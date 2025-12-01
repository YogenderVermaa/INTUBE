import Router from "express";
import { upload } from "../middleware/multer.middleware.js";
import {
  registerUser,
  logoutUser,
  loginUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrenteUser,
  getUserChannelProfile,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getWatchHistory,
} from "../controller/user.controller.js";
import { verifyJWT } from "../middleware/user.middleware.js";

const router = Router();

// unsecured routes

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

router.route("/upload").post(upload.single("image"))

router.route("/login").post(loginUser);
router.route("/refreshToken").post(refreshAccessToken);

// secured routes

router.route("/logout").post(verifyJWT, logoutUser);
router.route("/changePassword").post(verifyJWT, changeCurrentPassword);
router.route("/current-user").get(verifyJWT, getCurrenteUser);
router.route("/c/:username").post(verifyJWT, getUserChannelProfile);
router.route("/update-account").patch(verifyJWT, updateAccountDetails);
router
  .route("/update-avatar")
  .patch(verifyJWT, upload.single("avatar"), updateUserAvatar);
router
  .route("/update-coverImage")
  .patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage);
router.route("/history").get(verifyJWT, getWatchHistory);

export default router;
