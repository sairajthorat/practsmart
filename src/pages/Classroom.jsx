import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import AddStudentModal from '../components/AddStudentModal';
import StudentCard from '../components/StudentCard';
import { Github } from 'lucide-react';

const Classroom = () => {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) console.error('Error fetching students:', error);
    else setStudents(data.map(s => ({ ...s, repoUrl: s.repo_url, addedAt: s.created_at })));
  };

  const handleAddStudent = async (student) => {
    // Determine marks, feedback, etc. usually null at start
    const newStudent = {
      name: student.name,
      repo_url: student.repoUrl
    };

    const { data, error } = await supabase.from('students').insert([newStudent]).select();

    if (error) {
        console.error('Error adding student:', error);
        alert('Failed to add student to database.');
    } else {
        // Optimistic update or refetch
        if (data && data.length > 0) {
            const added = data[0];
            setStudents((prev) => [{ ...added, repoUrl: added.repo_url, addedAt: added.created_at }, ...prev]);
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
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {students.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
                <div className="p-4 rounded-full bg-slate-800/50 border border-slate-700">
                    <Github className="h-12 w-12 text-slate-500" />
                </div>
                <h2 className="text-xl font-semibold text-slate-200">No students added yet</h2>
                <p className="text-slate-400 max-w-sm">
                    Get started by tracking your first student's repository. Click the button below to add a student.
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
      {/* Floating Action Button */}
      <AddStudentModal onAddStudent={handleAddStudent} />
    </div>
  );
};

export default Classroom;
