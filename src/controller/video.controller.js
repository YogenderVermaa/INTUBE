import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../../../PROJECTMANAGEMENT/src/utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    query,
    sortBy = "createdAt",
    sortType = "desc",
    userId,
  } = req.query;
  const skip = (page - 1) * limit;

  const filter = {};

  if (query) {
    filter.title = { $regex: query, $options: "i" };
  }

  if (userId && isValidObjectId(userId)) {
    filter.owner = userId;
  }

  const sortOptions = { [sortBy]: sortType === "asc" ? 1 : -1 };

  const videos = await Video.find(filter)
    .sort(sortOptions)
    .skip(skip)
    .limit(parseInt(limit))
    .populate("owner", "username email");

  const totalVideos = await Video.countDocuments(filter);

  return res.status(200).json(
    new ApiResponse(200, {
      total: totalVideos,
      page: parseInt(page),
      limit: parseInt(limit),
      videos,
    })
  );
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    throw new ApiError(400, "Title and description are required");
  }

  const videoUpload = await uploadOnCloudinary(req.files.videoFile[0]?.path);
  const thumbnailUpload = await uploadOnCloudinary(
    req.files.thumbnailUpload[0]?.path
  );

  if (!videoUpload || !!thumbnailUpload) {
    throw new ApiError(500, "Something Went Wrong While Uploading The Video");
  }

  const video = await Video.create({
    title,
    description,
    videoFile: videoUpload?.url,
    thumbnail: thumbnailUpload?.url,
    duration: videoUpload.duration || "0.00",
    owner: req.user?._id,
  });
  if (!video) {
    throw new ApiError(500, "something went Wrong while uploading the video");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, video, "Video published succesfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) throw new ApiError(400, "invalid video ID");

  const video = await Video.findById(videoId).populate(
    "owner",
    "username email"
  );
  if (!video) throw new ApiError(404, "video not found");

  return res
    .status(200)
    .json(new ApiResponse(200, video, "video found successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;
  if (!isValidObjectId(videoId)) throw new ApiError(400, "invalid video ID");

  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(404, "video not found");

  if (video.owner.toString() !== req.user?._id.toString())
    throw new ApiError(403, "unauthorized ");

  if (title) video.title = title;
  if (description) video.description = description;

  await video.save();

  return res
    .status(200)
    .json(new ApiResponse(200, video, "video updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video ID");

  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(404, "vidoe not found");

  if (video.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "unauthorized");
  }

  await video.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Video Deleted Successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video ID");

  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(404, "Video not found");

  if (video.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "unauthorized");
  }

  video.isPublished = !video.isPublished;

  await video.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        video,
        `Video is now ${video.isPublished ? "published" : "unPublished"}`
      )
    );
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
