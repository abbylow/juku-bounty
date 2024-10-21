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
}

export type ProfileOrNull = Profile | null;

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
