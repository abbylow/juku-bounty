export interface IGetFollowParams {
  followerId: string; 
  followeeId: string;
}

export interface Follow {
  id: number;                   // Primary key (SERIAL)
  follower_id: string;           // UUID referencing Profile(id) of the follower
  followee_id: string;           // UUID referencing Profile(id) of the followee
  active: boolean;               // Indicates whether the follow relationship is active (true = following, false = unfollowed)
  created_at: Date;              // Timestamp of when the follow relationship was created
  edited_at: Date;               // Timestamp of the last update to the follow relationship
  deleted_at?: Date | null;      // Optional timestamp for soft delete (nullable)
}

export type FollowOrNull = Follow | null;

export interface IUpsertFollowParams {
  followerId: string; 
  followeeId: string;
  active: boolean;
}