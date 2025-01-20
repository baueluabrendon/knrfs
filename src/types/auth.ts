export type UserRole = 
  | "client"
  | "sales officer"
  | "accounts officer" 
  | "recoveries officer"
  | "administrator"
  | "super user";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName: string | null;
  lastName: string | null;
  createdAt: string;
  password: string;
}