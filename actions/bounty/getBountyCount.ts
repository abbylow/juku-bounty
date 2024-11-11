"use server";

import { neon } from "@neondatabase/serverless";
import { GetBountyCountParams } from "@/actions/bounty/type";

export async function getBountyCount(params: GetBountyCountParams): Promise<number> {
  if (!process.env.DATABASE_URL) throw new Error("process.env.DATABASE_URL is not defined");

  const sql = neon(process.env.DATABASE_URL);

  try {
    // Construct the base query for counting bounties
    let countQuery = `
      SELECT COUNT(*) AS total
      FROM Bounty b
      WHERE 1 = 1
    `;

    // Apply optional filters
    if (params.categoryId) {
      countQuery += ` AND EXISTS (
        SELECT 1 FROM BountyCategory bc WHERE bc.bounty_id = b.id AND bc.category_id = ${params.categoryId} AND bc.active = true
      )`;
    }

    if (params.title) {
      countQuery += ` AND b.title ILIKE '%${params.title}%'`;
    }

    if (params.description) {
      countQuery += ` AND b.description ILIKE '%${params.description}%'`;
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