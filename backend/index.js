const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const envFile = path.join(__dirname, ".env");
if (fs.existsSync(envFile)) process.loadEnvFile(envFile);

const app = express();
const port = process.env.PORT || 5000;

const ADMIN_USER = process.env.ADMIN_USER;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const TOKEN_SECRET = process.env.TOKEN_SECRET;
const TOKEN_HOURS = 8;

app.use(cors());
app.use(express.json());

const rooms = [
  { id: 1, number: 101, type: "Single", price: 5000, status: "Available" },
  { id: 2, number: 102, type: "Double", price: 8000, status: "Booked" },
  { id: 3, number: 201, type: "Suite", price: 15000, status: "Cleaning" },
];

const guests = [
  { id: 1, name: "Haya Shakil", email: "haya@example.com", phone: "03001234567" },
  { id: 2, name: "Asha", email: "asha@example.com", phone: "03008765433" },
];

const bookings = [];

function sign(data) {
  return crypto.createHmac("sha256", TOKEN_SECRET).update(data).digest("base64url");
}

function sameText(a, b) {
  const first = crypto.createHash("sha256").update(String(a)).digest();
  const second = crypto.createHash("sha256").update(String(b)).digest();
  return crypto.timingSafeEqual(first, second);
}

function createToken(user) {
  const payload = Buffer.from(
    JSON.stringify({ user, exp: Date.now() + TOKEN_HOURS * 60 * 60 * 1000 })
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function isValidToken(token) {
  const [payload, signature] = token.split(".");
  if (!payload || !signature || !TOKEN_SECRET) return false;
  if (!sameText(signature, sign(payload))) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    return data.exp > Date.now();
  } catch {
    return false;
  }
}

function requireAdmin(req, res, next) {
  const token = (req.headers.authorization || "").replace("Bearer ", "");
  if (!isValidToken(token)) {
    return res.status(401).json({ message: "Please log in again" });
  }
  next();
}

app.post("/api/login", (req, res) => {
  if (!ADMIN_USER || !ADMIN_PASSWORD || !TOKEN_SECRET) {
    return res.status(500).json({ message: "Admin login is not set up on the server" });
  }
  const { username = "", password = "" } = req.body || {};
  if (!sameText(username, ADMIN_USER) || !sameText(password, ADMIN_PASSWORD)) {
    return res.status(401).json({ message: "Wrong username or password" });
  }
  res.json({ token: createToken(username) });
});

app.get("/api/rooms", (req, res) => {
  res.json(rooms);
});

app.get("/api/rooms/:id", (req, res) => {
  const found = rooms.find((r) => r.id === Number(req.params.id));
  if (!found) {
    return res.status(404).json({ message: "Room not found" });
  }
  res.json(found);
});

app.post("/api/rooms", requireAdmin, (req, res) => {
  const exists = rooms.find((r) => r.number === Number(req.body.number));
  if (exists) {
    return res.status(400).json({ message: "Room number already exists" });
  }
  const newRoom = {
    id: Date.now(),
    number: Number(req.body.number),
    type: req.body.type,
    price: Number(req.body.price),
    status: "Available",
  };
  rooms.push(newRoom);
  res.status(201).json(newRoom);
});

app.put("/api/rooms/:id", requireAdmin, (req, res) => {
  const found = rooms.find((r) => r.id === Number(req.params.id));
  if (!found) {
    return res.status(404).json({ message: "Room not found" });
  }
  found.number = req.body.number ?? found.number;
  found.type = req.body.type ?? found.type;
  found.price = req.body.price ?? found.price;
  found.status = req.body.status ?? found.status;
  res.json(found);
});

app.delete("/api/rooms/:id", requireAdmin, (req, res) => {
  const index = rooms.findIndex((r) => r.id === Number(req.params.id));
  if (index === -1) {
    return res.status(404).json({ message: "Room not found" });
  }
  rooms.splice(index, 1);
  res.json({ message: "Room deleted successfully" });
});

app.get("/api/guests", requireAdmin, (req, res) => {
  res.json(guests);
});

app.get("/api/guests/:id", requireAdmin, (req, res) => {
  const found = guests.find((g) => g.id === Number(req.params.id));
  if (!found) {
    return res.status(404).json({ message: "Guest not found" });
  }
  res.json(found);
});

app.post("/api/guests", requireAdmin, (req, res) => {
  const newGuest = {
    id: Date.now(),
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
  };
  guests.push(newGuest);
  res.status(201).json(newGuest);
});

app.put("/api/guests/:id", requireAdmin, (req, res) => {
  const found = guests.find((g) => g.id === Number(req.params.id));
  if (!found) {
    return res.status(404).json({ message: "Guest not found" });
  }
  found.name = req.body.name ?? found.name;
  found.email = req.body.email ?? found.email;
  found.phone = req.body.phone ?? found.phone;
  res.json(found);
});

app.delete("/api/guests/:id", requireAdmin, (req, res) => {
  const index = guests.findIndex((g) => g.id === Number(req.params.id));
  if (index === -1) {
    return res.status(404).json({ message: "Guest not found" });
  }
  guests.splice(index, 1);
  res.json({ message: "Guest deleted successfully" });
});

app.get("/api/bookings", requireAdmin, (req, res) => {
  res.json(bookings);
});

app.post("/api/bookings", requireAdmin, (req, res) => {
  const room = rooms.find((r) => r.id === Number(req.body.roomId));
  const guest = guests.find((g) => g.id === Number(req.body.guestId));

  if (!guest || !room) {
    return res.status(404).json({ message: "Room or Guest not found" });
  }
  if (room.status !== "Available") {
    return res.status(400).json({ message: "Room is not available" });
  }

  const checkIn = new Date(req.body.checkIn);
  const checkOut = new Date(req.body.checkOut);
  const nights = (checkOut - checkIn) / (1000 * 60 * 60 * 24);

  if (!(nights > 0)) {
    return res.status(400).json({ message: "Check-out date must be after check-in" });
  }

  const newBooking = {
    id: Date.now(),
    guestId: guest.id,
    guestName: guest.name,
    roomId: room.id,
    roomNumber: room.number,
    checkIn: req.body.checkIn,
    checkOut: req.body.checkOut,
    nights: nights,
    totalPrice: nights * room.price,
    status: "Active",
  };
  bookings.push(newBooking);
  room.status = "Booked";
  res.status(201).json(newBooking);
});

app.put("/api/bookings/:id/checkout", requireAdmin, (req, res) => {
  const booking = bookings.find((b) => b.id === Number(req.params.id));
  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }
  booking.status = "CheckedOut";
  const room = rooms.find((r) => r.id === booking.roomId);
  if (room) room.status = "Cleaning";
  res.json(booking);
});

app.listen(port, () => {
  console.log(`Server is running: http://localhost:${port}`);
});
