export interface CreateContributionParams {
  bountyId: string;
  creatorProfileId: string;
  description: string;
  referreeId?: string; // Optional
}

export interface Contribution {
  id: number; // SERIAL PRIMARY KEY
  bounty_id: string; // UUID referencing the Bounty table
  creator_profile_id: string; // UUID referencing the Profile table
  referree_id?: string | null; // UUID referencing the Profile table, nullable
  description: string; // TEXT field for the contribution description
  created_at: Date; // TIMESTAMP, not nullable
  edited_at: Date; // TIMESTAMP, not nullable
  deleted_at?: Date | null; // TIMESTAMP, nullable
}