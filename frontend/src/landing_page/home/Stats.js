import React, { useEffect, useRef } from "react";

function useReveal() {
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

function Stats() {
  const left = useReveal();
  const right = useReveal();

  return (
    <div className="container p-3 mt-4">
      <div className="row p-5">
        <div className="col-6 p-5">
          <div ref={left} className="reveal-left">
            <h1 className="fs-2 mb-5" style={{ fontWeight: 700, color: "#1a1a2e" }}>Trust with confidence</h1>
            <h2 className="fs-4" style={{ fontWeight: 600 }}>Customer-first always</h2>
            <p className="text-muted">
              That's why 1.3+ crore customers trust Zerodha with ₹3.5+ lakh crores
              worth of equity investments.
            </p>
            <h2 className="fs-4" style={{ fontWeight: 600 }}>No spam or gimmicks</h2>
            <p className="text-muted">
              No gimmicks, spam, "gamification", or annoying push notifications.
              High quality apps that you use at your pace, the way you like.
            </p>
            <h2 className="fs-4" style={{ fontWeight: 600 }}>The Zerodha universe</h2>
            <p className="text-muted">
              Not just an app, but a whole ecosystem. Our investments in 30+
              fintech startups offer you tailored services specific to your needs.
            </p>
            <h2 className="fs-4" style={{ fontWeight: 600 }}>Do better with money</h2>
            <p className="text-muted">
              With initiatives like Nudge and Kill Switch, we don't just
              facilitate transactions, but actively help you do better with your money.
            </p>
          </div>
        </div>
        <div className="col-6 p-5">
          <div ref={right} className="reveal-right">
            <img src="media/image/ecosystem.png" style={{ width: "90%" }} alt="Ecosystem" />
            <div className="text-center mt-3">
              <a href="#" className="arrow-link mx-4">Explore our products →</a>
              <a href="#" className="arrow-link">Try Kite demo →</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Stats;
