import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import CreateClassroomModal from '../components/CreateClassroomModal';
import ClassroomCard from '../components/ClassroomCard';
import ClassroomDetail from '../components/ClassroomDetail';
import { BookOpen } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const Classroom = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [classroomToDelete, setClassroomToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchClassrooms();
  }, []);

  const fetchClassrooms = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('classrooms')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching classrooms:', error);
    } else {
      setClassrooms(data);
    }
    setLoading(false);
  };

  const handleClassroomCreated = (newClassroom) => {
    setClassrooms((prev) => [newClassroom, ...prev]);
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

  const handleClassroomUpdate = (id) => {
    setClassrooms((prev) =>
      prev.map((c) => (c.id === id ? { ...c, _lastUpdated: Date.now() } : c))
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {classrooms.length === 0 && !loading ? (
             <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
                 <div className="p-4 rounded-full bg-slate-800/50 border border-slate-700">
                     <BookOpen className="h-12 w-12 text-slate-500" />
                 </div>
                 <h2 className="text-xl font-semibold text-slate-200">No classrooms created yet</h2>
                 <p className="text-slate-400 max-w-sm">
                     Create your first classroom to get started managing students.
                 </p>
             </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classrooms.map((classroom) => (
                    <ClassroomCard 
                        key={classroom.id} 
                        classroom={classroom} 
                        onClick={setSelectedClassroom} 
                        onDelete={handleDeleteClick}
                    />
                ))}
            </div>
        )}
      
      {/* Floating Action Button to Create Classroom */}
      <CreateClassroomModal onClassroomCreated={handleClassroomCreated} />

      {/* Classroom Detail Modal */}
      {selectedClassroom && (
        <ClassroomDetail 
          classroom={selectedClassroom} 
          onClose={() => setSelectedClassroom(null)} 
          onUpdate={() => handleClassroomUpdate(selectedClassroom.id)}
        />
      )}

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

export default Classroom;
