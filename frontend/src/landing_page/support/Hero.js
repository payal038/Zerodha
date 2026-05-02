import React, { useState } from "react";

function Hero() {
  const [query, setQuery] = useState("");

  return (
    <section className="container-fluid" id="supportHero" style={{ padding: "0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <h4 style={{ margin: 0, fontWeight: 700, fontSize: 20 }}>Support Portal</h4>
          <a href="#" style={{ color: "rgba(255,255,255,0.85)", fontSize: 14, textDecoration: "none", border: "1px solid rgba(255,255,255,0.4)", borderRadius: 6, padding: "6px 14px", transition: "background 0.2s" }}>
            Track Tickets →
          </a>
        </div>

        <div className="row g-4">
          <div className="col-lg-7">
            <h2 style={{ fontWeight: 700, fontSize: "1.5rem", marginBottom: 20 }}>
              Search for an answer or browse help topics to create a ticket
            </h2>
            <div style={{ position: "relative", marginBottom: 20 }}>
              <input
                id="supportWrapper"
                placeholder="Eg. how do I activate F&O segment?"
                value={query}
                onChange={e => setQuery(e.target.value)}
                style={{ paddingLeft: 44 }}
              />
              <i className="fa fa-search" style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "#888", fontSize: 16 }} />
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {["Track account opening", "Track segment activation", "Intraday margins", "Kite user manual"].map(link => (
                <a key={link} href="#" style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, textDecoration: "none", background: "rgba(255,255,255,0.12)", borderRadius: 20, padding: "4px 12px", transition: "background 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.22)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.12)"}
                >
                  {link}
                </a>
              ))}
            </div>
          </div>

          <div className="col-lg-5">
            <h3 style={{ fontWeight: 700, fontSize: "1.2rem", marginBottom: 16 }}>📌 Featured</h3>
            <ol style={{ paddingLeft: 20, lineHeight: 2.2 }}>
              <li><a href="#" style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, textDecoration: "none" }}>Current Takeovers and Delisting — 2024</a></li>
              <li><a href="#" style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, textDecoration: "none" }}>Latest Intraday leverages — MIS &amp; CO</a></li>
              <li><a href="#" style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, textDecoration: "none" }}>New margin rules for F&amp;O traders</a></li>
              <li><a href="#" style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, textDecoration: "none" }}>KYC re-verification for existing clients</a></li>
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
