import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const BACKEND = process.env.REACT_APP_BACKEND_URL || "http://localhost:3002";

function Auth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("signup");
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setError(""); setSuccess("");
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess(""); setLoading(true);
    try {
      if (mode === "signup") {
        const res = await axios.post(`${BACKEND}/signup`, formData);
        setSuccess(res.data.message + " Please sign in.");
        setMode("login");
        setFormData({ name: "", email: formData.email, password: "" });
      } else {
        const res = await axios.post(`${BACKEND}/login`, {
          email: formData.email,
          password: formData.password,
        });
        localStorage.setItem("ztoken", res.data.token);
        localStorage.setItem("zuser", JSON.stringify(res.data.user));
        window.dispatchEvent(new Event("zauth"));
        navigate("/app");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "80vh", background: "#f8faff", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 16px" }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        {/* Header */}
        <div className="text-center mb-4">
          <img src="media/image/logo.svg" alt="Zerodha" style={{ width: 120, marginBottom: 16 }} />
          <p className="text-muted" style={{ fontSize: 14 }}>
            {mode === "signup" ? "Create your free Zerodha account" : "Welcome back! Sign in to continue"}
          </p>
        </div>

        <div className="auth-card">
          {/* Tabs */}
          <div style={{ display: "flex", gap: 6, background: "#f3f4f6", borderRadius: 10, padding: 4, marginBottom: 28 }}>
            <button className={`auth-tab${mode === "signup" ? " active" : ""}`} style={{ flex: 1 }} onClick={() => { setMode("signup"); setError(""); setSuccess(""); }}>
              Sign Up
            </button>
            <button className={`auth-tab${mode === "login" ? " active" : ""}`} style={{ flex: 1 }} onClick={() => { setMode("login"); setError(""); setSuccess(""); }}>
              Login
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {mode === "signup" && (
              <div className="mb-3">
                <label className="form-label text-muted" style={{ fontSize: 13 }}>Full Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  placeholder="Payal Mohanapure"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  style={{ padding: "10px 14px", borderRadius: 8 }}
                />
              </div>
            )}

            <div className="mb-3">
              <label className="form-label text-muted" style={{ fontSize: 13 }}>Email Address</label>
              <input
                type="email"
                name="email"
                className="form-control"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                style={{ padding: "10px 14px", borderRadius: 8 }}
              />
            </div>

            <div className="mb-3">
              <label className="form-label text-muted" style={{ fontSize: 13 }}>Password</label>
              <input
                type="password"
                name="password"
                className="form-control"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                style={{ padding: "10px 14px", borderRadius: 8 }}
              />
            </div>

            {error && (
              <div className="alert alert-danger py-2 px-3" style={{ fontSize: 13, borderRadius: 8 }}>
                {error}
              </div>
            )}
            {success && (
              <div className="alert alert-success py-2 px-3" style={{ fontSize: 13, borderRadius: 8 }}>
                {success}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary w-100 mt-2"
              disabled={loading}
              style={{ padding: "11px", borderRadius: 8, fontWeight: 600, fontSize: 15 }}
            >
              {loading ? "Please wait…" : mode === "signup" ? "Create Account" : "Sign In"}
            </button>
          </form>

          <p className="text-center text-muted mt-4 mb-0" style={{ fontSize: 12 }}>
            {mode === "signup"
              ? <>Already have an account? <button className="btn btn-link p-0" style={{ fontSize: 12 }} onClick={() => setMode("login")}>Login</button></>
              : <>Don't have an account? <button className="btn btn-link p-0" style={{ fontSize: 12 }} onClick={() => setMode("signup")}>Sign up free</button></>
            }
          </p>
        </div>

        <p className="text-center text-muted mt-3" style={{ fontSize: 11 }}>
          By continuing, you agree to Zerodha's Terms of Service &amp; Privacy Policy.
        </p>
      </div>
    </div>
  );
}

export default Auth;
