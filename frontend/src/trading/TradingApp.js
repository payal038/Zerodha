import React, { useState } from "react";
import Navbar from "../landing_page/Navbar";
import Sidebar from "./Sidebar";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import Holdings from "./pages/Holdings";
import Positions from "./pages/Positions";
import AIAdvisor from "./pages/AIAdvisor";
import WatchList from "./WatchList";
import BuyModal from "./BuyModal";

export default function TradingApp() {
  const [page, setPage]         = useState("dashboard");
  const [buyStock, setBuyStock] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem("ztoken");
    localStorage.removeItem("zuser");
    window.dispatchEvent(new Event("zauth"));
    window.location.replace("/");
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100vh" }}>
      <Navbar />
      <div style={{ display:"flex", flex:1, background:"#f0f3f8", overflow:"hidden" }}>
      <Sidebar page={page} setPage={setPage} onLogout={handleLogout} />
      <div style={{ flex:1, overflowY:"auto", position:"relative" }}>
        {page === "dashboard"  && <Dashboard openBuy={s => setBuyStock(s)} />}
        {page === "orders"     && <Orders />}
        {page === "holdings"   && <Holdings />}
        {page === "positions"  && <Positions />}
        {page === "ai"         && <AIAdvisor />}
      </div>
      <WatchList openBuy={s => setBuyStock(s)} />
      </div>
      {buyStock && <BuyModal stock={buyStock} onClose={() => setBuyStock(null)} />}
    </div>
  );
}
