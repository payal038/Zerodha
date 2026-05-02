import React, { useEffect, useRef } from "react";

function useReveal(dir = "reveal") {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add("visible"); obs.disconnect(); } }, { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

function Awards() {
  const left  = useReveal();
  const right = useReveal();

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-6 p-5">
          <div ref={left} className="reveal-left">
            <img src="media/image/largestBroker.svg" alt="Largest Broker" style={{ width: "100%" }} />
          </div>
        </div>
        <div className="col-6 p-5 mt-5">
          <div ref={right} className="reveal-right">
            <h1 style={{ fontWeight: 700, color: "#1a1a2e" }}>Largest stock broker in India</h1>
            <p className="text-muted mb-4">
              2+ million Zerodha clients contribute to over 15% of all retail
              order volumes in India daily by trading and investing in:
            </p>
            <div className="row">
              <div className="col-6">
                <ul className="text-muted" style={{ lineHeight: 2 }}>
                  <li>Futures and Options</li>
                  <li>Commodity derivatives</li>
                  <li>Currency derivatives</li>
                </ul>
              </div>
              <div className="col-6">
                <ul className="text-muted" style={{ lineHeight: 2 }}>
                  <li>Stocks &amp; IPOs</li>
                  <li>Direct mutual funds</li>
                  <li>Bonds and Govt. Securities</li>
                </ul>
              </div>
            </div>
            <img src="media/image/pressLogos.png" style={{ width: "90%", marginTop: 16 }} alt="Press" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Awards;
