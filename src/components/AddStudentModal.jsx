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

import { validateGithubUrl, parseGithubUrl } from '../utils/validators';
import { checkRepoExists } from '../services/githubApi';

const AddStudentModal = ({ onAddStudent }) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // 1. Validate URL Format
    if (!validateGithubUrl(repoUrl)) {
      setError('Invalid GitHub repository URL. Format: https://github.com/username/repo');
      setIsLoading(false);
      return;
    }

    // 2. Check if Repostory Exists
    const { owner, repo } = parseGithubUrl(repoUrl);
    const exists = await checkRepoExists(owner, repo);

    if (!exists) {
      setError('Repository not found or private. Please check the URL.');
      setIsLoading(false);
      return;
    }

  	  const newStudent = {
	    // id: crypto.randomUUID(), // Let DB handle ID
	    name,
	    repoUrl,
	    // addedAt: new Date().toISOString(), // Let DB handle Date
	  };

	  await onAddStudent(newStudent); // Await incase it's async now
    
    setIsLoading(false);
    setOpen(false);
    setName('');
    setRepoUrl('');
    setError('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-full w-14 h-14 bg-[#2da44e] hover:bg-[#2c974b] shadow-lg fixed bottom-8 right-8 flex items-center justify-center p-0">
          <Plus className="h-8 w-8 text-white" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Student</DialogTitle>
          <DialogDescription>
            Enter the student's details and their GitHub repository URL.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              placeholder="John Doe"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="repo" className="text-right">
              GitHub URL
            </Label>
            <div className="col-span-3">
              <Input
                id="repo"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/username/repo"
                className={error ? 'border-red-500' : ''}
                required
              />
              {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" className="bg-[#2da44e] hover:bg-[#2c974b]" disabled={isLoading}>
              {isLoading ? 'Validating...' : 'Add Student'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddStudentModal;
