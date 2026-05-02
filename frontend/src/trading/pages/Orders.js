import React, { useState, useEffect } from "react";
import axios from "axios";

const BACKEND = process.env.REACT_APP_BACKEND_URL || "http://localhost:3002";

export default function Orders() {
  const [orders,   setOrders]   = useState([]);
  const [filter,   setFilter]   = useState("ALL");
  const [query,    setQuery]    = useState("");
  const [aiResult, setAiResult] = useState(null);
  const [aiLoad,   setAiLoad]   = useState(false);
  const [loading,  setLoading]  = useState(true);

  const fetchOrders = () => {
    setLoading(true);
    axios.get(`${BACKEND}/allOrders`).then(r=>setOrders(r.data)).catch(()=>{}).finally(()=>setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
    window.addEventListener("orderplaced", fetchOrders);
    return () => window.removeEventListener("orderplaced", fetchOrders);
  }, []);

  const askAI = async () => {
    if (!query.trim()) return;
    setAiLoad(true); setAiResult(null);
    try {
      const r = await axios.post(`${BACKEND}/api/query-orders`, { query });
      setAiResult(r.data);
    } catch { setAiResult({ answer:"Could not process query.", filteredOrders:[], count:0 }); }
    finally { setAiLoad(false); }
  };

  const display = aiResult ? (aiResult.filteredOrders||[])
    : filter==="ALL" ? orders : orders.filter(o=>o.mode===filter);

  return (
    <div style={{ padding:"24px" }}>
      <h4 style={{ fontWeight:800, marginBottom:16 }}>Orders</h4>

      {/* AI search */}
      <div style={{ display:"flex", gap:8, marginBottom:14, background:"#fff", border:"1px solid #e8edf2", borderRadius:10, padding:"10px 14px" }}>
        <span style={{ color:"#387ED1", fontWeight:800 }}>✦</span>
        <input style={{ flex:1, border:"none", outline:"none", fontSize:13, color:"#333" }}
          placeholder='Ask AI: "show my buy orders", "largest trade this week"…'
          value={query} onChange={e=>setQuery(e.target.value)}
          onKeyDown={e=>e.key==="Enter" && askAI()} />
        <button onClick={askAI} style={{ background:"#387ED1", color:"#fff", border:"none", borderRadius:7, padding:"5px 14px", fontSize:12, fontWeight:700, cursor:"pointer" }}>
          {aiLoad ? "…" : "Ask"}
        </button>
      </div>

      {/* AI result banner */}
      {aiResult && (
        <div style={{ background:"#eef3ff", border:"1px solid #c7d9f8", borderRadius:8, padding:"10px 14px", marginBottom:12, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <span style={{ color:"#387ED1", fontWeight:700 }}>✦ </span>
            <span style={{ fontSize:13 }}>{aiResult.answer}</span>
            <span style={{ marginLeft:10, fontWeight:700, color:"#387ED1", fontSize:12 }}>{aiResult.count} result{aiResult.count!==1?"s":""}</span>
          </div>
          <button onClick={()=>{setAiResult(null);setQuery("");}} style={{ background:"none", border:"1px solid #c7d9f8", borderRadius:6, padding:"3px 10px", fontSize:11, color:"#387ED1", cursor:"pointer" }}>Clear</button>
        </div>
      )}

      {/* Filter tabs */}
      {!aiResult && (
        <div style={{ display:"flex", gap:6, marginBottom:12 }}>
          {["ALL","BUY","SELL"].map(f=>(
            <button key={f} onClick={()=>setFilter(f)}
              style={{ padding:"5px 16px", borderRadius:20, border:"1px solid", fontSize:12, fontWeight:700, cursor:"pointer",
                background: filter===f?"#387ED1":"#fff", color: filter===f?"#fff":"#555", borderColor: filter===f?"#387ED1":"#e5e7eb" }}>
              {f}
            </button>
          ))}
        </div>
      )}

      {/* Table */}
      <div style={{ background:"#fff", borderRadius:10, border:"1px solid #e8edf2", overflow:"hidden" }}>
        {loading ? <div style={{ padding:32, textAlign:"center", color:"#888" }}>Loading…</div>
        : display.length===0 ? <div style={{ padding:40, textAlign:"center", color:"#aaa" }}>No orders found</div>
        : <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead><tr style={{ background:"#f8faff" }}>
            {["Instrument","Mode","Qty","Price","Value","Date"].map(h=><th key={h} style={{ padding:"9px 14px", fontSize:10, color:"#888", textAlign:"left", fontWeight:700, textTransform:"uppercase" }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {display.map((o,i)=>(
              <tr key={o._id||i} style={{ borderTop:"1px solid #f0f0f0" }}>
                <td style={{ padding:"10px 14px", fontWeight:700, fontSize:12 }}>{o.name}</td>
                <td style={{ padding:"10px 14px" }}><span style={{ fontSize:10, fontWeight:700, padding:"2px 9px", borderRadius:10, background:o.mode==="BUY"?"#e6f9f4":"#fef2f2", color:o.mode==="BUY"?"#15803d":"#b91c1c" }}>{o.mode}</span></td>
                <td style={{ padding:"10px 14px", fontSize:12 }}>{o.qty}</td>
                <td style={{ padding:"10px 14px", fontSize:12 }}>₹{parseFloat(o.price).toFixed(2)}</td>
                <td style={{ padding:"10px 14px", fontSize:12, fontWeight:700, color:"#387ED1" }}>₹{(o.price*o.qty).toFixed(2)}</td>
                <td style={{ padding:"10px 14px", fontSize:11, color:"#aaa" }}>{o.createdAt?new Date(o.createdAt).toLocaleString("en-IN",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"}):"—"}</td>
              </tr>
            ))}
          </tbody>
        </table>}
      </div>
    </div>
  );
}
