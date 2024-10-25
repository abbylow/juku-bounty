"use server";

import { neon } from "@neondatabase/serverless";

import { Tag } from "@/actions/tag/type";

export async function getTags(limit = 100): Promise<Tag[]> {
  if (!process.env.DATABASE_URL) throw new Error("process.env.DATABASE_URL is not defined");

  const sql = neon(process.env.DATABASE_URL);

  try {
    const result = await sql`
      SELECT * FROM Tag
      ORDER BY created_at DESC
      LIMIT ${limit};
    `;

    return result as Tag[]
  } catch (error) {
    console.log("Error retrieving all tags ", error)
    throw new Error("Error retrieving all tags")
  }
}