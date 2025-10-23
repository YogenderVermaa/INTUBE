import dotenv from "dotenv"
dotenv.config({
    path:"./.env"
})
import {app} from  "./app.js"
import { connectDB } from "./db/index.js"

const port = process.env.PORT || 3000
console.log(process.env.PORT)

connectDB()
.then(() => {
    app.listen(port,() => {
        console.log(`app is listining on port no : ${port}`)
    })
})
.catch((err) => {
    console.log("Something went Wront")
    process.exit(1)
})
