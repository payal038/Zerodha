import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

function Hero() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (el) setTimeout(() => el.classList.add("visible"), 100);
  }, []);

  return (
    <div className="container p-5">
      <div className="row align-items-center">
        <div className="col-12 text-center">
          <div ref={ref} className="reveal">
            <img
              src="media/image/homeHero.png"
              alt="Hero"
              className="mb-5 hero-img"
              style={{ maxWidth: "100%" }}
            />
            <h1 className="mt-3" style={{ fontSize: "2.6rem", fontWeight: 700, color: "#1a1a2e" }}>
              Invest in everything
            </h1>
            <p className="text-muted mt-2 mb-4" style={{ fontSize: "1.1rem", maxWidth: 500, margin: "0 auto" }}>
              Online platform to invest in stocks, derivatives, mutual funds, ETFs, and more
            </p>
            <Link
              to="/signup"
              className="btn btn-primary fs-5 px-5 py-3"
              style={{ borderRadius: 8, fontWeight: 600 }}
            >
              Sign Up Now — It's Free
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Hero;
