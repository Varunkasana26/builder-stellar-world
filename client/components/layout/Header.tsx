import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";

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
    <header className="sticky top-0 z-40 w-full backdrop-blur supports-[backdrop-filter]:bg-background/70 bg-background/80 border-b">
      <div className="container flex h-16 items-center justify-between">
        <Link to={user ? "/dashboard" : "/login"} className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-gradient-to-br from-emerald-600 to-green-700" />
          <span className="font-extrabold tracking-tight text-xl">FRA Atlas</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          {user &&
            nav.map((n) => (
              <a
                key={n.to}
                href={n.to}
                className={cn(
                  "text-muted-foreground hover:text-foreground transition-colors",
                  active.includes(n.to.replace("/#", "/")) && "text-foreground",
                )}
              >
                {n.label}
              </a>
            ))}

          {!user ? (
            <Link to="/login" className="inline-flex items-center justify-center rounded-md border px-4 py-2 font-medium">
              Login
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <div className="text-sm text-muted-foreground">{user.username}</div>
              <button
                onClick={onLogout}
                className="inline-flex items-center justify-center rounded-md bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 font-medium"
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
