
export interface UserProfile {
  user_id: string;
  id: string; // Adding this to match the database structure
  email: string;
  role: "client" | "sales officer" | "accounts officer" | "recoveries officer" | "administrator" | "super user" | "administration officer";
  first_name: string | null;
  last_name: string | null;
  created_at: string;
  is_password_changed: boolean | null;
}
