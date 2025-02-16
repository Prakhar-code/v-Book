from pydantic import BaseModel


class ErrorResponse(BaseModel):
    status: str
    message: str

