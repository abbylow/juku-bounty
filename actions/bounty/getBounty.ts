"use server";

import { neon } from "@neondatabase/serverless";
import { Bounty, BountyOrNull, BountyWinningContribution, Contribution, GetBountyParams } from "@/actions/bounty/type";
import { Tag } from "@/actions/tag/type";

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
        c.referree_id AS contribution_referree_id,
        c.description AS contribution_description,
        c.created_at AS contribution_created_at,
        c.edited_at AS contribution_edited_at,
        c.deleted_at AS contribution_deleted_at,
        cp.display_name AS creator_display_name,
        cp.username AS creator_username,
        rp.display_name AS referee_display_name,
        rp.username AS referee_username
      FROM Bounty b
      LEFT JOIN BountyCategory bc ON b.id = bc.bounty_id AND bc.active = true
      LEFT JOIN BountyTag bt ON b.id = bt.bounty_id AND bt.active = true
      LEFT JOIN Tag t ON bt.tag_id = t.id
      LEFT JOIN BountyWinningContribution bwc ON b.id = bwc.bounty_id AND bwc.deleted_at IS NULL
      LEFT JOIN Contribution c ON b.id = c.bounty_id AND c.deleted_at IS NULL
      LEFT JOIN Profile cp ON c.creator_profile_id = cp.id
      LEFT JOIN Profile rp ON c.referree_id = rp.id
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
      contributions: [] as Contribution[] // Include contributions here
    };

    result.forEach(row => {
      // Add tags
      if (row.tag_id) {
        bounty.tags.push({
          id: row.tag_id,
          name: row.tag_name,
          slug: row.tag_slug
        } as Tag);
      }

      // Add winning contributions
      if (row.winning_contribution_id) {
        bounty.winningContributions.push({
          id: row.winning_contribution_id,
          bounty_id: params.bountyId,
          contribution_id: row.winning_contribution_contribution_id
        } as BountyWinningContribution);
      }

      // Add contributions
      if (row.contribution_id) {
        bounty.contributions.push({
          id: row.contribution_id,
          bounty_id: params.bountyId,
          creator_profile_id: row.contribution_creator_id,
          referree_id: row.contribution_referree_id,
          description: row.contribution_description,
          created_at: new Date(row.contribution_created_at),
          edited_at: new Date(row.contribution_edited_at),
          deleted_at: row.contribution_deleted_at ? new Date(row.contribution_deleted_at) : null,
          creator: {
            display_name: row.creator_display_name,
            username: row.creator_username
          },
          referee: row.referee_display_name
            ? {
                display_name: row.referee_display_name,
                username: row.referee_username
              }
            : null
        } as Contribution);
      }
    });

    return bounty as Bounty;
  } catch (error) {
    console.error("Error retrieving bounty by ID", error);
    throw new Error("Error retrieving bounty by ID");
  }
}

