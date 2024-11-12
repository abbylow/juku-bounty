"use server";

import { neon } from "@neondatabase/serverless";
import { IGetPrivacySettingsParams, PrivacySettings, PrivacySettingsOrNull } from "@/actions/privacySettings/type";

export async function getPrivacySettings(params: IGetPrivacySettingsParams): Promise<PrivacySettingsOrNull> {
  if (!process.env.DATABASE_URL) throw new Error("process.env.DATABASE_URL is not defined");

  const sql = neon(process.env.DATABASE_URL);

  try {
    const whereClauses = [];
    const values = [];

    if (params?.profile_id) {
      whereClauses.push(`profile_id = $${whereClauses.length + 1}`);
      values.push(params.profile_id);
    }

    const whereClause = whereClauses.length > 0
      ? `WHERE ${whereClauses.join(' OR ')}`
      : '';

    const query = `
      SELECT * 
      FROM PrivacySettings 
      ${whereClause};
    `
    const result = await sql(query, values);

    // If privacy settings exist, return them
    if (result.length > 0) {
      return result[0] as PrivacySettings;
    }

    // Return null if no privacy settings are found
    return null;
  } catch (error) {
    console.log("Error retrieving privacy settings", error);
    throw new Error("Error retrieving privacy settings");
  }
}
