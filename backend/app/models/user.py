from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.core.db import Base


class UserModel(Base):
    __tablename__ = "users"
    user_id = Column(Integer, primary_key=True, autoincrement=True)
    employee_id = Column(Integer, unique=True)
    email = Column(String(50), unique=True)
    name = Column(String(50))
    password = Column(String(255))
    role = Column(String(20), default="user")

    bookings = relationship("Booking", back_populates="user") 
    feedbacks = relationship("Feedback", back_populates="user")
