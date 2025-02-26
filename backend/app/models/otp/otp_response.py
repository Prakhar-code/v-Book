from pydantic import BaseModel


class OTPResponse(BaseModel):
    status: str
    message: str