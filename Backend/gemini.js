import axios from "axios"
const geminiResponse = async (command, assistantName, userName) => {
    try {
        const apiUrl = process.env.GEMINI_API_URL
        const prompt = `You are a virtual assistant ${assistantName} created by ${userName}.
    You are not Google. You will behave like a voice-enabled assistant.
    
    Your task is to understand the user's natural language input and respond with a JSON object like this:
    
  {
  "type": "general" | "google_search" | "youtube_search" | "youtube_play" | "get_time" | "get_date" | "get_day" | "get_month" | "calculator_open" | "instagram_open" | "facebook_open" | "weather-show",
  "userInput": "<original user input without assistant name>",
  "response": "<short voice-friendly reply>"
}
    Instructions:
    -"type" : determine the internet of the user.
    -"userinput" : original sentence the user spoke.
    -"response" : A short voice-friendly reply, e.g., "Sure, playing it now", "Here what I found", "Today is Tuesday", etc.
    
    Type meannings:
    - "general" : if it's a factual or informational question. and if someone asks you a question and if you know the answer of that question, then you can answer it
    - "google_search" : if user wants to search something on Google.
    - "youtube_search" : if user wants to search something on YouTube.
    - "youtube_play" : if user wants to directly paly a video or song.
    - "get_time" : if user asks for current time.
    - "get_date" : if user asks for today's date.
    - "get_day" : if user asks what day it is.
    - "get_month" : if user asks for the current month
    - "calculator_open" : if user wants to open a calculator.
    - "instagram_open" : if user wants to open a instagram.
    - "facebook_open" :  if user wants to open a facebook.
    - "weather-show" : if user wants to know a weather.

    Important:
    - If asked who created you → say ${userName}
    - Do NOT return anything except JSON.
    - No markdown.
    - No explanation.
    - No backticks.
 

    now your userInput - ${command}
    `;

        const result = await axios.post(apiUrl, {
            "contents": [{
                "parts": [{
                    "text": prompt
                }]
            }]
        })

        const rawText = result.data.candidates[0].content.parts[0].text

           if (!rawText) {
            console.log("Empty Gemini response")
            return null
        }

        //  FIX: Clean Gemini response
        const cleaned = rawText.replace(/```json|```/g, "").trim()

       try {
            const parsed = JSON.parse(cleaned)
            return parsed
        } catch (parseError) {
            console.log("JSON Parse Error:", cleaned)
            return null
        }

    } catch (error) {
        console.log("Gemini Error:", error.response?.data || error.message)
        return null  

    }
}

export default geminiResponse