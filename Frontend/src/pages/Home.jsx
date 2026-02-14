import React, { useContext, useEffect, useRef, useState } from 'react'
import { userDataContext } from '../context/UserContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import aiImg from "../assets/ai.gif"
import userImg from "../assets/user.gif"
import { CgMenuRight } from "react-icons/cg";
import { RxCross2 } from "react-icons/rx";

function Home() {

  const { userData, serverUrl, setUserData, getGeminiResponse } = useContext(userDataContext)
  const navigate = useNavigate()

  const recognitionRef = useRef(null)
  const isRecognitionActiveRef = useRef(false)
  const isSpeakingRef = useRef(false)
  const lastRequestTimeRef = useRef(0)

  const [listening, setListening] = useState(false)
  const [userText, setUserText] = useState("")
  const [aiText, setAiText] = useState("")
  const [ham, setHam] = useState(false)

  const synth = window.speechSynthesis

  // ---------------- LOGOUT ----------------
  const handleLogOut = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/logout`, { withCredentials: true })
      setUserData(null)
      navigate("/signin")
    } catch (error) {
      setUserData(null)
      console.log(error)
    }
  }

  // ---------------- START RECOGNITION ----------------
  const startRecognition = () => {
    if (!isSpeakingRef.current && !isRecognitionActiveRef.current) {
      try {
        recognitionRef.current?.start()
      } catch (error) {
        if (error.name !== "InvalidStateError") {
          console.log(error)
        }
      }
    }
  }

  // ---------------- SPEAK ----------------
  const speak = (text) => {
    if (!text) return
    const utterance = new SpeechSynthesisUtterance(text)
    isSpeakingRef.current = true

    utterance.onend = () => {
      isSpeakingRef.current = false
      setAiText("")
      setTimeout(() => startRecognition(), 700)
    }

    synth.cancel()
    synth.speak(utterance)
  }

  // ---------------- HANDLE COMMAND ----------------
  const handleCommand = (data) => {
    if (!data || !data.type) {
      speak("Sorry, something went wrong.")
      return
    }

    const { type, userInput, response } = data

    switch (type) {

      case "get_time": {
        const currentTime = new Date().toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true
        })
        speak(`Current time is ${currentTime}`)
        break
      }

      case "get_date": {
        const currentDate = new Date().toLocaleDateString("en-IN", {
          timeZone: "Asia/Kolkata"
        })
        speak(`Today's date is ${currentDate}`)
        break
      }

      case "weather-show":
        speak("Showing weather.")
        window.open(`https://www.google.com/search?q=weather+today`, "_blank")
        break

      case "youtube_search":
      case "youtube_play":
        speak("Opening YouTube.")
        window.open(`https://www.youtube.com`, "_blank")
        break

      case "google_search":
        speak(response)
        window.open(`https://www.google.com/search?q=${encodeURIComponent(userInput)}`, "_blank")
        break

      case "calculator_open":
        speak("Opening calculator.")
        window.open(`https://www.google.com/search?q=calculator`, "_blank")
        break

      case "instagram_open":
        speak("Opening Instagram.")
        window.open(`https://www.instagram.com/`, "_blank")
        break

      case "facebook_open":
        speak("Opening Facebook.")
        window.open(`https://www.facebook.com/`, "_blank")
        break

      default:
        speak(response)
        break
    }
  }

  // ---------------- SPEECH RECOGNITION ----------------
  useEffect(() => {

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.lang = "en-US"
    recognition.interimResults = false

    recognitionRef.current = recognition

    recognition.onstart = () => {
      setListening(true)
      isRecognitionActiveRef.current = true
    }

    recognition.onend = () => {
      setListening(false)
      isRecognitionActiveRef.current = false
      if (!isSpeakingRef.current) {
        setTimeout(() => startRecognition(), 1000)
      }
    }

    recognition.onerror = () => {
      setListening(false)
      isRecognitionActiveRef.current = false
      if (!isSpeakingRef.current) {
        setTimeout(() => startRecognition(), 1000)
      }
    }

    recognition.onresult = async (e) => {
      const transcript = e.results[e.results.length - 1][0].transcript.trim()
      console.log("Heard:", transcript)

      if (!transcript.toLowerCase().includes(userData?.assistantName?.toLowerCase())) {
        return
      }

      recognition.stop()
      setUserText(transcript)
      setAiText("")

      const lower = transcript.toLowerCase()

      // -------- LOCAL COMMANDS --------

      if (lower.includes("time")) {
        handleCommand({ type: "get_time" })
        return
      }

      if (lower.includes("date")) {
        handleCommand({ type: "get_date" })
        return
      }

      if (lower.includes("weather")) {
        handleCommand({ type: "weather-show" })
        return
      }

      if (lower.includes("youtube")) {
        handleCommand({ type: "youtube_search" })
        return
      }

      if (lower.includes("calculator")) {
        handleCommand({ type: "calculator_open" })
        return
      }

      if (lower.includes("instagram")) {
        handleCommand({ type: "instagram_open" })
        return
      }

      if (lower.includes("facebook")) {
        handleCommand({ type: "facebook_open" })
        return
      }

      // -------- COOLDOWN --------

      const now = Date.now()
      if (now - lastRequestTimeRef.current < 4000) return
      lastRequestTimeRef.current = now

      // -------- GEMINI --------

      const data = await getGeminiResponse(transcript)

      if (!data) {
        speak("Sorry, I couldn't understand that.")
        return
      }

      handleCommand(data)
    }

    recognition.start()

    if (userData?.name) {
      speak(`Hello ${userData.name}, how can I help you today?`)
    }

    return () => {
      synth.cancel()
      recognition.stop()
    }

  }, [])

  return (
    <div className='w-full h-[100vh] bg-gradient-to-t from-black to-[#02023d] flex justify-center items-center flex-col gap-[15px] overflow-hidden'>

      {/* Desktop Buttons */}
      <button
        className='hidden lg:block absolute top-[20px] right-[20px] bg-white px-6 py-3 rounded-full font-semibold'
        onClick={handleLogOut}
      >
        Log Out
      </button>

      <button
        className='hidden lg:block absolute top-[90px] right-[20px] bg-white px-6 py-3 rounded-full font-semibold'
        onClick={() => navigate("/customize")}
      >
        Customize Assistant
      </button>

      {/* Mobile Hamburger */}
      <CgMenuRight
        className='absolute lg:hidden text-white top-[20px] right-[20px] w-[25px] h-[25px]'
        onClick={() => setHam(true)}
      />

      <div className={`absolute lg:hidden top-0 w-full h-full bg-[#0000003a] backdrop-blur-lg p-[20px] flex flex-col gap-[20px] items-start ${ham ? "translate-x-0" : "translate-x-full"} transition-transform`}>
        <RxCross2
          className='absolute text-white top-[20px] right-[20px] w-[25px] h-[25px]'
          onClick={() => setHam(false)}
        />

        <button
          className='min-w-[150px] h-[60px] bg-white rounded-full font-semibold'
          onClick={handleLogOut}
        >
          Log Out
        </button>

        <button
          className='min-w-[150px] h-[60px] bg-white rounded-full font-semibold'
          onClick={() => navigate("/customize")}
        >
          Customize Assistant
        </button>
      </div>

      <div className='w-[300px] h-[400px] flex justify-center items-center overflow-hidden rounded-4xl shadow-lg'>
        <img src={userData?.assistantImage} className='h-full object-cover' />
      </div>

      <h1 className='text-white text-[18px] font-semibold'>
        I'm {userData?.assistantName}
      </h1>

      {!aiText && <img src={userImg} className='w-[200px]' />}
      {aiText && <img src={aiImg} className='w-[200px]' />}

      <h1 className='text-white text-[18px] font-semibold text-wrap'>
        {userText || aiText || null}
      </h1>

    </div>
  )
}

export default Home
