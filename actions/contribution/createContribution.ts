"use server";

import { neon } from "@neondatabase/serverless";
import { cookies } from "next/headers";
import { decodeJWT } from "thirdweb/utils";

import { CreateContributionParams, Contribution } from "@/actions/contribution/type";
import { JWT_COOKIE_NAME } from "@/const/jwt";

export async function createContribution(params: CreateContributionParams) {
  if (!process.env.DATABASE_URL) throw new Error("process.env.DATABASE_URL is not defined");

  const sql = neon(process.env.DATABASE_URL);

  try {
    // Check JWT before performing mutation
    const jwt = cookies().get(JWT_COOKIE_NAME);
    if (!jwt?.value) {
      throw new Error("Error creating contribution due to invalid JWT");
    }
    const decoded = decodeJWT(jwt.value);
    const userAddressInJwt = decoded.payload.sub;

    // Verify the creator's profile ID matches the logged-in user
    const profileQuery = await sql`
      SELECT id FROM Profile WHERE wallet_address = ${userAddressInJwt};
    `;
    if (profileQuery.length === 0) {
      throw new Error("Profile not found for the provided wallet address from JWT.");
    }

    const profileIdFromDb = profileQuery[0].id;
    if (profileIdFromDb !== params.creatorProfileId) {
      throw new Error("Unauthorized: Profile ID does not match the logged-in user.");
    }

    // Create the Contribution record
    const contributionResult = await sql`
      INSERT INTO Contribution (
        bounty_id,
        creator_profile_id,
        referree_id,
        description,
        created_at,
        edited_at
      )
      VALUES (
        ${params.bountyId},
        ${params.creatorProfileId},
        ${params.referreeId || null}, -- Referree is optional
        ${params.description},
        NOW(),
        NOW()
      )
      RETURNING *;
    `;

    // Return the created contribution
    const contribution = contributionResult.length === 0 ? null : contributionResult[0];

    if (!contribution) {
      throw new Error("Error creating contribution.");
    }

    return contribution as Contribution;
  } catch (error) {
    console.error("Error creating contribution", error);
    throw new Error("Error creating contribution");
  }
}
