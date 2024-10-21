"use server";

import { neon } from "@neondatabase/serverless";
import { cookies } from "next/headers";
import { decodeJWT } from "thirdweb/utils";

import { IUpsertProfileParams, Profile, ProfileOrNull } from "@/actions/profile/type";
import { JWT_COOKIE_NAME } from "@/const/jwt";

// TODO: test if username is duplicated, will this sql revert
// TODO: test if wallet_address is duplicated, will this sql revert
export async function createOrUpdateProfile(params: IUpsertProfileParams): Promise<ProfileOrNull> {
  if (!process.env.DATABASE_URL) throw new Error("process.env.DATABASE_URL is not defined");

  const sql = neon(process.env.DATABASE_URL);

  // check JWT before performing mutation
  const jwt = cookies().get(JWT_COOKIE_NAME);
  if (!jwt?.value) {
    throw new Error("Error creating or updating profile due to invalid JWT");
  }
  const decoded = decodeJWT(jwt.value)
  const userAddressInJwt = decoded.payload.sub;

  if (userAddressInJwt !== params.walletAddress) {
    throw new Error("Error creating or updating profile due to unauthorized identity");
  }

  console.log({params})
  try {
    const profileUpsertQuery = `
      INSERT INTO Profile (
        display_name, 
        username, 
        bio, 
        pfp, 
        wallet_address, 
        login_method, 
        created_at, 
        edited_at
      ) 
      VALUES (
        $1, 
        $2, 
        $3, 
        $4, 
        $5, 
        $6, 
        NOW(), 
        NOW()
      )
      ON CONFLICT (wallet_address) 
      DO UPDATE 
      SET 
        display_name = EXCLUDED.display_name,
        username = EXCLUDED.username,
        bio = EXCLUDED.bio,
        pfp = EXCLUDED.pfp,
        login_method = EXCLUDED.login_method,
        edited_at = NOW()
      RETURNING *;
  `;

    const profileUpsertValues = [
      params?.displayName,
      params?.username,
      params?.bio,
      params?.pfp,
      params?.walletAddress,
      params?.loginMethod
    ];

    console.log({ profileUpsertQuery, profileUpsertValues })

    const result = await sql(profileUpsertQuery, profileUpsertValues);
    console.log({ result })

    if (result.length > 0) {
      return result[0] as Profile
    }

    return null;
  } catch (error) {
    console.log("Error creating or updating profile ", error)
    throw new Error("Error creating or updating profile");
  }
}