/** App categories available in the marketplace */
export const CATEGORIES = [
  "All",
  "Devices",
  "Reporting",
  "Alerts",
  "Planning",
  "Import/Export",
  "Utilities",
] as const;

export type AppCategory = Exclude<(typeof CATEGORIES)[number], "All">;
export type AppStatus = "active" | "beta" | "inactive";

export interface MarketplaceApp {
  id: string;
  name: string;
  description: string;
  how_it_works: string;
  category: AppCategory;
  icon: string;
  status: AppStatus;
  version: string;
  author: string;
  api_endpoint: string;
  input_schema: Record<string, unknown>;
  created_at: string;
}

/** Action modes for mini app workspace */
export const ACTION_MODES = [
  { value: "apply", label: "Apply to all matches" },
  { value: "dry_run", label: "Dry run preview" },
  { value: "export", label: "Export to CSV" },
] as const;
