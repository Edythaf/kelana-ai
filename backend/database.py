from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os

#load .env so os.getev() can read it 
load_dotenv()
#connection string from .env 
DATABASE_URL = os.getenv("DATABASE_URL")

#engine = the connection pool
engine = create_engine(DATABASE_URL)
#SessionLocal = a factory for DB sessions
SessionLocal = sessionmaker(bind = engine, autoflush=False)
#Base = alll CRM models inherit from this 
Base = declarative_base()

#create all tables
def init_db() -> None :
    """Create all SQLAlchemy tables for the configured database."""
    Base.metadata.create_all(bind=engine)