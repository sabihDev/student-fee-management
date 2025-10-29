'use server'

import { neon } from '@neondatabase/serverless'

export async function createComment(comment: string) {
  if (!process.env.DATABASE_URL) {
    throw new Error('Missing DATABASE_URL in environment variables')
  }

  const sql = neon(process.env.DATABASE_URL)
  await sql`INSERT INTO comments (comment) VALUES (${comment})`
}
