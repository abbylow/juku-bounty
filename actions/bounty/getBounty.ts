"use server";

import { neon } from "@neondatabase/serverless";
import { Bounty, BountyOrNull, GetBountyParams } from "@/actions/bounty/type"; // Assuming Bounty types are defined

export async function getBounty(params: GetBountyParams): Promise<BountyOrNull> {
  if (!process.env.DATABASE_URL) throw new Error("process.env.DATABASE_URL is not defined");

  const sql = neon(process.env.DATABASE_URL);

  try {
    const result = await sql`
      SELECT * 
      FROM Bounty
      WHERE id = ${params.bountyId};
    `;

    return result.length === 0 ? null : result[0] as Bounty;
  } catch (error) {
    console.log("Error retrieving bounty by ID", error);
    throw new Error("Error retrieving bounty by ID");
  }
}
