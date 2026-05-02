import React, { useState, useEffect } from "react";
import axios from "axios";

const BACKEND = process.env.REACT_APP_BACKEND_URL || "http://localhost:3002";

export default function Positions() {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${BACKEND}/allPositions`).then(r => setPositions(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const totalPnl = positions.reduce((s, p) => s + (p.price - p.avg) * p.qty, 0);

  return (
    <div style={{ padding:"24px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <h4 style={{ fontWeight:800, margin:0 }}>Positions ({positions.length})</h4>
        <span style={{ fontWeight:800, fontSize:15, color:totalPnl>=0?"#15803d":"#b91c1c" }}>
          Day P&L: {totalPnl>=0?"+":"-"}₹{Math.abs(totalPnl).toFixed(2)}
        </span>
      </div>
      <div style={{ background:"#fff", borderRadius:10, border:"1px solid #e8edf2", overflow:"hidden" }}>
        {loading ? <div style={{ padding:32, textAlign:"center", color:"#888" }}>Loading…</div>
        : positions.length === 0 ? <div style={{ padding:40, textAlign:"center", color:"#aaa" }}>No open positions</div>
        : <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead><tr style={{ background:"#f8faff" }}>
            {["Product","Instrument","Qty","Avg","LTP","P&L","Day Chg"].map(h =>
              <th key={h} style={{ padding:"9px 14px", fontSize:10, color:"#888", textAlign:"left", fontWeight:700, textTransform:"uppercase" }}>{h}</th>
            )}
          </tr></thead>
          <tbody>
            {positions.map(p => {
              const pnl = (p.price - p.avg) * p.qty, pos = pnl >= 0;
              return <tr key={p._id} style={{ borderTop:"1px solid #f0f0f0" }}>
                <td style={{ padding:"10px 14px" }}><span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:10, background:"#eef3ff", color:"#387ED1" }}>{p.product}</span></td>
                <td style={{ padding:"10px 14px", fontWeight:700, fontSize:12 }}>{p.name}</td>
                <td style={{ padding:"10px 14px", fontSize:12 }}>{p.qty}</td>
                <td style={{ padding:"10px 14px", fontSize:12 }}>₹{p.avg.toFixed(2)}</td>
                <td style={{ padding:"10px 14px", fontSize:12 }}>₹{p.price.toFixed(2)}</td>
                <td style={{ padding:"10px 14px", fontSize:12, fontWeight:700, color:pos?"#15803d":"#b91c1c" }}>{pos?"+":"-"}₹{Math.abs(pnl).toFixed(2)}</td>
                <td style={{ padding:"10px 14px" }}><span style={{ fontSize:10, fontWeight:700, color:p.isLoss?"#b91c1c":"#15803d" }}>{p.day}</span></td>
              </tr>;
            })}
          </tbody>
        </table>}
      </div>
    </div>
  );
}
