import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "@/lib/theme";

const nav = [
  { to: "/forest-map", label: "Forest Map", icon: "map" },
  { to: "/analytics", label: "Analytics", icon: "chart" },
  { to: "/fra-compliance", label: "FRA Compliance", icon: "shield" },
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
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-yellow-400"
        >
          <path
            d="M12 3v2"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 19v2"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M4.22 4.22l1.42 1.42"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M18.36 18.36l1.42 1.42"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M1 12h2"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M21 12h2"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M4.22 19.78l1.42-1.42"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M18.36 5.64l1.42-1.42"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle
            cx="12"
            cy="12"
            r="3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        // moon icon for switching to dark
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-primary"
        >
          <path
            d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
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
        <Link
          to={user ? "/dashboard" : "/login"}
          className="flex items-center gap-3"
        >
          <div className="h-10 w-10 rounded-md bg-gradient-to-br from-primary to-accent shadow-md transform transition-transform hover:scale-105" />
          <span className="font-extrabold tracking-tight text-xl">
            VanDarpan
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          {user && (
            <div className="flex items-center gap-4">
              {nav.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  className={cn(
                    "flex items-center gap-2 px-2 py-1 rounded-md",
                    active.includes(n.to)
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {n.icon === "map" ? (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-current"
                    >
                      <path
                        d="M20 21l-5-2-5 2-5-2V6l5 2 5-2 5 2v13z"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : n.icon === "chart" ? (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M3 3v18h18"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M7 13v6M12 9v10M17 5v14"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 3l8 4v5c0 5-3.8 9.7-8 11-4.2-1.3-8-6-8-11V7l8-4z"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                  <span className="hidden sm:inline">{n.label}</span>
                </Link>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <input
                placeholder="Search"
                className="rounded-md border px-3 py-1 w-56 bg-input text-sm"
              />
            </div>
            <ThemeButton />

            <Link
              to="/settings"
              className="hidden sm:inline-flex items-center gap-2 rounded-md btn-primary px-3 py-2"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 15.5A3.5 3.5 0 1112 8.5a3.5 3.5 0 010 7z"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Settings</span>
            </Link>

            {!user ? (
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-md border px-4 py-2 font-medium hover:bg-secondary/20 transition"
              >
                Login
              </Link>
            ) : (
              <div className="flex items-center gap-3">
                <div className="text-sm text-muted-foreground text-right">
                  <div>{user.username}</div>
                  <div className="text-xs text-muted-foreground">
                    {user.organizationLabel ?? user.organization}
                    {user.organizationState
                      ? ` — ${user.organizationState}`
                      : ""}
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  className="inline-flex items-center justify-center rounded-md border bg-white/5 px-3 py-2 font-medium hover:shadow-md transition"
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
