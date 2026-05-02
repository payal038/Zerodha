import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

function OpenAccount() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add("visible"); obs.disconnect(); } }, { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div className="container p-5 mt-3 mb-3">
      <div ref={ref} className="reveal">
        <div className="row text-center">
          <img src="media/image/homeHero.png" alt="Open Account" className="mb-4" style={{ maxWidth: "100%" }} />
          <h1 className="mt-3" style={{ fontWeight: 700, color: "#1a1a2e" }}>Open a Zerodha account</h1>
          <p className="text-muted mt-2 mb-4" style={{ fontSize: "1rem", maxWidth: 480, margin: "0 auto" }}>
            Modern platforms and apps, ₹0 investments, and flat ₹20 intraday and F&amp;O trades.
          </p>
          <div>
            <Link
              to="/signup"
              className="btn btn-primary fs-5 px-5 py-3"
              style={{ borderRadius: 8, fontWeight: 600 }}
            >
              Sign up Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OpenAccount;
