import { AlertCircle, Eye, EyeOff, Shield } from "lucide-react";
import { useState } from "react";
import { useApp } from "../context/AppContext";

export default function LoginPage() {
  const { login } = useApp();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTimeout(() => {
      const ok = login(username, password);
      if (!ok) setError("Invalid username or password.");
      setLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <Shield size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">CriminalDB</h1>
          <p className="text-slate-400 text-sm mt-1">
            Law Enforcement Management System
          </p>
        </div>

        <div className="bg-slate-900 rounded-2xl border border-slate-700/50 p-8">
          <h2 className="text-lg font-semibold text-white mb-6">Sign In</h2>

          {error && (
            <div
              data-ocid="auth.error_state"
              className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-3 py-2.5 mb-4 text-sm"
            >
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Username
              </label>
              <input
                data-ocid="auth.username.input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  data-ocid="auth.password.input"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2.5 pr-10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button
              data-ocid="auth.login.submit_button"
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors text-sm"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-slate-800/60 rounded-lg border border-slate-700/50">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Demo Credentials
            </p>
            <div className="space-y-2">
              {[
                {
                  role: "Admin",
                  user: "admin",
                  pass: "admin123",
                  color: "text-red-400",
                },
                {
                  role: "Officer",
                  user: "officer1",
                  pass: "pass123",
                  color: "text-blue-400",
                },
                {
                  role: "Investigator",
                  user: "investigator1",
                  pass: "pass123",
                  color: "text-purple-400",
                },
              ].map((c) => (
                <button
                  key={c.user}
                  onClick={() => {
                    setUsername(c.user);
                    setPassword(c.pass);
                  }}
                  className="w-full text-left flex items-center justify-between px-3 py-1.5 rounded bg-slate-700/50 hover:bg-slate-700 transition-colors"
                >
                  <span className={`text-xs font-semibold ${c.color}`}>
                    {c.role}
                  </span>
                  <span className="text-xs text-slate-400">
                    {c.user} / {c.pass}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
