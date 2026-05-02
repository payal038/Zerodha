import React, { useEffect, useRef } from "react";

const TOPICS = [
  {
    icon: "fa-user",
    title: "Account Opening",
    links: ["Online Account Opening", "Offline Account Opening", "Company / Partnership / HUF Account", "NRI Account Opening", "Charges at Zerodha", "IDFC FIRST Bank 3-in-1 Account", "Getting Started"],
  },
  {
    icon: "fa-bar-chart",
    title: "Trading & Markets",
    links: ["Equity", "Futures & Options", "Currency", "Commodity", "Margins", "Corporate Actions", "Kite — Web & App"],
  },
  {
    icon: "fa-money",
    title: "Funds & Payments",
    links: ["Add Funds", "Withdraw Funds", "Payment Failures", "Bank Account Change", "UPI & Net Banking", "DP Charges"],
  },
  {
    icon: "fa-file-text",
    title: "Reports & Statements",
    links: ["P&L Reports", "Contract Notes", "Tax P&L", "Ledger", "Holdings Statement", "Annual Reports"],
  },
  {
    icon: "fa-shield",
    title: "Profile & Settings",
    links: ["Personal Details", "Bank & Demat", "Nominees", "Two-Factor Auth", "Password Reset", "KYC & Documents"],
  },
  {
    icon: "fa-briefcase",
    title: "Mutual Funds & IPOs",
    links: ["Coin — Mutual Funds", "IPO Applications", "SIP Management", "Redemption", "Switch & STP", "ELSS Tax Saving"],
  },
];

function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add("visible"); obs.disconnect(); } }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

function CreateTicket() {
  const ref = useReveal();

  return (
    <div className="container mt-4 mb-5">
      <div ref={ref} className="reveal">
        <h2 className="fs-3 mb-4 mt-3" style={{ fontWeight: 700, color: "#1a1a2e" }}>
          To create a ticket, select a relevant topic
        </h2>
        <div className="row g-4">
          {TOPICS.map((topic) => (
            <div key={topic.title} className="col-4">
              <div className="hover-card p-4 h-100" style={{ border: "1px solid #e8eef8", background: "#fff" }}>
                <h4 className="fs-5 mb-3" style={{ fontWeight: 600, color: "#1a1a2e" }}>
                  <i className={`fa ${topic.icon} me-2`} aria-hidden="true" style={{ color: "#387ED1" }}></i>
                  {topic.title}
                </h4>
                {topic.links.map((link) => (
                  <div key={link}>
                    <a href="#" style={{ textDecoration: "none", fontSize: 13, color: "#555", lineHeight: 2.4, display: "block", transition: "color 0.2s" }}
                      onMouseEnter={e => e.target.style.color = "#387ED1"}
                      onMouseLeave={e => e.target.style.color = "#555"}
                    >
                      {link}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CreateTicket;
