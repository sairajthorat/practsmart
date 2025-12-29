import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User as UserIcon } from 'lucide-react';


const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // App.jsx listener will handle the redirect/role clearing or we can force navigate
    // window.location.reload(); // Hard reload is safest to clear all state
  };

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

            {user ? (
               <DropdownMenu>
                <DropdownMenuTrigger className="outline-none">
                    <Avatar className="h-9 w-9 border border-slate-700 cursor-pointer hover:border-slate-500 transition-colors">
                        <AvatarImage src={user.user_metadata?.avatar_url} />
                        <AvatarFallback className="bg-slate-800 text-slate-400">
                            {user.email?.charAt(0).toUpperCase() || <UserIcon className="h-4 w-4" />}
                        </AvatarFallback>
                    </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-slate-900 border-slate-800 text-slate-200">
                    <DropdownMenuLabel>
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none text-white">{user.user_metadata?.full_name || 'User'}</p>
                            <p className="text-xs leading-none text-slate-500 truncate">{user.email}</p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-slate-800" />
                    <DropdownMenuItem 
                        className="text-red-400 focus:text-red-400 focus:bg-red-900/20 cursor-pointer"
                        onClick={handleLogout}
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
               </DropdownMenu>
            ) : (
                <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700"></div>
            )}

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
