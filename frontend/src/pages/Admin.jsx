import { useCallback, useEffect, useState } from "react";
import { API, HOTEL } from "../hotel";
import Login from "../components/Login";

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: "fa-th-large" },
  { id: "rooms", label: "Rooms", icon: "fa-bed" },
  { id: "guests", label: "Guests", icon: "fa-users" },
  { id: "bookings", label: "Bookings", icon: "fa-calendar" },
];

function formatDate(date) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function whatsappNumber(phone) {
  const digits = phone.replace(/\D/g, "");
  return digits.startsWith("0") ? "92" + digits.slice(1) : digits;
}

function readToken() {
  try {
    return localStorage.getItem("hmsToken") || "";
  } catch {
    return "";
  }
}

function saveToken(value) {
  try {
    if (value) localStorage.setItem("hmsToken", value);
    else localStorage.removeItem("hmsToken");
  } catch {
    return;
  }
}

function AdminPanel({ token, onLogout }) {
  const [tab, setTab] = useState("dashboard");

  const [rooms, setRooms] = useState([]);
  const [form, setForm] = useState({ number: "", type: "Single", price: "" });

  const [guests, setGuests] = useState([]);
  const [guestForm, setGuestForm] = useState({ name: "", phone: "", email: "" });

  const [bookings, setBookings] = useState([]);
  const [bookingForm, setBookingForm] = useState({
    guestId: "",
    roomId: "",
    checkIn: "",
    checkOut: "",
  });

  const [message, setMessage] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      fetch(`${API}/rooms`, { headers }),
      fetch(`${API}/guests`, { headers }),
      fetch(`${API}/bookings`, { headers }),
    ]).then(async ([roomsRes, guestsRes, bookingsRes]) => {
      if (guestsRes.status === 401 || bookingsRes.status === 401) {
        onLogout();
        return;
      }
      setRooms(await roomsRes.json());
      setGuests(await guestsRes.json());
      setBookings(await bookingsRes.json());
    });
  }, [token, onLogout]);

  function api(path, options = {}) {
    return fetch(`${API}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }).then((res) => {
      if (res.status === 401) {
        onLogout();
        throw new Error("Session expired");
      }
      return res;
    });
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const res = await api(`/rooms`, {
      method: "POST",
      body: JSON.stringify({
        number: Number(form.number),
        type: form.type,
        price: Number(form.price),
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.message);
      return;
    }
    setRooms([...rooms, data]);
    setForm({ number: "", type: "Single", price: "" });
  }

  function changeStatus(id, status) {
    api(`/rooms/${id}`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    })
      .then((res) => res.json())
      .then((updated) => {
        setRooms(rooms.map((r) => (r.id === id ? updated : r)));
      });
  }

  function deleteRoom(id) {
    if (!window.confirm("Are you sure you want to delete this room?")) return;
    api(`/rooms/${id}`, { method: "DELETE" }).then(() => {
      setRooms(rooms.filter((r) => r.id !== id));
    });
  }

  function handleGuestChange(e) {
    setGuestForm({ ...guestForm, [e.target.name]: e.target.value });
  }

  async function addGuest(e) {
    e.preventDefault();
    const res = await api(`/guests`, {
      method: "POST",
      body: JSON.stringify(guestForm),
    });
    const data = await res.json();
    setGuests([...guests, data]);
    setGuestForm({ name: "", phone: "", email: "" });
  }

  function deleteGuest(id) {
    if (!window.confirm("Are you sure you want to delete this guest?")) return;
    api(`/guests/${id}`, { method: "DELETE" }).then(() => {
      setGuests(guests.filter((g) => g.id !== id));
    });
  }

  function handleBookingChange(e) {
    setBookingForm({ ...bookingForm, [e.target.name]: e.target.value });
  }

  const selectedRoom = rooms.find((r) => r.id === Number(bookingForm.roomId));
  const nights =
    (new Date(bookingForm.checkOut) - new Date(bookingForm.checkIn)) /
    (1000 * 60 * 60 * 24);
  const previewTotal = selectedRoom && nights > 0 ? nights * selectedRoom.price : 0;

  async function addBooking(e) {
    e.preventDefault();
    const res = await api(`/bookings`, {
      method: "POST",
      body: JSON.stringify(bookingForm),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.message);
      return;
    }
    setBookings([...bookings, data]);
    setRooms(rooms.map((r) => (r.id === data.roomId ? { ...r, status: "Booked" } : r)));
    setBookingForm({ guestId: "", roomId: "", checkIn: "", checkOut: "" });
  }

  function checkout(booking) {
    if (!window.confirm(`Check out ${booking.guestName}?`)) return;
    api(`/bookings/${booking.id}/checkout`, { method: "PUT" })
      .then((res) => res.json())
      .then((updated) => {
        setBookings(bookings.map((b) => (b.id === updated.id ? updated : b)));
        setRooms(
          rooms.map((r) => (r.id === booking.roomId ? { ...r, status: "Cleaning" } : r))
        );
      });
  }

  function buildMessage(b) {
    const room = rooms.find((r) => r.id === b.roomId);
    const roomName = room ? `${b.roomNumber} (${room.type})` : b.roomNumber;
    const stay = `${b.nights} night${b.nights > 1 ? "s" : ""}`;
    const amount = `Rs ${b.totalPrice.toLocaleString()}`;

    if (b.status === "Active") {
      return [
        `Dear ${b.guestName},`,
        "",
        `Thank you for choosing ${HOTEL.name}. We are pleased to confirm your reservation.`,
        "",
        "Booking Details",
        `Room: ${roomName}`,
        `Check-in: ${formatDate(b.checkIn)}`,
        `Check-out: ${formatDate(b.checkOut)}`,
        `Duration: ${stay}`,
        `Total Amount: ${amount}`,
        "",
        `Should you need any assistance before your arrival, please contact us at ${HOTEL.phone}.`,
        "",
        "We look forward to welcoming you.",
        "",
        "Warm regards,",
        "Front Desk",
        HOTEL.name,
      ].join("\n");
    }

    return [
      `Dear ${b.guestName},`,
      "",
      `Thank you for staying with us at ${HOTEL.name}. We hope you enjoyed a comfortable stay in Room ${roomName}.`,
      "",
      "Stay Summary",
      `Check-in: ${formatDate(b.checkIn)}`,
      `Check-out: ${formatDate(b.checkOut)}`,
      `Duration: ${stay}`,
      `Total Amount: ${amount}`,
      "",
      "Your feedback means a great deal to us, and we would be delighted to welcome you back.",
      "",
      "Warm regards,",
      "Front Desk",
      HOTEL.name,
    ].join("\n");
  }

  function openMessage(b) {
    setCopied(false);
    setMessage({
      title: b.status === "Active" ? "Booking Confirmation" : "Thank You Message",
      subject:
        b.status === "Active"
          ? `Your Booking is Confirmed - ${HOTEL.name}`
          : `Thank You for Staying with ${HOTEL.name}`,
      text: buildMessage(b),
      guest: guests.find((g) => g.id === b.guestId),
    });
  }

  function copyMessage() {
    navigator.clipboard.writeText(message.text).then(() => setCopied(true));
  }

  const today = new Date().toLocaleDateString("en-CA");
  const availableRooms = rooms.filter((r) => r.status === "Available").length;
  const activeBookings = bookings.filter((b) => b.status === "Active").length;
  const todayCheckIns = bookings.filter((b) => b.checkIn === today).length;
  const totalEarnings = bookings.reduce((sum, b) => sum + b.totalPrice, 0);
  const recentBookings = bookings.slice(-5).reverse();

  function bookingsTable(list, withActions) {
    return (
      <div className="table-wrap">
        <table className="hms-table">
          <thead>
            <tr>
              <th>Guest</th>
              <th>Room</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Nights</th>
              <th>Total Bill</th>
              <th>{withActions ? "Action" : "Status"}</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 && (
              <tr>
                <td colSpan={7} className="empty-row">No bookings yet</td>
              </tr>
            )}
            {list.map((b) => (
              <tr key={b.id}>
                <td>{b.guestName}</td>
                <td>{b.roomNumber}</td>
                <td>{formatDate(b.checkIn)}</td>
                <td>{formatDate(b.checkOut)}</td>
                <td>{b.nights}</td>
                <td><strong>Rs {b.totalPrice.toLocaleString()}</strong></td>
                <td>
                  {withActions ? (
                    <div className="action-group">
                      {b.status === "Active" ? (
                        <button className="btn-checkout" onClick={() => checkout(b)}>
                          Check-out
                        </button>
                      ) : (
                        <span className="badge-status status-CheckedOut">Checked out</span>
                      )}
                      <button
                        className="btn-message"
                        onClick={() => openMessage(b)}
                        aria-label="Write message"
                        title="Write message"
                      >
                        <i className="fa fa-envelope-o"></i>
                      </button>
                    </div>
                  ) : (
                    <span className={`badge-status ${b.status === "Active" ? "status-Booked" : "status-CheckedOut"}`}>
                      {b.status === "Active" ? "Active" : "Checked out"}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <>
      <section className="admin-bar">
        <div className="container">
          <h2>Admin Panel</h2>
          <div className="admin-tabs">
            {tabs.map((t) => (
              <button
                key={t.id}
                className={tab === t.id ? "active" : ""}
                onClick={() => setTab(t.id)}
              >
                <i className={`fa ${t.icon}`}></i> {t.label}
              </button>
            ))}
            <button className="admin-logout" onClick={onLogout}>
              <i className="fa fa-sign-out"></i> Logout
            </button>
          </div>
        </div>
      </section>

      {tab === "dashboard" && (
        <section className="container admin-section">
          <div className="stats-grid">
            <div className="stat-card">
              <i className="fa fa-bed"></i>
              <div>
                <span>Available Rooms</span>
                <h3>{availableRooms} / {rooms.length}</h3>
              </div>
            </div>
            <div className="stat-card">
              <i className="fa fa-calendar-check-o"></i>
              <div>
                <span>Active Bookings</span>
                <h3>{activeBookings}</h3>
              </div>
            </div>
            <div className="stat-card">
              <i className="fa fa-sign-in"></i>
              <div>
                <span>Today's Check-ins</span>
                <h3>{todayCheckIns}</h3>
              </div>
            </div>
            <div className="stat-card">
              <i className="fa fa-money"></i>
              <div>
                <span>Total Earnings</span>
                <h3>Rs {totalEarnings.toLocaleString()}</h3>
              </div>
            </div>
          </div>

          <h4 className="admin-subtitle">Recent Bookings</h4>
          {bookingsTable(recentBookings, false)}
        </section>
      )}

      {tab === "rooms" && (
        <section className="container admin-section">
          <div className="section-title">
            <span>Manage</span>
            <h2>Rooms</h2>
          </div>

          <form className="hms-form" onSubmit={handleSubmit}>
            <input
              name="number"
              type="number"
              min={1}
              placeholder="Room No"
              value={form.number}
              onChange={handleChange}
              required
            />
            <select name="type" value={form.type} onChange={handleChange}>
              <option>Single</option>
              <option>Double</option>
              <option>Suite</option>
            </select>
            <input
              name="price"
              type="number"
              min={1}
              placeholder="Price / Night"
              value={form.price}
              onChange={handleChange}
              required
            />
            <button type="submit" className="hms-btn">+ Add Room</button>
          </form>

          <div className="table-wrap">
            <table className="hms-table">
              <thead>
                <tr>
                  <th>Room No</th>
                  <th>Type</th>
                  <th>Price / Night</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((room) => (
                  <tr key={room.id}>
                    <td>{room.number}</td>
                    <td>{room.type}</td>
                    <td>Rs {room.price.toLocaleString()}</td>
                    <td>
                      <select
                        className={`status-select status-${room.status}`}
                        value={room.status}
                        onChange={(e) => changeStatus(room.id, e.target.value)}
                      >
                        <option>Available</option>
                        <option>Booked</option>
                        <option>Cleaning</option>
                      </select>
                    </td>
                    <td>
                      <button
                        className="btn-delete"
                        onClick={() => deleteRoom(room.id)}
                        aria-label="Delete room"
                      >
                        <i className="fa fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === "guests" && (
        <section className="container admin-section">
          <div className="section-title">
            <span>Manage</span>
            <h2>Guests</h2>
          </div>

          <form className="hms-form" onSubmit={addGuest}>
            <input
              name="name"
              placeholder="Full Name"
              value={guestForm.name}
              onChange={handleGuestChange}
              required
            />
            <input
              name="phone"
              type="tel"
              placeholder="Phone (03xx xxxxxxx)"
              value={guestForm.phone}
              onChange={handleGuestChange}
              required
            />
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={guestForm.email}
              onChange={handleGuestChange}
              required
            />
            <button type="submit" className="hms-btn">+ Add Guest</button>
          </form>

          <div className="table-wrap">
            <table className="hms-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {guests.map((guest) => (
                  <tr key={guest.id}>
                    <td>{guest.name}</td>
                    <td>{guest.phone}</td>
                    <td>{guest.email}</td>
                    <td>
                      <button
                        className="btn-delete"
                        onClick={() => deleteGuest(guest.id)}
                        aria-label="Delete guest"
                      >
                        <i className="fa fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === "bookings" && (
        <section className="container admin-section">
          <div className="section-title">
            <span>Reservations</span>
            <h2>Bookings</h2>
          </div>

          <form className="hms-form" onSubmit={addBooking}>
            <label className="hms-field">
              Guest
              <select
                name="guestId"
                value={bookingForm.guestId}
                onChange={handleBookingChange}
                required
              >
                <option value="">Select guest</option>
                {guests.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </label>

            <label className="hms-field">
              Room
              <select
                name="roomId"
                value={bookingForm.roomId}
                onChange={handleBookingChange}
                required
              >
                <option value="">Select room</option>
                {rooms
                  .filter((r) => r.status === "Available")
                  .map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.number} ({r.type}) - Rs {r.price.toLocaleString()}
                    </option>
                  ))}
              </select>
            </label>

            <label className="hms-field">
              Check-in
              <input
                name="checkIn"
                type="date"
                value={bookingForm.checkIn}
                onChange={handleBookingChange}
                required
              />
            </label>

            <label className="hms-field">
              Check-out
              <input
                name="checkOut"
                type="date"
                min={bookingForm.checkIn}
                value={bookingForm.checkOut}
                onChange={handleBookingChange}
                required
              />
            </label>

            <div className="bill-preview">
              {previewTotal > 0 ? (
                <>
                  {nights} night{nights > 1 ? "s" : ""} ={" "}
                  <strong>Rs {previewTotal.toLocaleString()}</strong>
                </>
              ) : (
                "Select room & dates"
              )}
            </div>

            <button type="submit" className="hms-btn">Book Now</button>
          </form>

          {bookingsTable(bookings, true)}
        </section>
      )}

      {message && (
        <div className="msg-overlay" onClick={() => setMessage(null)}>
          <div className="msg-box" onClick={(e) => e.stopPropagation()}>
            <div className="msg-head">
              <h4>{message.title}</h4>
              <button className="msg-close" onClick={() => setMessage(null)} aria-label="Close">
                <i className="fa fa-times"></i>
              </button>
            </div>

            <textarea
              value={message.text}
              onChange={(e) => setMessage({ ...message, text: e.target.value })}
              rows={16}
            />

            <div className="msg-actions">
              <button className="hms-btn" onClick={copyMessage}>
                {copied ? "Copied" : "Copy"}
              </button>
              {message.guest && (
                <>
                  <a
                    className="msg-link"
                    href={`https://wa.me/${whatsappNumber(message.guest.phone)}?text=${encodeURIComponent(message.text)}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <i className="fa fa-whatsapp"></i> WhatsApp
                  </a>
                  <a
                    className="msg-link"
                    href={`mailto:${message.guest.email}?subject=${encodeURIComponent(message.subject)}&body=${encodeURIComponent(message.text)}`}
                  >
                    <i className="fa fa-envelope"></i> Email
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Admin() {
  const [token, setToken] = useState(readToken);

  function login(newToken) {
    saveToken(newToken);
    setToken(newToken);
  }

  const logout = useCallback(() => {
    saveToken("");
    setToken("");
  }, []);

  if (!token) return <Login onLogin={login} />;
  return <AdminPanel token={token} onLogout={logout} />;
}

export default Admin;
