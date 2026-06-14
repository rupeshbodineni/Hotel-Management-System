from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import users, rooms, bookings, payments, auth, ai
from app.database.connection import engine, Base

from app.models.user import User
from app.models.room import Room
from app.models.booking import Booking
from app.models.payment import Payment

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Hotel Management System")

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

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(rooms.router)
app.include_router(bookings.router)
app.include_router(payments.router)
app.include_router(ai.router)