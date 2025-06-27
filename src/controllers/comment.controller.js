import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {Video} from "../models/video.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400, "Invalid Video id format");
    }

    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(404, "Video not found with given ID");
    }

    // const comments = await Comment.find({video: videoId})
    //     .skip((page - 1) * limit)
    //     .limit(limit)
    //     .populate("owner", "username profilePicture")
    //     .sort({createdAt: -1})

    const comments = await Comment.aggregate([
        {
            $match: {
                vide : mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $skip: (page-1)*limit
        },
        {
            $limit: limit
        },
        {
            $lookup: {
                from: "Video",
                localField: "owner",
                foreignField: "_id",
                as: "ownerInfo"
            }
        },
        {
            $unwind: "$ownerInfo"
        },
        {
            $project: {
                content: 1,
                createdAt: 1,
                "owner._id": "$ownerInfo._id",
                "owner.username": "$ownerInfo.username",
                "owner.profilePicture": "$ownerInfo.profilePicture"
            }
        }
    ])
    
    return res.status(201)
        .json(
            new ApiResponse(201, comments, "Video comments fetched successfully")
        );
})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {videoId} = req.params
    
    const {content} = req.body;

    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400, "Invalid Video id format");
    }

    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(404, "Video not found with given ID");
    }

    const comment = await Comment.create({
        content,
        video: videoId,
        owner: req.user._id
    });

    if(!comment){
        throw new ApiError(500, "Something went wrong while creaing comment");
    }

    return res.status(201)
      .json(
        new ApiResponse(201, comment, "Comment added successfully")
      )
});

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "Invalid comment ID format");
    }

    if (!content?.trim()) {
        throw new ApiError(400, "Comment content cannot be empty");
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    if (comment.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not allowed to update this comment");
    }

    comment.content = content.trim();
    await comment.save();

    return res.status(200).json(
        new ApiResponse(200, comment, "Comment updated successfully")
    );
});

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "Invalid comment ID format");
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    if (comment.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not allowed to delete this comment");
    }

    await comment.deleteOne();

    return res.status(200).json(
        new ApiResponse(200, null, "Comment deleted successfully")
    );
});

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
}