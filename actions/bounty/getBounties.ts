"use server";

import { neon } from "@neondatabase/serverless";

import { Bounty, BountyWinningContribution, GetBountiesParams } from "@/actions/bounty/type";
import { Tag } from "@/actions/tag/type";

export async function getBounties(params: GetBountiesParams): Promise<Bounty[]> {
  if (!process.env.DATABASE_URL) throw new Error("process.env.DATABASE_URL is not defined");

  const sql = neon(process.env.DATABASE_URL);

  try {
    let query = `
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
      WHERE 1 = 1
    `;

    // Adding optional filters
    if (params.categoryId) {
      query += ` AND bc.category_id = ${params.categoryId}`;
    }

    if (params.title) {
      query += ` AND b.title ILIKE '%${params.title}%'`;
    }

    if (params.description) {
      query += ` AND b.description ILIKE '%${params.description}%'`;
    }

    // Add pagination
    query += ` LIMIT ${params.limit} OFFSET ${params.offset}`;

    // Execute the query
    const result = await sql(query);

    // Process the result to structure it in the desired format
    const bountiesMap: { [key: string]: Partial<Bounty> } = {};

    result.forEach(row => {
      const bountyId = row.id;

      // Initialize the bounty if it doesn't exist in the map
      if (!bountiesMap[bountyId]) {
        bountiesMap[bountyId] = {
          ...row,
          category_id: row.category_id,
          tags: [],
          winningContributions: []
        };
      }

      // Add tags
      if (row.tag_id) {
        bountiesMap[bountyId].tags?.push({
          id: row.tag_id,
          name: row.tag_name,
          slug: row.tag_slug
        } as Tag);
      }

      // Add winning contributions
      if (row.winning_contribution_id) {
        bountiesMap[bountyId].winningContributions?.push({
          id: row.winning_contribution_id,
          bounty_id: bountyId,
          contribution_id: row.winning_contribution_contribution_id
        } as BountyWinningContribution);
      }
    });

    // Convert the map to an array of bounties
    return Object.values(bountiesMap) as Bounty[];
  } catch (error) {
    console.log("Error retrieving bounties:", error);
    throw new Error("Error retrieving bounties");
  }
}
