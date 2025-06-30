# Black Box - LeetCode Practice Platform

A comprehensive coding practice platform inspired by LeetCode, featuring an interactive problem-solving environment with AI-powered explanations, voice transcription, and gamified progression system.

## Features

### Core Functionality
- **Interactive Code Editor**: Monaco Editor with Python syntax highlighting and auto-completion
- **Real-time Code Execution**: Integrated with Judge0 API for code testing and validation
- **Problem Categorization**: 18+ topics covering algorithms and data structures (Arrays, Trees, Graphs, Dynamic Programming, etc.)
- **Tiered Progression System**: Unlock advanced topics by earning stars
- **Multi-format Problem Support**: Handles both function-based and class-based problems (e.g., MinStack)

### AI-Powered Learning
- **OpenAI Integration**: AI-generated explanations and comprehension questions
- **Voice Recording**: Record and transcribe solution explanations using OpenAI Whisper
- **Automated Grading**: AI evaluates explanations and comprehension answers
- **Intelligent Question Generation**: Dynamic questions based on your solution approach

### Progress Tracking
- **Star System**: Earn up to 3 stars per problem:
  - ⭐ Solve the problem
  - ⭐⭐ Pass verbal explanation evaluation
  - ⭐⭐⭐ Pass comprehension questions
- **Unlock Progression**: Access advanced topics by accumulating stars

### User Experience
- **Dark Theme UI**: Modern, eye-friendly interface built with Tailwind CSS
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Resizable Panels**: Customizable layout with problem description, code editor, and test cases
- **Lock Screen Protection**: Prevents access to problems requiring higher star counts
- **Firebase Authentication**: Secure user accounts and data persistence

## Screenshots

### Dashboard Overview
![Dashboard](public/images/dashboard-screenshot.png)


### Problem Solving Interface
![Problem Interface](public/images/problem-interface-screenshot.png)
![Problem Interface](public/images/problem-interface-submissions.png)

### AI-Powered Learning
![AI Features](public/images/ai-features-screenshot.png)
![AI Features](public/images/ai-features-1.png)


### Progress Tracking
![Progress Tracking](public/images/progress-screenshot.png)


## Tech Stack

### Frontend
- **Next.js 15.3.3** - React framework with App Router
- **React 19** - Latest React features and concurrent rendering
- **TypeScript/JavaScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Monaco Editor** - VS Code-powered code editor
- **React Resizable Panels** - Flexible layout system
- **Framer Motion** - Smooth animations and transitions
- **Recharts** - Data visualization and analytics

### Backend & Services
- **Firebase** - Authentication and Firestore database
- **Judge0 API** - Code execution and testing environment
- **OpenAI API** - AI explanations, questions, and transcription

## Usage

### Getting Started
1. **Sign Up/Login**: Create an account or sign in with existing credentials
2. **Dashboard Overview**: View available problem tiers and your progress
3. **Start with Tier 1**: Begin with foundational problems (Arrays & Hashing)
4. **Solve Problems**: Write code, run tests, and submit solutions
5. **Earn Stars**: Complete explanations and answer comprehension questions
6. **Unlock Advanced Topics**: Progress through tiers as you accumulate stars

### Problem Solving Workflow
1. **Read Problem Description**: Understand requirements and constraints
2. **Write Your Solution**: Use the Monaco code editor with syntax highlighting
3. **Test Your Code**: Run against provided test cases
4. **Submit Solution**: Validate against all test cases
5. **Record Explanation**: Use voice recording to explain your approach
6. **Answer Questions**: Complete AI-generated comprehension questions

### Tier System
- **Tier 1 (0+ stars)**: Arrays & Hashing fundamentals
- **Tier 2 (10+ stars)**: Two Pointers & Stack techniques
- **Tier 3 (25+ stars)**: Binary Search, Sliding Window & Linked Lists
- **Tier 4 (55+ stars)**: Tree algorithms and traversals
- **Tier 5 (80+ stars)**: Advanced data structures (Tries, Backtracking)
- **Tier 6 (100+ stars)**: Complex algorithms (Heaps, Graphs, Dynamic Programming)
- **Tier 7 (175+ stars)**: Optimization patterns (Intervals, Greedy, Bit Manipulation)
- **Tier 8 (275+ stars)**: Mastery level (Advanced Graphs, 2D DP, Math & Geometry)

## Project Structure

```
black-box/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   │   └── openai/        # OpenAI integration endpoints
│   │   ├── dashboard/         # Dashboard page
│   │   ├── login/            # Authentication pages
│   │   ├── signup/
│   │   └── question/         # Individual problem pages
│   ├── components/           # Reusable UI components
│   │   ├── CodeEditorPanel.js
│   │   ├── Header.js
│   │   ├── ProblemDescriptionPanel.js
│   │   └── TestCasesPanel.js
│   ├── context/              # React Context providers
│   │   ├── AuthContext.js
│   │   └── FirestoreContext.js
│   ├── firebase/             # Firebase configuration
│   ├── hooks/                # Custom React hooks
│   ├── utils/                # Utility functions
│   └── middleware.js         # Next.js middleware
├── data/                     # Problem definitions
│   └── blind75.json
├── public/                   # Static assets
│   └── images/
└── README.md
```


