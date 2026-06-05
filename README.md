🏨 Hotel Management System
A full-stack Hotel Management System built with React (frontend) and FastAPI (backend), designed to streamline hotel operations including room management, bookings, guest handling, and billing.

🚀 Tech Stack
LayerTechnologyFrontendReact, Axios, React RouterBackendFastAPI (Python)DatabasePostgreSQL / SQLiteAuthenticationJWT (JSON Web Tokens)StylingTailwind CSS / Material UI

📁 Project Structure
hotel-management-system/
├── frontend/                  # React application
│   ├── public/
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Page-level components
│   │   ├── services/          # API service calls (Axios)
│   │   ├── context/           # React Context / State management
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── backend/                   # FastAPI application
│   ├── app/
│   │   ├── main.py            # Entry point
│   │   ├── models/            # SQLAlchemy models
│   │   ├── schemas/           # Pydantic schemas
│   │   ├── routes/            # API route handlers
│   │   ├── services/          # Business logic
│   │   ├── database.py        # DB connection setup
│   │   └── auth.py            # Authentication helpers
│   ├── requirements.txt
│   └── .env
│
└── README.md

✨ Features

Room Management — Add, update, and delete rooms; track availability and room types
Booking Management — Create, view, modify, and cancel reservations
Guest Management — Maintain guest profiles and booking history
Check-in / Check-out — Streamlined check-in and check-out workflows
Billing & Invoicing — Auto-generate invoices on checkout
Dashboard — Real-time overview of occupancy, revenue, and upcoming bookings
User Authentication — Role-based access (Admin, Receptionist, Manager)
Search & Filter — Filter rooms by type, price, availability, and date range


⚙️ Getting Started
Prerequisites

Node.js >= 18.x
Python >= 3.10
pip
PostgreSQL (or SQLite for development)


Backend Setup (FastAPI)
bash# Navigate to the backend directory
cd backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate        # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your DB credentials and secret key

# Run database migrations
alembic upgrade head

# Start the FastAPI server
uvicorn app.main:app --reload
The API will be available at: http://localhost:8000
Interactive API docs: http://localhost:8000/docs

Frontend Setup (React)
bash# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
The React app will be available at: http://localhost:5173

🔑 Environment Variables
Create a .env file in the /backend directory:
envDATABASE_URL=postgresql://user:password@localhost:5432/hotel_db
SECRET_KEY=your_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

📡 API Endpoints
MethodEndpointDescriptionPOST/api/auth/loginUser loginGET/api/roomsGet all roomsPOST/api/roomsCreate a new roomPUT/api/rooms/{id}Update room detailsDELETE/api/rooms/{id}Delete a roomGET/api/bookingsGet all bookingsPOST/api/bookingsCreate a bookingPUT/api/bookings/{id}Update a bookingDELETE/api/bookings/{id}Cancel a bookingGET/api/guestsGet all guestsPOST/api/guestsAdd a new guestPOST/api/checkin/{booking_id}Check in a guestPOST/api/checkout/{booking_id}Check out a guest
Full API documentation available at /docs (Swagger UI) when the backend is running.

🧪 Running Tests
bash# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm run test

🛠️ Development Notes

CORS is configured in backend/app/main.py to allow requests from the React dev server
JWT tokens are stored in localStorage on the frontend
The frontend uses Axios interceptors for attaching auth headers automatically
Database models use SQLAlchemy ORM; schemas use Pydantic for validation


🤝 Contributing

Fork the repository
Create a new branch: git checkout -b feature/your-feature-name
Commit your changes: git commit -m "Add: your feature description"
Push to the branch: git push origin feature/your-feature-name
Open a Pull Request


📄 License
This project is licensed under the MIT License.

👤 Author
Made with ❤️ by Rupesh
Feel free to reach out or open an issue for any bugs or feature requests.