import { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../../../PROJECTMANAGEMENT/src/utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;

  if (!content || !content.trim()) {
    throw new ApiError(400, "content is required");
  }

  const tweet = await Tweet.create({
    content,
    owner: req.user?._id,
  });

  if (!tweet) {
    throw new ApiError(500, "Something went wrong while creating tweet");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, tweet, "Tweet created Successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId || !isValidObjectId(userId)) {
    throw new ApiError(400, "inValid user id");
  }
  const userTweets = await Tweet.find({ owner: userId })
    .sort({ createdAt: -1 })
    .populate("owner", "username email avatar");

  if (!userTweets || userTweets.length === 0) {
    throw new ApiError(404, "tweet not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, userTweets, "user tweet fetched Successfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const { tweetId } = req.params;

  if (!content || !content.trim()) {
    throw new ApiError(400, "content required");
  }

  if (!tweetId || !isValidObjectId(tweetId)) {
    throw new ApiError(404, "invalid Tweet Id");
  }

  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new ApiError(400, "invalid Tweet ID");
  }

  if (tweet.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "unauthorized ");
  }

  tweet.content = content;

  await tweet.save();

  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!tweetId || !isValidObjectId(tweetId)) {
    throw new ApiError(400, "invalid tweet Id");
  }

  const tweet = await Tweet.findById(tweetId);

  if (tweet.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "unauthorized");
  }

  await tweet.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "user tweet deleted Successfully"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
