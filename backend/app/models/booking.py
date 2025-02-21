from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.db import Base
from datetime import datetime

class Booking(Base):
    __tablename__ = "bookings"
    
    booking_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    cabin_id = Column(Integer, nullable=False)
    booking_timestamp = Column(DateTime, nullable=False)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    status = Column(String(35), nullable=False)
    purpose = Column(String(255))
    additional_requirements = Column(String(255), nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.now)
    moderated_by_admin = Column(String(50), nullable=False) 

    user = relationship("UserModel", back_populates="bookings")
    feedbacks = relationship("Feedback", back_populates="booking")
