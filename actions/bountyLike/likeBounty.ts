"use server";

import { neon } from "@neondatabase/serverless";
import { cookies } from "next/headers";
import { decodeJWT } from "thirdweb/utils";

import { LikeDislikeParams } from "@/actions/bountyLike/type";
import { JWT_COOKIE_NAME } from "@/const/jwt";

export async function handleLikeDislike(params: LikeDislikeParams): Promise<void> {
  if (!process.env.DATABASE_URL) throw new Error("process.env.DATABASE_URL is not defined");

  const sql = neon(process.env.DATABASE_URL);

  try {
    // check JWT before performing mutation
    const jwt = cookies().get(JWT_COOKIE_NAME);
    if (!jwt?.value) {
      throw new Error("Error updating verified platform due to invalid JWT");
    }
    const decoded = decodeJWT(jwt.value);
    const userAddressInJwt = decoded.payload.sub;

    // Query the profile based on the wallet address from JWT
    const profileQuery = await sql`
      SELECT id FROM Profile WHERE wallet_address = ${userAddressInJwt};
    `;

    // If no profile is found, throw an error
    if (profileQuery.length === 0) {
      throw new Error("Profile not found for the provided wallet address from JWT.");
    }

    const profileIdFromDb = profileQuery[0].id;

    // Check if a like/dislike entry exists for the given bounty and profile
    const result = await sql`
      SELECT active
      FROM BountyLike
      WHERE bounty_id = ${params.bountyId} AND profile_id = ${profileIdFromDb};
    `;

    if (result.length > 0) {
      // Entry exists, update its status based on the `like` parameter
      const isActive = result[0].active;

      if (params.like && !isActive) {
        // Reactivate the like
        await sql`
          UPDATE BountyLike
          SET active = true, edited_at = NOW()
          WHERE bounty_id = ${params.bountyId} AND profile_id = ${profileIdFromDb};
        `;
      } else if (!params.like && isActive) {
        // Deactivate the like (dislike)
        await sql`
          UPDATE BountyLike
          SET active = false, edited_at = NOW()
          WHERE bounty_id = ${params.bountyId} AND profile_id = ${profileIdFromDb};
        `;
      }
    } else if (params.like) {
      // Entry does not exist, create a new like
      await sql`
        INSERT INTO BountyLike (bounty_id, profile_id, active, created_at, edited_at)
        VALUES (${params.bountyId}, ${profileIdFromDb}, true, NOW(), NOW());
      `;
    }
  } catch (error) {
    console.log("Error handling like/dislike action:", error);
    throw new Error("Error handling like/dislike action");
  }
}
