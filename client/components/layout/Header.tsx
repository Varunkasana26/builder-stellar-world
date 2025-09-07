import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "@/lib/theme";

const nav = [
  { to: "/", label: "Home" },
  { to: "/#atlas", label: "Atlas" },
  { to: "/#analysis", label: "AI Analysis" },
  { to: "/#about", label: "About" },
];

export function Header() {
  const { pathname, hash } = useLocation();
  const active = pathname + hash;
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur supports-[backdrop-filter]:bg-background/70 bg-card/50 border-b border-border/40 shadow-sm">
      <div className="container flex h-16 items-center justify-between">
        <Link to={user ? "/dashboard" : "/login"} className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-md bg-gradient-to-br from-emerald-500 to-emerald-300 shadow-md transform transition-transform hover:scale-105" />
          <span className="font-extrabold tracking-tight text-xl">FRA Atlas</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          {user &&
            nav.map((n) => (
              <a
                key={n.to}
                href={n.to}
                className={cn(
                  "text-muted-foreground hover:text-foreground transition-all relative px-2 py-1",
                  active.includes(n.to.replace("/#", "/")) && "text-foreground"
                )}
              >
                <span className="after:absolute after:left-0 after:bottom-0 after:h-0.5 after:w-0 after:bg-emerald-400 after:transition-all after:duration-300 hover:after:w-full">{n.label}</span>
              </a>
            ))}

          {!user ? (
            <Link to="/login" className="inline-flex items-center justify-center rounded-md border px-4 py-2 font-medium hover:bg-secondary/20 transition">
              Login
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <div className="text-sm text-muted-foreground">{user.username} <span className="text-xs text-muted-foreground block">{user.ministry}</span></div>
              <button
                onClick={onLogout}
                className="inline-flex items-center justify-center rounded-md bg-primary hover:bg-emerald-600 text-primary-foreground px-3 py-2 font-medium transition transform hover:-translate-y-0.5"
              >
                Logout
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
