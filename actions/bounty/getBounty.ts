"use server";

import { neon } from "@neondatabase/serverless";
import { Bounty, BountyOrNull, BountyWinningContribution, GetBountyParams } from "@/actions/bounty/type";
import { Tag } from "@/actions/tag/type";

export async function getBounty(params: GetBountyParams): Promise<BountyOrNull> {
  if (!process.env.DATABASE_URL) throw new Error("process.env.DATABASE_URL is not defined");

  const sql = neon(process.env.DATABASE_URL);

  try {
    const result = await sql`
      SELECT * 
      FROM Bounty
      WHERE id = ${params.bountyId};
    `;

    // If no bounty is found, return null
    if (result.length === 0) {
      return null;
    }

    const bounty = result[0] as Bounty;

    // Query to get active category for the bounty
    const categoryResult = await sql`
      SELECT category_id
      FROM BountyCategory 
      WHERE bounty_id = ${bounty.id} AND active = true;
    `;
    bounty.category_id = categoryResult[0].category_id;

    // Query to get active tags for the bounty, including the tag names
    const tagsResult = await sql`
      SELECT t.id AS id, t.name AS name, t.slug AS slug
      FROM BountyTag bt
      JOIN Tag t ON bt.tag_id = t.id
      WHERE bt.bounty_id = ${bounty.id} AND bt.active = true;
    `;
    bounty.tags = tagsResult as Tag[];

    const winningContributionResult = await sql`
      SELECT * 
      FROM BountyWinningContribution
      WHERE bounty_id = ${bounty.id} AND deleted_at IS NULL;
    `;
    bounty.winningContributions = winningContributionResult as BountyWinningContribution[];

    return bounty;
  } catch (error) {
    console.log("Error retrieving bounty by ID", error);
    throw new Error("Error retrieving bounty by ID");
  }
}
