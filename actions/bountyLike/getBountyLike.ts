"use server";

import { neon } from "@neondatabase/serverless";
import { cookies } from "next/headers";
import { decodeJWT } from "thirdweb/utils";

import { GetLikeStatusParams } from "@/actions/bountyLike/type";
import { JWT_COOKIE_NAME } from "@/const/jwt";

export async function getCurrentLikeStatus(
  params: GetLikeStatusParams
): Promise<boolean> {
  if (!process.env.DATABASE_URL) throw new Error("process.env.DATABASE_URL is not defined");

  const sql = neon(process.env.DATABASE_URL);

  try {
    // Check JWT before performing the query
    const jwt = cookies().get(JWT_COOKIE_NAME);
    if (!jwt?.value) {
      throw new Error("Error retrieving like status due to invalid JWT");
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

    // Query to get the like status for the specified bounty_id and profile_id
    const result = await sql`
      SELECT active
      FROM BountyLike
      WHERE bounty_id = ${params.bountyId} AND profile_id = ${profileIdFromDb};
    `;

    // If a result exists and `active` is true, the bounty is currently liked
    const liked = result.length > 0 ? result[0].active === true : false;

    return liked;
  } catch (error) {
    console.log("Error retrieving like status:", error);
    throw new Error("Error retrieving like status");
  }
}
