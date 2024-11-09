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
  id?: string;
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