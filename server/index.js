import express from 'express';
import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

app.post('/api/generate-question', async (req, res) => {
  try {
    const { code } = req.body;

    // Check for OpenRouter Key
    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(500).json({ error: 'Server missing OPENROUTER_API_KEY in .env file.' });
    }

    if (!code) {
      return res.status(400).json({ error: 'Code is required.' });
    }

    const prompt = `You are a programming question generator for an educational platform called PractSmart. Your task is to analyze code snippets and generate concise problem statements that describe what the code accomplishes, without revealing implementation details.

CORE INSTRUCTIONS:
1. Analyze the provided code to understand its functionality, logic, and purpose
2. Identify the programming language automatically from syntax
3. Generate a problem statement that describes WHAT the code does, not HOW it does it
4. Never mention specific variables, function names, algorithms, or implementation details from the code
5. Focus on the input-output behavior and functional requirements

OUTPUT FORMAT (STRICT):
Write <Language> program to <problem statement>

LANGUAGE DETECTION RULES:
- Python: Use "Python"
- JavaScript/Node.js: Use "JavaScript"
- Java: Use "Java"
- C: Use "C"
- C++: Use "C++"
- C#: Use "C#"
- Go: Use "Go"
- Rust: Use "Rust"
- TypeScript: Use "TypeScript"
- Ruby: Use "Ruby"
- PHP: Use "PHP"

PROBLEM STATEMENT GUIDELINES:
- Use clear, simple language (8th-grade reading level)
- Start with an action verb (calculate, find, check, sort, reverse, etc.)
- Include input/output expectations when relevant
- Keep it under 25 words
- Make it specific enough to be implementable
- Avoid phrases like "the program", "this code", "it uses", "implementation"

PROHIBITED CONTENT:
- Do NOT explain what's inside the program
- Do NOT mention algorithm names (bubble sort, binary search, etc.)
- Do NOT describe code structure (loops, conditionals, functions)
- Do NOT use markdown formatting (**, ##, , etc.)
- Do NOT add extra explanation or commentary
- Do NOT include phrases like "Here is the question:" or "Output:"

EXAMPLES:

Input Code (Python):
def factorial(n):
    if n == 0:
        return 1
    return n * factorial(n-1)

Correct Output:
Write Python program to calculate factorial of a given number using recursion

Wrong Output (DO NOT DO THIS):
Write Python program using recursive function with base case to compute factorial


Input Code (Java):
public class Palindrome {
    public static boolean check(String str) {
        String rev = new StringBuilder(str).reverse().toString();
        return str.equals(rev);
    }
}

Correct Output:
Write Java program to check if a given string is palindrome

Wrong Output (DO NOT DO THIS):
This program uses StringBuilder to reverse and compare strings


Input Code (C):
int arr[100], i, n, search, found = 0;
for(i = 0; i < n; i++) {
    if(arr[i] == search) found = 1;
}

Correct Output:
Write C program to search for an element in an array

Wrong Output (DO NOT DO THIS):
Write C program that uses linear search with a loop


EDGE CASES:
- If code has multiple functionalities, describe the PRIMARY purpose
- If code is incomplete or unclear, generate the most likely problem statement
- If code is too trivial (like "print hello"), describe it directly: "Write Python program to print hello world"
- For web development code (HTML/CSS/React), describe the UI/functionality: "Write JavaScript program to create a todo list application"

RESPONSE REQUIREMENTS:
- Output ONLY the question text
- No introductory phrases
- No trailing periods or punctuation after the statement
- No line breaks or extra whitespace
- Plain text only, zero formatting

Remember: You are generating exam questions for students. The question should be clear enough that a student could write similar code without seeing the original implementation.

Code:
${code}`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "kwaipilot/kat-coder-pro:free",
        "messages": [
          {
            "role": "user",
            "content": prompt
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
       console.error("OpenRouter Error:", data);
       throw new Error(data.error?.message || "Failed to fetch from OpenRouter");
    }

    // OpenRouter returns OpenAI-compatible format
    const text = data.choices[0].message.content;

    res.json({ question: text });

  } catch (error) {
    console.error("Error generating question:", error);
    res.status(500).json({ error: 'Failed to generate question. Check server logs.' });
  }
});

// Helper: Grade with AI
async function gradeWithAI(teacherCode, studentCode, question) {
  try {
    const prompt = `
Context: Use the following problem statement and teacher's solution to grade the student's submission.
Problem: ${question}
Teacher's Solution:
${teacherCode}

Student's Submission:
${studentCode || "NO CODE FOUND"}

Task:
Compare the student's code logic against the teacher's code and the problem requirements.
Assign a score from 0 to 100.
Provide a very short 1-sentence reason.

Output JSON ONLY:
{ "marks": number, "feedback": "string" }
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
    
    // Parse JSON from AI response (handle potential markdown wrapping)
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

app.post('/api/grade-students', async (req, res) => {
  try {
    const { teacherCode, students, question } = req.body;

    if (!teacherCode || !students || !Array.isArray(students)) {
      return res.status(400).json({ error: 'Missing teacherCode or students list.' });
    }

    // Determine extension (e.g., .py, .js)
    // Simple heuristic: check first line or use default. User didn't specify, so let's guess based on teacher code?
    // Actually, passing extension from frontend might be better, but let's infer for now.
    // Let's assume most are simple scripts. We'll look for *any* code file. 
    // Wait, the plan said "Identify target file extension from Teacher Code". 
    // Since we don't know the language, let's try to match ANY file that looks like code? 
    // Or better: Let's blindly search for ANY file that is not readme/license. 
    // Refinement: Python if teacher code has 'def ' or 'import ', JS if 'function ' or 'const '.
    // For simplicity, let's try to find a file with the SAME extension as the student's repo language? 
    // GitHub API returns 'language' in repo details, but we are listing contents.
    // Let's blindly get the first file that ends in .js, .py, .cpp, .java, .c.
    
    // Better logic: Just fetch the first non-markdown file for now.
    const extensions = ['.js', '.py', '.cpp', '.java', '.c', '.ts', '.html', '.css'];
    
    // Using Promise.all to process in parallel
    const gradedStudents = await Promise.all(students.map(async (student) => {
      let studentCode = null;
      let marks = 0;
      let feedback = "Repo empty or not found";
      let gradedFileUrl = null;

      // 1. Fetch
      // We need to guess extension. Let's try to find any valid source file in the root.
      // This helper needs to be smarter or we iterate.
      // Let's update helper to just return the first code file it finds.
       try {
          const parts = student.repoUrl.split('github.com/');
          if (parts.length >= 2) {
            const [owner, repo] = parts[1].split('/').filter(Boolean);
            const { data } = await axios.get(`https://api.github.com/repos/${owner}/${repo}/contents`);
            if (Array.isArray(data)) {
                 // Filter for all potential code files
                 const codeFiles = data.filter(f => extensions.some(ext => f.name.endsWith(ext)));
                 
                 let codeFile = null;

                 if (codeFiles.length === 0) {
                    // No code files found
                 } else if (codeFiles.length === 1) {
                    codeFile = codeFiles[0];
                 } else {
                    // Multiple files: Find the most recently updated one
                    try {
                        const filesWithDates = await Promise.all(codeFiles.map(async (f) => {
                            try {
                                const commitRes = await axios.get(`https://api.github.com/repos/${owner}/${repo}/commits?path=${f.path}&per_page=1`);
                                const dateStr = commitRes.data[0]?.commit?.committer?.date;
                                return { ...f, lastUpdated: dateStr ? new Date(dateStr) : new Date(0) };
                            } catch (err) {
                                // If commit fetch fails (e.g. rate limit), assume old date
                                return { ...f, lastUpdated: new Date(0) };
                            }
                        }));
                        
                        // Sort descending (newest first)
                        filesWithDates.sort((a, b) => b.lastUpdated - a.lastUpdated);
                        codeFile = filesWithDates[0];
                        console.log(`Selected latest file for ${student.name}: ${codeFile.name} (${codeFile.lastUpdated})`);
                    } catch (err) {
                        // Fallback to first file if sorting fails
                        console.error(`Error checking dates for ${student.name}, falling back to first file.`);
                        codeFile = codeFiles[0];
                    }
                 }

                 if (codeFile) {
                    const raw = await axios.get(codeFile.download_url);
                    studentCode = typeof raw.data === 'string' ? raw.data : JSON.stringify(raw.data);
                    gradedFileUrl = codeFile.html_url;
                 }
            }
          }
       } catch (e) { 
          if (e.response) {
            console.log(`Fetch error for ${student.name}: Status ${e.response.status} - ${JSON.stringify(e.response.data)}`);
          } else {
            console.log(`Fetch error for ${student.name}: ${e.message}`);
          }
       }

      // 2. Grade
      if (studentCode) {
        const result = await gradeWithAI(teacherCode, studentCode, question);
        marks = result.marks;
        feedback = result.feedback;
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
    console.error("Batch Grading Error:", error);
    res.status(500).json({ error: 'Grading failed.' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
