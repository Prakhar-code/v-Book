from pydantic import BaseModel
from datetime import date
from typing import Optional

class TicketCreate(BaseModel):
    user_id: int
    cabin_id: int
    date: date
    description: str
    response: Optional[str] = None
    status: Optional[str] = 'Open'