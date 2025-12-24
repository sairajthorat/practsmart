import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Play } from 'lucide-react';
import { parseGithubUrl } from '../utils/validators';

const Handson = () => {
  const [code, setCode] = useState('');
  const [students, setStudents] = useState([]);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('practsmart_students');
    if (saved) {
      setStudents(JSON.parse(saved));
    }
  }, []);

  const handleGo = async () => {
    if (!code.trim()) return;
    
    setLoading(true);
    setQuestion('Generating question...');
    
    try {
      const response = await fetch('http://localhost:5000/api/generate-question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setQuestion(data.question);
      } else {
        setQuestion('Error: ' + data.error);
      }
    } catch (error) {
      setQuestion('Failed to connect to server.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = () => {
    console.log('Reviewing question...');
  };

  return (
    <div className="grid grid-cols-2 h-[calc(100vh-4rem)] overflow-hidden bg-slate-900">
      {/* Left Panel: Code Input (50%) */}
      <div className="relative bg-slate-950 border-r border-slate-800 flex flex-col min-h-0">
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
            disabled={loading}
            className="bg-[#2da44e] hover:bg-[#2c974b] text-white font-semibold px-6 shadow-lg shadow-green-900/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Thinking...' : 'Go'} <Play className={`w-4 h-4 ml-2 fill-current ${loading ? 'hidden' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Right Panel: Question Card + Student List (50%) */}
      <div className="flex flex-col h-full bg-slate-900 min-h-0">
        
        {/* Top Section: Question Card */}
        <div className="h-64 bg-[#5c7cfa]/10 border-b border-slate-700 p-6 relative flex flex-col">
            <h2 className="text-xl font-bold text-slate-100 mb-2">Question</h2>
            <div className="flex-1 bg-slate-800/50 rounded-lg p-4 text-slate-300 text-sm overflow-y-auto custom-scrollbar border border-slate-700/50">
                <p>{question || 'Paste code and click Go to generate a question.'}</p>
            </div>
            
            {/* Review Button */}
            <div className="absolute bottom-8 right-8">
                 <Button 
                    onClick={handleReview}
                    className="bg-[#5c7cfa] hover:bg-[#4c6ef5] text-white shadow-lg"
                 >
                    Review
                 </Button>
            </div>
        </div>

        {/* Bottom Section: Student List Grid */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-slate-900">
          <h3 className="text-sm font-semibold text-slate-400 mb-4 sticky top-0 bg-slate-900 py-2 z-10">
            Students ({students.length})
          </h3>
          
          {students.length === 0 ? (
             <div className="text-center py-8 text-slate-500 text-sm col-span-2">
              No students found.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
                {students.map((student) => {
                const { owner } = parseGithubUrl(student.repoUrl) || { owner: 'user' };
                return (
                    <div 
                    key={student.id} 
                    className="bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 rounded-lg p-3 transition-colors cursor-pointer group flex items-center gap-3"
                    >
                        <div className="h-8 w-8 rounded-full bg-slate-700 overflow-hidden flex-shrink-0">
                            <img 
                            src={`https://github.com/${owner}.png`} 
                            alt={owner}
                            className="h-full w-full object-cover"
                            onError={(e) => { e.target.src = '/logo.png'; }}
                            />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-slate-200 truncate group-hover:text-white transition-colors">
                            {student.name}
                            </p>
                            <p className="text-xs text-slate-500 truncate">
                            @{owner}
                            </p>
                        </div>
                    </div>
                );
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Handson;
