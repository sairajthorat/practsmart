import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { BookOpen, Trash2 } from 'lucide-react';

const ClassroomCard = ({ classroom, onClick, onDelete }) => {
  const [studentCount, setStudentCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      const { count, error } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('classroom_id', classroom.id);
      
      if (!error) {
        setStudentCount(count);
      }
    };
    fetchCount();
  }, [classroom.id, classroom._lastUpdated]);

  return (
    <div 
      className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-sm hover:shadow-md hover:border-slate-600 transition-all cursor-pointer group relative"
      onClick={() => onClick(classroom)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-slate-900/50 rounded-lg group-hover:bg-slate-900 transition-colors">
          <BookOpen className="h-6 w-6 text-blue-400" />
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(classroom);
          }}
          className="p-2 hover:bg-red-900/30 rounded-full transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
          title="Delete Classroom"
        >
          <Trash2 className="h-5 w-5 text-slate-400 hover:text-red-400 transition-colors" />
        </button>
      </div>
      
      <h3 className="text-lg font-semibold text-slate-100 mb-1 group-hover:text-blue-400 transition-colors">
        {classroom.name}
      </h3>
      
      <p className="text-sm text-slate-400">
        {studentCount} {studentCount === 1 ? 'student' : 'students'}
      </p>
    </div>
  );
};

export default ClassroomCard;
