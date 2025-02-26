from sqlalchemy.orm import Session
from sqlalchemy import text
from app.models.feedback import Feedback
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import text

def get_user_by_id_and_booking_id(db: Session, user_id: int, booking_id: int):
    query = text("""
        SELECT u.user_id
        FROM Users u
        WHERE u.user_id = :user_id
    """)
    user_result = db.execute(query, {"user_id": user_id}).fetchone()
    
    if not user_result:
        return None

    booking_query = text("""
        SELECT booking_id
        FROM Bookings
        WHERE booking_id = :booking_id AND user_id = :user_id
    """)
    booking_result = db.execute(booking_query, {"booking_id": booking_id, "user_id": user_id}).fetchone()
    
    if not booking_result:
        return None

    return {"user_id": user_result.user_id, "booking_id": booking_result.booking_id}


def create_feedback_raw(db: Session, user_id: int, booking_id: int, ratings: int, feedback_text: str):
    insert_statement = text("""
       INSERT INTO Feedback (user_id, booking_id, ratings, feedback_text, created_at)
        VALUES (:user_id, :booking_id, :ratings, :feedback_text, :created_at)
        ON DUPLICATE KEY UPDATE 
    ratings = :ratings, 
    feedback_text = :feedback_text, 
    created_at = :created_at
    """)
    db.execute(insert_statement, {
        "user_id": user_id,
        "booking_id": booking_id,
        "ratings": ratings,
        "feedback_text": feedback_text,
        "created_at": datetime.now()
    })
    db.commit()

    return "Feedback inserted successfully"


def delete_old_feedback(db: Session):
    cutoff_date = datetime.now() - timedelta(days=30)
    db.query(Feedback).filter(Feedback.created_at < cutoff_date).delete()
    db.commit()
