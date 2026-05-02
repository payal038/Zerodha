import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";

import HomePage from "./landing_page/home/HomePage";
import Auth from "./landing_page/Signup/signup";
import AboutPage from "./landing_page/about/AboutPage";
import ProductPage from "./landing_page/products/ProductsPage";
import PricingPage from "./landing_page/Pricing/PricingPage.js";
import SupportPage from "./landing_page/support/SupportPage";
import NotFound from "./landing_page/NotFound";
import Navbar from "./landing_page/Navbar.js";
import Footer from "./landing_page/Footer";
import TradingApp from "./trading/TradingApp";

function ProtectedApp() {
  const token = localStorage.getItem("ztoken");
  if (!token) { window.location.replace("/login"); return null; }
  return <TradingApp />;
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/app/*" element={<ProtectedApp />} />
      <Route path="*" element={
        <>
          <Navbar />
          <Routes>
            <Route path="/"        element={<HomePage />}    />
            <Route path="/signup"  element={<Auth />}        />
            <Route path="/login"   element={<Auth />}        />
            <Route path="/about"   element={<AboutPage />}   />
            <Route path="/product" element={<ProductPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/support" element={<SupportPage />} />
            <Route path="*"        element={<NotFound />}    />
          </Routes>
          <Footer />
        </>
      } />
    </Routes>
  </BrowserRouter>
);
