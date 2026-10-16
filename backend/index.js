const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { MongoClient } = require("mongodb");

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

const sampleRooms = [
  { id: 1, number: 101, type: "Single", price: 5000, status: "Available" },
  { id: 2, number: 102, type: "Double", price: 8000, status: "Available" },
  { id: 3, number: 201, type: "Suite", price: 15000, status: "Available" },
];

const sampleGuests = [
  { id: 1, name: "Haya Shakil", email: "haya@example.com", phone: "03001234567" },
  { id: 2, name: "Asha", email: "asha@example.com", phone: "03008765433" },
];

const hidden = { projection: { _id: 0 } };
let dbPromise;

async function connect() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not set");
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db();

  if ((await db.collection("rooms").countDocuments()) === 0) {
    await db.collection("rooms").insertMany(sampleRooms.map((room) => ({ ...room })));
  }
  if ((await db.collection("guests").countDocuments()) === 0) {
    await db.collection("guests").insertMany(sampleGuests.map((guest) => ({ ...guest })));
  }
  return db;
}

function getDb() {
  if (!dbPromise) {
    dbPromise = connect().catch((error) => {
      dbPromise = null;
      throw error;
    });
  }
  return dbPromise;
}

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

app.get("/api/rooms", async (req, res) => {
  const db = await getDb();
  const rooms = await db.collection("rooms").find({}, hidden).sort({ number: 1 }).toArray();
  res.json(rooms);
});

app.get("/api/rooms/:id", async (req, res) => {
  const db = await getDb();
  const found = await db.collection("rooms").findOne({ id: Number(req.params.id) }, hidden);
  if (!found) {
    return res.status(404).json({ message: "Room not found" });
  }
  res.json(found);
});

app.post("/api/rooms", requireAdmin, async (req, res) => {
  const db = await getDb();
  const exists = await db.collection("rooms").findOne({ number: Number(req.body.number) });
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
  await db.collection("rooms").insertOne({ ...newRoom });
  res.status(201).json(newRoom);
});

app.put("/api/rooms/:id", requireAdmin, async (req, res) => {
  const db = await getDb();
  const id = Number(req.params.id);
  const found = await db.collection("rooms").findOne({ id }, hidden);
  if (!found) {
    return res.status(404).json({ message: "Room not found" });
  }
  const changes = {
    number: req.body.number ?? found.number,
    type: req.body.type ?? found.type,
    price: req.body.price ?? found.price,
    status: req.body.status ?? found.status,
  };
  await db.collection("rooms").updateOne({ id }, { $set: changes });
  res.json({ ...found, ...changes });
});

app.delete("/api/rooms/:id", requireAdmin, async (req, res) => {
  const db = await getDb();
  const result = await db.collection("rooms").deleteOne({ id: Number(req.params.id) });
  if (result.deletedCount === 0) {
    return res.status(404).json({ message: "Room not found" });
  }
  res.json({ message: "Room deleted successfully" });
});

app.get("/api/guests", requireAdmin, async (req, res) => {
  const db = await getDb();
  const guests = await db.collection("guests").find({}, hidden).toArray();
  res.json(guests);
});

app.get("/api/guests/:id", requireAdmin, async (req, res) => {
  const db = await getDb();
  const found = await db.collection("guests").findOne({ id: Number(req.params.id) }, hidden);
  if (!found) {
    return res.status(404).json({ message: "Guest not found" });
  }
  res.json(found);
});

app.post("/api/guests", requireAdmin, async (req, res) => {
  const db = await getDb();
  const newGuest = {
    id: Date.now(),
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
  };
  await db.collection("guests").insertOne({ ...newGuest });
  res.status(201).json(newGuest);
});

app.put("/api/guests/:id", requireAdmin, async (req, res) => {
  const db = await getDb();
  const id = Number(req.params.id);
  const found = await db.collection("guests").findOne({ id }, hidden);
  if (!found) {
    return res.status(404).json({ message: "Guest not found" });
  }
  const changes = {
    name: req.body.name ?? found.name,
    email: req.body.email ?? found.email,
    phone: req.body.phone ?? found.phone,
  };
  await db.collection("guests").updateOne({ id }, { $set: changes });
  res.json({ ...found, ...changes });
});

app.delete("/api/guests/:id", requireAdmin, async (req, res) => {
  const db = await getDb();
  const result = await db.collection("guests").deleteOne({ id: Number(req.params.id) });
  if (result.deletedCount === 0) {
    return res.status(404).json({ message: "Guest not found" });
  }
  res.json({ message: "Guest deleted successfully" });
});

app.get("/api/bookings", requireAdmin, async (req, res) => {
  const db = await getDb();
  const bookings = await db.collection("bookings").find({}, hidden).sort({ id: 1 }).toArray();
  res.json(bookings);
});

app.post("/api/bookings", requireAdmin, async (req, res) => {
  const db = await getDb();
  const room = await db.collection("rooms").findOne({ id: Number(req.body.roomId) });
  const guest = await db.collection("guests").findOne({ id: Number(req.body.guestId) });

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
  await db.collection("bookings").insertOne({ ...newBooking });
  await db.collection("rooms").updateOne({ id: room.id }, { $set: { status: "Booked" } });
  res.status(201).json(newBooking);
});

app.post("/api/book", async (req, res) => {
  const { name, phone, email, roomType, checkIn, checkOut, note = "" } = req.body || {};
  if (!name || !phone || !email || !roomType || !checkIn || !checkOut) {
    return res.status(400).json({ message: "Please fill in all the fields" });
  }

  const today = new Date().toISOString().slice(0, 10);
  if (checkIn < today) {
    return res.status(400).json({ message: "Check-in date cannot be in the past" });
  }

  const nights = (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24);
  if (!(nights > 0)) {
    return res.status(400).json({ message: "Check-out date must be after check-in" });
  }
  if (nights > 30) {
    return res.status(400).json({ message: "You can book up to 30 nights online" });
  }

  const db = await getDb();
  const room = await db
    .collection("rooms")
    .findOneAndUpdate(
      { type: roomType, status: "Available" },
      { $set: { status: "Booked" } },
      { sort: { number: 1 }, projection: { _id: 0 } }
    );
  if (!room) {
    return res.status(400).json({ message: `Sorry, no ${roomType} rooms are available right now` });
  }

  let guest = await db.collection("guests").findOne({ phone }, hidden);
  if (guest) {
    await db.collection("guests").updateOne({ id: guest.id }, { $set: { name, email } });
  } else {
    guest = { id: Date.now(), name, email, phone };
    await db.collection("guests").insertOne({ ...guest });
  }

  const newBooking = {
    id: Date.now(),
    guestId: guest.id,
    guestName: name,
    roomId: room.id,
    roomNumber: room.number,
    checkIn,
    checkOut,
    nights,
    totalPrice: nights * room.price,
    status: "Active",
    note,
  };
  await db.collection("bookings").insertOne({ ...newBooking });
  res.status(201).json({ ...newBooking, roomType: room.type });
});

app.put("/api/bookings/:id/checkout", requireAdmin, async (req, res) => {
  const db = await getDb();
  const id = Number(req.params.id);
  const booking = await db.collection("bookings").findOne({ id }, hidden);
  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }
  await db.collection("bookings").updateOne({ id }, { $set: { status: "CheckedOut" } });
  await db.collection("rooms").updateOne({ id: booking.roomId }, { $set: { status: "Cleaning" } });
  res.json({ ...booking, status: "CheckedOut" });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ message: "Something went wrong on the server" });
});

app.listen(port, () => {
  console.log(`Server is running: http://localhost:${port}`);
});
