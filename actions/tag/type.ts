export interface Tag {
  id: number;                  // Primary key, auto-incremented (SERIAL)
  name: string;                // The name of the tag (VARCHAR(300))
  slug: string;                // The unique slug for the tag (VARCHAR(300), must be unique)
  created_at: Date;            // The timestamp when the tag was created (TIMESTAMP)
  edited_at: Date;             // The timestamp when the tag was last edited (TIMESTAMP)
  deleted_at?: Date | null;    // Optional soft-delete timestamp (nullable)
}