
// This file is now a lightweight wrapper around our consolidated authService
import * as authService from "@/services/authService";

// Re-export the functions from the consolidated service
export const fetchUserProfile = authService.fetchUserProfile;
export const signInWithSupabase = authService.signIn;
export const signOutFromSupabase = authService.signOut;
