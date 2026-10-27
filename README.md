# AI-Powered Personalized Placement Preparation Platform

An end-to-end adaptive platform designed to prepare students for tech placements through personalized skill diagnostics, company-specific roadmaps, algorithmic coding practice, aptitude training, and face-to-face AI mock interviews.

---

## 🌟 Key Features & Architecture Flow

```
User Registration / Goals ➔ Diagnostic Skill Assessment ➔ AI Evaluation Engine ➔ Personalized Recommendations ➔ Readiness Dashboard ➔ Practice Modules (DSA, Aptitude, Languages, AI Interview)

```

### 1. **Authentication & User Management**
   - Secure user registration and login with JWT-based authentication
   - Password encryption using bcrypt
   - One-click demo account for instant platform exploration
   - Persistent session management with token-based authorization

### 2. **User Profile & Target Calibration**
   - Customizable target companies (Google, Amazon, Microsoft, TCS, Infosys, Goldman Sachs, and more)
   - Target role alignment (SDE-1, Full-Stack Developer, Data Analyst, etc.)
   - Primary tech stack preferences (Python, Java, JavaScript, C++)
   - Personalized profile dashboard with editable career goals
   - Activity log tracking and progress history

### 3. **Placement Diagnostic Skill Assessment**
   - Comprehensive 10-question benchmark test covering:
     - **Quantitative Aptitude**: Work & Time, Speed & Distance, Profit & Loss
     - **Logical Reasoning**: Series & Patterns, Coding-Decoding, Syllogisms
     - **Programming Languages**: Python, Java, JavaScript scoping and fundamentals
     - **Data Structures & Algorithms**: Arrays, Linked Lists, Trees, Graphs
     - **Core CS Fundamentals**: Operating Systems, DBMS, Networking
     - **System Design**: Basic scalability and architecture concepts
   - Real-time countdown timer with automated scoring
   - Instant results with comprehensive score breakdown
   - Identified strengths and weakness areas with gap analysis
   - Detailed solution explanations with hints for each question
   - Category-wise performance metrics

### 4. **Readiness Dashboard & Dynamic Recommendation Engine**
   - **Overall Placement Readiness Score** (0-100%) based on multi-dimensional analysis
   - Multi-category competency visualization with radar/bar charts
   - **Target Company Fit Index** showing alignment with dream companies
   - Missing competencies identification with priority recommendations
   - **Daily Adaptive Missions Checklist** with dynamic task generation
   - 4-week structured placement preparation roadmap
   - Recent activity timeline and progress tracking
   - Personalized next-step recommendations powered by AI

### 5. **Language Learning Tracks**
   - **14 Interactive Modules** for each language (Python, Java, C++, JavaScript)
   - Progressive difficulty levels from Foundational to Advanced
   - Topic coverage includes:
     - **Python**: LEGB Scoping, Closures, Mutable Default Arguments, Generators, List Comprehensions, OOP Magic Methods
     - **Java**: Polymorphism, JVM Memory Model, Collections Framework, Multithreading
     - **C++**: Pointers & References, Move Semantics, Templates, STL Internals
     - **JavaScript**: Event Loop, Closures & Prototypes, Promises & Async/Await, Memory Management
   - Interactive code playground with live code execution
   - Built-in quiz system for knowledge validation
   - Common mistakes section for each concept
   - Real-world code examples with detailed explanations

### 6. **Coding Practice Arena (DSA)**
   - **LeetCode-style problem-solving platform** with curated problems
   - **Multi-language code runner** supporting Python, Java, JavaScript, and C++
   - Problem difficulty levels: Easy, Medium, Hard
   - Topic-based categorization:
     - Arrays & Hashing
     - Sliding Window
     - Linked Lists
     - Trees & Graphs
     - Dynamic Programming
     - Backtracking
   - Company-tagged problems (Google, Amazon, Microsoft, TCS, Infosys, etc.)
   - Visible and hidden test cases with automated evaluation
   - Problem descriptions with examples, constraints, and hints
   - Starter code templates for all supported languages
   - Real-time code execution with input/output validation
   - Submission history and attempt tracking

### 7. **Aptitude Training Module**
   - **Timed mock exams** simulating actual placement tests
   - TCS NQT, Infosys, and other company-specific test formats
   - Speed analytics and time management insights
   - Question categories:
     - Numerical Ability
     - Logical Reasoning
     - Verbal Ability
     - Data Interpretation
   - Performance reports with accuracy metrics
   - Section-wise timing analysis

### 8. **Company Intelligence Blueprints**
   - Detailed profiles for 6+ target companies:
     - Google, Amazon, Microsoft (Product-based)
     - TCS, Infosys, Goldman Sachs (Service & Finance)
   - **Hiring round breakdowns** with stage-wise preparation guidance
   - **Skill weightage matrix** showing what each company values most
   - Sample past interview questions by topic
   - **Cutoff benchmarks** and assessment scoring guidelines
   - Company-specific preparation tips and strategies
   - Frequently asked topics and syllabus coverage

### 9. **AI Face-to-Face Mock Interview Studio**
   - Interactive voice & video interview simulations
   - AI-powered feedback on:
     - **Technical Accuracy (40%)**: Algorithms, data structures, edge cases
     - **Communication & Clarity (30%)**: Problem breakdown, thinking aloud process
     - **Behavioral & STAR Method (30%)**: Culture fit, leadership principles
   - Real-time question-answer sessions tailored to skill profile
   - Company-specific interview scenarios (Google Googliness, Amazon Leadership Principles)
   - Post-interview detailed feedback reports

### 10. **Progress Tracking & Analytics**
   - Comprehensive activity logging system
   - Track coding attempts, assessment completions, and module progress
   - Visual progress indicators for each learning track
   - Historical performance data and trend analysis
   - Personalized recommendations based on activity patterns

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite (fast development server and optimized builds)
- **Styling**: Tailwind CSS with custom design system
- **Icons**: Lucide React (modern, customizable icon library)
- **Routing**: React Router v6 for client-side navigation
- **State Management**: React Context API for authentication and global state
- **UI Effects**: Canvas Confetti for success celebrations
- **HTTP Client**: Axios for API communication

### Backend
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js with TypeScript
- **Authentication**: JWT-based token authentication (`jsonwebtoken`)
- **Security**: 
  - Password hashing with `bcryptjs`
  - CORS enabled for cross-origin requests
  - Environment-based configuration
- **Code Execution**: Multi-language code runner supporting Python, Java, JavaScript, and C++
- **API Architecture**: RESTful API with modular route structure

### Database
- **Primary**: MongoDB with Mongoose ODM
- **Fallback**: In-Memory & JSON file store (`./data/db.json`) for instant zero-config startup
- **Models**: User, SkillProfile, Attempt, CodingAttempt, TrackProgress, ActivityLog, Recommendation, InterviewSession

### Additional Features
- **Recommendation Engine**: AI-powered personalized learning path generation
- **Seed Data**: Pre-populated questions, companies, and learning tracks
- **Activity Service**: Automated user activity tracking and analytics

---

## 🚀 Quickstart & Setup

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** (comes with Node.js)
- **MongoDB** (optional - platform works with JSON fallback store)

### 1. Backend Setup (Port 3000)
```bash
cd backend
npm install
npm run dev
```
✅ The backend will start at: `http://localhost:3000`  
🔍 Health Check: `http://localhost:3000/api/health`

### 2. Frontend Setup (Port 5173)
```bash
cd frontend
npm install
npm run dev
```
✅ The frontend application will open at: `http://localhost:5173`

### 3. Environment Configuration (Optional)
For MongoDB connection, create a `.env` file in the `backend` directory:
```env
MONGODB_URI=mongodb://localhost:27017/placement-prep
JWT_SECRET=your_jwt_secret_key
PORT=3000
```
*Note: The platform automatically uses JSON file storage if MongoDB is not configured.*

---

## 🔑 Demo Account Credentials
- **Email**: `student.candidate@demo.com`
- **Password**: `Demo@1234`
- Or simply click **"Try Instant Demo Account (1-Click)"** on the Login screen!

---

## 📁 Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── controllers/      # Request handlers
│   │   ├── models/           # Database schemas
│   │   ├── routes/           # API endpoints
│   │   ├── services/         # Business logic (code runner, recommendations)
│   │   ├── data/             # Seed data (questions, companies, tracks)
│   │   ├── middleware/       # Authentication middleware
│   │   └── server.ts       # Entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/            # Route components
│   │   │   ├── Auth/         # Login & Register
│   │   │   ├── Dashboard/    # Main dashboard
│   │   │   ├── Assessment/   # Diagnostic test
│   │   │   ├── LanguageLearn/# Programming tracks
│   │   │   ├── CodingPractice/# DSA problems
│   │   │   ├── Aptitude/     # Mock tests
│   │   │   ├── CompanyPrep/  # Company blueprints
│   │   │   ├── AIInterview/  # Mock interviews
│   │   │   └── Profile/      # User profile
│   │   ├── components/       # Reusable UI components
│   │   ├── context/          # React Context (Auth)
│   │   ├── services/         # API client
│   │   └── App.tsx           # Main app component
│   └── package.json
│
└── README.md
```

---

## 🎯 How to Use the Platform

1. **Register/Login**: Create an account or use the demo credentials
2. **Complete Profile**: Set your target company, role, and tech stack preferences
3. **Take Diagnostic Assessment**: Complete the 10-question skills evaluation
4. **View Dashboard**: Check your readiness score and personalized recommendations
5. **Follow Daily Missions**: Complete adaptive tasks suggested by the AI engine
6. **Practice Modules**:
   - 📚 **Learn**: Master programming languages through interactive lessons
   - 💻 **Code**: Solve DSA problems with the multi-language code runner
   - 🧮 **Aptitude**: Take timed mock exams to improve speed
   - 🏢 **Company Prep**: Study company-specific interview patterns
   - 🎤 **AI Interview**: Practice with face-to-face mock interviews
7. **Track Progress**: Monitor your improvement through analytics and activity logs

---

## 🌟 Key Highlights

- ✅ **Zero Configuration**: Works out-of-the-box with JSON file storage
- ✅ **Multi-Language Support**: Practice in Python, Java, JavaScript, or C++
- ✅ **Company-Specific Prep**: Tailored content for Google, Amazon, Microsoft, TCS, Infosys, and more
- ✅ **Real-Time Code Execution**: Instant feedback on coding solutions
- ✅ **AI-Powered Recommendations**: Personalized learning paths based on your skill gaps
- ✅ **Comprehensive Coverage**: Aptitude, DSA, Programming, System Design, and Behavioral prep
- ✅ **Progress Tracking**: Detailed analytics and activity logs
- ✅ **Responsive Design**: Works seamlessly on desktop and mobile devices

---

## 🔧 Available API Endpoints

- **Auth**: `/api/auth/register`, `/api/auth/login`
- **Profile**: `/api/profile` (GET, PUT)
- **Assessment**: `/api/assessment/questions`, `/api/assessment/submit`
- **Dashboard**: `/api/dashboard/overview`
- **Companies**: `/api/companies`, `/api/companies/:id`
- **Problems**: `/api/problems`, `/api/problems/:id`
- **Code**: `/api/code/run`, `/api/code/submit`
- **Tracks**: `/api/tracks`, `/api/tracks/:trackId`
- **Health**: `/api/health`

---

## 📝 License

This project is built for educational purposes as an AI-powered placement preparation platform.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

---

## 📧 Support

For questions or support, please reach out through the platform's feedback system.

---

**Built with ❤️ for aspiring software engineers preparing for their dream placements!**
<<<<<<< HEAD
=======
# AI-Placement-Preparation
An AI-powered placement preparation platform featuring personalized skill assessments, DSA coding practice, aptitude training, company-specific preparation roadmaps, and AI mock interviews.