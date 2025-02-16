from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import Settings

config = Settings()

SQLALCHEMY_DATABASE_URL = f"mysql+pymysql://{config.db_user}:{config.db_pass}@{config.db_host}:{config.db_port}/{config.db_name}"

engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base=declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def close_db_session(db_session):
    if db_session:
        db_session.close()
