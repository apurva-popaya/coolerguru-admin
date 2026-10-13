export type ActivePortal = "BUYER" | "SELLER" | "ADMIN";

export interface AuthUserSession {
  session_id: string;
  active_portal: ActivePortal;
  logged_in_at: string;
  expires_at: string;
}

export interface AuthUser {
  user_id: number;
  name: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone_number: string;
  roles: string[];
  active_portal: ActivePortal;

  // Returned by GET /auth/me (and PATCH /users/me); optional elsewhere.
  profile_image_url?: string | null;
  status?: string;
  is_active?: boolean;
  email_verified?: boolean;
  email_verified_at?: string | null;
  phone_verified?: boolean;
  phone_verified_at?: string | null;
  has_password?: boolean;
  member_since?: string;
  updated_at?: string;
  last_login_at?: string | null;
  previous_login_at?: string | null;
  current_session?: AuthUserSession;
  active_sessions?: number;
}
