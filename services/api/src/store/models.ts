import mongoose, { Schema } from "mongoose";

const profileSchema = new Schema(
  {
    authority: { type: String, required: true, unique: true, index: true },
    username: { type: String, required: true, unique: true, index: true },
    displayName: { type: String, required: true },
    bioCid: { type: String, required: true },
    avatarCid: { type: String, required: true },
    eventId: { type: String },
  },
  { timestamps: true }
);
profileSchema.index({ eventId: 1 }, { unique: true, sparse: true });

const followSchema = new Schema(
  {
    follower: { type: String, required: true, index: true },
    following: { type: String, required: true, index: true },
    eventId: { type: String },
  },
  { timestamps: true }
);
followSchema.index({ follower: 1, following: 1 }, { unique: true });
followSchema.index({ eventId: 1 }, { unique: true, sparse: true });

const postSchema = new Schema(
  {
    author: { type: String, required: true, index: true },
    postId: { type: Number, required: true },
    contentCid: { type: String, required: true },
    visibility: { type: Number, required: true },
    eventId: { type: String },
  },
  { timestamps: true }
);
postSchema.index({ author: 1, postId: 1 }, { unique: true });
postSchema.index({ eventId: 1 }, { unique: true, sparse: true });

const tipSchema = new Schema(
  {
    from: { type: String, required: true, index: true },
    to: { type: String, required: true, index: true },
    tipId: { type: Number, required: true },
    amountLamports: { type: Number, required: true },
    eventId: { type: String },
  },
  { timestamps: true }
);
tipSchema.index({ from: 1, tipId: 1 }, { unique: true });
tipSchema.index({ eventId: 1 }, { unique: true, sparse: true });

const likeSchema = new Schema(
  {
    liker: { type: String, required: true, index: true },
    postAuthor: { type: String, required: true, index: true },
    postId: { type: Number, required: true },
    postKey: { type: String, required: true, index: true },
    eventId: { type: String },
  },
  { timestamps: true }
);
likeSchema.index({ liker: 1, postAuthor: 1, postId: 1 }, { unique: true });
likeSchema.index({ eventId: 1 }, { unique: true, sparse: true });

const commentSchema = new Schema(
  {
    author: { type: String, required: true, index: true },
    postAuthor: { type: String, required: true, index: true },
    postId: { type: Number, required: true },
    commentId: { type: Number, required: true },
    contentCid: { type: String, required: true },
    postKey: { type: String, required: true, index: true },
    eventId: { type: String },
  },
  { timestamps: true }
);
commentSchema.index(
  { author: 1, postAuthor: 1, postId: 1, commentId: 1 },
  { unique: true }
);
commentSchema.index({ eventId: 1 }, { unique: true, sparse: true });

const topicSchema = new Schema(
  {
    topic: { type: String, required: true, index: true },
    author: { type: String, required: true, index: true },
    postId: { type: Number, required: true },
    postKey: { type: String, required: true, index: true },
    eventId: { type: String },
  },
  { timestamps: true }
);
topicSchema.index({ topic: 1, author: 1, postId: 1 }, { unique: true });
topicSchema.index({ eventId: 1 }, { unique: true, sparse: true });

export const ProfileModel =
  mongoose.models.Profile || mongoose.model("Profile", profileSchema);
export const FollowModel =
  mongoose.models.Follow || mongoose.model("Follow", followSchema);
export const PostModel =
  mongoose.models.Post || mongoose.model("Post", postSchema);
export const TipModel =
  mongoose.models.Tip || mongoose.model("Tip", tipSchema);
export const LikeModel =
  mongoose.models.Like || mongoose.model("Like", likeSchema);
export const CommentModel =
  mongoose.models.Comment || mongoose.model("Comment", commentSchema);
export const TopicModel =
  mongoose.models.Topic || mongoose.model("Topic", topicSchema);
