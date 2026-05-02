import React, { useState, useEffect } from "react";
import axios from "axios";

const BACKEND = process.env.REACT_APP_BACKEND_URL || "http://localhost:3002";

export default function Holdings() {
  const [holdings, setHoldings] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [aiLoad,   setAiLoad]   = useState(false);
  const [aiOpen,   setAiOpen]   = useState(false);
  const [typed,    setTyped]    = useState("");

  useEffect(() => {
    axios.get(`${BACKEND}/allHoldings`).then(r=>setHoldings(r.data)).catch(()=>{});
  }, []);

  // Stream text character by character
  const streamText = (full) => {
    let i = 0;
    setTyped("");
    const iv = setInterval(()=>{
      i++;
      setTyped(full.slice(0,i));
      if(i>=full.length) clearInterval(iv);
    }, 11);
  };

  const analyse = async () => {
    setAiLoad(true); setAiOpen(true); setAnalysis(null); setTyped("");
    const token = localStorage.getItem("ztoken");
    try {
      const r = await axios.post(`${BACKEND}/api/analyse-portfolio`, {}, { headers:{ Authorization:`Bearer ${token}` } });
      setAnalysis(r.data);
      let text = r.data.summary || "";
      if(r.data.recommendations?.length) {
        text += "\n\nRecommendations:";
        r.data.recommendations.forEach((rec,i)=>{ text += `\n${i+1}. [${rec.type}] ${rec.stock} — ${rec.reason}`; });
      }
      if(r.data.riskLevel) text += `\n\nRisk: ${r.data.riskLevel} · Diversification: ${r.data.diversificationScore}/10`;
      streamText(text);
    } catch(e) {
      streamText(e.response?.status===401 ? "Please log in to use AI analysis." : "Analysis failed. Try again.");
    } finally { setAiLoad(false); }
  };

  const invested = holdings.reduce((s,h)=>s+h.avg*h.qty,0);
  const current  = holdings.reduce((s,h)=>s+h.price*h.qty,0);
  const pnl      = current-invested;

  return (
    <div style={{ padding:"24px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <h4 style={{ fontWeight:800, margin:0 }}>Holdings ({holdings.length})</h4>
        <button onClick={analyse} disabled={aiLoad}
          style={{ background:"#387ED1", color:"#fff", border:"none", borderRadius:8, padding:"8px 18px", fontWeight:700, fontSize:13, cursor:"pointer" }}>
          {aiLoad ? "Analysing…" : "✦ AI Analyse"}
        </button>
      </div>

      {/* Summary */}
      <div style={{ display:"flex", gap:12, marginBottom:16 }}>
        {[["Invested",`₹${(invested/1000).toFixed(1)}K`,"#555"],["Current Value",`₹${(current/1000).toFixed(1)}K`,"#387ED1"],["P&L",`${pnl>=0?"+":"-"}₹${(Math.abs(pnl)/1000).toFixed(1)}K`,pnl>=0?"#15803d":"#b91c1c"]].map(([l,v,c])=>(
          <div key={l} style={{ flex:1, background:"#fff", borderRadius:10, border:"1px solid #e8edf2", padding:"14px 18px" }}>
            <div style={{ fontSize:11, color:"#888", fontWeight:700, textTransform:"uppercase", marginBottom:4 }}>{l}</div>
            <div style={{ fontSize:18, fontWeight:800, color:c }}>{v}</div>
          </div>
        ))}
      </div>

      {/* AI panel */}
      {aiOpen && (
        <div style={{ background:"#eef3ff", border:"1px solid #c7d9f8", borderRadius:10, padding:"16px 18px", marginBottom:16 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
            <span style={{ fontWeight:700, color:"#387ED1", fontSize:13 }}>✦ AI Portfolio Analysis</span>
            <button onClick={()=>setAiOpen(false)} style={{ background:"none", border:"none", color:"#888", cursor:"pointer", fontSize:16 }}>✕</button>
          </div>
          {aiLoad ? <div style={{ color:"#888", fontSize:13 }}>Analysing your portfolio…<span style={{ animation:"blink 1s infinite" }}>|</span></div>
          : <pre style={{ whiteSpace:"pre-wrap", fontFamily:"inherit", fontSize:13, color:"#333", margin:0 }}>{typed}<span style={{ animation:"blink 1s infinite" }}>|</span></pre>}
        </div>
      )}

      {/* Table */}
      <div style={{ background:"#fff", borderRadius:10, border:"1px solid #e8edf2", overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead><tr style={{ background:"#f8faff" }}>
            {["Stock","Qty","Avg Cost","LTP","P&L","Net","Day"].map(h=><th key={h} style={{ padding:"9px 14px", fontSize:10, color:"#888", textAlign:"left", fontWeight:700, textTransform:"uppercase" }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {holdings.map(h=>{
              const p=(h.price-h.avg)*h.qty, pos=p>=0;
              return <tr key={h.name} style={{ borderTop:"1px solid #f0f0f0" }}>
                <td style={{ padding:"10px 14px", fontWeight:700, fontSize:12 }}>{h.name}</td>
                <td style={{ padding:"10px 14px", fontSize:12 }}>{h.qty}</td>
                <td style={{ padding:"10px 14px", fontSize:12 }}>₹{h.avg.toFixed(2)}</td>
                <td style={{ padding:"10px 14px", fontSize:12 }}>₹{h.price.toFixed(2)}</td>
                <td style={{ padding:"10px 14px", fontSize:12, fontWeight:700, color:pos?"#15803d":"#b91c1c" }}>{pos?"+":"-"}₹{Math.abs(p).toFixed(2)}</td>
                <td style={{ padding:"10px 14px" }}><span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:10, background:h.isLoss?"#fef2f2":"#e6f9f4", color:h.isLoss?"#b91c1c":"#15803d" }}>{h.net}</span></td>
                <td style={{ padding:"10px 14px" }}><span style={{ fontSize:10, fontWeight:700, color:h.isLoss?"#b91c1c":"#15803d" }}>{h.day}</span></td>
              </tr>;
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
