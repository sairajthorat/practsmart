import React from 'react';
import { ExternalLink, Trash2, Github } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { parseGithubUrl } from '../utils/validators';

const StudentCard = ({ student, onDelete }) => {
  const { owner, repo } = parseGithubUrl(student.repoUrl) || { owner: 'unknown', repo: 'unknown' };

  return (
    <Card className="bg-slate-800 border-slate-700 text-slate-100 overflow-hidden hover:border-slate-600 transition-colors">
      <CardHeader className="flex flex-row items-center gap-4 p-4 pb-2">
        <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden">
             {/* Use GitHub avatar if available, otherwise fallback */}
            <img 
                src={`https://github.com/${owner}.png`} 
                alt={owner}
                className="h-full w-full object-cover"
                onError={(e) => { e.target.src = '/logo.png'; }} // Fallback to logo on error
            />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">{student.name}</h3>
          <p className="text-sm text-slate-400 truncate">@{owner}</p>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="flex items-center gap-2 text-sm text-slate-300 mb-2">
            <Github className="h-4 w-4" />
            <a 
                href={student.repoUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-[#2da44e] truncate transition-colors flex items-center gap-1"
            >
                {repo}
                <ExternalLink className="h-3 w-3" />
            </a>
        </div>
        <div className="text-xs text-slate-500">
            Added: {new Date(student.addedAt).toLocaleDateString()}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-end">
        <Button 
            variant="ghost" 
            size="icon" 
            className="text-slate-400 hover:text-red-400 hover:bg-red-400/10"
            onClick={() => onDelete(student.id)}
        >
            <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default StudentCard;
