from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from models.trip import Trip
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

@app.post("/api/v1/trips")
def create_trip(request: TripRequest):
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
        
    )

    # save to PostgreSQL
    db = SessionLocal()
    db.add(trip)
    db.commit()
    db.refresh(trip)   # get the auto-generated id
    db.close()
    return trip

@app.get("/api/v1/trips")
def list_trips():
    db = SessionLocal()
    trips = db.query(Trip).all()
    db.close()
    return trips

@app.get("/api/v1/trips/{trip_id}")
def get_trip(trip_id: int):
    db = SessionLocal()
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    db.close()
    # handling not found
    if trip is None:
        raise HTTPException(status_code=404, detail=f"Trip with id {trip_id} not found")
    return trip

@app.put("/api/v1/trips/{trip_id}")
def update_trip(trip_id: int, request: TripUpdate):
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