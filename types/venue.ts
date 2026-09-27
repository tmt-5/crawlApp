export interface Venue {
  id: string;
  city: string;
  name: string;
  tagline: string | null;
  description: string | null;
  fun_fact: string | null;
  image_url: string | null;
  category: string | null;
  opening_hours_note: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  google_rating: number | null;
  last_verified_at: string | null;
}

export interface Checkin {
  id: string;
  group_id: string;
  venue_id: string;
  member_id: string;
  rating_beer: number | null;
  rating_atmosphere: number | null;
  rating_overall: number | null;
  created_at: string;
}

export interface CheckinInput {
  group_id: string;
  venue_id: string;
  member_id: string;
  rating_beer: number | null;
  rating_atmosphere: number | null;
  rating_overall: number | null;
}
