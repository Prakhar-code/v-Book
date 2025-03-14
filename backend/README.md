# Backend
## Getting Started

### Prerequisites

- Python 3.8+
- FastAPI
- Uvicorn

### Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/Prakhar-code/v-Book.git
    cd your-repo/backend
    ```

2. Create and activate a virtual environment:
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows use `venv\Scripts\activate`
    ```

3. Install the dependencies:
    ```bash
    pip install -r requirements.txt
    ```
### Set Python Path 

Set python path before running the server by copying the path for the run.py file

Example:
```bash
export PYTHONPATH=/d:/v-Book/backend
```

On Windows:
```bash
set PYTHONPATH=d:\v-Book\backend
```

### Running the Application

Start the FastAPI server using Uvicorn:
```bash
uvicorn run.app:app --reload
```

The application will be available at `http://127.0.0.1:8000`.

### Project Structure

Example : 
```
backend/
├── app/
│   ├── __init__.py
│   ├── run.py
│   ├── routes/
│   │   ├── __init__.py
│   │   └── endpoints/
│   │       ├── __init__.py
│   │       └── example_route.py
│   ├── core/
│   │   ├── __init__.py
│   │   ├── db.py
│   │   └── config.py
│   ├── models/
│   │   ├── __init__.py
│   │   └── example_model.py
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── example_schema.py
│   └── services/
│       ├── __init__.py
│       └── example_service.py
├── tests/
│   ├── __init__.py
│   └── test_files.py
├── .gitignore
├── .env
├── requirements.txt
└── README.md
```

### Example Endpoint

Here's an example of what a sample endpoint in FastAPI looks like `vbook/v1/api/endpoints/example.py`:

```python
from fastapi import APIRouter

router = APIRouter()

@router.get("/vbook")
async def read_example():
    return {"message": "Hello, User!"}
```

Don't forget to include the router in your `app/main.py`:

```python
from fastapi import FastAPI
from app.api.endpoints import example

app = FastAPI()

app.include_router(example.router, prefix="/vbook/v1")
```

### Testing

Run the tests using pytest:
```bash
pytest
```