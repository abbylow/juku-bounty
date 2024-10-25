"use server";

import { neon } from "@neondatabase/serverless";
import { FollowOrNull, Follow, IGetFollowParams } from "@/actions/follow/type";

export async function getFollow(params: IGetFollowParams): Promise<FollowOrNull> {
  if (!process.env.DATABASE_URL) throw new Error("process.env.DATABASE_URL is not defined");

  const sql = neon(process.env.DATABASE_URL);

  try {
    const query = `
      SELECT * 
      FROM Follow 
      WHERE follower_id = $1 AND followee_id = $2 AND deleted_at IS NULL;
    `;
    const result = await sql(query, [params.followerId, params.followeeId]);

    return result.length > 0 ? result[0] as Follow : null;
  } catch (error) {
    console.log("Error retrieving follow relationship", error);
    throw new Error("Error retrieving follow relationship");
  }
}
