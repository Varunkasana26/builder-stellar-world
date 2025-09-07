import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await auth.login(username.trim(), password.trim());
      navigate("/", { replace: true });
    } catch (err: any) {
      setError(err?.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-green-50">
      <div className="w-full max-w-md p-8 rounded-2xl bg-card border shadow-sm">
        <h1 className="text-2xl font-bold">Sign in to FRA Atlas</h1>
        <p className="text-sm text-muted-foreground mt-1">Enter your credentials to access the decision support system.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm text-muted-foreground">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 w-full rounded-md border px-3 py-2 bg-background"
              placeholder="e.g. admin"
              autoFocus
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground">Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              className="mt-1 w-full rounded-md border px-3 py-2 bg-background"
              placeholder="********"
            />
          </div>

          {error && <div className="text-sm text-destructive mt-1">{error}</div>}

          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-md bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 font-medium disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
            <a href="#" className="text-sm text-muted-foreground hover:underline">Need help?</a>
          </div>
        </form>

        <div className="mt-6 text-xs text-muted-foreground">
          For demo purposes any non-empty credentials will sign you in.
        </div>
      </div>
    </div>
  );
}
