from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from models.trip import Trip
from models.user import User
from services.auth_service import (hash_password, verify_password, create_access_token, get_current_user,)
from database import SessionLocal, init_db
from services.trip_services import calculate_daily_budget, get_trip_category, get_recommended_transport, get_travel_season, recommended_places
from services.bedrock_service import generate_trip_recommendation
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()

class TripRequest(BaseModel):
    destination: str
    days: int
    budget: float
    travel_style: str

class TripUpdate(BaseModel):
    budget: float

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

@app.post("/api/v1/auth/register")
def register_user(request: RegisterRequest):
    db = SessionLocal()

    try:
        user = User(
            name=request.name,
            email=request.email,
            password_hash=hash_password(request.password)
        )

        db.add(user)
        db.commit()
        db.refresh(user)

        return {
            "id" : user.id,
            "name" : user.name,
            "email" : user.email
        }
    finally: 
        db.close()

@app.post("/api/v1/auth/login")
def login_user(request: LoginRequest):
    db = SessionLocal()

    try:
        user = db.query(User).filter(
            User.email == request.email
        ).first()

        if user is None:
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password"
            )

        if not verify_password(
            request.password, 
            user.password_hash
        ):
            raise HTTPException(
                status_code = 401,
                detail = "Invalid email or password"
            )
        token = create_access_token(user.id)

        return {
            "access_token" : token, 
            "token_type": "Bearer"
        }
    finally:
        db.close() 

@app.get("/api/v1/auth/me")
def get_me(
    user: User = Depends(get_current_user)
):
    db = SessionLocal()

    try:
        total_trips = db.query(Trip).filter(
            Trip.user_id == user.id
        ).count()

        return {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "total_trips": total_trips
        }

    finally:
        db.close()

@app.post("/api/v1/trips")
def create_trip(request: TripRequest,  user: User = Depends(get_current_user)):
    # reuse Session 2 business logic
    daily_budget = calculate_daily_budget(request.budget, request.days)
    category     = get_trip_category(request.budget)

    # create a Trip ORM object
    trip = Trip(
        destination  = request.destination,
        days         = request.days,
        budget       = request.budget,
        travel_style=request.travel_style,
        category     = category,
        daily_budget = daily_budget,
        user_id=user.id, 
    )

    # save to PostgreSQL
    db = SessionLocal()
    db.add(trip)
    db.commit()
    db.refresh(trip)   # get the auto-generated id
    db.close()
    return trip

@app.get("/api/v1/trips")
def list_trips(
    user: User = Depends(get_current_user)
):
    db = SessionLocal()

    trips = db.query(Trip).filter(
        Trip.user_id == user.id
    ).all()

    db.close()
    return trips

@app.get("/api/v1/trips/{trip_id}")
def get_trip(
    trip_id: int,
    user: User = Depends(get_current_user)
):
    db = SessionLocal()

    trip = db.query(Trip).filter(
        Trip.id == trip_id
    ).first()

    db.close()

    if trip is None:
        raise HTTPException(
            status_code=404,
            detail=f"Trip with id {trip_id} not found"
        )

    if trip.user_id != user.id:
        raise HTTPException(
            status_code=403,
            detail="You are not allowed to view this trip"
        )

    return trip

@app.put("/api/v1/trips/{trip_id}")
def update_trip(
    trip_id: int,
    request: TripUpdate,
    user: User = Depends(get_current_user)
):
    db = SessionLocal()
    try: 
        trip = db.query(Trip).filter(
            Trip.id == trip_id
        ).first()
        
        if trip is None: 
            raise HTTPException(
                status_code = 404, 
                detail=f"Trip with id {trip_id} not found",
            )
        if trip.user_id != user.id:
            raise HTTPException(
                status_code=403,
                detail="You are not allowed to update this trip"
    )
        trip.budget = request.budget

        trip.category = get_trip_category(request.budget)

        trip.daily_budget = calculate_daily_budget(request.budget, trip.days,)

        db.commit()
        db.refresh(trip)
        
        return trip
    except HTTPException:
        raise

    except Exception:
        db.rollback()
        raise
    
    finally:
        db.close()

@app.post("/api/v1/trips/{trip_id}/generate")
def generate_ai_recommendation(trip_id: int):

    db = SessionLocal()

    try:
        trip = db.query(Trip).filter(Trip.id == trip_id).first()

        if trip is None:
            raise HTTPException(
                status_code=404,
                detail=f"Trip with id {trip_id} not found"
            )

        ai_recommendation = generate_trip_recommendation(
            trip.destination,
            trip.days,
            trip.budget,
            trip.travel_style or "Family"
        )

        trip.ai_recommendation = ai_recommendation

        db.commit()
        db.refresh(trip)

        return {
            "trip_id": trip.id,
            "destination": trip.destination,
            "recommendation": trip.ai_recommendation
        }

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()

@app.delete("/api/v1/trips/{trip_id}")
def delete_trip(
    trip_id: int,
    user: User = Depends(get_current_user)
):
    db = SessionLocal()

    try:
        trip = db.query(Trip).filter(
            Trip.id == trip_id
        ).first()

        if trip is None:
            raise HTTPException(
                status_code=404,
                detail=f"Trip with id {trip_id} not found"
            )

        if trip.user_id != user.id:
            raise HTTPException(
                status_code=403,
                detail="You are not allowed to delete this trip"
            )

        db.delete(trip)
        db.commit()

        return {
            "message": "Trip deleted successfully"
        }

    finally:
        db.close()