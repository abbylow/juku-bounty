"use server";

import { neon } from "@neondatabase/serverless";
import { cookies } from "next/headers";

import { IGetProfileParams, Profile, ProfileOrNull } from "@/actions/profile/type";

export async function getProfile(params: IGetProfileParams): Promise<ProfileOrNull> {
  const _cookies = cookies()

  if (!process.env.DATABASE_URL) throw new Error("process.env.DATABASE_URL is not defined");

  const sql = neon(process.env.DATABASE_URL);

  try {
    const whereClauses = [];
    const values = [];

    if (params?.wallet_address) {
      whereClauses.push(`wallet_address = $${whereClauses.length + 1}`);
      values.push(params.wallet_address);
    }

    if (params?.username) {
      whereClauses.push(`LOWER(username) = LOWER($${whereClauses.length + 1})`);
      values.push(params.username);
    }

    if (params?.id) {
      whereClauses.push(`id = $${whereClauses.length + 1}`);
      values.push(params.id);
    }

    const whereClause = whereClauses.length > 0
      ? `WHERE ${whereClauses.join(' OR ')}`
      : '';

    const query = `
      SELECT * 
      FROM Profile 
      ${whereClause};
    `
    const result = await sql(query, values);

    // If no profile is found, return null
    if (result.length === 0) {
      return null;
    }

    const profile = result[0] as Profile;

    // Query to get active categories for the profile
    const categoriesResult = await sql`
      SELECT category_id
      FROM ProfileCategory 
      WHERE profile_id = ${profile.id} AND active = true;
    `;

    // Add active categories to the profile
    profile.category_ids = categoriesResult.map(row => row.category_id) || [];
    return profile;
  } catch (error) {
    console.log("Error retrieving profile ", error)
    throw new Error("Error retrieving profile");
  }
}