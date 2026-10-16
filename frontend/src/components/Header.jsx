import { useState } from "react";

const links = [
  { id: "home", label: "Home" },
  { id: "rooms", label: "Rooms" },
  { id: "about", label: "About Us" },
  { id: "contact", label: "Contact" },
];

function Header({ page }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="hms-header">
      <div className="container hms-header-inner">
        <a href="#/home" className="hms-brand">
          <img src="/img/haya-logo.webp" alt="Haya HMS logo" />
          <h1>Haya <span>HMS</span></h1>
        </a>

        <button
          className="hms-menu-btn"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          <i className={menuOpen ? "fa fa-times" : "fa fa-bars"}></i>
        </button>

        <nav className={menuOpen ? "hms-nav open" : "hms-nav"}>
          {links.map((link) => (
            <a
              key={link.id}
              href={`#/${link.id}`}
              className={page === link.id ? "active" : ""}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <a
            href="#/admin"
            className={page === "admin" ? "nav-admin active" : "nav-admin"}
            onClick={() => setMenuOpen(false)}
          >
            <i className="fa fa-lock"></i> Admin
          </a>
        </nav>
      </div>
    </header>
  );
}

export default Header;
