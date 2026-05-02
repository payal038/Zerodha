import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const BACKEND = process.env.REACT_APP_BACKEND_URL || "http://localhost:3002";
const STOCKS = ["INFY", "TCS", "RELIANCE", "HDFCBANK", "WIPRO", "SBIN", "ITC", "M&M"];

function SentimentWidget() {
  const [sentiments, setSentiments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add("visible"); obs.disconnect(); } }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    axios.post(`${BACKEND}/api/market-sentiment`, { stocks: STOCKS })
      .then(r => setSentiments(r.data.sentiments || []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const icon = { BULLISH: "▲", BEARISH: "▼", NEUTRAL: "—" };

  return (
    <div className="container mt-5 mb-5">
      <div ref={ref} className="reveal">
        <div className="row align-items-center mb-4">
          <div className="col">
            <h2 className="fs-3 mb-1" style={{ fontWeight: 700, color: "#1a1a2e" }}>
              AI Market Sentiment
            </h2>
            <p className="text-muted mb-0" style={{ fontSize: 14 }}>
              Powered by OpenAI · Refreshed every 30 minutes
            </p>
          </div>
          <div className="col-auto">
            <span style={{ background: "#e6f9f4", color: "#15803d", border: "1px solid #bbf7d0", borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 700 }}>
              ✦ AI Powered
            </span>
          </div>
        </div>

        <div className="sentiment-widget">
          {loading && (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" style={{ width: 28, height: 28 }} role="status" />
              <p className="text-muted mt-2 mb-0" style={{ fontSize: 13 }}>AI is analysing markets…</p>
            </div>
          )}

          {error && !loading && (
            <div className="text-center py-3 text-muted" style={{ fontSize: 13 }}>
              Backend not connected. Start the server to see live sentiment.
            </div>
          )}

          {!loading && !error && sentiments.map((s, i) => (
            <div key={s.stock} className="sentiment-row" style={{ animationDelay: `${i * 0.05}s` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontWeight: 700, fontSize: 13, color: "#1a1a2e", minWidth: 90 }}>{s.stock}</span>
                <span className={`sentiment-badge sentiment-${s.sentiment}`}>
                  {icon[s.sentiment]} {s.sentiment}
                </span>
              </div>
              <span className="text-muted" style={{ fontSize: 12, maxWidth: 260, textAlign: "right" }}>{s.reason}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SentimentWidget;
