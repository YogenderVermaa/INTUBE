import { Router } from "express";
import { verifyJwt } from "../middleware/auth.middleware.js";
import {
  getVideoComments,
  addComment,
  updateComment,
  deleteComment,
} from "../controller/comment.controller.js";

const router = Router();

router.use(verifyJwt);

router
  .route("/video/:videoId")
  .get(getVideoComments) // Get all comments on a video
  .post(addComment); // Add a new comment to a video

router
  .route("/:commentId")
  .patch(updateComment) // Update a comment
  .delete(deleteComment); // Delete a comment

export default router;
