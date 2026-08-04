# Walkthrough - Hotel Management System Completion

This document walks through the structural database additions, REST API routers, React page implementations, and verification steps for the completed Real-World Hotel Management System.

---

## Default Accounts Seeded
The backend automatically creates test accounts with distinct user roles on startup. You can log in with any of these credentials immediately at `http://localhost:5173/login`:

| User Role | Email | Password | Access Path |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@hotel.com` | `admin123` | `/admin` (Metrics, CRUD rooms, coupons, reviews) |
| **Manager** | `manager@hotel.com` | `manager123` | `/admin` (Review bookings, manage staff shifts) |
| **Receptionist** | `receptionist@hotel.com` | `receptionist123` | `/reception` (Check-in/out guests, walk-in cash book) |
| **Housekeeping** | `housekeeping@hotel.com` | `housekeeping123` | `/housekeeping` (Dirt/clean rooms statuses) |
| **Customer** | `customer@hotel.com` | `customer123` | `/dashboard` (My reservations, invoices, profile edit) |

---

## Core Features Implemented

### 1. Database Extensions & Seeding (`models/`, `main.py`)
- **Extended Tables**: Added profile columns (`phone`, `address`, `photo`, `preferences`) to `User` and inventory columns (`capacity`, `floor_number`, `discount`, `is_featured`, `description`, `amenities`, `image_url`) to `Room`.
- **New Tables**: Registered `RoomImage`, `Coupon`, `Invoice`, `Review`, `Service`, `ServiceBooking`, `RestaurantOrder`, `Staff`, and `Notification` schemas.
- **Seeding Script**: Seeds 5 luxury rooms, 3 active coupon discount promo codes (e.g. `WELCOME10`), 5 premium spa/gym services, and 5 default role accounts on server start.

### 2. REST APIs & Services (`routers/`, `services/`)
- **Authentication**: JWT token validation, cookie management, `/forgot-password`, `/reset-password` (JWT recovery links printed in terminal logs).
- **Booking Engine**: Implements validation to block double-bookings on overlapping dates for the same room, handles discount deductions, calculates taxes, and updates status registers.
- **Payments & Invoices**: Stripe and Razorpay checkout gateways mock controllers. Automatically creates paid `Invoice` record and sends email alerts mock to terminal logs upon checkout.
- **Analytics & Notifications**: Computes daily/weekly revenue statistics, returns line charts coordinates, and logs notification alerts.

### 3. Glassmorphic User Interface (`frontend/src/`)
- **Luxury Landing Page (`Home.jsx`)**: Designed with parallax backdrops, availability date-selection widgets, testimonials slider, FAQs accordion, and newsletter subscription forms.
- **Advanced Search Filter (`Rooms.jsx`)**: Filter by room type, capacity guest counters, price boundary sliders, and checkbox amenities (AC, WiFi, Jacuzzi). Sort by price low-high / high-low.
- **Bespoke Reservation (`Booking.jsx`)**: Shows invoice billing breakdowns with subtotals, luxury tax and applied coupon codes. Simulated portal checkout forms for credit cards or Razorpay UPI.
- **Customer Workspace (`Dashboard.jsx`)**: Tabs-based dashboard to moderate profile preferences, review booking history, print billing invoices, and open concierge support tickets.
- **Admin Command Desk (`Admin.jsx`)**: Management interface displaying KPI metrics cards (total sales, occupancies, pending requests), revenue charts, and full staff roster controls.
- **Staff Interfaces (`Reception.jsx`, `Housekeeping.jsx`)**: Reception desk registers walk-ins and triggers check-in/out status transitions. Housekeeping board shows dirty rooms with cleaning logs.

---

## Manual Verification Steps

1. **Verify API Docs**:
   - Access `http://localhost:8000/docs` to inspect the Swagger UI, showing complete REST operations.
2. **Customer Reservation Flow**:
   - Navigate to `http://localhost:5173/` and search for rooms.
   - Click "Book Suite" on **Presidential Penthouse** or **Premium Suite**.
   - Input dates, guest counts, and apply promo code `WELCOME10` or `ROYAL20`. Verify the billing breakdown updates instantly.
   - Choose a payment gateway (e.g., Stripe) and authorize checkout. 
   - Login with `customer@hotel.com` (password `customer123`) to view the reservation, download the invoice, or open support enquiries in your dashboard.
3. **Staff Checking Flow**:
   - Login as Receptionist (`receptionist@hotel.com` / `receptionist123`).
   - Find the booking in the roster, click **Check In**. 
   - Login as Housekeeper (`housekeeping@hotel.com` / `housekeeping123`). Change a room status to "dirty" or "maintenance" to test the cleaning scheduler.
4. **Admin Dashboard Flow**:
   - Login as Admin (`admin@hotel.com` / `admin123`) and browse through weekly revenue charts, adjust staff shifts, edit room details, or moderate customer reviews.
