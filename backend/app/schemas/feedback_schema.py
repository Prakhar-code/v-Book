from pydantic import BaseModel
from datetime import datetime

class FeedbackCreate(BaseModel):
    user_id: int
    booking_id: int
    ratings:int
    feedback_text: str

class FeedbackResponse(BaseModel):
    id: int
    user_id: int
    booking_id: int
    ratings:int
    feedback_text: str
    created_at: datetime

    
