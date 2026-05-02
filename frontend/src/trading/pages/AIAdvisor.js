import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const BACKEND = process.env.REACT_APP_BACKEND_URL || "http://localhost:3002";
const CHIPS = [
  "What's my portfolio value?",
  "Show my holdings with live prices",
  "Buy 2 shares of INFY at current price",
  "What are my recent orders?",
  "Analyse my portfolio risk",
  "Which stocks are in loss?",
];

export default function AIAdvisor() {
  const [msgs,    setMsgs]    = useState([{ role:"ai", text:"Hi! I'm your AI Trading Assistant. I can check your live holdings, place orders, get real-time prices, and analyse your portfolio. Try asking me anything!" }]);
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior:"smooth" }); }, [msgs, loading]);

  const stream = (full) => {
    let i = 0;
    setMsgs(m => [...m, { role:"ai", text:"" }]);
    const iv = setInterval(() => {
      i++;
      setMsgs(m => { const c=[...m]; c[c.length-1]={ role:"ai", text:full.slice(0,i) }; return c; });
      if (i >= full.length) clearInterval(iv);
    }, 12);
  };

  const send = async (text) => {
    const t = (text || input).trim();
    if (!t || loading) return;
    setInput("");
    setMsgs(m => [...m, { role:"user", text:t }]);
    setLoading(true);
    const token = localStorage.getItem("ztoken");
    try {
      const r = await axios.post(`${BACKEND}/api/chat`, { message: t }, { headers:{ Authorization:`Bearer ${token}` } });
      setLoading(false);
      stream(r.data.reply || "Done.");
    } catch(e) {
      setLoading(false);
      stream(e.response?.status === 401 ? "Please log in to use the AI assistant." : `Error: ${e.response?.data?.error || "Something went wrong."}`);
    }
  };

  return (
    <div style={{ padding:"24px", display:"flex", flexDirection:"column", height:"100%", boxSizing:"border-box" }}>
      <div style={{ marginBottom:16 }}>
        <h4 style={{ fontWeight:800, margin:0 }}>✦ AI Trading Assistant</h4>
        <p style={{ color:"#888", fontSize:12, margin:"4px 0 0" }}>Powered by OpenAI GPT-4o-mini + MCP Tools · Real portfolio data · Can place orders</p>
      </div>

      <div style={{ flex:1, overflowY:"auto", background:"#fff", borderRadius:10, border:"1px solid #e8edf2", padding:16, marginBottom:12, display:"flex", flexDirection:"column", gap:12 }}>
        {msgs.map((m,i) => (
          <div key={i} style={{ display:"flex", justifyContent:m.role==="user"?"flex-end":"flex-start" }}>
            {m.role==="ai" && <div style={{ width:28, height:28, borderRadius:8, background:"#eef3ff", border:"1px solid #c7d9f8", display:"flex", alignItems:"center", justifyContent:"center", marginRight:8, flexShrink:0, color:"#387ED1", fontWeight:800, fontSize:12 }}>✦</div>}
            <div style={{ maxWidth:"75%", padding:"10px 14px", borderRadius:12, fontSize:13, lineHeight:1.65, whiteSpace:"pre-wrap",
              background:m.role==="user"?"#387ED1":"#f8faff", color:m.role==="user"?"#fff":"#333",
              borderBottomRightRadius:m.role==="user"?4:12, borderBottomLeftRadius:m.role==="ai"?4:12,
              border:m.role==="ai"?"1px solid #e8edf2":"none",
            }}>{m.text}</div>
          </div>
        ))}
        {loading && (
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:28, height:28, borderRadius:8, background:"#eef3ff", border:"1px solid #c7d9f8", display:"flex", alignItems:"center", justifyContent:"center", color:"#387ED1", fontWeight:800, fontSize:12 }}>✦</div>
            <div style={{ background:"#f8faff", border:"1px solid #e8edf2", borderRadius:12, padding:"10px 14px" }}>
              <span style={{ display:"inline-flex", gap:4 }}>
                {[0,1,2].map(i => <span key={i} style={{ width:6, height:6, borderRadius:"50%", background:"#387ED1", display:"inline-block", animation:`bounce 1.2s ${i*0.2}s infinite` }} />)}
              </span>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:10 }}>
        {CHIPS.map(c => (
          <button key={c} onClick={() => send(c)}
            style={{ background:"#fff", border:"1px solid #e8edf2", borderRadius:20, padding:"5px 12px", fontSize:11, color:"#555", cursor:"pointer" }}
            onMouseEnter={e => { e.target.style.borderColor="#387ED1"; e.target.style.color="#387ED1"; }}
            onMouseLeave={e => { e.target.style.borderColor="#e8edf2"; e.target.style.color="#555"; }}>
            {c}
          </button>
        ))}
      </div>

      <div style={{ display:"flex", gap:8 }}>
        <input style={{ flex:1, border:"1px solid #e8edf2", borderRadius:9, padding:"10px 14px", fontSize:13, outline:"none" }}
          placeholder='Ask anything: "Buy 5 INFY at 1180", "show my P&L", "analyse risk"…'
          value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key==="Enter" && send()} disabled={loading} />
        <button onClick={() => send()} disabled={loading}
          style={{ background:"#387ED1", color:"#fff", border:"none", borderRadius:9, padding:"10px 20px", fontWeight:700, fontSize:13, cursor:"pointer" }}>
          Send
        </button>
      </div>

      <style>{`@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}`}</style>
    </div>
  );
}
