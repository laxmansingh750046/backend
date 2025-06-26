import mongoose, {Schema} from "mongoose";

//id comment createAt video UpdateAt likeby tweet

const likeSchema = new Schema(
    {
        comment: {
            type: Schema.Types.ObjectId,
            ref: "Comment"
        },
        video: {
            type: Schema.Types.ObjectId,
            ref: "Video"
        },
        likeBy: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        tweet: {
            type: Schema.Types.ObjectId,
            ref: "Tweet"
        }
    },
    {
        timestamps: true
    }
);

likeSchema.index({ likeBy: 1, tweet: 1 }, { unique: true });
likeSchema.index({ likeBy: 1, video: 1 }, { unique: true });
likeSchema.index({ likeBy: 1, comment: 1 }, { unique: true });

export const Like = mongoose.model("Like", likeSchema)