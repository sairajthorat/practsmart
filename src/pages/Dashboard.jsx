import React, { useState, useEffect } from 'react';
import { Github } from 'lucide-react'; // Keep for header if needed, but we used img for logo
import AddStudentModal from '../components/AddStudentModal';
import StudentCard from '../components/StudentCard';

const Dashboard = () => {
  const [students, setStudents] = useState(() => {
    const saved = localStorage.getItem('practsmart_students');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('practsmart_students', JSON.stringify(students));
  }, [students]);

  const handleAddStudent = (student) => {
    setStudents((prev) => [student, ...prev]);
  };

  const handleDeleteStudent = (id) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="PractSmart Logo" className="h-8 w-8 object-contain" />
            <span className="font-bold text-lg tracking-tight">PractSmart</span>
          </div>
          <div className="flex items-center gap-4">
            {/* Placeholder for future specific header items */}
            <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
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
      </main>

      {/* Floating Action Button */}
      <AddStudentModal onAddStudent={handleAddStudent} />
    </div>
  );
};

export default Dashboard;
