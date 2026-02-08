import {
  FollowModel,
  PostModel,
  ProfileModel,
  TipModel,
  LikeModel,
  CommentModel,
  TopicModel,
} from "../store/models";
import { ParsedEvent } from "./indexer-parser";

export const applyIndexedEvents = async (
  events: ParsedEvent[],
  eventIdPrefix: string
) => {
  if (events.length === 0) return;
  const debug = process.env.INDEXER_DEBUG === "true";

  const profileOps: any[] = [];
  const followUpserts: any[] = [];
  const followDeletes: any[] = [];
  const postOps: any[] = [];
  const tipOps: any[] = [];
  const likeOps: any[] = [];
  const commentOps: any[] = [];
  const topicOps: any[] = [];

  events.forEach((event, index) => {
    const eventId = `${eventIdPrefix}:${index}`;
    if (debug) {
      // eslint-disable-next-line no-console
      console.log("Indexer: apply event", eventId, event.type, event.data);
    }
    switch (event.type) {
      case "profile":
        profileOps.push({
          updateOne: {
            filter: { eventId },
            update: { ...event.data, eventId },
            upsert: true,
          },
        });
        break;
      case "follow":
        followUpserts.push({
          updateOne: {
            filter: {
              follower: event.data.follower,
              following: event.data.following,
            },
            update: { $set: { ...event.data, eventId } },
            upsert: true,
          },
        });
        break;
      case "unfollow":
        followDeletes.push({
          deleteOne: {
            filter: {
              follower: event.data.follower,
              following: event.data.following,
            },
          },
        });
        break;
      case "post":
        postOps.push({
          updateOne: {
            filter: { eventId },
            update: { ...event.data, eventId },
            upsert: true,
          },
        });
        break;
      case "tip":
        tipOps.push({
          updateOne: {
            filter: { eventId },
            update: { ...event.data, eventId },
            upsert: true,
          },
        });
        break;
      case "like": {
        const postKey = `${event.data.postAuthor}:${event.data.postId}`;
        likeOps.push({
          updateOne: {
            filter: { eventId },
            update: { ...event.data, postKey, eventId },
            upsert: true,
          },
        });
        break;
      }
      case "unlike": {
        const postKey = `${event.data.postAuthor}:${event.data.postId}`;
        likeOps.push({
          deleteOne: {
            filter: {
              liker: event.data.liker,
              postAuthor: event.data.postAuthor,
              postId: event.data.postId,
              postKey,
            },
          },
        });
        break;
      }
      case "comment": {
        const postKey = `${event.data.postAuthor}:${event.data.postId}`;
        commentOps.push({
          updateOne: {
            filter: { eventId },
            update: { ...event.data, postKey, eventId },
            upsert: true,
          },
        });
        break;
      }
      case "topic": {
        const postKey = `${event.data.author}:${event.data.postId}`;
        topicOps.push({
          updateOne: {
            filter: { eventId },
            update: { ...event.data, postKey, eventId },
            upsert: true,
          },
        });
        break;
      }
      default:
        break;
    }
  });

  if (profileOps.length) await ProfileModel.bulkWrite(profileOps, { ordered: false });
  if (followUpserts.length) {
    await FollowModel.bulkWrite(followUpserts, { ordered: true });
  }
  if (followDeletes.length) {
    await FollowModel.bulkWrite(followDeletes, { ordered: true });
  }
  if (postOps.length) await PostModel.bulkWrite(postOps, { ordered: false });
  if (tipOps.length) await TipModel.bulkWrite(tipOps, { ordered: false });
  if (likeOps.length) await LikeModel.bulkWrite(likeOps, { ordered: false });
  if (commentOps.length) await CommentModel.bulkWrite(commentOps, { ordered: false });
  if (topicOps.length) await TopicModel.bulkWrite(topicOps, { ordered: false });
};
