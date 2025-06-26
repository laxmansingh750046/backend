import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {Video} from "../models/video.model.js"
import {Tweet} from "../models/tweet.model.js"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    const existingLike = await Like.findOne({
        likeBy: req.user._id,
        video: videoId    
    });

    if (existingLike) {
        const result = await Like.deleteOne({
            likeBy: req.user._id,
            video: videoId    
        });

        if (result.deletedCount === 0) {
            throw new ApiError(500, "Unable to unlike the video");
        }

        return res.status(200).json(
            new ApiResponse(200, null, "Video unliked successfully")
        );
    } else {
        const newLike = await Like.create({
            likeBy: req.user._id,
            video: videoId    
        });

        if (!newLike) {
            throw new ApiError(500, "Unable to like the video");
        }

        return res.status(200).json(
            new ApiResponse(200, newLike, "Video liked successfully")
        );
    }
});


const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    const existingLike = await Like.findOne({
        likeBy: req.user._id,
        comment: commentId    
    });

    if (existingLike) {
        const result = await Like.deleteOne({
            likeBy: req.user._id,
            comment: commentId    
        });

        if (result.deletedCount === 0) {
            throw new ApiError(500, "Unable to unlike the comment");
        }

        return res.status(200).json(
            new ApiResponse(200, null, "Comment unliked successfully")
        );
    } else {
        const newLike = await Like.create({
            likeBy: req.user._id,
            comment: commentId    
        });

        if (!newLike) {
            throw new ApiError(500, "Unable to like the comment");
        }

        return res.status(200).json(
            new ApiResponse(200, newLike, "Comment liked successfully")
        );
    }
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    
     if (!mongoose.Types.ObjectId.isValid(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }

    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    const existingLike = await Like.findOne({
        likeBy: req.user._id,
        tweet: tweetId    
    });

    if (existingLike) {
        const result = await Like.deleteOne({
            likeBy: req.user._id,
            tweet: tweetId    
        });

        if (result.deletedCount === 0) {
            throw new ApiError(500, "Unable to unlike tweet");
        }

        return res.status(200).json(
            new ApiResponse(200, null, "Tweet unliked successfully")
        );
    } else {
        const newLike = await Like.create({
            likeBy: req.user._id,
            tweet: tweetId    
        });

        if (!newLike) {
            throw new ApiError(500, "Unable to like tweet");
        }

        return res.status(200).json(
            new ApiResponse(200, newLike, "Tweet liked successfully")
        );
    }
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    const likedVideos = await Like.aggregate([
        {
            $match: {
                likedBy: req.user._id
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $lookup: {
                from: 'Video',
                localField: 'video',
                foreignField: '_id',
                as: 'videoDetails'
            }
        },
        {
            $unwind: '$videoDetails'
        },
        {
            $project: {
                'video.videoFile': '$videoDetails.videoFile',
                'video.thumbnail': '$videoDetails.thumbnail',
                'video.owner': '$videoDetails.owner',
                'video.title': '$videoDetails.title',
            }
        }
    ]);
    
    return res.status(200)
        .json(
            new ApiResponse(200, likedVideos, "Liked vidos fetched successfully")
        )
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}