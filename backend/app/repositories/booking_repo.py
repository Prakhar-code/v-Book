import logging
from typing import Any, Dict, Union
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from starlette.responses import JSONResponse
from app.core.db import engine
from fastapi import HTTPException
from app.services.email_service import send_request_status_email
from starlette.background import BackgroundTask
 
async def create_booking(cabin_id: int, booking_data: dict):
    try:
        with engine.connect() as connection:
           
            check_query = text(
                "SELECT * FROM Bookings WHERE cabin_id = :cabin_id AND "
                "((start_time <:end_time AND end_time >:start_time)) And (( status = 'pending' And user_id = :user_id) or status  ='approved')"
            )
            existing_booking = connection.execute(
                check_query,
                {
                    "cabin_id": cabin_id,
                    "start_time": booking_data["startTime"],
                    "end_time": booking_data["endTime"],
                    "user_id": booking_data["userId"]
                },
            ).fetchone()
 
            if existing_booking:
                response_data = {
                    "message": "Cabin is already booked for the selected time",
                    "status": "error",
                }
                return JSONResponse(content=response_data, status_code=400)
 
            insert_query = text(
                """
                INSERT INTO Bookings
                (user_id, cabin_id, booking_timestamp, start_time, end_time,
                purpose, additional_requirements, status, created_at)
                VALUES
                (:user_id, :cabin_id, NOW(), :start_time, :end_time,
                :purpose, :additional_requirements, 'pending', NOW())
                               
            """
            )
           
            connection.execute(
                insert_query,
                {
                    "user_id": booking_data["userId"],
                    "cabin_id": cabin_id,
                    "start_time": booking_data["startTime"],
                    "end_time": booking_data["endTime"],
                    "purpose": booking_data.get("purpose"),
                    "additional_requirements": booking_data.get(
                        "additionalRequirements"
                    ),
                },
            )
            connection.commit()
            cabin_name = connection.execute(
                text("SELECT name FROM Cabins WHERE cabin_id=:c_id"), {"c_id": cabin_id}
            ).fetchone()
            task = BackgroundTask(
            send_request_status_email,booking_data=booking_data,cabin_name=cabin_name[0],subject="vBook - Update On Your Booking Request"
            )
            return JSONResponse(status_code=200, content="Request sent Sucessfully",background=task)
 
    except SQLAlchemyError as e:
        logging.error(f"Database error while creating booking: {str(e)}")
        response_data = {"message": "Database error occurred", "status": "error"}
        return JSONResponse(content=response_data, status_code=500)
    except Exception as e:
        logging.error(f"Unexpected error while creating booking: {str(e)}")
        response_data = {"message": "An unexpected error occurred", "status": "error"}
        return JSONResponse(content=response_data, status_code=500)
 

async def create_admin_booking(cabin_id: int, booking_data: dict):
    try:
        with engine.connect() as connection:
            check_query = text(
                "SELECT * FROM Bookings WHERE cabin_id = :cabin_id AND "
                "((start_time <= :end_time AND end_time >= :start_time))"
            )
            existing_booking = connection.execute(
                check_query,
                {
                    "cabin_id": cabin_id,
                    "start_time": booking_data["startTime"],
                    "end_time": booking_data["endTime"],
                },
            ).fetchone()
 
            if existing_booking:
                response_data = {
                    "message": "Cabin is already booked for the selected time",
                    "status": "error",
                }
                return JSONResponse(content=response_data, status_code=400)
            else:
             insert_query = text(
                """
                INSERT INTO Bookings
                (user_id, cabin_id, booking_timestamp, start_time, end_time,
                purpose, additional_requirements, status, created_at)
                VALUES
                (:user_id, :cabin_id, NOW(), :start_time, :end_time,
                :purpose, :additional_requirements, 'approved', NOW())
                               
            """
            )
 
             connection.execute(
                insert_query,
                {
                    "user_id": booking_data["userId"],
                    "cabin_id": cabin_id,
                    "start_time": booking_data["startTime"],
                    "end_time": booking_data["endTime"],
                    "purpose": booking_data.get("purpose"),
                    "additional_requirements": booking_data.get(
                        "additionalRequirements"
                    ),
                },
            )
             connection.commit()
            return JSONResponse(status_code=200, content="Booking Confirmed")
 
    except SQLAlchemyError as e:
        logging.error(f"Database error while creating booking: {str(e)}")
        response_data = {"message": "Database error occurred", "status": "error"}
        return JSONResponse(content=response_data, status_code=500)
    except Exception as e:
        logging.error(f"Unexpected error while creating booking: {str(e)}")
        response_data = {"message": "An unexpected error occurred", "status": "error"}
        return JSONResponse(content=response_data, status_code=500)



 
def get_bookings_by_cabin_id(cabin_id):
    try:
        with engine.connect() as connection:
            fetch_bookings = connection.execute(
                text("SELECT * FROM Bookings WHERE cabin_id = :c_id"),
                {"c_id": cabin_id},
            )
            result = fetch_bookings.fetchall()
 
            if not result:
                return {
                    "status": "success",
                    "message": "No bookings found for this cabin",
                    "data": [],
                }
 
            formatted_result = []
            for row in result:
                booking = {
                    "booking_id": row[0],
                    "user_id": row[1],
                    "cabin_id": row[2],
                    "booking_timestamp": row[3],
                    "start_time": row[4],
                    "end_time": row[5],
                    "status": row[6],
                }
                formatted_result.append(booking)
 
            print(formatted_result)
 
            return {
                "status": "success",
                "message": "Bookings retrieved successfully",
                "data": formatted_result,
            }
 
    except Exception as e:
        print(f"Error fetching bookings by cabin ID: {e}")
        return {
            "status": "error",
            "message": "An error occurred while fetching bookings",
            "details": str(e),
        }
 

def delete_bookings_by_booking_id(booking_id):
    try:
        with engine.connect() as connection:
            delete_booking = connection.execute(
                text("Delete FROM Bookings WHERE booking_id = :b_id"),
                {"b_id": booking_id},
            )
            connection.commit()

            if not delete_booking:
                return {
                    "status": "success",
                    "message": "No bookings found for this booking ID",
                }

            return {
                "status": "success",
                "message": "Booking deleted successfully",
            }

    except Exception as e:
        print(f"Error deleting booking by booking ID: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error deleting booking by booking ID: {e}"
        )



def get_upcoming_bookings(user_id) -> Union[str, Dict[str, Any]]:
    try:
        with engine.connect() as connection:
            query = text(
                "SELECT * FROM Bookings WHERE user_id = :u_id AND end_time >= CURRENT_TIMESTAMP() ORDER BY start_time ASC"
            )
            result = connection.execute(query, {"u_id": user_id}).fetchall()
 
            if result:
                # json_string = json.dumps(result, default=str)
                bookings = []
                for row in result:
                    booking = {
                        "booking_id": row.booking_id,
                        "user_id": row.user_id,
                        "cabin_id": row.cabin_id,
                        "booking_timestamp": row.booking_timestamp.isoformat() + "Z",
                        "start_time": row.start_time.isoformat() + "Z",
                        "end_time": row.end_time.isoformat() + "Z",
                        "status": row.status,
                        "purpose": row.purpose,
                        "additional_requirements": row.additional_requirements,
                        "created_at": row.created_at.isoformat() + "Z",
                    }
                    bookings.append(booking)
                response = {
                    "success": True,
                    "message": "Upcoming bookings retrieved successfully.",
                    "data": {"bookings": bookings},
                }
                return response
            else:
                return {
                    "success": True,
                    "message": "No upcoming bookings found.",
                    "data": {"bookings": []},
                }
 
    except SQLAlchemyError as e:
        logging.error(f"Database error while fetching upcoming bookings: {str(e)}")
        raise HTTPException(status_code=500, detail="Database error occurred")
    except Exception as e:
        logging.error(f"Unexpected error while fetching upcoming bookings: {str(e)}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred")
 
 
def get_previous_bookings(user_id) -> Union[str, Dict[str, Any]]:
    try:
        with engine.connect() as connection:
            query = text(
                "SELECT * FROM Bookings WHERE user_id = :u_id AND end_time < CURRENT_TIMESTAMP() ORDER BY end_time DESC LIMIT 5"
            )
            result = connection.execute(query, {"u_id": user_id}).fetchall()
 
            if result:
                # json_string = json.dumps(result, default=str)
                bookings = []
                for row in result:
                    booking = {
                        "booking_id": row.booking_id,
                        "user_id": row.user_id,
                        "cabin_id": row.cabin_id,
                        "booking_timestamp": row.booking_timestamp.isoformat() + "Z",
                        "start_time": row.start_time.isoformat() + "Z",
                        "end_time": row.end_time.isoformat() + "Z",
                        "status": row.status,
                        "purpose": row.purpose,
                        "additional_requirements": row.additional_requirements,
                        "created_at": row.created_at.isoformat() + "Z",
                    }
                    bookings.append(booking)
                response = {
                    "success": True,
                    "message": "Previous bookings retrieved successfully.",
                    "data": {"bookings": bookings},
                }
                return response
            else:
                return {
                    "success": True,
                    "message": "No previous bookings found.",
                    "data": {"bookings": []},
                }
 
    except SQLAlchemyError as e:
        logging.error(f"Database error while fetching previous bookings: {str(e)}")
        raise HTTPException(status_code=500, detail="Database error occurred")
    except Exception as e:
        logging.error(f"Unexpected error while fetching previous bookings: {str(e)}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred")