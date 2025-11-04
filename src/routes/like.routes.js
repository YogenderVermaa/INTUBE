import { Router } from "express";
import {
  getLikedVideos,
  toggleCommentLike,
  toggleVideoLike,
  toggleTweetLike,
} from "../controller/like.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.post("/videos/:videoId/like", toggleVideoLike);
router.post("/comments/:commentId/like", toggleCommentLike);
router.post("/tweets/:tweetId/like", toggleTweetLike);

router.get("/videos", getLikedVideos);

export default router;
