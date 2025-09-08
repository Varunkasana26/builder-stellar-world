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

function ThemeButton() {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="p-2 rounded-md hover:bg-secondary/10 transition"
    >
      {theme === "dark" ? (
        // sun icon for switching to light
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-yellow-400">
          <path d="M12 3v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 19v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4.22 4.22l1.42 1.42" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M18.36 18.36l1.42 1.42" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M1 12h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M21 12h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4.22 19.78l1.42-1.42" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        // moon icon for switching to dark
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}

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
          <div className="h-10 w-10 rounded-md bg-gradient-to-br from-primary to-accent shadow-md transform transition-transform hover:scale-105" />
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
                <span className="after:absolute after:left-0 after:bottom-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full">{n.label}</span>
              </a>
            ))}

          <div className="flex items-center gap-3">
            <ThemeButton />
            {!user ? (
              <Link to="/login" className="inline-flex items-center justify-center rounded-md border px-4 py-2 font-medium hover:bg-secondary/20 transition">
                Login
              </Link>
            ) : (
              <div className="flex items-center gap-3">
                <div className="text-sm text-muted-foreground">{user.username} <span className="text-xs text-muted-foreground block">{user.organizationLabel ?? user.organization}{user.organizationState ? ` — ${user.organizationState}` : ''}</span></div>
                {user.organization === 'MOTA' && <Link to="/mota" className="text-sm underline">MOTA</Link>}
                {user.organization === 'NGO' && <Link to="/ngo" className="text-sm underline">NGO</Link>}
                <button
                  onClick={onLogout}
                  className="inline-flex items-center justify-center rounded-md btn-primary px-3 py-2 font-medium transition transform hover:-translate-y-0.5"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
