from pydantic import BaseModel

class BookingRequest(BaseModel):
    userId: int
    email:str
    name:str
    startTime: str
    endTime: str
    purpose: str
    additionalRequirements: str = None

class BookingResponse(BaseModel):
    status: str
    message: str
    booking_id: int