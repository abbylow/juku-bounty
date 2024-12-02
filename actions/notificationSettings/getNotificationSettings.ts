"use server";

import { neon } from "@neondatabase/serverless";
import { cookies } from "next/headers";

import { IGetNotificationSettingsParams, NotificationSettings, NotificationSettingsOrNull } from "@/actions/notificationSettings/type";

export async function getNotificationSettings(params: IGetNotificationSettingsParams): Promise<NotificationSettingsOrNull> {
  const _cookies = cookies()

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
      FROM NotificationSettings 
      ${whereClause};
    `
    const result = await sql(query, values);

    // If notification settings exist, return them
    if (result.length > 0) {
      return result[0] as NotificationSettings;
    }

    // Return null if no notification settings are found
    return null;
  } catch (error) {
    console.log("Error retrieving notification settings", error);
    throw new Error("Error retrieving notification settings");
  }
}
