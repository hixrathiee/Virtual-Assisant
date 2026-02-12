# 🤖 Virtual AI Assistant

A full-stack voice-enabled virtual assistant built using the MERN stack and Google Gemini AI.

The assistant listens to the user through the browser, understands natural language using Gemini, converts it into structured JSON, and performs real-world actions like searching Google, opening YouTube, telling time/date, and more.

The project also includes authentication, assistant customization, image upload, and command history tracking.

---

## 🌐 Live Demo

Deployed on Render  
https://virtual-assisant-frontend.onrender.com

---

## 🚀 Features

### AI Command Understanding
- Integrated with Google Gemini API
- Converts natural language into structured JSON
- Intent classification using a `type`-based routing system
- Custom prompt engineering to enforce consistent responses

### Voice Interaction
- Speech-to-Text using Web Speech API
- Text-to-Speech using Speech Synthesis API
- Continuous listening mode
- Auto-restart recognition after speaking
- Wake-word detection using assistant name

### Authentication & Security
- JWT-based authentication
- HTTP-only cookies for token storage
- Password hashing using bcrypt
- Protected backend routes

### Personalization
- Users can customize assistant name
- Users can upload assistant image
- Image upload handled using Multer + Cloudinary

### Conversation History
- Stores user commands in MongoDB
- Displays history in sidebar
- User-specific data persistence

### Command-Based Action Routing
Depending on the `type` returned by Gemini, the assistant can:

- Search on Google
- Search or play videos on YouTube
- Open calculator
- Open Instagram / Facebook
- Show weather
- Tell current date, time, month, or day
- Answer general knowledge questions

---

## 🛠 Tech Stack

### Frontend
- React.js
- Context API
- React Router
- Tailwind CSS
- Web Speech API
- Axios

### Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT
- bcrypt
- Cookies
- Multer
- Cloudinary
- Axios

### AI
- Google Gemini API
- Structured prompt engineering

---

## 🧠 How It Works

1. User speaks.
2. Web Speech API converts speech → text.
3. Text is sent to backend.
4. Backend sends a structured prompt to Gemini.
5. Gemini returns a JSON response like:

json
{
  "type": "google_search",
  "userInput": "best react projects",
  "response": "Here is what I found"
}

6. Backend extracts the JSON.
7. Action is routed based on type.
8. Frontend executes the action and speaks the response.

 ## 📁 Project Structure ##
 
Virtual-Assisant/
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── config/
│   ├── gemini.js
│   └── server.js
│
├── frontend/
│   ├── components/
│   ├── pages/
│   ├── context/
│   └── assets/
│
└── README.md

## 🔐 User Schema

name
email
password (hashed)
assistantName
assistantImage
history (array of commands)

## ⚙️ Local Setup
Clone the repository
git clone https://github.com/hixrathiee/Virtual-Assisant.git
cd Virtual-Assisant

## Backend
cd backend
npm install

 -- Create a .env file:
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
GEMINI_API_URL=your_gemini_api_url
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

Start server:
npm start

## Frontend
cd ../frontend
npm install
npm run dev

🔄 Supported Command Types
-general
-google_search
-youtube_search
-youtube_play
-get_time
-get_date
-get_day
-get_month
-calculator_open
-instagram_open
-facebook_open
-weather-show

## ✨ Implementation Notes
-Strict JSON enforcement in AI response
-Regex-based JSON extraction for safety
-Continuous speech recognition handling
-Speech synthesis lifecycle management
-Cloud-based image upload
-Context-based state management

## 📌 Future Improvements

-Weather API integration
-Persistent conversational memory
-Dark/Light theme options
-Custom domain deployment

## 👩‍💻 Author
Anjali Rathi
Full Stack Developer
