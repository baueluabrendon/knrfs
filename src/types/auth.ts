export interface UserProfile {
  user_id: string;
  id: string; // Adding this to match the database structure
  email: string;
  role: "client" | "sales officer" | "accounts officer" | "recoveries officer" | "administrator" | "super user";
  first_name: string | null;
  last_name: string | null;
  created_at: string;
}