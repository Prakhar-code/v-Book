import logging
from fastapi import APIRouter, Depends, Body
from starlette.exceptions import HTTPException
from app.models.userIdRequest import UserIdRequest
from app.repositories.booking_repo import (
    get_bookings_by_cabin_id,
    get_previous_bookings,
    get_upcoming_bookings, delete_bookings_by_booking_id,
)
from app.schemas.booking_schema import BookingRequest, BookingResponse
from app.repositories.booking_repo import create_booking
from app.repositories.booking_repo import create_admin_booking

app = APIRouter(prefix="/vbook/v1")

@app.post("/users/book-cabin/{cabin_id}", response_model=BookingResponse)
async def book_cabin(cabin_id: int, booking_request: BookingRequest):
    try:
        booking = await create_booking(cabin_id, booking_request.dict())
        return booking
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail="An unexpected error occurred.")


@app.post("/admin/book-cabin/{cabin_id}", response_model=BookingResponse)
async def book_cabin(cabin_id: int, booking_request: BookingRequest):
    try:
        booking = await create_admin_booking(cabin_id, booking_request.dict())
        return booking
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail="An unexpected error occurred.")


@app.get("/users/cabins/bookings/{cabin_id}")
async def get_cabin_bookings(cabin_id):
    try:
        cabin_bookings = get_bookings_by_cabin_id(cabin_id)

        return {
            "status": "success",
            "message": "Cabin bookings fetched successfully",
            "bookings": cabin_bookings,
        }

    except HTTPException as http_exc:
        raise http_exc

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while fetching the cabin bookings. Please try again later.",
        )


@app.delete("/users/delete/bookings/{booking_id}")
async def delete_booking(booking_id):
    try:
        delete_booking = delete_bookings_by_booking_id(booking_id)
        print(delete_booking)

        return delete_booking

    except HTTPException as http_exc:
        raise http_exc

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while deleting the cabin booking. Please try again later.",
        )


@app.post("/users/upcoming-bookings")
async def upcoming_booking(request: UserIdRequest):
    try:
        result = get_upcoming_bookings(request.user_id)
        return result
    except HTTPException as e:
        raise e
    except Exception as e:
        logging.error(f"Error in upcoming_booking route: {str(e)}")
        raise HTTPException(
            status_code=500, detail="An error occurred processing your request"
        )



@app.post("/users/previous-bookings")
async def previous_booking(request: UserIdRequest):
    try:
        result = get_previous_bookings(request.user_id)
        return result
    except HTTPException as e:
        raise e
    except Exception as e:
        logging.error(f"Error in previous_booking route: {str(e)}")
        raise HTTPException(
            status_code=500, detail="An error occurred processing your request"
        )
