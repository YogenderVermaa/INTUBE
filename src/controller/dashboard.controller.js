import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../../../PROJECTMANAGEMENT/src/utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  const channelId = req.user?._id; // Assuming user (creator) is authenticated

  if (!channelId) {
    throw new ApiError(401, "Unauthorized: Channel not found");
  }

  const videos = await Video.find({ owner: channelId });

  const totalVideos = videos.length;
  const totalViews = videos.reduce((acc, v) => acc + (v.views || 0), 0);

  const totalLikes = await Like.countDocuments({
    video: { $in: videos.map((v) => v._id) },
  });

  const totalSubscribers = await Subscription.countDocuments({
    channel: channelId,
  });

  const stats = {
    totalVideos,
    totalViews,
    totalLikes,
    totalSubscribers,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, stats, "Channel stats fetched successfully"));
});

const getChannelVideos = asyncHandler(async (req, res) => {
  const channelId = req.params.channelId;

  if (!mongoose.isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel ID");
  }

  const videos = await Video.find({ owner: channelId })
    .sort({ createdAt: -1 })
    .select("title description views thumbnail createdAt");

  if (!videos || videos.length === 0) {
    throw new ApiError(404, "No videos found for this channel");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Channel videos fetched successfully"));
});

export { getChannelStats, getChannelVideos };
