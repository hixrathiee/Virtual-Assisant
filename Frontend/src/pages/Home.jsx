import React, { useContext, useEffect, useRef, useState } from 'react'
import { userDataContext } from '../context/userContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import aiImg from "../assets/ai.gif"
import userImg from "../assets/user.gif"
import { CgMenuRight } from "react-icons/cg";
import { RxCross2 } from "react-icons/rx";
function Home() {
  const { userData, serverUrl, setUserData, getGeminiResponse } = useContext(userDataContext)
  const navigate = useNavigate()
  const isRecognitionActiveRef = useRef(false)
  const recognitionRef = useRef(null)
  const [listening, setListening] = useState(false)
  const [userText, setUserText] = useState("")
  const [aiText, setAiText] = useState("")
  const isSpeakingRef = useRef(false)
  const isRecognizingRef = useRef(false)
  const synth = window.speechSynthesis
  const [ham,setHam] = useState(false)
  const handleLogOut = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/auth/logout`, { withCredentials: true })
      setUserData(null)
      navigate("/signin")
    } catch (error) {
      setUserData(null)
      console.log(error)
    }
  }
  const startRecognition = () =>{
     if(!isSpeakingRef.current && !isRecognitionActiveRef.current){
    try {
      recognitionRef.current?.start()
      console.log("recognition started ");
      
    } catch (error) {
      if(e.name !== "InvalidStateError"){
        console.log(error);
        
      }
    }
  }
  }

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text)
    const voices = window.speechSynthesis.getVoices()
    isSpeakingRef.current = true
    utterance.onend = () => {
      setAiText("")
      isSpeakingRef.current = false
      setTimeout(() =>{
        startRecognition()
      },800)
    }
    synth.cancel()
    synth.speak(utterance)
  }

  const handleCommand = (data) => {
    const { type, userInput, response } = data
    speak(response)

    if (type === 'google_search') {
      const query = encodeURIComponent(userInput)
      window.open(`https://www.google.com/search?q=${query}`, '_blank');
    }
    if (type === 'calculator_open') {
      window.open(`https://www.google.com/search?q=calculator`, '_blank');
    }
    if (type === 'instagram_open') {
      window.open(`https://www.instagram.com/`, '_blank');
    }
    if (type === 'facebook_open') {
      window.open(`https://www.facebook.com/`, '_blank');
    }
    if (type === 'weather-show') {
      window.open(`https://www.google.com/search?q=weather`, '_blank');
    }
    if (type === 'youtube_search' || type === 'youtube_play') {
      const query = encodeURIComponent(userInput)
      window.open(`https://www.youtube.com/results?search_query=${query}`, '_blank');
    }

  }

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition


    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.lang = "en-US"
    recognition.interimResults = false

    recognitionRef.current = recognition

    let isMounted = true;

    const startTimeout = setTimeout(()=>{
  if(isMounted && !isSpeakingRef.current && !isRecognitionActiveRef.current){
    try {
      recognition.start()
      console.log("recognition started ");
      
    } catch (error) {
      if(Error.name !== "InvalidStateError"){
        console.log(error);
        
      }
    }
  }
},1000)

    recognition.onstart = () => {
      setListening(true)
      isRecognitionActiveRef.current = true
    }

    recognition.onend = () => {
      setListening(false)
      isRecognitionActiveRef.current = false
      if (!isSpeakingRef.current) {
        setTimeout(() => {
        
             if(isMounted && !isSpeakingRef.current){
    try {
      recognition.start()
      console.log("recognition started ");
      
    } catch (error) {
      if(error.name !== "InvalidStateError"){
        console.log(error);
        
      }
    }
  }

        }, 1000)
      }
     
    }

    recognition.onerror = (event) => {
      console.warn("Recognition error:", event.error)
      isRecognitionActiveRef.current = false
      setListening(false)
      if(event.error !== "aborted" && isMounted && !isSpeakingRef.current){
        setTimeout(()=>{
          if(isMounted)

    try {
      recognition.start()
      console.log("recognition started ");
      
    } catch (error) {
      if(error.name !== "InvalidStateError"){
        console.log(error);
        
      }
    }
  },1000)
   }
    }

    recognition.onresult = async (e) => {
      const transcript = e.results[e.results.length - 1][0].transcript.trim()
      console.log("Heard:", transcript)
      

      if (transcript.toLowerCase().includes(userData?.assistantName?.toLowerCase())) {
        setAiText("")
        setUserText(transcript)
        recognition.stop()
        const data = await getGeminiResponse(transcript)
        console.log(data)
        handleCommand(data)
        setAiText(data.response)
        setUserText("")
      }
    }

    recognition.start()

   
      const greeting = new SpeechSynthesisUtterance(`Hello ${userData.name}, what can i help you with? `);
      // greeting.lang = 'en-US'
      
      window.speechSynthesis.speak(greeting)


    return () => {
      isMounted = false
      window.speechSynthesis.cancel();
      recognition.stop()
      setListening(false)
      isRecognitionActiveRef.current = false
    }
  }, [])


  // const stopListening = () => {
  //   if (recognitionRef.current) {
  //     recognitionRef.current.stop()
  //     setListening(false)
  //   }
  // }

  return (
    <div className='w-full h-[100vh] bg-gradient-to-t from-black to-[#02023d] flex justify-center items-center flex-col gap-[15px] overflow-hidden'>
      <CgMenuRight className='absolute lg:hidden text-white top-[20px] right-[20px] w-[25px] h-[25px]' onClick={()=>setHam(true)} />
      <div className={`absolute lg:hidden top-0 w-full h-full bg-[#0000003a] backdrop-blur-lg p-[20px] flex flex-col gap-[20px] items-start ${ham?"translate-x-0":"translate-x-full"} transition-transform`}>
         <RxCross2 className='absolute  text-white top-[20px] right-[20px] w-[25px] h-[25px]' onClick={()=>setHam(false)} />
         <button className='min-w-[150px] h-[60px]  bg-white top-[20px] right-[20px]  rounded-full text-black font-semibold text-[19px] cursor-pointer'
        onClick={handleLogOut} >Log Out</button>
      <button className='min-w-[150px] h-[60px]  bg-white  top-[100px] right-[20px] rounded-full text-black font-semibold text-[19px] px-[20px] py-[10px] cursor-pointer'
        onClick={() => navigate("/customize")}>
        Customize your Assistant</button>
        <div className='w-full h-[2px] bg-gray-400'></div>
        
        <h1 className='text-white font-semibold text-[19px]'>History</h1>
        <div className='w-full h-[400px] text-white overflow-y-auto flex flex-col gap-[20px]'>
          {userData.history?.map((his)=>(
            <span className='text-gray-200 text-[18px] '>{his}</span>
          ))}
        </div>
        </div>
     
      <button
        className='min-w-[150px] h-[60px] mt-[30px] bg-white absolute top-[20px] right-[20px] hidden lg:block rounded-full text-black font-semibold text-[19px] cursor-pointer'
        onClick={handleLogOut}
      >
        Log Out
      </button>

      <button
        className='min-w-[150px] h-[60px] mt-[30px] bg-white absolute hidden lg:block  top-[100px] right-[20px] rounded-full text-black font-semibold text-[19px] px-[20px] py-[10px] cursor-pointer'
        onClick={() => navigate("/customize")}
      >
        Customize your Assistant
      </button>



      <div className='w-[300px] h-[400px] flex justify-center items-center overflow-hidden rounded-4xl shadow-lg'>
        <img src={userData?.assistantImage} className='h-full object-cover' />
      </div>

      <h1 className='text-white text-[18px] font-semibold'>I'm {userData?.assistantName}</h1>

      {!aiText && <img src={userImg} className='w-[200px]' />}
      {aiText && <img src={aiImg} className='w-[200px]' />}
      <h1 className='text-white text-[18px] font-semibold text-wrap'>{userText ? userText : aiText ? aiText : null}</h1>
    </div>
  )
}

export default Home
