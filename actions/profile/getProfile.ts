"use server";

import { neon } from "@neondatabase/serverless";

import { IGetProfileParams, Profile, ProfileOrNull } from "@/actions/profile/type";

export async function getProfile(params: IGetProfileParams): Promise<ProfileOrNull> {
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
      whereClauses.push(`username = $${whereClauses.length + 1}`);
      values.push(params.username);
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

    // If the profile exists, return it
    if (result.length > 0) {
      return result[0] as Profile
    }

    return null;
  } catch (error) {
    console.log("Error retrieving profile ", error)
    throw new Error("Error retrieving profile");
  }
}