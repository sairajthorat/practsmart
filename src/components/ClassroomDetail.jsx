import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import StudentCard from './StudentCard';
import AddStudentModal from './AddStudentModal';
import { Github, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const ClassroomDetail = ({ classroom, onClose, onUpdate }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (classroom) {
      fetchStudents();
    }
  }, [classroom]);

  const fetchStudents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('classroom_id', classroom.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching students:', error);
    } else {
      setStudents(data.map(s => ({ ...s, repoUrl: s.repo_url, addedAt: s.created_at })));
    }
    setLoading(false);
  };

  const handleAddStudent = async (student) => {
    const newStudent = {
      name: student.name,
      repo_url: student.repoUrl,
      classroom_id: classroom.id
    };

    const { data, error } = await supabase
      .from('students')
      .insert([newStudent])
      .select();

    if (error) {
      console.error('Error adding student:', error);
      alert('Failed to add student to database.');
    } else {
      if (data && data.length > 0) {
        const added = data[0];
        setStudents((prev) => [{ ...added, repoUrl: added.repo_url, addedAt: added.created_at }, ...prev]);
        if (onUpdate) onUpdate();
      }
    }
  };

  const handleDeleteStudent = async (id) => {
     const { error } = await supabase.from('students').delete().eq('id', id);
     if (error) {
         console.error('Error deleting student:', error);
         alert('Failed to delete student.');
     } else {
         setStudents((prev) => prev.filter((s) => s.id !== id));
         if (onUpdate) onUpdate();
     }
  };

  return (
    <Dialog open={!!classroom} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 gap-0 bg-slate-900 border-slate-800 text-slate-100">
        <DialogHeader className="p-6 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">{classroom?.name}</DialogTitle>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto p-6 bg-slate-900/50">
          {loading ? (
             <div className="flex items-center justify-center h-full text-slate-400">Loading students...</div>
          ) : students.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                <div className="p-4 rounded-full bg-slate-800/50 border border-slate-700">
                    <Github className="h-12 w-12 text-slate-500" />
                </div>
                <h2 className="text-xl font-semibold text-slate-200">No students in this classroom</h2>
                <p className="text-slate-400 max-w-sm">
                    Add students using the button below.
                </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {students.map((student) => (
                    <StudentCard 
                        key={student.id} 
                        student={student} 
                        onDelete={handleDeleteStudent} 
                    />
                ))}
            </div>
          )}
        </div>

        {/* 
            We place the AddStudentModal here. 
            The actual Modal (Dialog) from AddStudentModal will open on top of this one.
            We need to make sure the trigger button is visible.
            Since this ClassroomDetail is a modal, the trigger button (fixed) from AddStudentModal 
            will show up on the screen.
        */}
        <AddStudentModal onAddStudent={handleAddStudent} />

      </DialogContent>
    </Dialog>
  );
};

export default ClassroomDetail;
