import React, { useState } from "react";
import axios from "axios";

const BACKEND = process.env.REACT_APP_BACKEND_URL || "http://localhost:3002";

export default function BuyModal({ stock, onClose }) {
  const name  = typeof stock === "object" ? stock.name  : stock;
  const defP  = typeof stock === "object" ? (stock.price || 0) : 0;
  const defM  = typeof stock === "object" ? (stock.mode || "BUY") : "BUY";

  const [mode,    setMode]    = useState(defM);
  const [qty,     setQty]     = useState(1);
  const [price,   setPrice]   = useState(defP);
  const [placing, setPlacing] = useState(false);
  const [done,    setDone]    = useState(false);
  const [err,     setErr]     = useState("");

  const orderVal = qty * price;
  const pct      = Math.min((orderVal / 500000) * 100, 100);
  const verdict  = mode === "SELL" ? "SELL" : pct <= 5 ? "SAFE" : pct <= 12 ? "CAUTION" : "BLOCKED";
  const vcol     = { SAFE:"#15803d", CAUTION:"#b45309", BLOCKED:"#b91c1c", SELL:"#b91c1c" }[verdict];
  const vbg      = { SAFE:"#e6f9f4", CAUTION:"#fef3c7", BLOCKED:"#fef2f2", SELL:"#fef2f2" }[verdict];

  const place = async () => {
    if (verdict === "BLOCKED" || placing || !price) return;
    setPlacing(true); setErr("");
    try {
      await axios.post(`${BACKEND}/newOrder`, { name, qty, price, mode });
      window.dispatchEvent(new Event("orderplaced"));
      setDone(true);
      setTimeout(onClose, 1200);
    } catch(e) {
      setErr(e.response?.data?.message || "Order failed");
      setPlacing(false);
    }
  };

  const isBuy = mode === "BUY";

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modal} onClick={e=>e.stopPropagation()}>
        <div style={S.hdr}>
          <div style={{ display:"flex", gap:6 }}>
            <button onClick={()=>setMode("BUY")} style={{ ...S.modeBtn, background:isBuy?"#e6f9f4":"#f3f4f6", color:isBuy?"#15803d":"#888", border:`1px solid ${isBuy?"#bbf7d0":"#e5e7eb"}` }}>BUY</button>
            <button onClick={()=>setMode("SELL")} style={{ ...S.modeBtn, background:!isBuy?"#fef2f2":"#f3f4f6", color:!isBuy?"#b91c1c":"#888", border:`1px solid ${!isBuy?"#fecaca":"#e5e7eb"}` }}>SELL</button>
          </div>
          <span style={{ fontWeight:800, fontSize:16 }}>{name}</span>
          <span style={{ fontSize:10, color:"#888" }}>NSE · Equity</span>
          <button onClick={onClose} style={S.closeX}>✕</button>
        </div>

        <div style={{ padding:"16px 20px", display:"flex", gap:12 }}>
          <div style={{ flex:1 }}>
            <label style={S.label}>Quantity</label>
            <div style={{ display:"flex", gap:4 }}>
              <button style={S.step} onClick={()=>setQty(Math.max(1,qty-1))}>−</button>
              <input style={S.input} type="number" value={qty} min={1} onChange={e=>setQty(Math.max(1,+e.target.value||1))} />
              <button style={S.step} onClick={()=>setQty(qty+1)}>+</button>
            </div>
          </div>
          <div style={{ flex:1 }}>
            <label style={S.label}>Price (₹)</label>
            <input style={S.input} type="number" value={price||""} placeholder="0.00" step="0.05" onChange={e=>setPrice(parseFloat(e.target.value)||0)} />
          </div>
        </div>

        {price > 0 && (
          <div style={{ margin:"0 20px 14px", background:vbg, borderRadius:8, padding:"10px 12px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
              <span style={{ fontWeight:700, color:vcol, fontSize:13 }}>
                {isBuy ? verdict : "SELL ORDER"}
              </span>
              <span style={{ fontWeight:800 }}>₹{orderVal.toLocaleString("en-IN",{minimumFractionDigits:2})}</span>
            </div>
            {isBuy && (
              <>
                <div style={{ height:4, background:"#e5e7eb", borderRadius:4, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${pct}%`, background:vcol, borderRadius:4, transition:"width 0.4s" }} />
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:"#888", marginTop:4 }}>
                  <span>Safe ≤5%</span><span>Caution ≤12%</span><span>Blocked</span>
                </div>
              </>
            )}
          </div>
        )}

        {err && <div style={{ margin:"0 20px 10px", color:"#b91c1c", fontSize:12 }}>{err}</div>}

        <div style={{ display:"flex", gap:10, padding:"0 20px 20px" }}>
          <button onClick={place} disabled={verdict==="BLOCKED"||placing||!price}
            style={{ ...S.actionBtn, background: isBuy?"#15803d":"#b91c1c", opacity: verdict==="BLOCKED"||!price ? 0.4 : 1 }}>
            {done ? "✓ Placed!" : placing ? "Placing…" : verdict==="BLOCKED" ? "Blocked" : `${mode} ${qty} share${qty>1?"s":""}`}
          </button>
          <button onClick={onClose} style={S.cancelBtn}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

const S = {
  overlay:   { position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center" },
  modal:     { background:"#fff", borderRadius:14, width:420, boxShadow:"0 20px 60px rgba(0,0,0,0.2)", overflow:"hidden" },
  hdr:       { display:"flex", alignItems:"center", gap:10, padding:"16px 20px", borderBottom:"1px solid #e8edf2" },
  modeBtn:   { fontWeight:700, fontSize:11, borderRadius:6, padding:"4px 12px", cursor:"pointer" },
  closeX:    { marginLeft:"auto", background:"none", border:"none", fontSize:16, color:"#888", cursor:"pointer" },
  label:     { display:"block", fontSize:10, color:"#888", textTransform:"uppercase", letterSpacing:"0.6px", marginBottom:5, fontWeight:700 },
  input:     { flex:1, border:"1px solid #e5e7eb", borderRadius:7, padding:"8px 10px", fontSize:13, outline:"none", width:"100%" },
  step:      { width:32, background:"#f3f4f6", border:"1px solid #e5e7eb", borderRadius:7, fontSize:16, cursor:"pointer" },
  actionBtn: { flex:1, border:"none", borderRadius:8, padding:"11px", fontSize:14, fontWeight:700, color:"#fff", cursor:"pointer" },
  cancelBtn: { background:"none", border:"1px solid #e5e7eb", borderRadius:8, padding:"11px 18px", fontSize:13, color:"#666", cursor:"pointer" },
};
