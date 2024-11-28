"use server";

import { neon } from "@neondatabase/serverless";
import { Bounty, BountyOrNull, BountyWinningContribution, Contribution, GetBountyParams } from "@/actions/bounty/type";
import { Tag } from "@/actions/tag/type";
import { Comment } from '@/actions/comment/type';

export async function getBounty(params: GetBountyParams): Promise<BountyOrNull> {
  if (!process.env.DATABASE_URL) throw new Error("process.env.DATABASE_URL is not defined");

  const sql = neon(process.env.DATABASE_URL);

  try {
    const result = await sql`
      SELECT 
        b.*,
        bc.category_id AS category_id,
        t.id AS tag_id,
        t.name AS tag_name,
        t.slug AS tag_slug,
        bwc.id AS winning_contribution_id,
        bwc.contribution_id AS winning_contribution_contribution_id,
        c.id AS contribution_id,
        c.creator_profile_id AS contribution_creator_id,
        c.referee_id AS contribution_referee_id,
        c.description AS contribution_description,
        c.created_at AS contribution_created_at,
        c.edited_at AS contribution_edited_at,
        c.deleted_at AS contribution_deleted_at,
        cp.display_name AS creator_display_name,
        cp.username AS creator_username,
        cp.wallet_address AS creator_wallet_address,
        cp.pfp AS creator_pfp,
        rp.display_name AS referee_display_name,
        rp.wallet_address AS referee_wallet_address,
        rp.username AS referee_username,
        com.id AS comment_id,
        com.description AS comment_description,
        com.creator_profile_id AS comment_creator_profile_id,
        com.created_at AS comment_created_at,
        cmp.display_name AS comment_creator_display_name,
        cmp.username AS comment_creator_username,
        cmp.pfp AS comment_creator_pfp
      FROM Bounty b
      LEFT JOIN BountyCategory bc ON b.id = bc.bounty_id AND bc.active = true
      LEFT JOIN BountyTag bt ON b.id = bt.bounty_id AND bt.active = true
      LEFT JOIN Tag t ON bt.tag_id = t.id
      LEFT JOIN BountyWinningContribution bwc ON b.id = bwc.bounty_id AND bwc.deleted_at IS NULL
      LEFT JOIN Contribution c ON b.id = c.bounty_id AND c.deleted_at IS NULL
      LEFT JOIN Profile cp ON c.creator_profile_id = cp.id
      LEFT JOIN Profile rp ON c.referee_id = rp.id
      LEFT JOIN Comment com ON c.id = com.contribution_id AND com.deleted_at IS NULL
      LEFT JOIN Profile cmp ON com.creator_profile_id = cmp.id
      WHERE b.id = ${params.bountyId};
    `;

    if (result.length === 0) {
      return null;
    }

    // Structure the bounty data
    const bounty = {
      id: result[0].id,
      title: result[0].title,
      description: result[0].description,
      expiry: result[0].expiry,
      is_result_decided: result[0].is_result_decided,
      escrow_contract_address: result[0].escrow_contract_address,
      escrow_contract_chain_id: result[0].escrow_contract_chain_id,
      bounty_id_on_escrow: result[0].bounty_id_on_escrow,
      creator_profile_id: result[0].creator_profile_id,
      created_at: result[0].created_at,
      edited_at: result[0].edited_at,
      category_id: result[0].category_id,
      tags: [] as Tag[],
      winningContributions: [] as BountyWinningContribution[],
      contributions: [] as Contribution[], // Include contributions here
      contributionMap: {}
    };

    const contributionMap: Record<number, Contribution> = {};
    const tagMap: Record<number, Tag> = {};
    const winningContributionMap: Record<number, BountyWinningContribution> = {};

    result.forEach((row) => {
      // Add tags
      if (row.tag_id) {
        if (!tagMap[row.tag_id]) {
          tagMap[row.tag_id] = {
            id: row.tag_id,
            name: row.tag_name,
            slug: row.tag_slug
          };
        }
      }
      bounty.tags = Object.values(tagMap);

      // Add winning contributions
      if (row.winning_contribution_id) {
        if (!winningContributionMap[row.winning_contribution_id]) {
          winningContributionMap[row.winning_contribution_id] = {
            id: row.winning_contribution_id,
            bounty_id: params.bountyId,
            contribution_id: row.winning_contribution_contribution_id
          };
        }
      }
      bounty.winningContributions = Object.values(winningContributionMap);

      // Add contributions
      if (row.contribution_id) {
        if (!contributionMap[row.contribution_id]) {
          contributionMap[row.contribution_id] = {
            id: row.contribution_id,
            bounty_id: params.bountyId,
            creator_profile_id: row.contribution_creator_id,
            referee_id: row.contribution_referee_id,
            description: row.contribution_description,
            created_at: new Date(row.contribution_created_at),
            edited_at: new Date(row.contribution_edited_at),
            deleted_at: row.contribution_deleted_at ? new Date(row.contribution_deleted_at) : null,
            creator: {
              id: row.contribution_creator_id,
              pfp: row.creator_pfp,
              display_name: row.creator_display_name,
              username: row.creator_username,
              wallet_address: row.creator_wallet_address
            },
            referee: row.contribution_referee_id
              ? {
                id: row.contribution_referee_id,
                display_name: row.referee_display_name,
                username: row.referee_username,
                wallet_address: row.referee_wallet_address
              }
              : null,
            comments: [] as Comment[]
          };
        }

        // Add comments to the corresponding contribution
        if (row.comment_id) {
          contributionMap[row.contribution_id]!.comments?.push({
            id: row.comment_id,
            contribution_id: row.contribution_id,
            creator_profile_id: row.comment_creator_profile_id,
            description: row.comment_description,
            created_at: row.comment_created_at,
            edited_at: row.comment_edited_at,
            creator: {
              id: row.comment_creator_profile_id,
              display_name: row.comment_creator_display_name,
              username: row.comment_creator_username,
              pfp: row.comment_creator_pfp,
            }
          } as Comment);
        }
      }
    });

    // Assign contributions to the bounty
    bounty.contributions = Object.values(contributionMap);
    bounty.contributionMap = contributionMap;

    return bounty as Bounty;
  } catch (error) {
    console.error("Error retrieving bounty by ID", error);
    throw new Error("Error retrieving bounty by ID");
  }
}
