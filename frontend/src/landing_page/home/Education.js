import React, { useEffect, useRef } from "react";

function useReveal(cls) {
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

function Education() {
  const left  = useReveal();
  const right = useReveal();

  return (
    <div className="container mt-5 mb-5">
      <div className="row align-items-center">
        <div className="col-6">
          <div ref={left} className="reveal-left">
            <img src="media/image/education.svg" style={{ width: "70%" }} alt="Education" />
          </div>
        </div>
        <div className="col-6">
          <div ref={right} className="reveal-right">
            <h1 className="mb-3 fs-2" style={{ fontWeight: 700, color: "#1a1a2e" }}>
              Free and open market education
            </h1>
            <p className="text-muted">
              Varsity, the largest online stock market education book in the world
              covering everything from the basics to advanced trading.
            </p>
            <a href="#" className="arrow-link">Varsity →</a>
            <p className="text-muted mt-4">
              TradingQ&amp;A, the most active trading and investment community in
              India for all your market related queries.
            </p>
            <a href="#" className="arrow-link">TradingQ&amp;A →</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Education;
