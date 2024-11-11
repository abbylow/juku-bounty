import { Option } from '@/components/ui/multiple-selector';
import { Tag } from '@/actions/tag/type';

export interface GetBountyParams {
  bountyId: string
}

export interface CreateBountyParams {
  title: string;
  description?: string;
  expiry: string; // ISO string for date
  escrowContractAddress: string;
  escrowContractChainId: string;
  bountyIdOnEscrow: number;
  category: number;
  tags?: Option[];           // Array of tags (each tag is an Option)
  creatorProfileId: string; // UUID referencing Profile(id)
}

export interface Bounty {
  id: string;                           // UUID, primary key
  title: string;                        // Bounty title (VARCHAR(200))
  description?: string | null;          // Bounty description (VARCHAR(1000), optional)
  expiry: Date;                         // Bounty expiry date (TIMESTAMP)
  is_result_decided: boolean;           // Indicates if the result has been decided (BOOLEAN)
  escrow_contract_address: string;      // Escrow contract address (VARCHAR(100))
  escrow_contract_chain_id: string;     // Escrow contract chain ID (VARCHAR(100))
  bounty_id_on_escrow: number;          // Bounty ID in escrow contract (INT)
  creator_profile_id: string;           // UUID referencing Profile(id)
  created_at: Date;                     // Timestamp when bounty was created (TIMESTAMP)
  edited_at: Date;                      // Timestamp when bounty was last edited (TIMESTAMP)
  deleted_at?: Date | null;             // Soft delete timestamp (optional, can be null)
  category_id?: number;
  tags?: Tag[];
  winningContributions?: BountyWinningContribution[];
}

export type BountyOrNull = Bounty | null;

export interface BountyWinningContribution {
  id: number;
  bounty_id: string;
  contribution_id: number;
  created_at?: Date;
  edited_at?: Date;
  deleted_at?: Date | null;
}

export interface GetBountiesParams {
  limit: number;
  offset: number;
  categoryId?: string | null; // Optional filter by category ID
  title?: string; // Optional fuzzy search on title
  description?: string; // Optional fuzzy search on description
  orderBy?: string;
  orderDirection?: string;
}

export interface GetBountyCountParams {
  categoryId?: string | null;
  title?: string;
  description?: string;
}
