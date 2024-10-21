"use server";

import { neon } from "@neondatabase/serverless";

import { Category } from "@/actions/category/type";

export async function getCategories(): Promise<Category[]> {
  if (!process.env.DATABASE_URL) throw new Error("process.env.DATABASE_URL is not defined");

  const sql = neon(process.env.DATABASE_URL);

  try {
    const result = await sql`SELECT * FROM Category;`

    return result as Category[]
  } catch (error) {
    console.log("Error retrieving categories ", error)
    throw new Error("Error retrieving categories")
  }
}