import json
import logging
from fastapi import HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from app.models.cabin import CabinChangeRequest, Cabin
from app.core.db import engine
from app.models.cabin_request import CabinRequest
from app.services.email_service import send_ticket_mail
from starlette.background import BackgroundTask


def fetch_all_cabins():
    try:
        with engine.connect() as connection:
            fetch_cabins = connection.execute(text("SELECT * from Cabins"))
            result = fetch_cabins.fetchall()

            if not result:
                return []

            formatted_result = []
            for row in result:
                cabin = {
                    "id": row[0],
                    "name": row[1],
                    "location": row[2],
                    "capacity": row[3],
                    "status": row[4],
                    "facilities": row[5].split(", ") if row[5] else [],
                }
                formatted_result.append(cabin)

            return formatted_result

    except Exception as e:
        print(f"Error fetching cabins: {e}")
        raise Exception(f"Error fetching cabins: {str(e)}")


def get_cabin_by_id(cabin_id):
    try:
        with engine.connect() as connection:
            fetch_cabin = connection.execute(
                text("SELECT * FROM Cabins WHERE cabin_id=:c_id"), {"c_id": cabin_id}
            )
            result = fetch_cabin.fetchall()

            if not result:
                return None

            formatted_result = []
            for row in result:
                cabin = {
                    "id": row[0],
                    "name": row[1],
                    "location": row[2],
                    "capacity": row[3],
                    "status": row[4],
                    "facilities": row[5].split(", ") if row[5] else [],
                }
                formatted_result.append(cabin)

            return formatted_result[0]

    except Exception as e:
        print(f"Error fetching cabin by ID: {e}")
        raise Exception(f"Error fetching cabin: {str(e)}")


def get_cabin_request():
    try:
        with engine.connect() as connection:
            query = text("""Select u.email , c.name , b.purpose,b.start_time,b.end_time ,b.status,b.booking_id, b.additional_requirements from vbook.Bookings as b
INNER JOIN vbook.Cabins as c on b.cabin_id = c.cabin_id
INNER JOIN vbook.Users as u on u.user_id = b.user_id
WHERE b.status = 'pending'""")
            result = connection.execute(query).fetchall()

            if result:
                result_list = []
                for row in result:
                    dict1 = {
                        "booking_id": row.booking_id,
                        "email": row.email,
                        "cabin_name": row.name,
                        "start_time": row.start_time.isoformat() + "Z",
                        "end_time": row.end_time.isoformat() + "Z",
                        "status": row.status,
                        "purpose": row.purpose,
                        "additional_requirements":row.additional_requirements
                    }
                    result_list.append(dict1)

                return {"bookings": result_list, "status": "success"}
            else:
                response_data = {
                    "bookings": "No Request pending",
                    "message": "Here are the pending bookings",
                    "status": "success",
                }

                return JSONResponse(content=response_data)
                # logging.info("Bookings found successfully")


    except SQLAlchemyError as e:
        logging.error(f"Database error while fetching bookings: {str(e)}")
    except Exception as e:
        logging.error(f"Unexpected error while fetching bookings: {str(e)}")


def put_cabin_request(cabin_request: CabinRequest):
    try:
        with engine.connect() as connection:
            booking_id = cabin_request.booking_id
            request_status = cabin_request.request_status

            # Check for existing approved bookings in the same time interval
            check_query = text("""
                SELECT booking_id 
                FROM vbook.Bookings 
                WHERE cabin_id = (SELECT cabin_id FROM vbook.Bookings WHERE booking_id = :booking_id)
                AND status = 'approved' 
                AND (
                    (start_time <= (SELECT start_time FROM vbook.Bookings WHERE booking_id = :booking_id) 
                     AND end_time >= (SELECT start_time FROM vbook.Bookings WHERE booking_id = :booking_id))
                    OR 
                    (start_time <= (SELECT end_time FROM vbook.Bookings WHERE booking_id = :booking_id) 
                     AND end_time >= (SELECT end_time FROM vbook.Bookings WHERE booking_id = :booking_id))
                )
            """)

            conflicting_booking = connection.execute(check_query, {"booking_id": booking_id}).fetchone()

            if conflicting_booking and request_status == 'approved':
                return JSONResponse(
                    content={
                        "message": "An approved booking already exists for the same time interval",
                        "status": "conflict"
                    },
                    status_code=409
                )

            # Continue with existing update logic
            query = text(
                "UPDATE Bookings SET status = :status WHERE booking_id = :booking_id "
            )
            connection.execute(query, {"status": request_status, "booking_id": booking_id})
            connection.commit()

            # Existing email notification logic remains the same
            query1 = text("""SELECT c.name, u.email, b.start_time, b.end_time 
                             FROM vbook.Bookings AS b 
                             INNER JOIN vbook.Cabins AS c ON b.cabin_id = c.cabin_id 
                             INNER JOIN vbook.Users AS u ON b.user_id = u.user_id 
                             WHERE b.booking_id = :booking_id
                          """)
            result = connection.execute(query1, {"booking_id": booking_id}).fetchone()

            response_data=response_data = {
                    "message": "Status Successfully updated",
                    "status": "success",
                }
            subject = "vBook-Updates On Your Booking"
            task = BackgroundTask(
            send_ticket_mail,email =result.email,start_time =result.start_time,end_time=result.end_time,cabin_name= result.name,status=request_status,subject=subject)
            return JSONResponse(content=response_data,background=task)

    except SQLAlchemyError as e:
        logging.error(f"Database error while fetching bookings: {str(e)}")
        return JSONResponse(content={"message": "Database error", "status": "error"}, status_code=500)
    except Exception as e:
        logging.error(f"Unexpected error while fetching bookings: {str(e)}")
        return JSONResponse(content={"message": "Unexpected error", "status": "error"}, status_code=500)
def add_cabin(cabin: CabinChangeRequest):
    try:
        name = cabin.name
        office = cabin.office
        capacity = cabin.capacity
        status = cabin.status
        amenities = cabin.amenities
        with engine.connect() as connection:
            # query = text("UPDATE Bookings SET status = :status WHERE booking_id = :booking_id")
            # result = connection.execute(query, {"status": request_status, "booking_id": booking_id})
            query = text(
                """INSERT INTO Cabins (name, office, capacity, status, amenities)
                            VALUES (:name, :office, :capacity, :status, :amenities)"""
            )
            connection.execute(
                query,
                {
                    "name": name,
                    "office": office,
                    "capacity": capacity,
                    "status": status,
                    "amenities": amenities,
                },
            )
            connection.commit()

            response_data = {"message": "Cabin Added successfully", "status": "success"}
            return JSONResponse(content=response_data)

    except SQLAlchemyError as e:
        logging.error(f"Database error while fetching bookings: {str(e)}")
    except Exception as e:
        logging.error(f"Unexpected error while fetching bookings: {str(e)}")


def get_cabin(cabin_id):
    try:

        with engine.connect() as connection:
            query = text("""SELECT * FROM Cabins WHERE cabin_id = :cabin_id""")
            cabin_details = connection.execute(query, {"cabin_id": cabin_id}).fetchone()
            cabin_dict = {
                "cabin_id": cabin_details.cabin_id,
                "name": cabin_details.name,
                "office": cabin_details.office,
                "capacity": cabin_details.capacity,
                "status": cabin_details.status,
                "amenities": cabin_details.amenities,
            }

            response_data = {
                "cabin_details": json.dumps(cabin_dict, default=str),
                "message": "Cabin fetched successfully",
                "status": "success",
            }
            return JSONResponse(content=response_data)

    except SQLAlchemyError as e:
        logging.error(f"Database error while fetching cabin: {str(e)}")
    except Exception as e:
        logging.error(f"Unexpected error while fetching bookings: {str(e)}")


def get_all_cabin():
    try:

        with engine.connect() as connection:
            # query = text("UPDATE Bookings SET status = :status WHERE booking_id = :booking_id")
            # result = connection.execute(query, {"status": request_status, "booking_id": booking_id})
            query = text("SELECT * FROM Cabins")
            cabin_details = connection.execute(query).fetchall()
            #     cabin_dict = {
            # "cabin_id": cabin_details.cabin_id,
            # "name": cabin_details.name,
            # "office": cabin_details.office,
            # "capacity": cabin_details.capacity,
            # "status": cabin_details.status,
            # "amenities": cabin_details.amenities
            # }

            response_data = {
                "cabin_details": json.dumps(cabin_details, default=str),
                "message": "Cabin fetched successfully",
                "status": "success",
            }
            return JSONResponse(content=response_data)

    except SQLAlchemyError as e:
        logging.error(f"Database error while fetching cabin: {str(e)}")
    except Exception as e:
        logging.error(f"Unexpected error while fetching bookings: {str(e)}")



def update_cabin(cabin: Cabin):
    try:
        with engine.connect() as connection:
            query = text("""
                UPDATE Cabins 
                SET name = :name, office = :office, capacity = :capacity, status = :status, amenities = :amenities 
                WHERE cabin_id = :cabin_id
            """)
            #print(f"Updating cabin with ID: {cabin.cabin_id}")
            result = connection.execute(query, {
                "cabin_id": cabin.cabin_id,
                "name": cabin.name,
                "office": cabin.office,
                "capacity": cabin.capacity,
                "status": cabin.status,
                "amenities": ', '.join(cabin.amenities)
            })
            connection.commit()
            response_data = {
                "message": "Cabin Updated successfully",
                "status": "success",
            }
            #print(f"Cabin update response: {response_data}")
            return response_data
    except SQLAlchemyError as e:
        logging.error(f"Database error while updating cabin: {str(e)}")
        raise HTTPException(status_code=500, detail="Database error while updating cabin")
    except Exception as e:
        logging.error(f"Unexpected error while updating cabin: {str(e)}")
        raise HTTPException(status_code=500, detail="Unexpected error while updating cabin")

def delete_cabin(cabin_id: int):
    try:
        with engine.connect() as connection:

            delete_bookings_query = text("""
                DELETE FROM Bookings
                WHERE cabin_id = :cabin_id
            """)
            connection.execute(delete_bookings_query, {"cabin_id": cabin_id})


            delete_tickets_query = text("""
                DELETE FROM Tickets
                WHERE cabin_id = :cabin_id
            """)
            connection.execute(delete_tickets_query, {"cabin_id": cabin_id})


            delete_cabin_query = text("""
                DELETE FROM Cabins
                WHERE cabin_id = :cabin_id
            """)
            connection.execute(delete_cabin_query, {"cabin_id": cabin_id})

            connection.commit()
            response_data = {
                "message": "Cabin and associated bookings and tickets deleted successfully",
                "status": "success",
            }
            return response_data
    except SQLAlchemyError as e:
        logging.error(f"Database error while deleting cabin: {str(e)}")
        raise
    except Exception as e:
        logging.error(f"Unexpected error while deleting cabin: {str(e)}")
        raise
