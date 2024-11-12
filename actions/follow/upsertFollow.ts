"use server";

import { neon } from "@neondatabase/serverless";
import { FollowOrNull, IUpsertFollowParams } from "@/actions/follow/type";

export async function upsertFollow(params: IUpsertFollowParams): Promise<FollowOrNull> {
  if (!process.env.DATABASE_URL) throw new Error("process.env.DATABASE_URL is not defined");

  const sql = neon(process.env.DATABASE_URL);

  try {
    // Perform UPSERT using ON CONFLICT on (follower_id, followee_id)
    const result = await sql`
      INSERT INTO Follow (
        follower_id,
        followee_id,
        active,
        created_at,
        edited_at
      ) 
      VALUES (
        ${params.followerId},
        ${params.followeeId},
        ${params.active},
        NOW(),
        NOW()
      )
      ON CONFLICT (follower_id, followee_id) 
      DO UPDATE 
      SET 
        active = EXCLUDED.active,
        edited_at = NOW()
      RETURNING *;
    `;

    console.log("Follow relationship upserted successfully", { result });
    return result.length > 0 ? result[0] as FollowOrNull : null;
  } catch (error) {
    console.log("Error upserting follow relationship", error);
    throw new Error("Error upserting follow relationship");
  }
}
