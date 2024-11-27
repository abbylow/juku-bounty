export interface CreateCommentParams {
  contributionId: number; // ID of the associated Contribution
  creatorProfileId: string; // UUID of the profile creating the comment
  description: string; // Comment description
}

export interface Comment {
  id: number; // Primary key
  contribution_id: number; // Associated Contribution ID
  creator_profile_id: string; // UUID of the profile creating the comment
  description: string; // Comment description
  created_at: Date; // Timestamp of creation
  edited_at: Date; // Timestamp of the last edit
  deleted_at?: Date | null; // Soft deletion timestamp (nullable)
  creator?: {
    id: string; // Enriched id of the creator
    display_name: string; // Enriched display name of the creator
    username: string; // Enriched username of the creator
    pfp: string; // Enriched pfp of the creator
  }; // Optional nested object for creator details
}
