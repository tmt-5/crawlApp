export interface CityOption {
  id: string;
  label: string;
  available: boolean;
}

export const CITIES: CityOption[] = [
  { id: "Oslo", label: "Oslo", available: true },
  { id: "København", label: "København", available: true },
  { id: "Bergen", label: "Bergen", available: false },
  { id: "Trondheim", label: "Trondheim", available: false },
];
