import { supabase } from './supabase';
import React, { useState, useEffect } from "react";

export default function LoginPage() {
  const [mode, setMode] = useState("choose");
  const [role, setRole] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 50);
  }, []);

  const handleEmailLogin = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); setLoading(false); }
  };

  const handleMicrosoftLogin = () => { alert("Microsoft SSO coming soon!"); };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-start",
      fontFamily: "'Aptos', 'Segoe UI', system-ui, sans-serif",
      position: "relative",
      overflow: "hidden",
      backgroundImage: "url('/JLR-Login.png')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    }}>

      {/* Lighter overlay */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 0,
        background: "linear-gradient(135deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.25) 100%)",
      }} />

      {/* Left-side gradient */}
      <div style={{
        position: "absolute", top: 0, left: 0, bottom: 0, width: "55%", zIndex: 1,
        background: "linear-gradient(90deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.1) 70%, transparent 100%)",
        pointerEvents: "none",
      }} />

      {/* Card */}
      <div style={{
        position: "relative", zIndex: 2,
        marginLeft: "8%",
        background: "rgba(255,255,255,0.12)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(255,255,255,0.25)",
        borderRadius: "16px",
        padding: "36px",
        width: "100%",
        maxWidth: "400px",
        boxShadow: "0 24px 64px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.15)",
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0)" : "translateY(20px)",
        transition: "all 0.6s cubic-bezier(.22,1,.36,1)",
      }}>

        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "22px" }}>
          <div style={{
            width: "46px", height: "46px",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <img src="/jlr-logo.png" alt="JLR" style={{ height: "52px", objectFit: "contain", filter: "brightness(1)" }} />
          </div>
          <div>
            <div style={{ fontSize: "17px", fontWeight: 600, color: "#FFFFFF", letterSpacing: "0.02em" }}>PMO Portal</div>
            <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: "2px" }}>
              Programme Management Office
            </div>
          </div>
        </div>

        <div style={{ height: "1px", background: "rgba(255,255,255,0.12)", marginBottom: "24px" }} />

        {/* CHOOSE ROLE */}
        {mode === "choose" && (
          <div>
            <h1 style={{ fontSize: "22px", color: "#FFFFFF", margin: "0 0 5px 0", fontWeight: 500 }}>Welcome back</h1>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.55)", margin: "0 0 22px 0", lineHeight: 1.5 }}>
              Sign in as:
            </p>

            {/* Executive Manager */}
            <button onClick={() => { setRole("executive"); setMode("login"); }} style={{
              display: "flex", alignItems: "center", gap: "12px",
              width: "100%", background: "rgba(43,58,46,0.4)",
              border: "1px solid rgba(43,58,46,0.6)", borderRadius: "10px",
              padding: "13px 16px", color: "#FFFFFF", fontSize: "14px",
              cursor: "pointer", marginBottom: "10px",
              transition: "all 0.15s ease",
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ flexShrink: 0 }}>
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              Executive Manager
              <span style={{ marginLeft: "auto", fontSize: "10px", background: "rgba(196,162,101,0.3)", padding: "3px 10px", borderRadius: "20px", color: "#C4A265", fontWeight: 500 }}>Executive</span>
            </button>

            {/* Programme Manager */}
            <button onClick={() => { setRole("manager"); setMode("login"); }} style={{
              display: "flex", alignItems: "center", gap: "12px",
              width: "100%", background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.18)", borderRadius: "10px",
              padding: "13px 16px", color: "#FFFFFF", fontSize: "14px",
              cursor: "pointer", marginBottom: "10px",
              transition: "all 0.15s ease",
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="8" r="4"/>
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
              </svg>
              Programme Manager
              <span style={{ marginLeft: "auto", fontSize: "10px", background: "rgba(255,255,255,0.1)", padding: "3px 10px", borderRadius: "20px", color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>Manager</span>
            </button>

            {/* Employee */}
            <button onClick={() => { setRole("employee"); setMode("login"); }} style={{
              display: "flex", alignItems: "center", gap: "12px",
              width: "100%", background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.12)", borderRadius: "10px",
              padding: "13px 16px", color: "#FFFFFF", fontSize: "14px",
              cursor: "pointer", marginBottom: "16px",
              transition: "all 0.15s ease",
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ flexShrink: 0 }}>
                <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a4 4 0 0 0-8 0v2"/>
              </svg>
              Employee
              <span style={{ marginLeft: "auto", fontSize: "10px", background: "rgba(255,255,255,0.08)", padding: "3px 10px", borderRadius: "20px", color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>Staff</span>
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "0 0 16px 0" }}>
              <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.1)" }} />
              <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)" }}>or</span>
              <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.1)" }} />
            </div>

            {/* Microsoft */}
            <button onClick={handleMicrosoftLogin} style={{
              display: "flex", alignItems: "center", gap: "10px",
              width: "100%", background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.18)", borderRadius: "10px",
              padding: "12px 16px", color: "#FFFFFF", fontSize: "14px",
              cursor: "pointer", transition: "all 0.15s ease",
            }}>
              <svg width="20" height="20" viewBox="0 0 21 21" fill="none" style={{ flexShrink: 0 }}>
                <rect width="10" height="10" fill="#F25022"/>
                <rect x="11" width="10" height="10" fill="#7FBA00"/>
                <rect y="11" width="10" height="10" fill="#00A4EF"/>
                <rect x="11" y="11" width="10" height="10" fill="#FFB900"/>
              </svg>
              Sign in with Microsoft
              <span style={{ marginLeft: "auto", fontSize: "10px", background: "rgba(255,255,255,0.1)", padding: "3px 10px", borderRadius: "20px", color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>JLR SSO</span>
            </button>
          </div>
        )}

        {/* EMAIL LOGIN FORM */}
        {mode === "login" && (
          <div>
            <button onClick={() => { setMode("choose"); setError(""); }} style={{
              background: "none", border: "none", color: "rgba(255,255,255,0.5)",
              fontSize: "13px", cursor: "pointer", padding: "0", marginBottom: "14px",
            }}>
              ← Back
            </button>
            <h1 style={{ fontSize: "22px", color: "#FFFFFF", margin: "0 0 4px 0", fontWeight: 500 }}>
              {role === "executive" ? "Executive Manager" : role === "manager" ? "Programme Manager" : "Employee"} Sign-in
            </h1>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", margin: "0 0 22px 0", lineHeight: 1.5 }}>
              Enter your credentials to continue.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label style={{ fontSize: "12px", color: "rgba(255,255,255,0.55)", letterSpacing: "0.05em", textTransform: "uppercase", fontWeight: 500 }}>Email address</label>
                <input type="email" placeholder="you@jlr.com" value={email} onChange={e => setEmail(e.target.value)}
                  style={{
                    background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "8px", padding: "11px 14px", color: "#FFFFFF",
                    fontSize: "14px", outline: "none", fontFamily: "inherit",
                  }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label style={{ fontSize: "12px", color: "rgba(255,255,255,0.55)", letterSpacing: "0.05em", textTransform: "uppercase", fontWeight: 500 }}>Password</label>
                <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleEmailLogin(e); }}
                  style={{
                    background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "8px", padding: "11px 14px", color: "#FFFFFF",
                    fontSize: "14px", outline: "none", fontFamily: "inherit",
                  }} />
              </div>

              {error && (
                <div style={{
                  background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)",
                  borderRadius: "8px", padding: "10px 14px", fontSize: "13px", color: "#FCA5A5",
                }}>
                  {error}
                </div>
              )}

              <button onClick={handleEmailLogin} disabled={loading} style={{
                background: "#2B3A2E", border: "none", borderRadius: "10px",
                padding: "13px", color: "#FFFFFF", fontSize: "14px", fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1,
                marginTop: "4px", transition: "all 0.15s ease",
              }}>
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </div>

            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", textAlign: "center", marginTop: "18px" }}>
              Forgot your password? <span style={{ color: "rgba(255,255,255,0.6)", cursor: "pointer", fontWeight: 500 }}>Contact admin</span>
            </p>
          </div>
        )}

        {/* Footer */}
        <div style={{
          display: "flex", gap: "8px", justifyContent: "center", marginTop: "26px",
          paddingTop: "18px", borderTop: "1px solid rgba(255,255,255,0.08)",
          fontSize: "11px", color: "rgba(255,255,255,0.25)",
        }}>
          <span>Secured by Azure AD</span>
          <span>·</span>
          <span>PMO Portal v1.0</span>
        </div>
      </div>
    </div>
  );
}
