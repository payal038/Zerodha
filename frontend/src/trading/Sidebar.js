import React from "react";

const NAV = [
  { id:"dashboard", label:"Dashboard",  icon:"📊" },
  { id:"orders",    label:"Orders",     icon:"📋" },
  { id:"holdings",  label:"Holdings",   icon:"📈" },
  { id:"positions", label:"Positions",  icon:"📉" },
  { id:"ai",        label:"AI Advisor", icon:"✦", ai:true },
];

export default function Sidebar({ page, setPage, onLogout }) {
  const user = (() => { try { return JSON.parse(localStorage.getItem("zuser")); } catch { return null; } })();

  return (
    <div style={S.nav}>
      {/* Logo */}
      <div style={S.logo}>
        <img src="media/image/logo.svg" alt="Zerodha" style={{ width:90 }} />
      </div>

      {/* Nav */}
      <div style={{ flex:1 }}>
        {NAV.map(n => (
          <div key={n.id} onClick={() => setPage(n.id)}
            style={{ ...S.item, ...(page===n.id ? S.active : {}), color: n.ai ? "#387ED1" : undefined }}>
            <span style={{ fontSize:16 }}>{n.icon}</span>
            <span style={{ fontSize:13, fontWeight: page===n.id ? 700 : 500 }}>{n.label}</span>
            {n.ai && <span style={S.aiBadge}>AI</span>}
          </div>
        ))}
      </div>

      {/* User + logout */}
      <div style={{ borderTop:"1px solid #e8edf2", padding:"12px 16px" }}>
        <div style={{ fontSize:12, fontWeight:600, color:"#333", marginBottom:6 }}>{user?.name || "User"}</div>
        <div style={{ fontSize:11, color:"#888", marginBottom:10 }}>{user?.email}</div>
        <button onClick={onLogout} style={S.logoutBtn}>Sign Out</button>
      </div>
    </div>
  );
}

const S = {
  nav:      { width:200, background:"#fff", borderRight:"1px solid #e8edf2", display:"flex", flexDirection:"column", height:"100%" },
  logo:     { padding:"18px 16px 14px", borderBottom:"1px solid #e8edf2" },
  item:     { display:"flex", alignItems:"center", gap:10, padding:"11px 16px", cursor:"pointer", borderLeftWidth:3, borderLeftStyle:"solid", borderLeftColor:"transparent", transition:"all 0.15s", color:"#555" },
  active:   { background:"#eef3ff", borderLeftColor:"#387ED1", color:"#387ED1" },
  aiBadge:  { marginLeft:"auto", background:"#387ED1", color:"#fff", fontSize:9, fontWeight:700, borderRadius:4, padding:"2px 5px" },
  logoutBtn:{ width:"100%", background:"none", border:"1px solid #ddd", borderRadius:6, padding:"6px", fontSize:12, color:"#666", cursor:"pointer" },
};
