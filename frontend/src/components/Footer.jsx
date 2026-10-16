import { HOTEL } from "../hotel";

function Footer() {
  return (
    <footer className="hms-footer">
      <div className="container">
        <div className="row">
          <div className="col-lg-5 col-md-12 footer-col">
            <img src="/img/haya-logo-dark.webp" alt="Haya HMS logo" className="footer-logo" />
            <p>Perfect stay, easy service. Comfortable rooms and warm hospitality in the heart of the city.</p>
          </div>
          <div className="col-lg-3 offset-lg-1 col-md-6 footer-col">
            <h5>Quick Links</h5>
            <ul>
              <li><a href="#/home">Home</a></li>
              <li><a href="#/rooms">Rooms</a></li>
              <li><a href="#/about">About Us</a></li>
              <li><a href="#/contact">Contact</a></li>
            </ul>
          </div>
          <div className="col-lg-3 col-md-6 footer-col">
            <h5>Contact Us</h5>
            <ul>
              <li><i className="fa fa-map-marker"></i> {HOTEL.address}</li>
              <li><i className="fa fa-phone"></i> {HOTEL.phone}</li>
              <li><i className="fa fa-envelope"></i> {HOTEL.email}</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <span>© {new Date().getFullYear()} {HOTEL.name}. All rights reserved.</span>
          <span>
            Template by <a href="https://colorlib.com" target="_blank" rel="noreferrer">Colorlib</a>
          </span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
