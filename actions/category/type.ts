export interface Category {
  id: number;                 // The auto-incrementing primary key (SERIAL)
  name: string;               // The category name (VARCHAR(300))
  slug: string;               // The unique slug for the category (VARCHAR(300))
  created_at: Date;           // Timestamp of when the category was created
  edited_at: Date;            // Timestamp of when the category was last edited
  deleted_at?: Date | null;   // Optional timestamp for soft delete (nullable)
}