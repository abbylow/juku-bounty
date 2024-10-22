"use server";

import { neon } from "@neondatabase/serverless";
import { cookies } from "next/headers";
import { decodeJWT } from "thirdweb/utils";

import { JWT_COOKIE_NAME } from "@/const/jwt";
import { IUpsertVerifiedPlatformParams, VerifiedPlatform, VerifiedPlatformOrNull } from "@/actions/verifiedPlatform/type";

export async function upsertVerifiedPlatform(params: IUpsertVerifiedPlatformParams): Promise<VerifiedPlatformOrNull> {
  if (!process.env.DATABASE_URL) throw new Error("process.env.DATABASE_URL is not defined");

  const sql = neon(process.env.DATABASE_URL);

  // check JWT before performing mutation
  const jwt = cookies().get(JWT_COOKIE_NAME);
  if (!jwt?.value) {
    throw new Error("Error updating verified platform due to invalid JWT");
  }
  const decoded = decodeJWT(jwt.value);
  const userAddressInJwt = decoded.payload.sub;

  if (userAddressInJwt !== params.walletAddress) {
    throw new Error("Unauthorized access to verified platform");
  }

  try {
    // Perform UPSERT using ON CONFLICT on (type, profile_id)
    const result = await sql`
      INSERT INTO VerifiedPlatform (
        type,
        verified,
        additional_data,
        profile_id,
        created_at,
        edited_at
      ) 
      VALUES (
        ${params.type},
        ${params.verified},
        ${params.additionalData ? JSON.stringify(params.additionalData) : null},
        ${params.profileId},
        NOW(),
        NOW()
      )
      ON CONFLICT (type, profile_id) 
      DO UPDATE 
      SET 
        verified = EXCLUDED.verified,
        additional_data = EXCLUDED.additional_data,
        edited_at = NOW()
      RETURNING *;
    `;

    console.log("Verified platform upserted successfully", { result });
    return result.length > 0 ? result[0] as VerifiedPlatform : null;

  } catch (error) {
    console.log("Error upserting verified platform", error);
    throw new Error("Error upserting verified platform");
  }
}
