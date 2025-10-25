import Router from "express";
import {upload} from "../middleware/multer.middleware.js"
import { registerUser } from "../controller/auth.controller.js";



const router = Router()


router.route('/register').post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
)

export default router