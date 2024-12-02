"use server";

import { neon } from "@neondatabase/serverless";
import { cookies } from "next/headers";

import { GetBountyCountParams } from "@/actions/bounty/type";
import { BountyStatus } from "@/const/bounty-status";

export async function getBountyCount(params: GetBountyCountParams): Promise<number> {
  const _cookies = cookies()

  if (!process.env.DATABASE_URL) throw new Error("process.env.DATABASE_URL is not defined");

  const sql = neon(process.env.DATABASE_URL);

  try {
    // Construct the base query for counting bounties
    let countQuery = `
      SELECT COUNT(*) AS total
      FROM Bounty b
      WHERE 1 = 1
    `;

    // Filter by category
    if (params.categoryId) {
      countQuery += ` AND EXISTS (
        SELECT 1 FROM BountyCategory bc WHERE bc.bounty_id = b.id AND bc.category_id = ${params.categoryId} AND bc.active = true
      )`;
    }

    // Filter by search term
    if (params.searchTerm) {
      countQuery += ` AND (b.title ILIKE '%${params.searchTerm}%' OR b.description ILIKE '%${params.searchTerm}%')`;
    }

    // Filter by status
    if (params.status && params.status !== BountyStatus.UNKNOWN) {
      switch (params.status) {
        case BountyStatus.OPEN:
          countQuery += ` AND NOT b.is_result_decided AND b.expiry > NOW()`;
          break;
        case BountyStatus.ENDED:
          countQuery += ` AND b.is_result_decided AND NOT EXISTS (
            SELECT 1 FROM BountyWinningContribution bwc WHERE bwc.bounty_id = b.id AND bwc.deleted_at IS NULL
          )`;
          break;
        case BountyStatus.COMPLETED:
          countQuery += ` AND EXISTS (
            SELECT 1 FROM BountyWinningContribution bwc WHERE bwc.bounty_id = b.id AND bwc.deleted_at IS NULL
          )`;
          break;
        case BountyStatus.EXPIRED:
          countQuery += ` AND NOT b.is_result_decided AND b.expiry <= NOW()`;
          break;
      }
    }

    // Filter by relatedProfile
    if (params.relatedProfile) {
      countQuery += ` AND (
        b.creator_profile_id = '${params.relatedProfile}' OR
        EXISTS (
          SELECT 1 FROM Contribution c 
          WHERE c.bounty_id = b.id AND 
            (c.creator_profile_id = '${params.relatedProfile}' OR c.referee_id = '${params.relatedProfile}')
        )
      )`;
    }

    // Execute the count query
    const result = await sql(countQuery);

    // Return the total count from the result
    return result[0].total;
  } catch (error) {
    console.log("Error retrieving bounty count:", error);
    throw new Error("Error retrieving bounty count");
  }
}
