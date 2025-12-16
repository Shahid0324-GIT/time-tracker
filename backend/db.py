from sqlmodel import SQLModel, Session, create_engine
from config import DATABASE_URL

engine = create_engine(DATABASE_URL, echo=True, pool_pre_ping=True) # type: ignore

# Debugging statements
# print("Engine created: ", engine)
# print("Engine URL: ", engine.url)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)
    
def get_session():
    with Session(engine) as session:
        yield session
