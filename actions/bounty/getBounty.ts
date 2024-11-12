"use server";

import { neon } from "@neondatabase/serverless";
import { Bounty, BountyOrNull, BountyWinningContribution, GetBountyParams } from "@/actions/bounty/type";
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
        bwc.contribution_id AS winning_contribution_contribution_id
      FROM Bounty b
      LEFT JOIN BountyCategory bc ON b.id = bc.bounty_id AND bc.active = true
      LEFT JOIN BountyTag bt ON b.id = bt.bounty_id AND bt.active = true
      LEFT JOIN Tag t ON bt.tag_id = t.id
      LEFT JOIN BountyWinningContribution bwc ON b.id = bwc.bounty_id AND bwc.deleted_at IS NULL
      WHERE b.id = ${params.bountyId};
    `;

    // If no bounty is found, return null
    if (result.length === 0) {
      return null;
    }

    // Process the result to structure it in the desired format
    const bounty = {
      ...result[0],
      category_id: result[0].category_id,
      tags: [] as Tag[],
      winningContributions: [] as BountyWinningContribution[]
    };

    result.forEach(row => {
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
    });

    return bounty as Bounty;
  } catch (error) {
    console.log("Error retrieving bounty by ID", error);
    throw new Error("Error retrieving bounty by ID");
  }
}
