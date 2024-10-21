import { Option } from '@/components/ui/multiple-selector';

export interface Profile {
  id: string;
  display_name: string;
  username: string;
  bio?: string;
  pfp?: string;
  wallet_address: string;
  login_method: string;
  created_at: Date;
  edited_at: Date;
  deleted_at?: Date | null;
  category_ids?: number[];
}

export type ProfileOrNull = Profile | null;

// export type ProfileCategory = {
//   profile_id?: string;           // UUID, foreign key referencing Profile(id)
//   category_id: number;          // INT, foreign key referencing Category(id)
//   active?: boolean;              // BOOLEAN, defaults to true
//   created_at?: Date;             // TIMESTAMP, non-nullable
//   edited_at?: Date;              // TIMESTAMP, non-nullable
//   deleted_at?: Date | null;     // Optional TIMESTAMP for soft delete
// };

export interface IGetProfileParams {
  wallet_address?: string;
  username?: string;
}

export interface IUpsertProfileParams {
  displayName: string;
  username: string;
  bio?: string;
  pfp?: string;
  walletAddress: string;
  loginMethod: string;
  categories?: Option[];
}

export interface IUpsertPrivacySettingsParams {
  walletAddress: string;
  profileId: string; // UUID of the profile
  allowReferGroup?: string;
  allowReferKnowledgeBounty?: boolean;
  allowReferConsultation?: boolean;
  allowViewPortfolioGroup?: string;
  allowViewWorkExperience?: boolean;
  allowViewSkillAttestation?: boolean;
  allowViewPeerRecommendation?: boolean;
}

export interface PrivacySettings {
  id: number;                                      // Primary key, auto-incrementing (SERIAL)
  profile_id: string;                              // UUID, foreign key referencing Profile(id)
  allow_refer_group?: string | null;               // Optional VARCHAR(100) field for refer group
  allow_refer_knowledge_bounty: boolean;           // Boolean, defaults to true
  allow_refer_consultation: boolean;               // Boolean, defaults to true
  allow_view_portfolio_group?: string | null;      // Optional VARCHAR(100) field for portfolio group
  allow_view_work_experience: boolean;             // Boolean, defaults to true
  allow_view_skill_attestation: boolean;           // Boolean, defaults to true
  allow_view_peer_recommendation: boolean;         // Boolean, defaults to true
  created_at: Date;                                // Timestamp, non-nullable
  edited_at: Date;                                 // Timestamp, non-nullable
  deleted_at?: Date | null;                        // Optional timestamp for soft delete
}

export type PrivacySettingsOrNull = PrivacySettings | null;
