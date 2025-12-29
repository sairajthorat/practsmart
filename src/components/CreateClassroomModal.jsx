import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from '../supabaseClient';

const CreateClassroomModal = ({ onClassroomCreated }) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setError("You must be logged in to create a classroom.");
      setLoading(false);
      return;
    }

    const { data, error: insertError } = await supabase
      .from('classrooms')
      .insert([{ name, teacher_id: user.id }])
      .select();

    if (insertError) {
      console.error('Error creating classroom:', insertError);
      setError('Failed to create classroom. Please try again.');
    } else {
      if (onClassroomCreated && data) {
        onClassroomCreated(data[0]);
      }
      setOpen(false);
      setName('');
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-full w-14 h-14 bg-[#2da44e] hover:bg-[#2c974b] shadow-lg fixed bottom-8 right-8 flex items-center justify-center p-0 z-50">
          <Plus className="h-8 w-8 text-white" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Classroom</DialogTitle>
          <DialogDescription>
            Enter a name for your new classroom.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="className" className="text-right">
              Name
            </Label>
            <Input
              id="className"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              placeholder="e.g. Physics 101"
              required
            />
          </div>
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}
          <DialogFooter>
            <Button type="submit" className="bg-[#2da44e] hover:bg-[#2c974b]" disabled={loading}>
              {loading ? 'Creating...' : 'Create Classroom'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateClassroomModal;
