import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.model.js";
import { Video } from "../models/video.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../../../PROJECTMANAGEMENT/src/utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  if (!videoId || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid Video ID");
  }

  const videoComments = await Comment.find({ video: videoId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .select("content owner");

  if (!videoComments.length) {
    throw new ApiError(404, "No comments found for this video");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, videoComments, "All comments fetched successfully")
    );
});

const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { content } = req.body;

  if (!videoId || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid Video ID");
  }

  const isValidVideo = await Video.findById(videoId);
  if (!isValidVideo) {
    throw new ApiError(404, "Video not found");
  }

  const comment = await Comment.create({
    content,
    video: videoId,
    owner: req.user?._id,
  });

  if (!comment) {
    throw new ApiError(400, "Failed to create comment");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, comment, "Comment created successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;

  if (!commentId || !isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid Comment ID");
  }

  const commentExists = await Comment.findById(commentId);
  if (!commentExists) {
    throw new ApiError(404, "Comment not found");
  }

  if (commentExists.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "Unauthorized to update this comment");
  }

  commentExists.content = content || commentExists.content;
  await commentExists.save();

  return res
    .status(200)
    .json(new ApiResponse(200, commentExists, "Comment updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!commentId || !isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid Comment ID");
  }

  const commentExists = await Comment.findById(commentId);
  if (!commentExists) {
    throw new ApiError(404, "Comment not found");
  }

  if (commentExists.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "Unauthorized to delete this comment");
  }

  await commentExists.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, commentExists, "Comment deleted successfully"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
