from fastapi import APIRouter, HTTPException, Depends
from app.repositories.feedback_repo import get_user_by_id_and_booking_id
from app.repositories.user_repo import raise_ticket
from app.schemas.feedback_schema import FeedbackCreate
from app.repositories.feedback_repo import create_feedback_raw
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.models.TicketCreate import TicketCreate
from app.models.api_error import ErrorResponse
app = APIRouter(prefix="/vbook/v1")


@app.get("/users/upcoming-bookings")
async def upcoming_bookings():
    pass


@app.get("/users/previous_bookings/")
async def previous_bookings():
    pass


@app.post("/users/feedback", status_code=200)
def submit_feedback(feedback: FeedbackCreate, db: Session = Depends(get_db)):
    user = get_user_by_id_and_booking_id(db, feedback.user_id, feedback.booking_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found or booking not found")
    
    message = create_feedback_raw(db, user['user_id'], feedback.booking_id, feedback.ratings, feedback.feedback_text)
    
    print(message)  
    
    return {
        "message": "Feedback submitted successfully",
        "user_id":user['user_id']
    }

@app.post("/users/raise-ticket",
          responses={
        400: {"model": ErrorResponse},
        404: {"model": ErrorResponse},
        500: {"model": ErrorResponse},
    },
)
async def raise_ticket1(ticket: TicketCreate):
    return raise_ticket(ticket)