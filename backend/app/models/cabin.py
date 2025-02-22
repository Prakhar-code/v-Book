from pydantic import BaseModel, Field, conint, constr,validator

class Cabin(BaseModel):
    cabin_id: int = Field(..., description="Unique identifier for the cabin")
    name: constr(min_length=1, max_length=50) = Field(..., description="Name of the cabin") # type: ignore
    office: constr(min_length=1, max_length=50) = Field(..., description="Office location and name") # type: ignore
    capacity: conint(ge=1) = Field(..., description="Capacity of the cabin") # type: ignore
    status: constr(min_length=1, max_length=35) = Field(..., description="Status of the cabin") # type: ignore
    amenities: list[constr(min_length=1, max_length=255)] = Field(..., description="Amenities available in the cabin")# type: ignore

class CabinChangeRequest(BaseModel):
        name:constr(min_length=1, max_length=50) = Field(..., description="Name of the cabin") # type: ignore
        office:constr(min_length=1, max_length=50) = Field(..., description="Office location and name") # type: ignore
        capacity:conint(ge=1) = Field(..., description="Capacity of the cabin") # type: ignore
        status:constr(min_length=1, max_length=35) = Field(..., description="Status of the cabin") # type: ignore
        amenities:str=Field(..., description="Amenities available in the cabin") # type: ignore

        class Config:
            anystr_strip_whitespace = True 
            min_anystr_length = 1  
            extra = "forbid"  # Forbid extra fields not defined in the model

        def __init__(self, **data):
            super().__init__(**data)
            if isinstance(self.amenities, list):
                self.amenities = ', '.join(self.amenities)  # Convert list to a comma-separated string
