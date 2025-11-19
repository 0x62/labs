import React from "react";
import { Github } from "lucide-react";

const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-slate-200 mt-auto py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-slate-500 text-sm">&copy; {year} Benedict Lewis. MIT.</div>
        <a
          href="https://github.com/0x62/labs"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm font-medium"
        >
          <Github className="w-4 h-4" />
          View on GitHub
        </a>
      </div>
    </footer>
  );
};

export default Footer;
