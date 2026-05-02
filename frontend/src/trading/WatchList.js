import React, { useState, useEffect } from "react";
import axios from "axios";

const BACKEND = process.env.REACT_APP_BACKEND_URL || "http://localhost:3002";
const STOCKS = [
  { name:"INFY",     price:1555.45, pct:"-1.60%" },
  { name:"TCS",      price:3194.80, pct:"-0.25%" },
  { name:"RELIANCE", price:2112.40, pct:"+1.44%" },
  { name:"HDFCBANK", price:1522.35, pct:"+0.11%" },
  { name:"WIPRO",    price:577.75,  pct:"+0.32%" },
  { name:"SBIN",     price:430.20,  pct:"-0.34%" },
  { name:"ITC",      price:207.90,  pct:"+0.80%" },
  { name:"M&M",      price:779.80,  pct:"-0.01%" },
  { name:"ONGC",     price:116.80,  pct:"-0.09%" },
];

export default function WatchList({ openBuy }) {
  const [hov, setHov]     = useState(null);
  const [sents, setSents] = useState({});
  const [live, setLive]   = useState({});

  const fetchPrices = () => {
    const syms = STOCKS.map(s => s.name === "M&M" ? "M%26M" : s.name).join(",");
    axios.get(`${BACKEND}/api/prices?symbols=${syms}`)
      .then(r => setLive(r.data))
      .catch(() => {});
  };

  useEffect(() => {
    axios.post(`${BACKEND}/api/market-sentiment`, { stocks: STOCKS.map(s=>s.name) })
      .then(r => { const m={}; (r.data.sentiments||[]).forEach(s => m[s.stock]=s.sentiment); setSents(m); })
      .catch(()=>{});
    fetchPrices();
    const iv = setInterval(fetchPrices, 30000);
    return () => clearInterval(iv);
  }, []);

  const sentColor = { BULLISH:"#15803d", BEARISH:"#b91c1c", NEUTRAL:"#6b7280" };
  const sentBg    = { BULLISH:"#e6f9f4", BEARISH:"#fef2f2", NEUTRAL:"#f3f4f6" };

  return (
    <div style={S.aside}>
      <div style={S.head}>
        <span style={{ fontWeight:700, fontSize:13 }}>Watchlist</span>
        <span style={{ fontSize:10, color: live && Object.keys(live).length ? "#15803d" : "#aaa", fontWeight:700 }}>
          {Object.keys(live).length ? "● LIVE" : "○ static"}
        </span>
      </div>
      <div style={{ flex:1, overflowY:"auto" }}>
        {STOCKS.map((s,i) => {
          const lp = live[s.name];
          const price = lp?.price ?? s.price;
          const pct   = lp?.change != null ? `${lp.change > 0 ? "+" : ""}${lp.change}%` : s.pct;
          const down  = parseFloat(pct) < 0;
          return (
            <div key={s.name} style={{ ...S.row, background: hov===i?"#f5f7fa":"#fff" }}
              onMouseEnter={()=>setHov(i)} onMouseLeave={()=>setHov(null)}>
              <div>
                <div style={{ fontWeight:700, fontSize:12 }}>{s.name}</div>
                {sents[s.name] && (
                  <span style={{ fontSize:9, fontWeight:700, borderRadius:10, padding:"1px 6px", background:sentBg[sents[s.name]], color:sentColor[sents[s.name]] }}>
                    {sents[s.name]}
                  </span>
                )}
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontWeight:700, fontSize:12 }}>₹{price?.toFixed ? price.toFixed(2) : price}</div>
                <div style={{ fontSize:10, color: down?"#b91c1c":"#15803d" }}>{pct}</div>
                {hov===i && (
                  <div style={{ display:"flex", gap:4, marginTop:3 }}>
                    <button onClick={()=>openBuy({name:s.name, price, mode:"BUY"})} style={S.bBtn}>B</button>
                    <button onClick={()=>openBuy({name:s.name, price, mode:"SELL"})} style={S.sBtn}>S</button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ borderTop:"1px solid #e8edf2", padding:"10px 14px" }}>
        {[["NIFTY 50","24,631",false],["SENSEX","81,024",true],["VIX","13.45",false]].map(([l,v,d])=>(
          <div key={l} style={{ display:"flex", justifyContent:"space-between", fontSize:11, padding:"3px 0" }}>
            <span style={{ color:"#888" }}>{l}</span>
            <span style={{ fontWeight:700, color: d?"#b91c1c":"#15803d" }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const S = {
  aside: { width:220, background:"#fff", borderLeft:"1px solid #e8edf2", display:"flex", flexDirection:"column", height:"100%" },
  head:  { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px", borderBottom:"1px solid #e8edf2" },
  row:   { display:"flex", justifyContent:"space-between", alignItems:"flex-start", padding:"10px 14px", borderBottom:"1px solid #f0f0f0", cursor:"pointer", transition:"background 0.1s" },
  bBtn:  { background:"#e6f9f4", border:"1px solid #bbf7d0", color:"#15803d", fontSize:10, fontWeight:700, borderRadius:4, padding:"2px 7px", cursor:"pointer" },
  sBtn:  { background:"#fef2f2", border:"1px solid #fecaca", color:"#b91c1c", fontSize:10, fontWeight:700, borderRadius:4, padding:"2px 7px", cursor:"pointer" },
};
