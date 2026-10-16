import { useState } from "react";
import PageBanner from "../components/PageBanner";
import { HOTEL, ROOM_TYPES } from "../hotel";

const emptyForm = { name: "", phone: "", roomType: "Single", checkIn: "", checkOut: "", message: "" };

function Contact() {
  const [form, setForm] = useState(emptyForm);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    const text = [
      `Hello ${HOTEL.name},`,
      "",
      "I would like to make a booking enquiry.",
      "",
      `Name: ${form.name}`,
      `Phone: ${form.phone}`,
      `Room: ${form.roomType}`,
      `Check-in: ${form.checkIn}`,
      `Check-out: ${form.checkOut}`,
      form.message ? `Message: ${form.message}` : "",
    ]
      .join("\n")
      .trim();

    window.open(`https://wa.me/${HOTEL.whatsapp}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
    setForm(emptyForm);
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
              <form className="contact-form" onSubmit={handleSubmit}>
                <h4>Booking Enquiry</h4>
                <input name="name" placeholder="Your Name" value={form.name} onChange={handleChange} required />
                <input
                  name="phone"
                  type="tel"
                  placeholder="Phone Number"
                  value={form.phone}
                  onChange={handleChange}
                  required
                />
                <label className="hms-field">
                  Room Type
                  <select name="roomType" value={form.roomType} onChange={handleChange}>
                    {ROOM_TYPES.map((item) => (
                      <option key={item.type}>{item.type}</option>
                    ))}
                  </select>
                </label>
                <label className="hms-field">
                  Check-in
                  <input name="checkIn" type="date" value={form.checkIn} onChange={handleChange} required />
                </label>
                <label className="hms-field full">
                  Check-out
                  <input
                    name="checkOut"
                    type="date"
                    min={form.checkIn}
                    value={form.checkOut}
                    onChange={handleChange}
                    required
                  />
                </label>
                <textarea
                  name="message"
                  rows={4}
                  placeholder="Any special request? (optional)"
                  value={form.message}
                  onChange={handleChange}
                />
                <button type="submit" className="hms-btn">
                  <i className="fa fa-whatsapp"></i> Send on WhatsApp
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Contact;
