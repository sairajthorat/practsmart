# PractSmart 🚀  
**AI-Powered Code Assessment & Classroom Management Platform**  
[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen)](https://practsmart.vercel.app/) [![Tech Stack](https://img.shields.io/badge/Stack-MERN%2B-blue)]()

PractSmart is an intelligent educational platform designed to streamline the technical assessment process. By integrating **Generative AI** with modern classroom tools, it automates the creation of coding problems and provides instant, logic-based grading for student submissions directly from GitHub.

## ✨ Key Features

### 🤖 AI-Driven Auto-Grading
- **Logic Over Syntax**: Uses LLMs (via OpenRouter) to evaluate student code based on logic, edge cases, and efficiency rather than simple string matching.
- **Smart Feedback**: Generates detailed, constructive feedback and a 0-100 score for every submission.

### 🔗 Seamless GitHub Integration
- **Automated Fetching**: Connects directly to the GitHub API to retrieve the latest student code commits.
- **Repo Tracking**: Teachers can link student repositories once and automatically track progress over time.

### 📊 Real-Time Classroom Dashboard
- **Live Monitoring**: Track class performance, view recent submissions, and manage student rosters in real-time.
- **Interactive UI**: Built with a responsive, modern interface using Tailwind CSS and Radix UI.

### 🧠 Automated Question Generation
- **Reverse Engineering**: The system can analyze a "teacher's solution" and automatically generate an appropriate problem statement for students to solve.

---

## 🛠️ Technology Stack

**Frontend**  
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB) ![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white) ![Radix UI](https://img.shields.io/badge/Radix_UI-161618?style=flat&logo=radix-ui&logoColor=white)

**Backend & Database**  
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white) ![Express.js](https://img.shields.io/badge/Express.js-000000?style=flat&logo=express&logoColor=white) ![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white)

**AI & Tools**  
![OpenAI](https://img.shields.io/badge/Gen_AI-LLMs-412991) ![GitHub API](https://img.shields.io/badge/GitHub_API-181717?style=flat&logo=github&logoColor=white)

---

## ⚡ Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/practsmart.git
   ```

2. **Install Dependencies**
   ```bash
   npm install
   cd server && npm install
   ```

3. **Environment Setup**
   Create a `.env` file with your credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_key
   OPENROUTER_API_KEY=your_ai_key
   GITHUB_TOKEN=your_github_token
   ```

4. **Run Locally**
   ```bash
   # Start Backend
   cd server
   node index.js
   
   # Start Frontend (in root)
   npm run dev
   ```

---

## 🚀 Future Enhancements
- [ ] Student Performance Analytics & Graphs
- [ ] Multi-language support expansion (currently optimized for JS/Python)
- [ ] Plagiarism Detection Module

---

<p align="center">
  Built with ❤️ for better education. | <a href="https://practsmart.vercel.app/">Visit Live App</a>
</p>
