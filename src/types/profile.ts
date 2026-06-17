export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  email: string | null;
  dietary_goals: string[];
  serving_default: number;
}
