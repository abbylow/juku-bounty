"use server";

import { neon } from "@neondatabase/serverless";
import { cookies } from "next/headers";

import { IGetProfileParams, Profile } from "@/actions/profile/type";

export async function getProfiles(params: IGetProfileParams): Promise<Profile[]> {
  const _cookies = cookies()

  if (!process.env.DATABASE_URL) throw new Error("process.env.DATABASE_URL is not defined");

  const sql = neon(process.env.DATABASE_URL);

  try {
    const whereClauses = [];
    const values = [];

    if (params?.display_name) {
      whereClauses.push(`display_name ILIKE $${whereClauses.length + 1}`);
      values.push(`%${params.display_name}%`);
    }

    if (params?.username) {
      whereClauses.push(`username ILIKE $${whereClauses.length + 1}`);
      values.push(`%${params.username}%`);
    }

    const whereClause = whereClauses.length > 0
      ? `WHERE ${whereClauses.join(' OR ')}`
      : '';

    const query = `
      SELECT * 
      FROM Profile 
      ${whereClause}
      LIMIT 10;
    `
    const result = await sql(query, values);
    return result as Profile[];
  } catch (error) {
    console.error("Error retrieving profiles by username or display_name:", error);
    throw new Error("Error retrieving profiles");
  }
}
