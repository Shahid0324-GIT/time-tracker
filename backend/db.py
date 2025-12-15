from sqlmodel import SQLModel, Session, create_engine
from dotenv import load_dotenv
import os

load_dotenv(".env.development")
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set")

# Debugging statements
# print("Database url: ", DATABASE_URL)

engine = create_engine(DATABASE_URL, echo=True, pool_pre_ping=True)

# Debugging statements
# print("Engine created: ", engine)
# print("Engine URL: ", engine.url)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)
    
def get_session():
    with Session(engine) as session:
        yield session
