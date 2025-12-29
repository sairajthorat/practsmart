import React from 'react';
import { Shield, GraduationCap, User } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { supabase } from '../supabaseClient';

const RoleSelection = ({ onSelectRole }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full shadow-2xl space-y-8 animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto h-16 w-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4">
             <img src="/logo.png" alt="Logo" className="h-10 w-10 object-contain" onError={(e) => e.target.style.display = 'none'} /> 
             {/* Fallback if logo fails */}
             <Shield className="h-8 w-8 text-blue-500 hidden" style={{ display: 'none' }} /> 
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Welcome to PractSmart</h1>
          <p className="text-slate-400">Please select your role to continue</p>
        </div>

        {/* Options */}
        <div className="space-y-4">
          <Button 
            className="w-full h-14 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-blue-500/50 text-slate-200 hover:text-white justify-start px-6 text-lg transition-all group"
            onClick={async () => {
              const { error } = await supabase.auth.signInWithOAuth({ provider: 'github' });
              if (error) {
                console.error("Error logging in:", error.message);
                alert("Failed to initiate GitHub login.");
              }
              // Redirect happens automatically
            }}
          >
            <div className="h-8 w-8 rounded-lg bg-blue-500/20 flex items-center justify-center mr-4 group-hover:bg-blue-500/30 transition-colors">
                <Shield className="h-5 w-5 text-blue-400" />
            </div>
            Login as Teacher
          </Button>
{/*
          <Button 
            className="w-full h-14 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-green-500/50 text-slate-200 hover:text-white justify-start px-6 text-lg transition-all group"
            onClick={() => onSelectRole('student')}
          >
            <div className="h-8 w-8 rounded-lg bg-green-500/20 flex items-center justify-center mr-4 group-hover:bg-green-500/30 transition-colors">
                <GraduationCap className="h-5 w-5 text-green-400" />
            </div>
            Login as Student
          </Button>
          */}

          <Button 
            className="w-full h-14 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-purple-500/50 text-slate-200 hover:text-white justify-start px-6 text-lg transition-all group"
            onClick={() => onSelectRole('demo')}
          >
            <div className="h-8 w-8 rounded-lg bg-purple-500/20 flex items-center justify-center mr-4 group-hover:bg-purple-500/30 transition-colors">
                <User className="h-5 w-5 text-purple-400" />
            </div>
            Demo Login sairaj Thoart
          </Button>


        </div>
        {/*
        <p className="text-xs text-center text-slate-500 pt-4">
            Select "Demo Login" for visitor access.
        </p>
        */}
      </div>
    </div>
  );
};

export default RoleSelection;
