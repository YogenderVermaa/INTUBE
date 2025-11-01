import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../../../PROJECTMANAGEMENT/src/utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if(!channelId || !isValidObjectId(channelId)){
    throw new ApiError(400,"Invalid channel ID")
  }

  if(channelId.toString() === req.user?._id.toString()){
    throw new ApiError(400,"You cannot subscribe to yourself")
  }


  const existingSub = await Subscription.findOne({
    subscriber:req.user?._id,
    channel:channelId,
  })

  if(existingSub){

    await Subscription.deleteOne({
      subscriber:req.user?._id,
      channel:channelId
    })

    return res.status(200).json(new ApiResponse(200,null,"Unsubscribed Successfully"))
  }

  const subscriber = await Subscription.create({
    subscriber :req.user?._id,
    channel: channelId
  })




  if(!subscriber){
    throw new ApiError(500,"Unable to subscribe,Try again")
  }

  return res.status(201).json(new ApiResponse(201,subscriber,"Subscribed Successfully"))
  
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if(!channelId || !isValidObjectId(channelId)){
    throw new ApiError(400,"Invalid Channel Id");
  };

  const userSubscribers = await Subscription.find({channel:channelId})
  .populate("subscriber","username email avatar")
  .sort({createdAt:-1})

  if(!userSubscribers){
    throw new ApiError(404,"Subscriber not found")
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      userSubscribers,
      "Subscribers fatched successfully"
    )
  )
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  if(!subscriberId || !isValidObjectId(subscriberId)){
  throw new ApiError(400,"Invalid subscriber Id");
  };

  const userSubscribedTo = await Subscription.find({subscriber:subscriberId})
.populate("channel","username email avatar")
.sort({createdAt:-1})
if(!userSubscribedTo || userSubscribedTo.length === 0){
  throw new ApiError(404,"subscribed channel not found")
}

return res.status(200).json(
  new ApiResponse(200,userSubscribedTo,"subscribed channel fatched successfully")
)

});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
