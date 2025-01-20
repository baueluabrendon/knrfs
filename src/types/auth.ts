export type UserRole = 
  | "SUPER_USER"
  | "CLIENT"
  | "MANAGER"
  | "SALES_OFFICER"
  | "ACCOUNTS_OFFICER"
  | "RECOVERIES_OFFICER"
  | "OFFICE_ADMIN";

export interface User {
  user_id: string;
  email: string;
  role: UserRole;
  firstname: string;  // Changed from firstName
  lastname: string;   // Changed from lastName
  createdat: string;  // Changed from createdAt
}