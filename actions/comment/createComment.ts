"use server";

import { neon } from "@neondatabase/serverless";
import { cookies } from "next/headers";
import { decodeJWT } from "thirdweb/utils";

import { Comment, CreateCommentParams } from "@/actions/comment/type";
import { JWT_COOKIE_NAME } from "@/const/jwt";

export async function createComment(params: CreateCommentParams): Promise<Comment | null> {
  if (!process.env.DATABASE_URL) throw new Error("process.env.DATABASE_URL is not defined");

  const sql = neon(process.env.DATABASE_URL);

  try {
    // Verify JWT before performing the mutation
    const jwt = cookies().get(JWT_COOKIE_NAME);
    if (!jwt?.value) {
      throw new Error("Unauthorized: Missing or invalid JWT.");
    }
    const decoded = decodeJWT(jwt.value);
    const userAddressInJwt = decoded.payload.sub;

    // Query the profile based on the wallet address from JWT
    const profileQuery = await sql`
      SELECT id FROM Profile WHERE wallet_address = ${userAddressInJwt};
    `;

    // If no profile is found, throw an error
    if (profileQuery.length === 0) {
      throw new Error("Unauthorized: Profile not found for the provided wallet address.");
    }

    const profileIdFromDb = profileQuery[0].id;

    // Check if the creator_profile_id matches the profile from the JWT
    if (profileIdFromDb !== params.creatorProfileId) {
      throw new Error("Unauthorized: Profile ID does not match the authenticated user.");
    }

    // Verify that the contribution exists
    const contributionQuery = await sql`
      SELECT id FROM Contribution WHERE id = ${params.contributionId} AND deleted_at IS NULL;
    `;

    if (contributionQuery.length === 0) {
      throw new Error("Invalid contribution: Contribution does not exist or has been deleted.");
    }

    // Insert the new comment
    const commentResult = await sql`
      INSERT INTO Comment (
        contribution_id,
        creator_profile_id,
        description,
        created_at,
        edited_at
      )
      VALUES (
        ${params.contributionId},
        ${params.creatorProfileId},
        ${params.description},
        NOW(),
        NOW()
      )
      RETURNING *;
    `;

    // Return the created comment
    return commentResult.length === 0 ? null : (commentResult[0] as Comment);
  } catch (error) {
    console.error("Error creating comment:", error);
    throw new Error("Error creating comment");
  }
}
