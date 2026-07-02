import { Link, useLocation } from "react-router-dom";
import { Compass, Sparkle } from "@phosphor-icons/react";

const NavBar = () => {
  const loc = useLocation();
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-scout-bg/75 border-b border-stone-200/60">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 lg:px-10 py-4">
        <Link to="/" data-testid="nav-home" className="flex items-center gap-2 group">
          <Compass size={26} weight="duotone" className="text-scout-terracotta group-hover:rotate-45 transition-transform duration-500" />
          <span className="font-serif text-2xl tracking-tight text-scout-ink">Scout</span>
          <span className="hidden sm:inline-block ml-2 text-[10px] font-mono uppercase tracking-[0.25em] text-stone-500 border border-stone-300 px-2 py-0.5 rounded-full">
            AI · YouTube
          </span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            to="/"
            data-testid="nav-discover"
            className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${loc.pathname === "/" ? "bg-scout-ink text-scout-bg" : "text-stone-600 hover:text-scout-ink"}`}
          >
            Discover
          </Link>
          <Link
            to="/analyze"
            data-testid="nav-analyze"
            className={`px-3 py-2 rounded-full text-sm font-medium inline-flex items-center gap-1.5 transition-colors ${loc.pathname === "/analyze" ? "bg-scout-terracotta text-white" : "text-stone-600 hover:text-scout-terracotta"}`}
          >
            <Sparkle size={14} weight="fill" /> Analyze
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default NavBar;
