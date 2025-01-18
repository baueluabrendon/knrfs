export type UserRole = 
  | "SUPER_USER"
  | "CLIENT"
  | "MANAGER"
  | "SALES_OFFICER"
  | "ACCOUNTS_OFFICER"
  | "RECOVERIES_OFFICER"
  | "OFFICE_ADMIN";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  createdAt: string;
}