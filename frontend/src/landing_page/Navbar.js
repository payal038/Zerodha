import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("zuser");
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch {}
    }
  }, []);

  // re-check on storage changes (login in same tab)
  useEffect(() => {
    const onStorage = () => {
      const stored = localStorage.getItem("zuser");
      setUser(stored ? JSON.parse(stored) : null);
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("zauth", onStorage);
    return () => { window.removeEventListener("storage", onStorage); window.removeEventListener("zauth", onStorage); };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("ztoken");
    localStorage.removeItem("zuser");
    setUser(null);
    window.dispatchEvent(new Event("zauth"));
    navigate("/");
  };

  const initials = user?.name
    ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "";

  return (
    <nav className={`navbar navbar-expand-lg border-bottom sticky-top${scrolled ? " navbar-scrolled" : ""}`} style={{ backgroundColor: "#FFF" }}>
      <div className="container p-2">
        <Link className="navbar-brand" to="/">
          <img src="media/image/logo.svg" style={{ width: "25%" }} alt="Logo" />
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-center gap-1">
            <li className="nav-item"><Link className="nav-link" to="/">Home</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/signup">Signup</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/about">About</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/product">Product</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/pricing">Pricing</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/support">Support</Link></li>

            {user ? (
              <>
                <li className="nav-item ms-2">
                  <span className="user-pill">
                    <span style={{ width: 22, height: 22, borderRadius: "50%", background: "#387ED1", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>
                      {initials}
                    </span>
                    {user.name.split(" ")[0]}
                  </span>
                </li>
                <li className="nav-item ms-1">
                  <Link className="nav-link btn-kite ms-1" to="/app">
                    Launch Kite ↗
                  </Link>
                </li>
                <li className="nav-item ms-1">
                  <button onClick={handleLogout} className="btn btn-sm btn-outline-secondary" style={{ fontSize: 13, borderRadius: 6 }}>
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <li className="nav-item ms-2">
                <Link className="nav-link btn-kite" to="/login">Login</Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
