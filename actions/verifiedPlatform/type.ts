export interface IGetVerifiedPlatformParams {
  profileId: string;
  type: string;
}

export interface IUpsertVerifiedPlatformParams {
  walletAddress: string;                         // Wallet address for ownership validation
  profileId: string;                             // Profile ID for which platform verification is being added
  type: string;                                  // Platform type (e.g., Coinbase, LinkedIn)
  verified: boolean;                             // Whether the platform is verified
  additionalData?: Record<string, any>;          // Additional data as JSON
}

export interface VerifiedPlatform {
  id: number;                                      // Primary key (SERIAL)
  type: string;                                    // Platform type (e.g., Coinbase, LinkedIn)
  verified: boolean;                               // Whether the platform is verified
  additional_data: Record<string, any> | null;     // JSONB field for additional data, can be null
  profile_id: string;                              // Foreign key, UUID referencing Profile(id)
  created_at: Date;                                // Timestamp for when the record was created
  edited_at: Date;                                 // Timestamp for when the record was last edited
  deleted_at?: Date | null;                        // Optional timestamp for soft delete
}

export type VerifiedPlatformOrNull = VerifiedPlatform | null;
