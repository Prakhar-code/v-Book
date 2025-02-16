from fastapi import HTTPException

class UserAlreadyExistsException(Exception):
    """Exception raised when a user already exists"""
    def __init__(self, message="User already exists"):
        self.message = message
        super().__init__(self.message)


def raise_http_exception(status_code: int, detail: str):
    raise HTTPException(status_code=status_code, detail=detail)
