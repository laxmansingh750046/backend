import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    // Check if user is logged in
    const { content } = req.body;

    if (!content) {
        throw new ApiError(400, "Can't tweet without content");
    }

    const tweet = await Tweet.create({
        content,
        owner: req.user._id
    });

    if (!tweet) {
        throw new ApiError(500, "Something went wrong while creating tweet");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, tweet, "Tweet created successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const {userId} = req.params;
    
    if(!userId?.trim()){
        throw new ApiError(400, "missing userId");
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400, "Invalid user ID format");
    }

    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError(404, "User not found with given ID");
    }

    const tweets = await Tweet.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $project: {
                id: "$_id",
                content: 1,
                createdAt: 1,
                updatedAt: 1
            }
        },
        {
            $sort: {
                createdAt: -1         
            }
        }
    ])
    return res.status(200)
        .json(
            new ApiResponse(201, tweets, "User all tweets")
        );
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {tweetId} = req.params;
    const {content} = req.body;
    if(!content?.trim()){
        throw new ApiError(400, "Missing Content");
    }
    if(typeof content !== "string"){
        throw new ApiError(400, "invalid tweet content");
    }
    if(!tweetId?.trim()){
        throw new ApiError(400, "Missing tweetId");
    }

    if(!mongoose.Types.ObjectId.isValid(tweetId)){
        throw new ApiError(400, "Invalid tweetId format")
    }

    const tweet = await Tweet.findById(tweetId);
    if(!tweet){
        throw new ApiError(404, "No Tweet found with given tweet id");
    }
    
    if (tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to edit this tweet");
    }

    tweet.content = content;

    const updatedTweet = await tweet.save();

    if(!updatedTweet){
        throw new ApiError(500, "something went wrong while updating");
    }

    return res.status(201)
        .json(
            new ApiResponse(200, updatedTweet, "Tweet updated")
        )

});

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId} = req.params;
    if(!tweetId?.trim()){
        throw new ApiError(400, "Missing tweetId");
    }

    if(!mongoose.Types.ObjectId.isValid(tweetId)){
        throw new ApiError(400, "Invalid tweetId format")
    }

    const tweet = await Tweet.findById(tweetId);
    if(!tweet){
        throw new ApiError(404, "No Tweet found with given tweet id");
    }

    if(tweet.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403, "You are not authorized to delete this tweet");
    }
    
    const tweetDeleted = await Tweet.findByIdAndDelete(tweetId);

    if(!tweetDeleted){
        throw new ApiError(500, "Something went wrong while deleting tweet");
    }

    return res.status(201)
        .json(
            new ApiResponse(200, tweetDeleted, "Tweet deleted")
        )
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}