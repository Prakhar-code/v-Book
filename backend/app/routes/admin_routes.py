from fastapi import APIRouter, HTTPException
from app.models.cabin import Cabin
from app.models.api_error import ErrorResponse
from app.models.cabin_request import CabinRequest
from app.models.ticket_update import TicketUpdate
from app.models.access_management_request import AccessManagementRequest
from app.repositories.cabin_repo import (
    add_cabin,
    delete_cabin,
    get_cabin,
    get_cabin_request,
    put_cabin_request,
    get_all_cabin,
    update_cabin,
)
from app.repositories.admin_repo import (
    get_all_tickets,
    get_ticket,
    update_ticket,
    provide_access,
)

app = APIRouter(prefix="/vbook/v1")


@app.get(
    "/admins/cabins/requests",
    responses={
        400: {"model": ErrorResponse},
        404: {"model": ErrorResponse},
        500: {"model": ErrorResponse},
    },
)
async def cabin_request():
    return get_cabin_request()


@app.put(
    "/admins/cabins/requests",
    responses={
        400: {"model": ErrorResponse},
        404: {"model": ErrorResponse},
        500: {"model": ErrorResponse},
    },
)
async def cabin_request(cabin_request: CabinRequest):
    return put_cabin_request(cabin_request)


@app.get("/admins/cabin-management/{cabin_id}")
async def cabin_management(cabin_id):
    return get_cabin(cabin_id)


@app.get("/admins/cabin-management")
async def cabin_management():
    return get_all_cabin()


@app.put("/admins/cabin-management")
async def cabin_management(cabin: Cabin):
    return update_cabin(cabin)


@app.delete(
    "/admins/cabin-management/{cabin_id}",
    responses={
        400: {"model": ErrorResponse},
        404: {"model": ErrorResponse},
        500: {"model": ErrorResponse},
    },
)
async def cabin_management(cabin_id):
    return delete_cabin(cabin_id)


@app.get(
    "/admins/manage-tickets",
    responses={
        400: {"model": ErrorResponse},
        404: {"model": ErrorResponse},
        500: {"model": ErrorResponse},
    },
)
async def manage_tickets():
    return get_all_tickets()


@app.get(
    "/admins/manage-tickets/{ticket_id}",
    responses={
        400: {"model": ErrorResponse},
        404: {"model": ErrorResponse},
        500: {"model": ErrorResponse},
    },
)
async def get_ticket_by_id(ticket_id):
    return get_ticket(ticket_id)


@app.put(
    "/admins/manage-tickets/{ticket_id}",
    responses={
        400: {"model": ErrorResponse},
        404: {"model": ErrorResponse},
        500: {"model": ErrorResponse},
    },
)
async def manage_ticket(ticket_id: int, ticket: TicketUpdate):
    return update_ticket(ticket_id, ticket)


@app.put(
    "/admins/access-management",
    responses={
        400: {"model": ErrorResponse},
        404: {"model": ErrorResponse},
        500: {"model": ErrorResponse},
    },
)
async def access_management(request: AccessManagementRequest):
    try:
        return provide_access(request)

    except HTTPException as http_exc:
        raise http_exc

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while sending the OTP. Please try again later.",
        )
