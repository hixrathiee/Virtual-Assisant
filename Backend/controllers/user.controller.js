import uploadOnCloudinary from "../config/cloudinary.js"
import geminiResponse from "../gemini.js"
import User from "../models/user.model.js"

export const getCurrentUser = async (req, res) => {
    try {
        const userId = req.userId
        const user = await User.findById(userId).select("-password")
        if (!user) {
            return res.status(400).json({ message: "User not found" })
        }
        return res.status(200).json(user)
    } catch (error) {
        return res.status(400).json({ message: "get current user error" })
    }
}

export const updateAssistant = async (req, res) => {
    try {
        const { assistantName, imageUrl } = req.body
        let assistantImage;
        if (req.file) {
            assistantImage = await uploadOnCloudinary(req.file.path)
        }
        else {
            assistantImage = imageUrl
        }
        const user = await User.findByIdAndUpdate(req.userId, {
            assistantName, assistantImage
        }, { new: true }).select("-password")
        return res.status(200).json(user)
    } catch (error) {
        return res.status(400).json({ message: "update assistant error" })
    }
}

export const askToAssistant = async (req, res) => {
    try {
        const { command } = req.body

        if (!command) {
            return res.status(400).json({ response: "Command is required." })
        }

        const user = await User.findById(req.userId)
        if (!user) {
            return res.status(404).json({ response: "User not found." })
        }

        user.history.push(command)
        await user.save()

        const userName = user.name
        const assistantName = user.assistantName
        const result = await geminiResponse(command, assistantName, userName)

        // FIX - If Gemini failed
        if (!result) {
            return res.json({
                type: "general",
                userInput: command,
                response: "Sorry, I didn't understand that."
            })
        }

        const { type, userInput, response } = result

        // FIX -  Handle Date/Time in IST (not UTC)
        const currentDate = new Date().toLocaleDateString("en-IN", {
            timeZone: "Asia/Kolkata"
        })

        const currentTime = new Date().toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        })

        const currentDay = new Date().toLocaleDateString("en-IN", {
            timeZone: "Asia/Kolkata",
            weekday: "long"
        })

        const currentMonth = new Date().toLocaleDateString("en-IN", {
            timeZone: "Asia/Kolkata",
            month: "long"
        })

        switch (type) {
            case "get_date":
                return res.json({
                    type,
                    userInput,
                    response: `Current date is ${currentDate}`
                })

            case "get_time":
                return res.json({
                    type,
                    userInput,
                    response: `Current time is ${currentTime}`
                })

            case "get_day":
                return res.json({
                    type,
                    userInput,
                    response: `Today is ${currentDay}`
                })

            case "get_month":
                return res.json({
                    type,
                    userInput,
                    response: `Current month is ${currentMonth}`
                })

            case "google_search":
            case "youtube_search":
            case "youtube_play":
            case "general":
            case "calculator_open":
            case "instagram_open":
            case "facebook_open":
            case "weather-show":
                return res.json({
                    type,
                    userInput,
                    response
                })
            default:
                return res.status(400).json({
                    response: "I didn't understand that command."
                })
        }

    } catch (error) {
        console.log("Ask Assistant Error:", error)
        return res.status(500).json({
            response: "Something went wrong."
        })
    }
}
