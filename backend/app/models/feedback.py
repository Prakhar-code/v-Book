from sqlalchemy import Column, Integer, String, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.db import Base

class Feedback(Base):
    __tablename__ = "feedback"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    booking_id = Column(Integer, ForeignKey("bookings.booking_id"), nullable=False)
    ratings = Column(Integer, nullable=False)
    feedback_text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.now)
    
    user = relationship("UserModel", back_populates="feedbacks")
    booking = relationship("Booking", back_populates="feedbacks")
