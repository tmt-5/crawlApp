export type GroupStatus = "planning" | "active" | "completed";

export interface Group {
  id: string;
  name: string;
  invite_code: string;
  status: GroupStatus;
  city: string | null;
  route_id: string | null;
  created_at: string;
}

export interface Member {
  id: string;
  group_id: string;
  name: string;
  avatar: string;
  joined_at: string;
}
