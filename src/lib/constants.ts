/** Action modes for workspace run buttons */
export const ACTION_MODES = [
  { value: "apply", label: "Apply to all matches" },
  { value: "dry_run", label: "Dry run preview" },
  { value: "export", label: "Export to CSV" },
] as const;
