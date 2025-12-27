import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';

const Layout = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      {/* Navigation Bar */}
      <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img src="/app-logo.png" alt="PractSmart Logo" className="h-8 w-8 object-contain" />
            <span className="font-bold text-lg tracking-tight">PractSmart</span>
          </Link>

          {/* Navigation Links */}
          <nav className="flex items-center gap-6">
            <Link 
              to="/" 
              className={`text-sm font-medium transition-colors hover:text-white ${isActive('/') ? 'text-white' : 'text-slate-400'}`}
            >
              My Classrooms
            </Link>
            <Link 
              to="/handson" 
              className={`text-sm font-medium transition-colors hover:text-white ${isActive('/handson') ? 'text-white' : 'text-slate-400'}`}
            >
              Handson
            </Link>
          </nav>

          {/* User Profile / Placeholder */}
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700"></div>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
