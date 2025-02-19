from pydantic import BaseModel


class CabinRequest(BaseModel):
    request_status: str
    booking_id: int