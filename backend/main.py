from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import users, rooms, bookings, payments, auth  # adjust path if needed

app = FastAPI()

origins = [
    "http://localhost:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "Backend Working"}

# include routers
app.include_router(users.router)
app.include_router(rooms.router)
app.include_router(bookings.router)
app.include_router(payments.router)
app.include_router(auth.router)