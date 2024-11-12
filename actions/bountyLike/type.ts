export interface LikeDislikeParams {
  bountyId: string;
  like: boolean; // true for like, false for dislike
}

export interface GetLikeStatusParams {
  bountyId: string;
}