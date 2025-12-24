import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Play } from 'lucide-react';
import { parseGithubUrl } from '../utils/validators';

const Handson = () => {
  const [code, setCode] = useState('');
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('practsmart_students');
    if (saved) {
      setStudents(JSON.parse(saved));
    }
  }, []);

  const handleGo = () => {
    console.log('Running code:', code);
    // Future: Integrate specific logic here
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Left Panel: Code Input */}
      <div className="flex-1 relative bg-slate-950 border-r border-slate-800 flex flex-col">
        <div className="p-4 border-b border-slate-800 bg-slate-900/50">
          <h2 className="text-sm font-semibold text-slate-400">Code Editor</h2>
        </div>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="// Paste or write your code here..."
          className="flex-1 w-full bg-slate-950 text-slate-100 font-mono p-4 resize-none focus:outline-none text-sm leading-relaxed custom-scrollbar"
          spellCheck="false"
        />
        
        {/* Go Button */}
        <div className="absolute bottom-6 right-6">
          <Button 
            onClick={handleGo}
            className="bg-[#2da44e] hover:bg-[#2c974b] text-white font-semibold px-6 shadow-lg shadow-green-900/20 active:scale-95 transition-all"
          >
            Go <Play className="w-4 h-4 ml-2 fill-current" />
          </Button>
        </div>
      </div>

      {/* Right Panel: Student List */}
      <div className="w-80 flex flex-col bg-slate-900 border-l border-slate-800 shadow-xl z-20">
        <div className="p-4 border-b border-slate-800 bg-slate-900/50">
          <h2 className="font-semibold text-slate-200">Students ({students.length})</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {students.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              No students in the class.
            </div>
          ) : (
            students.map((student) => {
               const { owner } = parseGithubUrl(student.repoUrl) || { owner: 'user' };
               return (
                <div 
                  key={student.id} 
                  className="bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 rounded-lg p-3 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-slate-700 overflow-hidden flex-shrink-0">
                      <img 
                        src={`https://github.com/${owner}.png`} 
                        alt={owner}
                        className="h-full w-full object-cover"
                        onError={(e) => { e.target.src = '/logo.png'; }}
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate group-hover:text-white transition-colors">
                        {student.name}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        @{owner}
                      </p>
                    </div>
                  </div>
                </div>
               );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Handson;
