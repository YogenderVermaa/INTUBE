import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../../../PROJECTMANAGEMENT/src/utils/asyncHandler.js";

const toggleLike = async (req, res, fieldName, fieldValue, entityName) => {
  if (!fieldValue || !isValidObjectId(fieldValue)) {
    throw new ApiError(400, `Invalid ${entityName} ID`);
  }

  const existing = await Like.findOneAndDelete({
    [fieldName]: fieldValue,
    likedBy: req.user?._id,
  });
  if (existing) {
    return res
      .status(200)
      .json(new ApiResponse(200, null, `Unliked ${entityName} successfully`));
  }

  const newLike = await Like.create({
    [fieldName]: fieldValue,
    likedBy: req.user?._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, newLike, `${entityName} liked successfully`));
};

const toggleVideoLike = asyncHandler(async (req, res) => {
  await toggleLike(req, res, "video", req.params.videoId, "video");
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  await toggleLike(req, res, "comment", req.params.commentId, "comment");
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  await toggleLike(req, res, "tweet", req.params.tweetId, "tweet");
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const likedVideos = await Like.find({
    likedBy: req.user?._id,
    video: { $exists: true },
  })
    .populate("video", "videoFile title description owner")
    .sort({ createdAt: -1 });

  if (!likedVideos || likedVideos.length === 0) {
    throw new ApiError(404, "No liked videos found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, likedVideos, "Liked videos fetched successfully")
    );
});

export { toggleVideoLike, toggleCommentLike, toggleTweetLike, getLikedVideos };
