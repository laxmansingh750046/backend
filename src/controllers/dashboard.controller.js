import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Tweet} from "../models/tweet.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

    // Video Stats
// totalVideos
// totalVideoLikes
// totalVideoViews
// totalVideoComments
// const videoStats = await Video.aggregate([
//     {
//         $match: {
//             owner: req.user._id
//         }
//     },
//     {
//         $lookup: {
//             from :'Like',
//             localField: '_id',
//             foreignField: 'video',
//             as: 'likesDetails',
//             pipeline: [
//                 {
//                     $group: {
//                         _id: null,
//                         totalVideoLikes: {
//                             $sum: 1
//                         }
//                     }
//                 }
//             ]
//         }
//     },
//     {
//         $unwind: "$likesDetails"
//     },
//     {
//         $lookup: {
//             from :'Comment',
//             localField: '_id',
//             foreignField: 'video',
//             as: 'commentDetails',
//             pipeline: [
//                 {
//                     $group: {
//                         _id: null,
//                         totalVideoComments: {
//                             $sum: 1
//                         }
//                     }
//                 }
//             ]
//         }
//     },
//     {
//         $unwind: "$commentDetails"
//     },
//     {
//         $group: {
//             _id: null,
//             totalVideo: {
//                 $sum: 1
//             },
//             totalVideoLikes: {
//                 $sum: "$likesDetails.totalVideoLikes"
//             },
//             totalVideoComments: {
//                 $sum: "$commentDetails.totalVideoComments"
//             }
//         }
//     }
// ])

const videoStats = await Video.aggregate([
    {
        $match: {
            owner: req.user._id
        }
    },
    {
        $lookup: {
            from: 'likes',
            localField: '_id',
            foreignField: 'video',
            as: 'likesDetails'
        }
    },
    {
        $lookup: {
            from: 'comments',
            localField: '_id',
            foreignField: 'video',
            as: 'commentDetails'
        }
    },
    {
        $group: {
            _id: null,
            totalVideos: { $sum: 1 },
            totalVideoLikes: { $sum: { $size: "$likesDetails" } },
            totalVideoComments: { $sum: { $size: "$commentDetails" } },
            totalVideoViews: {$sum: "$views"}
        }
    }
]);


// Tweet Stats
// totalTweets
// totalTweetLikes
// totalTweetComments
const tweetStats = await Tweet.aggregate([
    {
        $match: {
            owner: req.user._id
        }
    },
    {
        $lookup: {
            from: 'likes',
            localField: '_id',
            foreignField: 'tweet',
            as: 'likesDetails'
        }
    },
    {
        $group: {
            _id: null,
            totalTweets: { $sum: 1 },
            totalTweetsLikes: { $sum: { $size: "$likesDetails" } },
        }
    }
]);

 return res.status(200)
    .json(
        new ApiResponse(200,  {
        videoStats: {
            totalVideos: videoStats[0]?.totalVideos || 0,
            totalVideoLikes: videoStats[0]?.totalVideoLikes || 0,
            totalVideoComments: videoStats[0]?.totalVideoComments || 0,
            totalVideoViews: videoStats[0]?.totalVideoViews || 0,
        },
        tweetStats: {
            totalTweets: tweetStats[0]?.totalTweets || 0,
            totalTweetLikes: tweetStats[0]?.totalTweetsLikes || 0,
        }
  }, "Channel stats fetched successfully")
    );
})

const getChannelVideos = asyncHandler(async (req, res) => {
    const videos = await Video.aggregate([
        {
            $match: {
                owner: req.user._id
            }
        },
        {
            $project: {
                _id: 1,
                videoFile: 1,
                thumbnail: 1,
                title: 1,
                duration: 1,
                views: 1,
                createdAt: 1,
                updatedAt: 1
            }
        },
        {
            $sort: {
                createdAt: -1 
            }
        }
    ]);
    return res.status(200)
        .json(
            new ApiResponse(200, videos, "All videos of channels fetched successfully")
        );
})

export {
    getChannelStats, 
    getChannelVideos
    }