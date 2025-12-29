import express from 'express';
import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// --- Helper Functions ---

// 1. GitHub Headers
const getGithubHeaders = () => {
  const token = process.env.GITHUB_TOKEN || process.env.github_token;
  return token ? { headers: { 'Authorization': `token ${token}` } } : {};
};

// 2. AI Grading Service
async function gradeWithAI(teacherCode, studentCode, question) {
  try {
    const prompt = `
You are an automated code evaluator. Follow the rules exactly.

INPUT:
Problem:
${question}

Reference Solution (correct logic):
${teacherCode}

Student Submission:
${studentCode || "NO CODE FOUND"}

SCORING RULES (MANDATORY):
1. Score MUST be an integer from 0 to 100.
2. Start from 100 and deduct marks for each logical mistake.
3. Deduct 10–30 marks per missing or incorrect core logic.
4. Deduct 5–10 marks per missing edge case.
5. Deduct 5–15 marks for incorrect output handling.
6. Fully correct and complete logic → 100.
7. Partially correct logic → proportional score.
8. Incorrect, unrelated, or empty code → 0.
9. Ignore variable names, formatting, comments, and style.
10. Be deterministic: same input → same score.

OUTPUT:
Return ONLY valid JSON in this exact format:
{ "marks": number, "feedback": "one short sentence" }
`;


    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "mistralai/devstral-2512:free",
        "messages": [{ "role": "user", "content": prompt }]
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
        console.error("AI Grading API Error:", data);
        return { marks: 0, feedback: "AI Service Error" };
    }

    const content = data.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return { marks: 0, feedback: "Failed to parse AI response" };

  } catch (error) {
    console.error("AI Grading Error:", error);
    return { marks: 0, feedback: "AI Error" };
  }
}

// 3. Fast Code Fetcher (Strategy: Latest Commit -> Fallback to Root)
async function fetchLatestCode(owner, repo) {
    const extensions = ['.js', '.py', '.cpp', '.java', '.c', '.ts', '.html', '.css'];
    
    try {
        const commitRes = await axios.get(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=1`, getGithubHeaders());
        
        if (commitRes.data && commitRes.data.length > 0) {
            const latestCommit = commitRes.data[0];
            const sha = latestCommit.sha;

            const detailRes = await axios.get(`https://api.github.com/repos/${owner}/${repo}/commits/${sha}`, getGithubHeaders());
            const files = detailRes.data.files || [];

            const latestFile = files.find(f => extensions.some(ext => f.filename.endsWith(ext)));

            if (latestFile) {
                const rawUrl = latestFile.raw_url; 
                const contentRes = await axios.get(rawUrl, getGithubHeaders());
                const content = typeof contentRes.data === 'string' ? contentRes.data : JSON.stringify(contentRes.data);
                
                return {
                    code: content,
                    url: latestFile.blob_url || rawUrl,
                    filename: latestFile.filename
                };
            }
        }
    } catch (e) {
        // Fallback
    }

    try {
        const contentsRes = await axios.get(`https://api.github.com/repos/${owner}/${repo}/contents`, getGithubHeaders());
        const files = contentsRes.data;
        
        if (Array.isArray(files)) {
             const codeFile = files.find(f => extensions.some(ext => f.name.endsWith(ext)));
             if (codeFile) {
                 const contentRes = await axios.get(codeFile.download_url, getGithubHeaders());
                 const content = typeof contentRes.data === 'string' ? contentRes.data : JSON.stringify(contentRes.data);
                 return {
                     code: content,
                     url: codeFile.html_url,
                     filename: codeFile.name
                 };
             }
        }
    } catch (e) {
        throw e;
    }

    return null;
}


// --- Routes ---

app.post('/api/check-repo', async (req, res) => {
  try {
    const { owner, repo } = req.body;
    if (!owner || !repo) {
       return res.status(400).json({ error: 'Owner and repo are required' });
    }
    
    // Use existing helper with token logic
    try {
        await axios.get(`https://api.github.com/repos/${owner}/${repo}`, getGithubHeaders());
        res.json({ exists: true });
    } catch (error) {
        if (error.response && error.response.status === 404) {
             res.json({ exists: false });
        } else {
             throw error; 
        }
    }
  } catch (error) {
    console.error("Repo Check Error:", error.message);
    res.status(500).json({ error: 'Failed to check repository' });
  }
});

app.post('/api/generate-question', async (req, res) => {
  try {
    const { code } = req.body;

    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(500).json({ error: 'Server missing OPENROUTER_API_KEY.' });
    }
    if (!code) {
      return res.status(400).json({ error: 'Code is required.' });
    }

    const prompt = `Analyze the following code. Identify the programming language and the problem it solves. Generate a clear, concise programming question (problem statement) that would require a student to write this code. Output ONLY the question text. Note: Be concise.

Code:
${code}`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "mistralai/devstral-2512:free",
        "messages": [{ "role": "user", "content": prompt }]
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || "AI Error");
    
    res.json({ question: data.choices[0].message.content });

  } catch (error) {
    console.error("Gen Question Error:", error);
    res.status(500).json({ error: 'Failed to generate question.' });
  }
});

app.post('/api/grade-students', async (req, res) => {
  try {
    const { teacherCode, students, question } = req.body;

    if (!teacherCode || !students || !Array.isArray(students)) {
      return res.status(400).json({ error: 'Invalid payload.' });
    }

    const gradedStudents = await Promise.all(students.map(async (student) => {
        let studentCode = null;
        let marks = 0;
        let feedback = "Repo empty or no code found";
        let gradedFileUrl = null;

        try {
            const parts = student.repoUrl.split('github.com/');
            if (parts.length >= 2) {
                const [owner, repo] = parts[1].split('/').filter(Boolean);
                const result = await fetchLatestCode(owner, repo);
                if (result) {
                    studentCode = result.code;
                    gradedFileUrl = result.url;
                }
            }
        } catch (e) {
            feedback = "Fetch Error (Check Repo/Privacy)";
            if (e.response && e.response.status === 404) feedback = "Repo Not Found";
            if (e.response && e.response.status === 403) feedback = "API Rate Limit";
            console.log(`Fetch Fail ${student.name}: ${e.message}`);
        }

        if (studentCode) {
            const grade = await gradeWithAI(teacherCode, studentCode, question);
            marks = grade.marks;
            feedback = grade.feedback;
        }

        return {
            ...student,
            marks,
            feedback,
            gradedFileUrl,
            gradedAt: new Date().toISOString()
        };
    }));

    res.json({ students: gradedStudents });

  } catch (error) {
    console.error("Batch Grading Crash:", error);
    res.status(500).json({ error: 'System Error during grading.' });
  }
});

// Vercel Serverless Export: No app.listen()
export default app;
