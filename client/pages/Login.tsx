import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";

const ORG_OPTIONS = [
  "Gram Sabha",
  "Sub-Divisional Level Committee (SDLC)",
  "District Level Committee (DLC)",
  "Ministry of Tribal Affairs (MOTA)",
  "NGO",
];

export default function Login() {
  const [organization, setOrganization] = useState<string>(ORG_OPTIONS[0]);
  const [stateName, setStateName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const navigate = useNavigate();
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
      await auth.login(username.trim(), password.trim(), { ministry: undefined, organization: organization, organizationState: stateName });
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      setError(err?.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-green-50">
      <div className="w-full max-w-4xl p-6 rounded-2xl bg-card border shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Ministry selection */}
          <div className="p-6 rounded-lg border bg-accent/30">
            <h2 className="text-lg font-semibold">Organization</h2>
            <p className="text-sm text-muted-foreground mt-1">Choose your organization type before signing in.</p>

            <div className="mt-4 space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">Organization</label>
                <select
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="mt-1 w-full rounded-md border px-3 py-2 bg-background"
                >
                  {ORG_OPTIONS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground">State</label>
                <input
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  className="mt-1 w-full rounded-md border px-3 py-2 bg-background"
                  placeholder="e.g. Madhya Pradesh"
                />
              </div>

              <div className="text-xs text-muted-foreground">This information is stored locally for demo sessions only.</div>
            </div>
          </div>

          {/* Right: Credentials */}
          <div className="p-6">
            <h1 className="text-2xl font-bold">Sign in to FRA Atlas</h1>
            <p className="text-sm text-muted-foreground mt-1">Enter credentials for the selected ministry/unit.</p>

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
                  className="inline-flex items-center justify-center rounded-md bg-emerald-400 hover:bg-emerald-500 text-white px-4 py-2 font-medium disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? "Signing in…" : "Sign in"}
                </button>
                <a href="#" className="text-sm text-muted-foreground hover:underline">Need help?</a>
              </div>

              <div className="mt-2 text-xs text-muted-foreground">
                For demo purposes any non-empty credentials will sign you in.
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
