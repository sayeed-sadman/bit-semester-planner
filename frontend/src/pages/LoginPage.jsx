import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import InputField from "../components/common/InputField";
import SuccessBanner from "../components/common/SuccessBanner";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showBanner, setShowBanner] = useState(params.get("registered") === "true");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(email, password);
      navigate(user.role === "ADMIN" ? "/admin/modules" : "/dashboard", { replace: true });
    } catch (err) {
      const msg = err?.response?.data?.message;
      setError(msg || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-132px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-dark mb-2">Welcome back</h1>
          <p className="text-dark-muted text-sm">Sign in to your account to continue</p>
        </div>

        <SuccessBanner
          isVisible={showBanner}
          message="Account created! Log in to start planning your semester."
          onDismiss={() => setShowBanner(false)}
        />

        <div className="bg-white rounded-card p-8 shadow-card">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <InputField
              id="email"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
            <InputField
              id="password"
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            {error && (
              <p className="text-sm text-danger bg-danger-light border border-danger-border rounded-input px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-primary text-white font-semibold rounded-button hover:bg-primary-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-dark-muted mt-4">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="text-primary font-medium hover:text-primary-dark">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}
