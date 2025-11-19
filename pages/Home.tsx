import React from "react";
import { Link } from "react-router-dom";
import { Activity, ArrowRight } from "lucide-react";

const Home: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Select a Simulation</h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Interactive physics and electronics simulations for revision practice
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Projectile Motion Card */}
        <Link
          to="/projectiles"
          className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all duration-300 cursor-pointer block"
        >
          <div className="h-48 bg-gradient-to-br from-indigo-500 to-purple-600 p-6 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
              <Activity className="w-32 h-32 text-white" />
            </div>
            <div className="relative z-10">
              <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-white text-xs font-medium backdrop-blur-sm mb-2">
                Mechanics
              </span>
              <h3 className="text-2xl font-bold text-white">Projectile Motion</h3>
            </div>
          </div>
          <div className="p-6">
            <p className="text-slate-600 mb-6 line-clamp-3">
              Simulate flight paths, calculate ranges, and solve for unknown variables using
              kinematic equations.
            </p>
            <div className="flex items-center text-indigo-600 font-semibold group-hover:translate-x-1 transition-transform">
              Enter Lab <ArrowRight className="w-4 h-4 ml-2" />
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Home;
