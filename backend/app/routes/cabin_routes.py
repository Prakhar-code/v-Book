from fastapi import APIRouter
import logging
from sqlalchemy import exc
from starlette.exceptions import HTTPException
from app.models.cabin import Cabin
from app.repositories.cabin_repo import fetch_all_cabins, get_cabin_by_id,CabinChangeRequest,update_cabin,delete_cabin

app = APIRouter(prefix="/vbook/v1")

@app.get("/cabins/{cabin_id}")
async def get_cabin(cabin_id):
    try:
        cabin = get_cabin_by_id(cabin_id)
        if cabin:
            return {
                "status": "Success",
                "message": "Cabin fetched successfully",
                "cabins": cabin,
            }
        else:
            raise HTTPException(
                status_code=404,
                detail="No cabin found"
            )

    except HTTPException as http_exc:
        raise http_exc

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while fetching the cabin. Please try again later.",
        )


@app.get("/cabins")
async def get_all_cabins():
    try:
        cabins_list = fetch_all_cabins()
        if cabins_list:
            return {
                "status": "Success",
                "message": "Cabins fetched successfully",
                "cabins": cabins_list,
            }
        else:
            raise HTTPException(
                status_code=204,
                detail="No cabins found"
            )

    except HTTPException as http_exc:
        raise http_exc

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while fetching the cabins. Please try again later.",
        )



@app.put("/cabins/{cabin_id}")
async def update_cabin_endpoint(cabin_id: int, cabin: CabinChangeRequest):
    try:
        existing_cabin = get_cabin_by_id(cabin_id)
        if existing_cabin:
            updated_cabin_data = Cabin(
                cabin_id=cabin_id,
                name=cabin.name,
                office=cabin.office,
                capacity=cabin.capacity,
                status=cabin.status,
                amenities=cabin.amenities.split(', ')  
            )
            updated_cabin = update_cabin(updated_cabin_data)
            return {
                "status": "Success",
                "message": "Cabin updated successfully",
                "cabin": updated_cabin,
            }
        else:
            raise HTTPException(
                status_code=404,
                detail="No cabin found"
            )
    except HTTPException as http_exc:
        logging.error(f"HTTP error while updating cabin: {str(http_exc)}")
        raise http_exc
    except Exception as e:
        logging.error(f"Unexpected error while updating cabin: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"An unexpected error occurred while updating the cabin. Details: {str(e)}",
        )

@app.delete("/cabins/{cabin_id}")
async def delete_cabin_route(cabin_id: int):
    try:
        response_data = delete_cabin(cabin_id)
        return response_data
    except exc.SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail="Database error while deleting cabin")
    except Exception as e:
        raise HTTPException(status_code=500, detail="Unexpected error while deleting cabin")