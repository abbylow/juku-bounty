import { Option } from '@/components/ui/multiple-selector';
import { Tag } from '@/actions/tag/type';
import { Comment } from '@/actions/comment/type';
import { BountyStatus } from '@/const/bounty-status';

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
  contributions?: Contribution[];
  contributionMap?: Record<number, Contribution>;
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

export interface Contribution {
  id: number; // SERIAL PRIMARY KEY
  bounty_id: string; // UUID referencing the Bounty table
  creator_profile_id: string; // UUID referencing the creator's Profile
  referee_id?: string | null; // Nullable UUID referencing the referee's Profile
  description: string; // TEXT field for the contribution's description
  created_at: Date; // TIMESTAMP for when the contribution was created
  edited_at: Date; // TIMESTAMP for when the contribution was last edited
  deleted_at?: Date | null; // Nullable TIMESTAMP for soft deletion
  creator?: {
    id: string; // Enriched id of the creator
    display_name: string; // Enriched display name of the creator
    username: string; // Enriched username of the creator
    pfp: string; // Enriched pfp of the creator
    wallet_address: string; // Enriched wallet address of the creator
  }; // Optional nested object for creator details
  referee?: {
    id: string; // Enriched id of the referee
    display_name: string; // Enriched display name of the referee
    username: string; // Enriched username of the referee
    wallet_address: string; // Enriched wallet address of the referee
  } | null; // Optional nested object for referee details
  comments?: Comment[];
}

export interface GetBountiesParams {
  limit: number;
  offset: number;
  categoryId?: string | null; // Optional filter by category ID
  searchTerm?: string; // Optional fuzzy search on title / description
  orderBy?: string;
  orderDirection?: string;
  status?: BountyStatus;
  relatedProfile?: string;
}

export interface GetBountyCountParams {
  categoryId?: string | null;
  searchTerm?: string; // Optional fuzzy search on title / description
  status?: BountyStatus;
  relatedProfile?: string;
}

export interface CloseBountyParams {
  bountyId: string;
  winningContributions: number[]; // Array of Contribution IDs
}