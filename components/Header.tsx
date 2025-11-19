import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Activity, ArrowLeft } from "lucide-react";

const Header: React.FC = () => {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {!isHome && (
            <Link
              to="/"
              className="p-2 -ml-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition-all"
              aria-label="Back to Labs"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
          )}

          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isHome ? "bg-slate-900" : "bg-indigo-600"}`}>
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-none">
                {isHome ? "Labs" : "Projectile Motion Simulator"}
              </h1>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
