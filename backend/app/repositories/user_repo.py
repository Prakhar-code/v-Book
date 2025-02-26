import json
import logging
from sqlalchemy import text
from app.core.db import engine
from app.services.password_utils import hash_password, verify_password
from sqlalchemy.exc import SQLAlchemyError
from app.models.user import UserModel
from app.schemas.user_schema import UserCreate
from app.exception.custom_exception import UserAlreadyExistsException
from app.models.TicketCreate import TicketCreate
from datetime import datetime
from sqlalchemy.orm import Session
from fastapi.responses import JSONResponse
from fastapi import HTTPException


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def create_user(user: UserCreate):
    try:
        with engine.connect() as connection:
            check_query = text(
                "SELECT * FROM Users WHERE email = :email OR employee_id=:empid"
            )
            existing_user = connection.execute(
                check_query, {"email": user.email, "empid": user.employee_id}
            ).fetchone()
            if existing_user:
                raise UserAlreadyExistsException("Email already registered")

            hashed_password = hash_password(user.password)

            insert_query = text(
                """
                INSERT INTO Users (employee_id, email, name, password, role) 
                VALUES (:employee_id, :email, :name, :password, :role)
            """
            )
            connection.execute(
                insert_query,
                {
                    "employee_id": user.employee_id,
                    "email": user.email,
                    "name": user.name,
                    "password": hashed_password,
                    "role": "user",
                },
            )
            connection.commit()
            logging.info("User added successfully")

            new_user = UserModel(
                employee_id=user.employee_id,
                email=user.email,
                name=user.name,
                password=hashed_password,
                role="user",
            )

            logging.info(f"Successfully created new user with email: {user.email}")
            return new_user

    except UserAlreadyExistsException:
        return False
    except SQLAlchemyError as e:
        logging.error(f"Database error while creating user: {str(e)}")
        raise
    except Exception as e:
        logging.error(f"Unexpected error while creating user: {str(e)}")
        raise


def get_user(email: str):
    try:
        with engine.connect() as connection:
            query = text("Select * from Users WHERE email = :email")
            result = connection.execute(query, {"email": email})
            if result.rowcount == 0:
                logging.warning(f"No user found with email: {email}")
                return False
            logging.info("User found successfully")
            user = result.fetchone()
            return user
    except SQLAlchemyError as e:
        logging.error(f"Database error while finding user: {str(e)}")
        return False
    except Exception as e:
        logging.error(f"Unexpected error while finding user: {str(e)}")
        return False


def verifyOldPassword(email: str, oldpassword: str):
    try:
        with engine.connect() as connection:
            query = text("SELECT password FROM Users WHERE email = :email")
            result = connection.execute(query, {"email": email}).first()
            print(oldpassword)
            if not result:
                logging.warning(f"No user found with email: {email}")
                return False

            
            hashed_password=result[0]
            print(hashed_password)

            if verify_password(oldpassword, hashed_password):
                logging.info("Password matched successfully")
                return True
            else:
                logging.warning("Password verification failed")
                return False

    except SQLAlchemyError as e:
        logging.error(f"Database error while matching password: {str(e)}")
        return False
    except Exception as e:
        logging.error(f"Unexpected error while matching password: {str(e)}")
        return False


def update_user_password(email: str, new_password: str):
    try:
        with engine.connect() as connection:
            hashed_password = hash_password(new_password)

            query = text(
                """
                UPDATE Users 
                SET password = :password 
                WHERE email = :email 
            """
            )

            result = connection.execute(
                query, {"password": hashed_password, "email": email}
            )
            connection.commit()

            if result.rowcount == 0:
                logging.warning(f"No user found with email: {email}")
                return False

            logging.info("Password updated successfully")
            return True

    except SQLAlchemyError as e:
        logging.error(f"Database error while updating password: {str(e)}")
        return False
    except Exception as e:
        logging.error(f"Unexpected error while updating password: {str(e)}")
        return False

def raise_ticket(ticket: TicketCreate):
    try:
      
        user_id = ticket.user_id
        cabin_id=ticket.cabin_id
        date=ticket.date
        description=ticket.description
        
        with engine.connect() as connection:
            query = text(
                """
                INSERT INTO Tickets (user_id, cabin_id, date, description, response, status, created_at)
                VALUES (:user_id, :cabin_id, :date, :description, :response, :status, :created_at)
                """
            )
            connection.execute(query, {
                "user_id": user_id,
                "cabin_id": cabin_id,
                "date": date,
                "description": description,
                "response": ticket.response,
                "status": ticket.status,
                "created_at": datetime.utcnow()
            })
            connection.commit()
            return JSONResponse(
                content={"status": "success", "message": "Ticket raised successfully"},
                status_code=201
            )
    except SQLAlchemyError as e:
        logging.error(f"Database error while raising ticket: {str(e)}")
        raise HTTPException(status_code=500, detail="Database error occurred while raising ticket")
    except Exception as e:
        logging.error(f"Unexpected error while raising ticket: {str(e)}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred")