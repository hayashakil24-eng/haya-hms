
  A hotel management system I built while learning React and Node.js.

  It has two parts. The first is a small hotel website where guests can look at
  rooms, read about the hotel and send a booking enquiry on WhatsApp. The second
  is an admin panel for the front desk, where staff can manage rooms, guests and
  bookings.

  Live demo: (add your link here)

  ## What it does

  **Website**
  - Home, Rooms, About and Contact pages
  - Room prices and availability come straight from the backend
  - Booking enquiry form that opens WhatsApp with the details filled in

  **Admin panel**
  - Login for staff
  - Dashboard with available rooms, active bookings, today's check-ins and total earnings
  - Add, update and delete rooms and guests
  - Book a room for a guest. The bill is calculated from the number of nights
  - Check out a guest and the room goes to cleaning
- Book a room for a guest. The bill is calculated from the number of nights
- Check out a guest and the room goes to cleaning
- Ready made confirmation and thank you messages that can be copied or sent on WhatsApp or email

## Built with

- React (Vite)
- Node.js and Express
- Bootstrap and the Sona template for the design

I tried to keep it light. There are no big UI libraries and no router package,
and all the images are compressed to webp.

## Run it locally

Backend

    cd backend
    npm install
    cp .env.example .env
    npm run dev

Set your own admin username and password in `backend/.env`.

Frontend

    cd frontend
    npm install
    npm run dev

Open http://localhost:5173

## Things I want to add next

- A database (right now data is kept in memory, so it resets when the server restarts)
- Search and filters for bookings
- Monthly reports
