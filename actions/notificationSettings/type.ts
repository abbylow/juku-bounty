export interface NotificationSettings {
  id: number;                                      // Primary key, auto-incrementing (SERIAL)
  profile_id: string;                              // UUID, foreign key referencing Profile(id)
  platform_new_feature: boolean;                   // Boolean, defaults to true
  platform_new_quest: boolean;                     // Boolean, defaults to true
  new_contribution_to_involved_quest: boolean;     // Boolean, defaults to true
  new_likes_to_involved_quest: boolean;            // Boolean, defaults to true
  new_replies_to_involved_quest: boolean;          // Boolean, defaults to true
  status_change_to_involved_quest: boolean;        // Boolean, defaults to true
  be_mentioned: boolean;                           // Boolean, defaults to true
  created_at: Date;                                // Timestamp, non-nullable
  edited_at: Date;                                 // Timestamp, non-nullable
  deleted_at?: Date | null;                        // Optional timestamp for soft delete
}

export type NotificationSettingsOrNull = NotificationSettings | null;

export interface IUpsertNotificationSettingsParams {
  walletAddress: string;                           // Wallet address for ownership validation
  profileId: string;                               // UUID of the profile
  platformNewFeature?: boolean;
  platformNewQuest?: boolean;
  newContributionToInvolvedQuest?: boolean;
  newLikesToInvolvedQuest?: boolean;
  newRepliesToInvolvedQuest?: boolean;
  statusChangeToInvolvedQuest?: boolean;
  beMentioned?: boolean;
}

export interface IGetNotificationSettingsParams {
  profile_id?: string;
}