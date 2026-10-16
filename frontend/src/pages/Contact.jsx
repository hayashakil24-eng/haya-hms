import { useState } from "react";
import PageBanner from "../components/PageBanner";
import { API, HOTEL, ROOM_TYPES } from "../hotel";

const emptyForm = {
  name: "",
  phone: "",
  email: "",
  roomType: "Single",
  checkIn: "",
  checkOut: "",
  note: "",
};

function formatDate(date) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function Contact() {
  const [form, setForm] = useState(emptyForm);
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const today = new Date().toLocaleDateString("en-CA");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API}/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message);
        return;
      }
      setBooking(data);
      setForm(emptyForm);
    } catch {
      setError("Server is not responding. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageBanner title="Contact Us" />

      <section className="section-space">
        <div className="container">
          <div className="row">
            <div className="col-lg-5">
              <div className="section-title left">
                <span>Get In Touch</span>
                <h2>We Are Here To Help</h2>
              </div>
              <ul className="contact-info">
                <li>
                  <i className="fa fa-map-marker"></i>
                  <div>
                    <h5>Address</h5>
                    <p>{HOTEL.address}</p>
                  </div>
                </li>
                <li>
                  <i className="fa fa-phone"></i>
                  <div>
                    <h5>Phone</h5>
                    <p>{HOTEL.phone}</p>
                  </div>
                </li>
                <li>
                  <i className="fa fa-envelope"></i>
                  <div>
                    <h5>Email</h5>
                    <p><a href={`mailto:${HOTEL.email}`}>{HOTEL.email}</a></p>
                  </div>
                </li>
                <li>
                  <i className="fa fa-clock-o"></i>
                  <div>
                    <h5>Front Desk</h5>
                    <p>Open 24 hours, 7 days a week</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="col-lg-7">
              {booking ? (
                <div className="booking-success">
                  <i className="fa fa-check-circle"></i>
                  <h4>Booking Confirmed</h4>
                  <p>Thank you, {booking.guestName}. Your room is reserved and we look forward to welcoming you.</p>
                  <ul className="room-info">
                    <li><span>Booking ID</span>{booking.id}</li>
                    <li><span>Room</span>{booking.roomNumber} ({booking.roomType})</li>
                    <li><span>Check-in</span>{formatDate(booking.checkIn)}</li>
                    <li><span>Check-out</span>{formatDate(booking.checkOut)}</li>
                    <li><span>Nights</span>{booking.nights}</li>
                    <li><span>Total Amount</span>Rs {booking.totalPrice.toLocaleString()}</li>
                  </ul>
                  <button className="hms-btn" onClick={() => setBooking(null)}>Book Another Room</button>
                </div>
              ) : (
                <form className="contact-form" onSubmit={handleSubmit}>
                  <h4>Book Your Stay</h4>
                  {error && <div className="login-error full">{error}</div>}
                  <input name="name" placeholder="Your Name" value={form.name} onChange={handleChange} required />
                  <input
                    name="phone"
                    type="tel"
                    placeholder="Phone Number"
                    value={form.phone}
                    onChange={handleChange}
                    required
                  />
                  <input
                    name="email"
                    type="email"
                    placeholder="Email Address"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                  <select name="roomType" value={form.roomType} onChange={handleChange}>
                    {ROOM_TYPES.map((item) => (
                      <option key={item.type} value={item.type}>{item.type} Room</option>
                    ))}
                  </select>
                  <label className="hms-field">
                    Check-in
                    <input
                      name="checkIn"
                      type="date"
                      min={today}
                      value={form.checkIn}
                      onChange={handleChange}
                      required
                    />
                  </label>
                  <label className="hms-field">
                    Check-out
                    <input
                      name="checkOut"
                      type="date"
                      min={form.checkIn || today}
                      value={form.checkOut}
                      onChange={handleChange}
                      required
                    />
                  </label>
                  <textarea
                    name="note"
                    rows={4}
                    placeholder="Any special request? (optional)"
                    value={form.note}
                    onChange={handleChange}
                  />
                  <button type="submit" className="hms-btn" disabled={loading}>
                    {loading ? "Booking..." : "Submit"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Contact;
