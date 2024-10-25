import { ReferGroupOptionType, ViewPortfolioGroupOptionType } from '@/app/profile/settings/privacy/form-schema';

export interface IUpsertPrivacySettingsParams {
  profileId: string; // UUID of the profile
  allowReferGroup?: string;
  allowReferKnowledgeBounty?: boolean;
  allowReferConsultation?: boolean;
  allowViewPortfolioGroup?: string;
  allowViewWorkExperience?: boolean;
  allowViewSkillAttestation?: boolean;
  allowViewPeerRecommendation?: boolean;
}

export interface IGetPrivacySettingsParams {
  profile_id?: string;
}

export interface PrivacySettings {
  id: number;                                      // Primary key, auto-incrementing (SERIAL)
  profile_id: string;                              // UUID, foreign key referencing Profile(id)
  allow_refer_group?: ReferGroupOptionType | null;               // Optional VARCHAR(100) field for refer group
  allow_refer_knowledge_bounty: boolean;           // Boolean, defaults to true
  allow_refer_consultation: boolean;               // Boolean, defaults to true
  allow_view_portfolio_group?: ViewPortfolioGroupOptionType | null;      // Optional VARCHAR(100) field for portfolio group
  allow_view_work_experience: boolean;             // Boolean, defaults to true
  allow_view_skill_attestation: boolean;           // Boolean, defaults to true
  allow_view_peer_recommendation: boolean;         // Boolean, defaults to true
  created_at: Date;                                // Timestamp, non-nullable
  edited_at: Date;                                 // Timestamp, non-nullable
  deleted_at?: Date | null;                        // Optional timestamp for soft delete
}

export type PrivacySettingsOrNull = PrivacySettings | null;
