import React, { useState, useEffect } from "react";
import axios from "axios";

const BACKEND = process.env.REACT_APP_BACKEND_URL || "http://localhost:3002";

function Card({ label, value, sub, color="#333" }) {
  return (
    <div style={{ background:"#fff", borderRadius:10, padding:"18px 20px", border:"1px solid #e8edf2", flex:1 }}>
      <div style={{ fontSize:11, color:"#888", textTransform:"uppercase", letterSpacing:"0.6px", fontWeight:700, marginBottom:6 }}>{label}</div>
      <div style={{ fontSize:22, fontWeight:800, color }}>{value}</div>
      <div style={{ fontSize:11, color:"#888", marginTop:4 }}>{sub}</div>
    </div>
  );
}

export default function Dashboard({ openBuy }) {
  const [holdings, setHoldings] = useState([]);
  const [orders,   setOrders]   = useState([]);

  const fetchOrders = () => axios.get(`${BACKEND}/allOrders`).then(r=>setOrders(r.data.slice(0,5))).catch(()=>{});

  useEffect(() => {
    axios.get(`${BACKEND}/allHoldings`).then(r=>setHoldings(r.data)).catch(()=>{});
    fetchOrders();
    window.addEventListener("orderplaced", fetchOrders);
    return () => window.removeEventListener("orderplaced", fetchOrders);
  }, []);

  const invested = holdings.reduce((s,h)=>s+h.avg*h.qty,0);
  const current  = holdings.reduce((s,h)=>s+h.price*h.qty,0);
  const pnl      = current - invested;

  return (
    <div style={{ padding:"24px" }}>
      <h4 style={{ fontWeight:800, marginBottom:20 }}>Dashboard</h4>

      {/* Metric cards */}
      <div style={{ display:"flex", gap:14, marginBottom:20 }}>
        <Card label="Portfolio Value" value={`₹${(current/1000).toFixed(1)}K`} sub={`Invested ₹${(invested/1000).toFixed(1)}K`} color="#387ED1" />
        <Card label="Total P&L" value={`${pnl>=0?"+":"-"}₹${(Math.abs(pnl)/1000).toFixed(1)}K`} sub={`${pnl>=0?"Profit":"Loss"} overall`} color={pnl>=0?"#15803d":"#b91c1c"} />
        <Card label="Holdings" value={holdings.length} sub="Active positions" />
        <Card label="Orders Today" value={orders.length} sub="Recent trades" />
      </div>

      {/* Holdings table */}
      <div style={{ background:"#fff", borderRadius:10, border:"1px solid #e8edf2", marginBottom:20, overflow:"hidden" }}>
        <div style={{ padding:"14px 18px", borderBottom:"1px solid #e8edf2", fontWeight:700, fontSize:13 }}>Holdings</div>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead><tr style={{ background:"#f8faff" }}>
            {["Stock","Qty","Avg","LTP","P&L","Net"].map(h=><th key={h} style={{ padding:"9px 14px", fontSize:10, color:"#888", textAlign:"left", fontWeight:700, textTransform:"uppercase" }}>{h}</th>)}
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
              </tr>;
            })}
          </tbody>
        </table>
      </div>

      {/* Recent orders */}
      <div style={{ background:"#fff", borderRadius:10, border:"1px solid #e8edf2", overflow:"hidden" }}>
        <div style={{ padding:"14px 18px", borderBottom:"1px solid #e8edf2", fontWeight:700, fontSize:13 }}>Recent Orders</div>
        {orders.length===0 ? <div style={{ padding:"24px", color:"#888", textAlign:"center", fontSize:13 }}>No orders yet — buy from the watchlist</div>
        : orders.map(o=>(
          <div key={o._id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"11px 18px", borderTop:"1px solid #f0f0f0" }}>
            <div style={{ fontWeight:700, fontSize:12 }}>{o.name}</div>
            <span style={{ fontSize:10, fontWeight:700, padding:"2px 9px", borderRadius:10, background:o.mode==="BUY"?"#e6f9f4":"#fef2f2", color:o.mode==="BUY"?"#15803d":"#b91c1c" }}>{o.mode}</span>
            <div style={{ fontSize:12, color:"#555" }}>Qty: {o.qty} · ₹{o.price}</div>
            <div style={{ fontSize:11, color:"#aaa" }}>{o.createdAt ? new Date(o.createdAt).toLocaleString("en-IN",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"}) : "—"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
