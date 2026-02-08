export type Profile = {
  authority: string;
  username: string;
  displayName: string;
  bioCid: string;
  avatarCid: string;
  createdAt: number;
  updatedAt: number;
};

export type FollowEdge = {
  follower: string;
  following: string;
  createdAt: number;
};

export type PostIndex = {
  author: string;
  postId: number;
  contentCid: string;
  visibility: number;
  createdAt: number;
};

export type TipRecord = {
  from: string;
  to: string;
  tipId: number;
  amountLamports: number;
  createdAt: number;
};
