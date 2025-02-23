import logging
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from app.core.db import engine
from app.models.ticket_update import TicketUpdate
from app.services.email_service import send_ticket_mail
from app.models.access_management_request import AccessManagementRequest


def get_all_tickets():
    try:
        with engine.connect() as connection:
            query = text(
                """
                SELECT t.*, u.name, u.email 
                FROM Tickets t 
                LEFT JOIN Users u ON t.user_id = u.user_id
            """
            )
            result = connection.execute(query).fetchall()
            if result:
                result_list = []
                for row in result:
                    dict1 = {
                        "ticket_id": row.ticket_id,
                        "user_id": row.user_id,
                        "cabin_id": row.cabin_id,
                        "name": row.name,
                        "email": row.email,
                        "date": row.date.isoformat() if row.date else None,
                        "description": row.description,
                        "response": row.response,
                        "status": row.status,
                        "created_at": row.created_at.isoformat() + "Z",
                    }
                    result_list.append(dict1)

                return {"tickets": result_list, "status": "success"}
            else:
                return {"status": "success", "tickets": []}
    except SQLAlchemyError as e:
        logging.error(f"Database error while fetching tickets: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={
                "status": "error",
                "detail": "Database error occurred while fetching tickets",
            },
        )
    except Exception as e:
        logging.error(f"Unexpected error while fetching tickets: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"status": "error", "detail": "An unexpected error occurred"},
        )


def get_ticket(ticket_id):
    try:
        with engine.connect() as connection:
            query = text(
                """
                SELECT t.*, u.name, u.email, c.name as cabin_name 
                FROM Tickets t 
                LEFT JOIN Users u ON t.user_id = u.user_id 
                LEFT JOIN Cabins c ON t.cabin_id = c.cabin_id
                WHERE t.ticket_id = :ticket_id
            """
            )
            result = connection.execute(query, {"ticket_id": ticket_id}).fetchone()

            if result:
                ticket_data = {
                    "ticket_id": result.ticket_id,
                    "user_id": result.user_id,
                    "cabin_id": result.cabin_id,
                    "cabin_name": result.cabin_name,
                    "name": result.name,
                    "email": result.email,
                    "date": result.date.isoformat() if result.date else None,
                    "description": result.description,
                    "response": result.response,
                    "status": result.status,
                    "created_at": result.created_at.isoformat() + "Z",
                }

                return {"status": "success", "ticket": ticket_data}
            else:
                return JSONResponse(
                    status_code=404,
                    content={
                        "status": "error",
                        "detail": f"Ticket with ID {ticket_id} not found",
                    },
                )
    except SQLAlchemyError as e:
        logging.error(f"Database error while fetching ticket: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={
                "status": "error",
                "detail": "Database error occurred while fetching ticket details",
            },
        )
    except Exception as e:
        logging.error(f"Unexpected error while fetching ticket: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"status": "error", "detail": "An unexpected error occurred"},
        )


def update_ticket(ticket_id: int, ticket: TicketUpdate):
    try:
        with engine.connect() as connection:
            check_query = text(
                """SELECT t.ticket_id, u.email, u.name
                FROM Tickets t
                JOIN Users u ON t.user_id = u.user_id
                WHERE t.ticket_id = :ticket_id"""
            )
            exists = connection.execute(
                check_query, {"ticket_id": ticket_id}
            ).fetchone()

            if not exists:
                return JSONResponse(
                    status_code=404,
                    content={
                        "status": "error",
                        "detail": f"Ticket with ID {ticket_id} not found",
                    },
                )

            # # Force status to CLOSED
            # ticket.status = "CLOSED"

            update_query = text(
                """
                UPDATE Tickets
                SET status = :status,
                    response = :response,
                    description = :description,
                    date = COALESCE(:date, date)
                WHERE ticket_id = :ticket_id
            """
            )

            connection.execute(
                update_query,
                {
                    "ticket_id": ticket_id,
                    "status": ticket.status,
                    "response": ticket.response,
                    "description": ticket.description,
                    "date": ticket.date if ticket.date else None,
                },
            )
            connection.commit()

            # email, name, ticket_id, description, response, status, subject
            print(exists.email)
            print(exists.name)
            print(ticket_id)
            print(ticket.description)
            print(ticket.response)
            print(ticket.status)

            send_ticket_mail(
                exists.email,
                exists.name,
                ticket_id,
                ticket.description,
                ticket.response,
                ticket.status,
                subject="vBook - Update on your Ticket",
            )

            return {
                "status": "success",
                "message": "Ticket updated successfully",
                "ticket_id": ticket_id,
                "response": ticket.response,
                "status": ticket.status,
                "description": ticket.description,
                "email": exists.email,
                "name": exists.name,
            }

    except SQLAlchemyError as e:
        logging.error(f"Database error while updating ticket: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={
                "status": "error",
                "detail": "Database error occurred while updating ticket",
            },
        )
    except Exception as e:
        logging.error(f"Unexpected error while updating ticket: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"status": "error", "detail": str(e)},
        )


def provide_access(request: AccessManagementRequest):
    try:

        with engine.connect() as connection:
            role = request.role
            employee_id = request.employee_id
            query = text(
                "UPDATE Users SET role = :role WHERE employee_id = :employee_id"
            )
            result = connection.execute(query, {"role": role, "employee_id": employee_id})
            connection.commit()

            if result.rowcount > 0:
                response_data = {
                    "message": "Role Updated successfully",
                    "status": "success",
                }
                return JSONResponse(content=response_data,status_code=200)
            else:
                response_data = {
                    "message": "No user found",
                    "status": "failed",
                }
                return JSONResponse(content=response_data, status_code=404)
    except SQLAlchemyError as e:
        logging.error(f"Database error while fetching cabin: {str(e)}")
    except Exception as e:
        logging.error(f"Unexpected error while fetching bookings: {str(e)}")
