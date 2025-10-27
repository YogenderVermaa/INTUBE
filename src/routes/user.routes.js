import Router from "express";
import { upload } from "../middleware/multer.middleware.js";
import { registerUser, logoutUser } from "../controller/auth.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

// secured routes

router.route("/logout").post(verifyJWT, logoutUser);

export default router;
