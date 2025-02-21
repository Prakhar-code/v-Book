from pydantic import BaseModel


class Ticket(BaseModel):
    ticket_id: int
    user_id: int
    cabin_id: int
    date: str
    description: str
    response: str
    status: str
