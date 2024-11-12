"use server";

import { neon } from "@neondatabase/serverless";
import { IGetVerifiedPlatformParams, VerifiedPlatform, VerifiedPlatformOrNull } from "@/actions/verifiedPlatform/type";

export async function getVerifiedPlatform(params: IGetVerifiedPlatformParams): Promise<VerifiedPlatformOrNull> {
  if (!process.env.DATABASE_URL) throw new Error("process.env.DATABASE_URL is not defined");

  const sql = neon(process.env.DATABASE_URL);

  try {
    const query = `
      SELECT * 
      FROM VerifiedPlatform 
      WHERE profile_id = $1 AND type = $2 AND deleted_at IS NULL;
    `;
    const result = await sql(query, [params.profileId, params.type]);

    return result.length > 0 ? result[0] as VerifiedPlatform : null;
  } catch (error) {
    console.log("Error retrieving verified platform", error);
    throw new Error("Error retrieving verified platform");
  }
}
