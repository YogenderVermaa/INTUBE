import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../../../PROJECTMANAGEMENT/src/utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name?.trim() || !description?.trim()) {
    throw new ApiError(400, "Name and Description are required");
  }

  const playListExist = await Playlist.findOne({
    name,
    owner: req.user?._id,
  });

  if (playListExist) {
    throw new ApiError(400, "Playlist with same name already exists, change the name");
  }

  const newPlaylist = await Playlist.create({
    name,
    description,
    owner: req.user?._id,
  });

  if (!newPlaylist) {
    throw new ApiError(400, "Unable to create Playlist");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, newPlaylist, "Playlist created successfully"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId || !isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  const userPlaylists = await Playlist.find({ owner: userId })
    .sort({ createdAt: -1 })
    .select("name description videos");

  if (!userPlaylists.length) {
    throw new ApiError(404, "No playlists found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, userPlaylists, "Playlists fetched successfully"));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!playlistId || !isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist ID");
  }

  const playlist = await Playlist.findById(playlistId).select("name description videos");

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist fetched successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (![playlistId, videoId].every(id => isValidObjectId(id))) {
    throw new ApiError(400, "Invalid playlist or video ID");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  if (playlist.videos.includes(videoId)) {
    throw new ApiError(400, "Video already in playlist");
  }

  playlist.videos.push(videoId);
  await playlist.save();

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Video added to playlist successfully"));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (![playlistId, videoId].every(id => isValidObjectId(id))) {
    throw new ApiError(400, "Invalid playlist or video ID");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  playlist.videos = playlist.videos.filter(
    (vId) => vId.toString() !== videoId.toString()
  );
  await playlist.save();

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Video removed from playlist successfully"));
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!playlistId || !isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist ID");
  }

  const playlist = await Playlist.findByIdAndDelete(playlistId);

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Playlist deleted successfully"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;

  if (!playlistId || !isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist ID");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  if (playlist.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "Unauthorized");
  }

  playlist.name = name || playlist.name;
  playlist.description = description || playlist.description;

  await playlist.save();

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist updated successfully"));
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
