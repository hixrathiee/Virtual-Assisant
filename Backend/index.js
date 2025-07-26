import express from "express"
import "dotenv/config"
import connectDb from "./config/db.js"
import authRouter from "./routes/auth.routes.js"
import cookieParser from "cookie-parser"
import cors from "cors"
import userRouter from "./routes/user.routes.js"
import geminiResponse from "./gemini.js"
const app = express()
const port = process.env.PORT || 5000
app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin:"https://virtual-assisant-frontend.onrender.com",
    credentials:true
}))
app.use("/api/auth",authRouter)
app.use("/api/user",userRouter)



app.listen(port,()=>{
    connectDb()
    console.log(`listening on port ${port}` );
    
})
