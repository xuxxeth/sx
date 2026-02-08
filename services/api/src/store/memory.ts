import { FollowEdge, PostIndex, Profile, TipRecord } from "../types";

const profilesByAuthority = new Map<string, Profile>();
const usernameToAuthority = new Map<string, string>();
const follows = new Map<string, FollowEdge>();
const posts = new Map<string, PostIndex>();
const tips = new Map<string, TipRecord>();

const followKey = (follower: string, following: string) =>
  `${follower}::${following}`;
const postKey = (author: string, postId: number) =>
  `${author}::${postId}`;
const tipKey = (from: string, tipId: number) => `${from}::${tipId}`;

export const memoryStore = {
  profilesByAuthority,
  usernameToAuthority,
  follows,
  posts,
  tips,
  followKey,
  postKey,
  tipKey,
};
