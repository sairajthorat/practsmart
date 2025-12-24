import express from 'express';
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

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
