import mongoose from "mongoose";

const connectDB = async () => {
    
    try {
        console.log(process.env.MONGODB_URI)
        await mongoose.connect(process.env.MONGODB_URI)
        
        console.log(
            "MongoDB connected SuccessFully"
        )
    } catch (error) {
        console.log("MONGODB connection failed: ",error.message)
        process.exit(1)
    }
}


export {connectDB}