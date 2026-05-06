import { Heart, Home, LogOut, Sparkles, UserRound } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/", label: "Home", icon: Home },
  { to: "/wishlist", label: "Wish List", icon: Sparkles },
  { to: "/profile", label: "Profile", icon: UserRound },
];

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-20 mb-8 border-b border-rosewood/15 bg-white/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-2 text-rosewood">
          <Heart className="h-5 w-5 fill-current" />
          <p className="font-serif text-2xl font-semibold">Our Secret Space</p>
        </div>

        <nav className="flex items-center gap-2 rounded-full bg-cream/70 p-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-full px-3 py-2 text-sm transition ${
                  isActive
                    ? "bg-white text-rosewood shadow"
                    : "text-rosewood/80 hover:bg-white/70"
                }`
              }
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{label}</span>
            </NavLink>
          ))}
        </nav>

        <button
          onClick={logout}
          className="flex items-center gap-2 rounded-full bg-rosewood px-4 py-2 text-sm text-white transition hover:opacity-90"
        >
          <span className="hidden sm:inline">{user}</span>
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
