"use server";

import { neon } from "@neondatabase/serverless";

import { Bounty, GetBountiesParams } from "@/actions/bounty/type";

export async function getBounties(params: GetBountiesParams): Promise<Bounty[]> {
  if (!process.env.DATABASE_URL) throw new Error("process.env.DATABASE_URL is not defined");

  const sql = neon(process.env.DATABASE_URL);

  try {
    let query = `
      SELECT b.* 
      FROM Bounty b
      LEFT JOIN BountyCategory bc ON b.id = bc.bounty_id
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

    return result as Bounty[];
  } catch (error) {
    console.log("Error retrieving bounties:", error);
    throw new Error("Error retrieving bounties");
  }
}
