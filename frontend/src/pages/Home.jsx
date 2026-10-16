import RoomCards from "../components/RoomCards";
import { SERVICES } from "../hotel";

function Home() {
  return (
    <>
      <section className="hero">
        <div className="container">
          <div className="hero-text">
            <span>Welcome to Haya HMS</span>
            <h1>A Perfect Stay, Easy Service</h1>
            <p>
              Comfortable rooms, warm hospitality and simple booking. Everything you need for a
              relaxing stay, all in one place.
            </p>
            <div className="hero-buttons">
              <a href="#/rooms" className="hms-btn">Explore Rooms</a>
              <a href="#/contact" className="hms-btn hms-btn-outline">Contact Us</a>
            </div>
          </div>
        </div>
      </section>

      <section className="section-space section-white">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 about-text">
              <div className="section-title left">
                <span>About Us</span>
                <h2>Welcome To Haya HMS</h2>
              </div>
              <p>
                At Haya HMS we believe a hotel stay should feel easy from the first call to the
                last goodbye. Our rooms are clean, quiet and thoughtfully designed, and our front
                desk team is always ready to help.
              </p>
              <p>
                Whether you are here for business or a family trip, we make sure every guest feels
                at home.
              </p>
              <a href="#/about" className="link-more">Read More</a>
            </div>
            <div className="col-lg-6">
              <div className="about-images">
                <img src="/img/about-1.webp" alt="Hotel lounge" loading="lazy" />
                <img src="/img/about-2.webp" alt="Hotel room" loading="lazy" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-space">
        <div className="container">
          <div className="section-title">
            <span>What We Do</span>
            <h2>Discover Our Services</h2>
          </div>
          <div className="row">
            {SERVICES.map((service) => (
              <div className="col-lg-4 col-sm-6" key={service.title}>
                <div className="service-card">
                  <i className={`fa ${service.icon}`}></i>
                  <h4>{service.title}</h4>
                  <p>{service.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-space section-white">
        <div className="container">
          <div className="section-title">
            <span>Our Rooms</span>
            <h2>Choose Your Stay</h2>
          </div>
          <RoomCards />
        </div>
      </section>
    </>
  );
}

export default Home;
