import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Play, ChevronLeft, Settings } from 'lucide-react';
import { parseGithubUrl } from '../utils/validators';
import { supabase } from '../supabaseClient';
import ClassroomCard from '../components/ClassroomCard';

const Handson = () => {
  const [code, setCode] = useState('');
  const [classrooms, setClassrooms] = useState([]);
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [students, setStudents] = useState([]);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [classroomToDelete, setClassroomToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchClassrooms();
  }, []);

  useEffect(() => {
    if (selectedClassroom) {
      fetchStudents(selectedClassroom.id);
    } else {
      setStudents([]);
    }
  }, [selectedClassroom]);

  const fetchClassrooms = async () => {
    const { data, error } = await supabase
      .from('classrooms')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) console.error('Error fetching classrooms:', error);
    else setClassrooms(data);
  };

  const fetchStudents = async (classroomId) => {
    setLoadingStudents(true);
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('classroom_id', classroomId)
      .order('created_at', { ascending: false });
    
    if (error) console.error('Error fetching students:', error);
    else setStudents(data.map(s => ({ ...s, repoUrl: s.repo_url, addedAt: s.created_at })));
    setLoadingStudents(false);
  };

  const handleDeleteClick = (classroom) => {
    setClassroomToDelete(classroom);
  };

  const confirmDelete = async () => {
    if (!classroomToDelete) return;
    setIsDeleting(true);

    const { error } = await supabase
      .from('classrooms')
      .delete()
      .eq('id', classroomToDelete.id);

    if (error) {
      console.error('Error deleting classroom:', error);
      alert('Failed to delete classroom. Please try again.');
    } else {
      setClassrooms((prev) => prev.filter((c) => c.id !== classroomToDelete.id));
      setClassroomToDelete(null);
    }
    setIsDeleting(false);
  };

  const handleGo = async () => {
    if (!code.trim()) return;
    
    setLoading(true);
    setQuestion('Generating question...');
    
    try {
      const response = await fetch('/api/generate-question', {
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

  const handleReview = async () => {
    if (!code.trim() || !question) {
        alert("Please generate a question first by entering code and clicking Go.");
        return;
    }

    if (!selectedClassroom) {
        alert("Please select a classroom first.");
        return;
    }
    
    setLoading(true);
    try {
        const response = await fetch('/api/grade-students', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                teacherCode: code, 
                students, 
                question 
            }),
        });
        
        const data = await response.json();
        
        if (response.ok && data.students) {
            const gradedStudents = data.students;
            setStudents(gradedStudents);
            
            // Save grades to Supabase
            const updates = gradedStudents.map(s => ({
                id: s.id,
                marks: s.marks,
                feedback: s.feedback,
                // last_graded_at: new Date() // if column exists
            }));
            
            const { error } = await supabase.from('students').upsert(updates);
            if (error) console.error('Error saving grades:', error);

        } else {
            console.error(data.error);
            alert("Grading failed: " + data.error);
        }
    } catch (error) {
        console.error("Review error:", error);
        alert("Failed to connect to grading server.");
    } finally {
      setLoading(false);
    }
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
        <div className="h-52 bg-[#5c7cfa]/10 border-b border-slate-700 p-6 relative flex flex-col">
            <h2 className="text-xl font-bold text-slate-100 mb-2">Question</h2>
            <div className="flex-1 bg-slate-800/50 rounded-lg p-4 text-slate-300 text-sm overflow-y-auto custom-scrollbar border border-slate-700/50">
                <p>{question || 'Paste code and click Go to generate a question.'}</p>
            </div>
            
            {/* Review Button */}
            <div className="absolute bottom-8 right-8">
                 <Button 
                    onClick={handleReview}
                    disabled={loading || !selectedClassroom} // Disable if no classroom selected
                    className="bg-[#5c7cfa] hover:bg-[#4c6ef5] text-white shadow-lg disabled:opacity-50"
                 >
                    {loading ? 'Grading...' : selectedClassroom ? `Review ${selectedClassroom.name}` : 'Select Classroom'}
                 </Button>
            </div>
        </div>

        {/* Bottom Section: Classroom/Student List Grid */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-slate-900">
            {/* Header for Bottom Section */}
          <div className="flex justify-between items-center mb-4 sticky top-0 bg-slate-900 py-2 z-10">
            <div className="flex items-center gap-2">
                 {selectedClassroom && (
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setSelectedClassroom(null)}
                        className="text-slate-400 hover:text-slate-200 p-0 h-auto mr-1"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                 )}
                 <h3 className="text-sm font-semibold text-slate-400">
                    {selectedClassroom ? `Students in ${selectedClassroom.name}` : 'Select Classroom'} 
                    {selectedClassroom && ` (${students.length})`}
                 </h3>
            </div>
            {loadingStudents && <span className="text-xs text-blue-400 animate-pulse">Loading...</span>}
            
            {/* Optional: Change Classroom Button (redundant if we have back arrow, but per request 'option in corner change classroom') */}
            {selectedClassroom && (
                <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedClassroom(null)}
                    className="text-xs text-blue-400 hover:text-blue-300"
                >
                    Change Classroom
                </Button>
            )}
          </div>
          
          {!selectedClassroom ? (
            // Classroom Grid View
            <div className="grid grid-cols-2 gap-4">
                {classrooms.map((classroom) => (
                    <div className="scale-90 origin-top-left w-[110%]"> 
                        {/* We reuse ClassroomCard but maybe scale it down or just render it directly. 
                            Let's just use it directly, knowing it might be a bit big. 
                            Actually, let's pass a dummy onClick that sets selected.
                        */}
                        <ClassroomCard 
                            key={classroom.id}
                            classroom={classroom}
                            onClick={setSelectedClassroom} 
                            onDelete={handleDeleteClick} 
                        />
                     </div>
                ))}
                {classrooms.length === 0 && (
                     <p className="text-slate-500 text-sm col-span-2 text-center py-8">No classrooms found.</p>
                )}
            </div>
          ) : (
            // Student Grid View
            students.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm col-span-2">
                 No students found in this classroom.
               </div>
             ) : (
               <div className="grid grid-cols-2 gap-3">
                   {students.map((student) => {
                   const { owner } = parseGithubUrl(student.repoUrl) || { owner: 'user' };
                   const hasMarks = typeof student.marks === 'number';
                   
                   return (
                       <div 
                       key={student.id} 
                       onClick={() => {
                           const url = student.gradedFileUrl || student.repoUrl;
                           if (url) window.open(url, '_blank');
                       }}
                       className="bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 rounded-lg p-3 transition-colors cursor-pointer group flex items-start gap-3 relative overflow-hidden"
                       >
                           {/* Progress Bar / Marks Indicator */}
                           {hasMarks && (
                              <div 
                                className={`absolute left-0 top-0 bottom-0 w-1 ${student.marks >= 80 ? 'bg-green-500' : student.marks >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                              />
                           )}
   
                           <div className="h-8 w-8 rounded-full bg-slate-700 overflow-hidden flex-shrink-0 mt-1">
                               <img 
                               src={`https://github.com/${owner}.png`} 
                               alt={owner}
                               className="h-full w-full object-cover"
                               onError={(e) => { e.target.src = '/logo.png'; }}
                               />
                           </div>
                           <div className="min-w-0 flex-1">
                               <div className="flex justify-between items-start">
                                   <p className="text-sm font-medium text-slate-200 truncate group-hover:text-white transition-colors">
                                   {student.name}
                                   </p>
                                   {hasMarks && (
                                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${student.marks >= 80 ? 'bg-green-900/50 text-green-400' : 'bg-slate-700 text-slate-300'}`}>
                                        {student.marks}
                                      </span>
                                   )}
                               </div>
                               <p className="text-xs text-slate-500 truncate mb-1">
                               @{owner}
                               </p>
                               
                               {/* Feedback Snippet */}
                               {student.feedback && (
                                   <p className="text-[10px] text-slate-400 leading-tight line-clamp-2">
                                       {student.feedback}
                                   </p>
                               )}
                           </div>
                       </div>
                   );
                   })}
               </div>
             )
          )}
        </div>
      </div>
      {/* Delete Confirmation Modal */}
      <Dialog open={!!classroomToDelete} onOpenChange={(open) => !open && setClassroomToDelete(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Classroom</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <span className="font-semibold text-slate-900 dark:text-slate-100">{classroomToDelete?.name}</span>? This action cannot be undone and will delete all students associated with this classroom.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClassroomToDelete(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" className="bg-red-600 hover:bg-red-700 text-white" onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Handson;
