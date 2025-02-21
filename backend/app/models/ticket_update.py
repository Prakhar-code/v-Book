from pydantic import BaseModel
from typing import Optional
from datetime import date as Date


class TicketUpdate(BaseModel):
    date: Optional[Date] = None
    description:str 
    response: str
    status: str
