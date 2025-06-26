import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { response } from "express"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params;

    if(!req.user){
      throw new ApiError(403, "Login before subscribing")
    }
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    const channel = await User.findById(channelId);
    if(!channel){
        throw new ApiError(400, "This channel does not exist");;
    }
    const isSubscribed = await Subscription.findOne({
        subscriber: req.user?._id,
        channel: channel._id
    });

    if(isSubscribed){
        const unsubscribed = await Subscription.deleteOne({
            subscriber: req.user?._id,
            channel: channel._id
        });

        if(unsubscribed.deletedCount === 0){
            throw new ApiError(400, "Unable to unsubscribed");
        }

        return res
        .status(200)
        .json(new ApiResponse(200, null, "channel unsubscribe successfully"));
    }else{
        const subscribed = await Subscription.create({
            subscriber: req.user?._id,
            channel: channel._id
        });

        if(!subscribed){
            throw new ApiError(400, "unable to subscribed user");
        }
        return res
        .status(200)
        .json( new ApiResponse(200, subscribed, "subscribed successfully"))
    }
})

// controller to return subscriber list of a channel
const getRandomChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    // Check if the channelId is valid
    if(!isValidObjectId(channelId)){
        throw new ApiError(400, "invalid channel Id");
    }
    
    const channel = await User.findById(channelId);
    if(!channel){
        throw new ApiError(400, "channel does not exist");
    }
    // Aggregation pipeline to fetch subscribers and their usernames
    const channelSubscribers = await Subscription.aggregate([
        {
          $match: {
            channel: new mongoose.Types.ObjectId(channelId)
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "subscriber",
            foreignField: "_id",
            as: "subscriber_detail",  
          }
        },
        {
          $addFields: {
            subscriber_detail: {
              $arrayElemAt: ["$subscriber_detail", 0]
            }
          }
        },
        {
          $group: {
            _id: null,
            subscribers: {
              $push: "$subscriber_detail"
            }
          }
        },{
          $project: {
            _id: 0,
            subscribers:{
              $map: {
                input: "$subscribers",
                as: "user",
                in: "$$user.username"
              }
            }
          }
        }
      ]);


    return res
        .status(200)
        .json(new ApiResponse(200, channelSubscribers[0].subscribers, "Fetched all subscribers"));
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    if(!isValidObjectId(subscriberId)){
        throw new ApiError(400, "invalid channel Id");
    }
    const user = await User.findById(subscriberId);
    if(!user){
        throw new ApiError(400, "user does not exist");
    }

    const subscribedChannels = await Subscription.aggregate([
        {
          $match: {
            subscriber: new mongoose.Types.ObjectId(subscriberId)
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "channel",
            foreignField: "_id",
            as: "channel_details",
          }
        },
        {
          $addFields: {
            channel_details: {
              $arrayElemAt: ["$channel_details", 0]
            }
          }
        },
        {
          $group: {
            _id: null,
          subscribed_channels: {
              $push: "$channel_details.username"
            }
          }
        }
      ]);

      return res
      .status(200)
      .json( new ApiResponse(200,subscribedChannels[0].subscribed_channels," subscribed channels fetched succesfully" ));
})

export {
    toggleSubscription,
    getRandomChannelSubscribers,
    getSubscribedChannels
}