// src/pages/Login.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { API_BASE_URL } from "./config";
import { Link } from "react-router-dom";


// ----- One-time Terms gate (versioned) -----
const TERMS_VERSION = "2025-12-09"; // bump this when Terms change
const TERMS_KEY = "aftech_terms_acceptance"; // stored JSON: { v: string, ts: number }

type Acceptance = { v: string; ts: number } | null;

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [reveal, setReveal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showTerms, setShowTerms] = useState(false);
  const [agreeTick, setAgreeTick] = useState(false);
  const [hasAccepted, setHasAccepted] = useState(false);

  const navigate = useNavigate();

  // Load acceptance state once
  useEffect(() => {
    try {
      const raw = localStorage.getItem(TERMS_KEY);
      if (!raw) return setHasAccepted(false);
      const parsed = JSON.parse(raw) as Acceptance;
      setHasAccepted(!!parsed && parsed.v === TERMS_VERSION);
    } catch {
      setHasAccepted(false);
    }
  }, []);

  const persistAcceptance = () => {
    const payload: Acceptance = { v: TERMS_VERSION, ts: Date.now() };
    localStorage.setItem(TERMS_KEY, JSON.stringify(payload));
    setHasAccepted(true);
    setShowTerms(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Hard block if not accepted
    if (!hasAccepted) {
      setShowTerms(true);
      setError("Please accept the Terms to continue.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/token/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("access", data.access);
        localStorage.setItem("refresh", data.refresh);

        const decoded: any = jwtDecode(data.access);
        const extractedUsername = decoded?.username;
        if (extractedUsername) localStorage.setItem("user", extractedUsername);

        navigate("/jobcards/dashboard");
      } else {
        setError(data.detail || "Invalid login");
      }
    } catch {
      setError("Server error unable to log you in");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-4">
      <style>{`
        .dots{
          background-image: radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1.5px);
          background-size:22px 22px;
          background-position:0 0;
        }
      `}</style>

      {/* Orangered gradient + static pattern */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, #ff4500 0%, #ff6a33 35%, #ff944d 60%, #ffd09b 100%)",
        }}
      />
      <div aria-hidden className="absolute inset-0 dots" style={{ mixBlendMode: "overlay", opacity: 0.35 }} />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(1000px 600px at 50% -10%, rgba(255,255,255,0.18), transparent 60%), radial-gradient(900px 500px at 90% 110%, rgba(0,0,0,0.14), transparent 60%)",
        }}
      />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-2xl border border-white/40 bg-white/85 backdrop-blur-md shadow-2xl p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">
              AFTECH MANAGEMENT PORTAL
            </h2>
            <p className="text-sm text-gray-600 mt-1">Secure Login</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                autoComplete="username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-400 outline-none ring-0 focus:border-orange-400 focus:ring-2 focus:ring-orange-300"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={reveal ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 pr-11 text-gray-900 placeholder-gray-400 outline-none ring-0 focus:border-orange-400 focus:ring-2 focus:ring-orange-300"
                  required
                />
                <button
                  type="button"
                  onClick={() => setReveal((v) => !v)}
                  className="absolute inset-y-0 right-0 px-3 text-gray-500 hover:text-gray-700"
                  aria-label={reveal ? "Hide password" : "Show password"}
                  title={reveal ? "Hide password" : "Show password"}
                >
                  <i className={`bi ${reveal ? "bi-eye-slash" : "bi-eye"} text-xl leading-none`} aria-hidden="true" />
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-center">
                {error}
              </p>
            )}

            {/* Terms microcopy + explicit link */}
            <div className="text-center text-[11px] text-gray-600">
            By continuing you agree to the{" "}
            <Link to="/terms" className="underline decoration-dotted">Terms</Link> &{" "}
            <Link to="/terms" className="underline decoration-dotted">Privacy Notice</Link>.
            </div>

            <button
              type="submit"
              disabled={submitting || !hasAccepted}
              className={`group w-full inline-flex items-center justify-center gap-2 rounded-lg text-white font-semibold py-2 transition shadow-lg ${
                submitting || !hasAccepted
                  ? "bg-[#ff9973] cursor-not-allowed"
                  : "bg-[#ff4500] hover:bg-[#e33e00] active:bg-[#c23800]"
              }`}
              title={!hasAccepted ? "Please accept the Terms to continue" : undefined}
            >
              {submitting ? (
                <>
                  <span className="inline-block h-4 w-4 rounded-full border-2 border-white/70 border-t-transparent animate-spin" />
                  Signing in…
                </>
              ) : (
                <>Log In</>
              )}
            </button>

            {/* If they click Log In without acceptance, we also open the modal via handleLogin guard */}
            {!hasAccepted && (
              <div className="text-center">
                <button
                  type="button"
                  className="mt-2 text-xs text-gray-700 underline decoration-dotted"
                  onClick={() => setShowTerms(true)}
                >
                  Review & accept Terms
                </button>
              </div>
            )}
          </form>
        </div>

        <div className="text-center mt-4">
          <span className="inline-block text-[10px] tracking-wide text-white/90 bg-black/10 rounded-full px-3 py-1 border border-white/20">
            Powered by AFTECH SOLUTION INTERNAL TEAM
          </span>
        </div>
      </div>

      {/* Terms Modal */}
      {showTerms && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-5 py-4 border-b">
              <h3 className="text-lg font-semibold">AFTECH API Terms of Use</h3>
              <p className="text-xs text-gray-500">Effective: {TERMS_VERSION}</p>
            </div>
            <div className="max-h-[60vh] overflow-y-auto px-5 py-4 space-y-3 text-sm text-gray-700">
              <p>
                Internal-use only. By accepting, you agree to use the portal and API only for your job duties, keep
                credentials/API keys secure, follow security and data-handling policies, and respect rate limits.
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>No scraping, bypassing security, or exporting data to unapproved systems.</li>
                <li>Treat all API/portal data as Confidential; share on need-to-know basis.</li>
                <li>We log usage for security/compliance; incidents must be reported immediately.</li>
              </ul>
              <p>
              Read the full document here:{" "}
              <Link to="/terms" className="text-[#ff4500] underline">Terms of Use</Link> &{" "}
              <Link to="/privacy" className="text-[#ff4500] underline">Privacy Notice</Link>.
              </p>
              <label className="flex items-start gap-2 mt-2">
                <input
                  type="checkbox"
                  className="mt-[3px]"
                  checked={agreeTick}
                  onChange={(e) => setAgreeTick(e.target.checked)}
                />
                <span className="text-sm">
                  I have read and agree to the Terms of Use and Privacy Notice.
                </span>
              </label>
            </div>
            <div className="px-5 py-4 border-t flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowTerms(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!agreeTick}
                onClick={persistAcceptance}
                className={`px-4 py-2 rounded-lg text-white ${
                  agreeTick ? "bg-[#ff4500] hover:bg-[#e33e00]" : "bg-[#ff9973] cursor-not-allowed"
                }`}
                title={!agreeTick ? "Tick the checkbox to enable" : undefined}
              >
                Accept & Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
