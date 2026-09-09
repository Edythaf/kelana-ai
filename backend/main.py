from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from database import SessionLocal, init_db

from models.trip import Trip
from models.user import User
from models.conversation import Conversation, Message

from services.auth_service import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
)

from services.trip_services import (
    calculate_daily_budget,
    get_trip_category,
)

from services.bedrock_service import generate_trip_recommendation
from services.kb_service import ask_knowledge_base, ask_base_model
from services.conversation_service import generate_chat_response


# =========================================================
# APP SETUP
# =========================================================

app = FastAPI(
    title="KelanaAI API",
    description="Backend API for KelanaAI travel planner",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://kelana-9t2lpapbu-ditalone.vercel.app",
        "https://loquacious-druid-894bd6.netlify.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


init_db()


# =========================================================
# REQUEST MODELS
# =========================================================

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


class QuestionRequest(BaseModel):
    question: str


class ConversationRequest(BaseModel):
    title: str = "New Conversation"


class MessageRequest(BaseModel):
    content: str


# =========================================================
# HEALTH CHECK
# =========================================================

@app.get("/")
def root():
    return {
        "message": "KelanaAI API is running"
    }


# =========================================================
# AUTH
# =========================================================

@app.post("/api/v1/auth/register")
def register_user(request: RegisterRequest):
    db = SessionLocal()

    try:
        existing_user = (
            db.query(User)
            .filter(User.email == request.email)
            .first()
        )

        if existing_user:
            raise HTTPException(
                status_code=400,
                detail="Email is already registered",
            )

        user = User(
            name=request.name,
            email=request.email,
            password_hash=hash_password(request.password),
        )

        db.add(user)
        db.commit()
        db.refresh(user)

        return {
            "id": user.id,
            "name": user.name,
            "email": user.email,
        }

    except HTTPException:
        raise

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


@app.post("/api/v1/auth/login")
def login_user(request: LoginRequest):
    db = SessionLocal()

    try:
        user = (
            db.query(User)
            .filter(User.email == request.email)
            .first()
        )

        if user is None:
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password",
            )

        if not verify_password(
            request.password,
            user.password_hash,
        ):
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password",
            )

        token = create_access_token(user.id)

        return {
            "access_token": token,
            "token_type": "Bearer",
        }

    finally:
        db.close()


@app.get("/api/v1/auth/me")
def get_me(
    user: User = Depends(get_current_user),
):
    db = SessionLocal()

    try:
        total_trips = (
            db.query(Trip)
            .filter(Trip.user_id == user.id)
            .count()
        )

        return {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "total_trips": total_trips,
        }

    finally:
        db.close()


# =========================================================
# TRIPS
# =========================================================

@app.post("/api/v1/trips")
def create_trip(
    request: TripRequest,
    user: User = Depends(get_current_user),
):
    db = SessionLocal()

    try:
        daily_budget = calculate_daily_budget(
            request.budget,
            request.days,
        )

        category = get_trip_category(
            request.budget
        )

        trip = Trip(
            destination=request.destination,
            days=request.days,
            budget=request.budget,
            travel_style=request.travel_style,
            category=category,
            daily_budget=daily_budget,
            user_id=user.id,
        )

        db.add(trip)
        db.commit()
        db.refresh(trip)

        return trip

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


@app.get("/api/v1/trips")
def list_trips(
    user: User = Depends(get_current_user),
):
    db = SessionLocal()

    try:
        trips = (
            db.query(Trip)
            .filter(Trip.user_id == user.id)
            .all()
        )

        return trips

    finally:
        db.close()


@app.get("/api/v1/trips/{trip_id}")
def get_trip(
    trip_id: int,
    user: User = Depends(get_current_user),
):
    db = SessionLocal()

    try:
        trip = (
            db.query(Trip)
            .filter(Trip.id == trip_id)
            .first()
        )

        if trip is None:
            raise HTTPException(
                status_code=404,
                detail=f"Trip with id {trip_id} not found",
            )

        if trip.user_id != user.id:
            raise HTTPException(
                status_code=403,
                detail="You are not allowed to view this trip",
            )

        return trip

    finally:
        db.close()


@app.put("/api/v1/trips/{trip_id}")
def update_trip(
    trip_id: int,
    request: TripUpdate,
    user: User = Depends(get_current_user),
):
    db = SessionLocal()

    try:
        trip = (
            db.query(Trip)
            .filter(Trip.id == trip_id)
            .first()
        )

        if trip is None:
            raise HTTPException(
                status_code=404,
                detail=f"Trip with id {trip_id} not found",
            )

        if trip.user_id != user.id:
            raise HTTPException(
                status_code=403,
                detail="You are not allowed to update this trip",
            )

        trip.budget = request.budget

        trip.category = get_trip_category(
            request.budget
        )

        trip.daily_budget = calculate_daily_budget(
            request.budget,
            trip.days,
        )

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


@app.delete("/api/v1/trips/{trip_id}")
def delete_trip(
    trip_id: int,
    user: User = Depends(get_current_user),
):
    db = SessionLocal()

    try:
        trip = (
            db.query(Trip)
            .filter(Trip.id == trip_id)
            .first()
        )

        if trip is None:
            raise HTTPException(
                status_code=404,
                detail=f"Trip with id {trip_id} not found",
            )

        if trip.user_id != user.id:
            raise HTTPException(
                status_code=403,
                detail="You are not allowed to delete this trip",
            )

        db.delete(trip)
        db.commit()

        return {
            "message": "Trip deleted successfully"
        }

    except HTTPException:
        raise

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


@app.post("/api/v1/trips/{trip_id}/generate")
def generate_ai_recommendation(
    trip_id: int,
    user: User = Depends(get_current_user),
):
    db = SessionLocal()

    try:
        trip = (
            db.query(Trip)
            .filter(Trip.id == trip_id)
            .first()
        )

        if trip is None:
            raise HTTPException(
                status_code=404,
                detail=f"Trip with id {trip_id} not found",
            )

        if trip.user_id != user.id:
            raise HTTPException(
                status_code=403,
                detail="You are not allowed to generate this trip",
            )

        ai_recommendation = generate_trip_recommendation(
            trip.destination,
            trip.days,
            trip.budget,
            trip.travel_style or "Family",
        )

        trip.ai_recommendation = ai_recommendation

        db.commit()
        db.refresh(trip)

        return {
            "trip_id": trip.id,
            "destination": trip.destination,
            "recommendation": trip.ai_recommendation,
        }

    except HTTPException:
        raise

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


# =========================================================
# RAG ASSISTANT
# =========================================================

@app.post("/api/v1/assistant")
def ask_assistant(request: QuestionRequest):
    result = ask_knowledge_base(
        request.question
    )

    return {
        "question": request.question,
        "answer": result["answer"],
        "sources": result["sources"],
    }


@app.post("/api/v1/assistant/compare")
def compare_assistant(request: QuestionRequest):
    base_answer = ask_base_model(
        request.question
    )

    rag_result = ask_knowledge_base(
        request.question
    )

    return {
        "question": request.question,
        "base_model_answer": base_answer,
        "rag_answer": rag_result["answer"],
        "sources": rag_result["sources"],
    }


# =========================================================
# CONVERSATIONS
# =========================================================

@app.post("/api/v1/conversations")
def create_conversation(
    request: ConversationRequest,
    user: User = Depends(get_current_user),
):
    db = SessionLocal()

    try:
        conversation = Conversation(
            user_id=user.id,
            title=request.title,
        )

        db.add(conversation)
        db.commit()
        db.refresh(conversation)

        return {
            "conversation_id": conversation.id,
            "title": conversation.title,
        }

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


@app.get("/api/v1/conversations")
def list_conversations(
    user: User = Depends(get_current_user),
):
    db = SessionLocal()

    try:
        conversations = (
            db.query(Conversation)
            .filter(Conversation.user_id == user.id)
            .order_by(Conversation.created_at.desc())
            .all()
        )

        return [
            {
                "id": conversation.id,
                "title": conversation.title,
                "created_at": conversation.created_at,
            }
            for conversation in conversations
        ]

    finally:
        db.close()


@app.get("/api/v1/conversations/{conversation_id}/messages")
def get_conversation_messages(
    conversation_id: int,
    user: User = Depends(get_current_user),
):
    db = SessionLocal()

    try:
        conversation = (
            db.query(Conversation)
            .filter(
                Conversation.id == conversation_id,
                Conversation.user_id == user.id,
            )
            .first()
        )

        if conversation is None:
            raise HTTPException(
                status_code=404,
                detail="Conversation not found",
            )

        messages = (
            db.query(Message)
            .filter(
                Message.conversation_id == conversation_id
            )
            .order_by(Message.id.asc())
            .all()
        )

        return [
            {
                "id": message.id,
                "role": message.role,
                "content": message.content,
                "created_at": message.created_at,
            }
            for message in messages
        ]

    finally:
        db.close()


@app.post("/api/v1/conversations/{conversation_id}/messages")
def send_message(
    conversation_id: int,
    request: MessageRequest,
    user: User = Depends(get_current_user),
):
    db = SessionLocal()

    try:
        conversation = (
            db.query(Conversation)
            .filter(
                Conversation.id == conversation_id,
                Conversation.user_id == user.id,
            )
            .first()
        )

        if conversation is None:
            raise HTTPException(
                status_code=404,
                detail="Conversation not found",
            )

        existing_message = (
            db.query(Message)
            .filter(
                Message.conversation_id == conversation_id
            )
            .first()
        )

        # Automatically use the first user message as the conversation title
        if existing_message is None:
            conversation.title = request.content.strip()[:60]

        user_message = Message(
            conversation_id=conversation_id,
            role="user",
            content=request.content,
        )

        db.add(user_message)
        db.commit()

        messages = (
            db.query(Message)
            .filter(
                Message.conversation_id == conversation_id
            )
            .order_by(Message.id.asc())
            .all()
        )

        ai_reply = generate_chat_response(
            messages
        )

        assistant_message = Message(
            conversation_id=conversation_id,
            role="assistant",
            content=ai_reply,
        )

        db.add(assistant_message)
        db.commit()

        return {
            "conversation_id": conversation_id,
            "user_message": request.content,
            "assistant_reply": ai_reply,
        }

    except HTTPException:
        raise

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()