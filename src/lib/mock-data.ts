import { MarketplaceApp } from "./constants";

/** Seed data for the marketplace — mirrors the planned Supabase table */
export const SEED_APPS: MarketplaceApp[] = [
  {
    id: "app-001",
    name: "Bulk Warranty Updater",
    description:
      "Select multiple devices and push warranty date changes in one operation — no clicking through individual records.",
    how_it_works:
      "Fetches all devices matching your filter from ScalePad, lets you set a new warranty date, and bulk-updates all records in one API call.",
    category: "Devices",
    icon: "🛡️",
    status: "active",
    version: "1.2.0",
    author: "ScalePad Team",
    api_endpoint: "/api/v1/devices/warranty",
    input_schema: {
      fields: [
        { name: "client_filter", label: "Client Name", type: "text", placeholder: "All clients" },
        { name: "warranty_date", label: "New Warranty Date", type: "date" },
      ],
    },
    created_at: "2025-01-15T10:00:00Z",
  },
  {
    id: "app-002",
    name: "Client Health Scorer",
    description:
      "Pulls device age, warranty coverage, and risk flags to generate a simple health score per client.",
    how_it_works:
      "Aggregates device data from ScalePad's client summary endpoint, scores each client on warranty coverage and device age, and presents a ranked list.",
    category: "Reporting",
    icon: "📊",
    status: "active",
    version: "0.9.1",
    author: "ScalePad Team",
    api_endpoint: "/api/v1/clients/summary",
    input_schema: {
      fields: [
        { name: "client_filter", label: "Client Name", type: "text", placeholder: "All clients" },
        { name: "min_score", label: "Minimum Score", type: "number", placeholder: "0" },
      ],
    },
    created_at: "2025-02-01T10:00:00Z",
  },
  {
    id: "app-003",
    name: "EOL Alert Generator",
    description:
      "Identifies end-of-life devices across all clients and generates a ready-to-send alert report.",
    how_it_works:
      "Queries the ScalePad EOL endpoint for devices past or nearing end-of-life, groups them by client, and produces a formatted alert report you can share.",
    category: "Alerts",
    icon: "⚠️",
    status: "active",
    version: "1.0.0",
    author: "Community",
    api_endpoint: "/api/v1/devices/eol",
    input_schema: {
      fields: [
        { name: "client_filter", label: "Client Name", type: "text", placeholder: "All clients" },
        { name: "eol_window", label: "EOL Window (months)", type: "number", placeholder: "6" },
      ],
    },
    created_at: "2025-02-10T10:00:00Z",
  },
  {
    id: "app-004",
    name: "12-Month Renewal Planner",
    description:
      "Rolling view of upcoming renewals across all clients. Export to CSV for QBR presentations.",
    how_it_works:
      "Pulls renewal dates from ScalePad, creates a 12-month forward view grouped by client, and lets you export the plan as CSV for presentations.",
    category: "Planning",
    icon: "📅",
    status: "beta",
    version: "0.4.2",
    author: "Community",
    api_endpoint: "/api/v1/renewals",
    input_schema: {
      fields: [
        { name: "client_filter", label: "Client Name", type: "text", placeholder: "All clients" },
        { name: "months_ahead", label: "Months Ahead", type: "number", placeholder: "12" },
      ],
    },
    created_at: "2025-03-01T10:00:00Z",
  },
  {
    id: "app-005",
    name: "Bulk Tag Manager",
    description:
      "Apply, rename, or remove device tags across clients using filter rules — no one-by-one editing.",
    how_it_works:
      "Lets you define tag rules (add, rename, or delete), applies them across all matching devices via ScalePad's tags endpoint, and reports how many were updated.",
    category: "Devices",
    icon: "🏷️",
    status: "active",
    version: "2.1.0",
    author: "ScalePad Team",
    api_endpoint: "/api/v1/devices/tags",
    input_schema: {
      fields: [
        { name: "client_filter", label: "Client Name", type: "text", placeholder: "All clients" },
        { name: "tag_action", label: "Action", type: "select", options: ["Add Tag", "Rename Tag", "Remove Tag"] },
        { name: "tag_value", label: "Tag Value", type: "text", placeholder: "e.g. needs-review" },
      ],
    },
    created_at: "2025-01-20T10:00:00Z",
  },
  {
    id: "app-006",
    name: "CSV Client Importer",
    description:
      "Upload a CSV of new clients and devices and have them mapped and created in ScalePad in seconds.",
    how_it_works:
      "Parses your uploaded CSV, maps columns to ScalePad fields, validates the data, and calls the import endpoint to create clients and devices.",
    category: "Import/Export",
    icon: "📥",
    status: "beta",
    version: "0.2.0",
    author: "Community",
    api_endpoint: "/api/v1/clients/import",
    input_schema: {
      fields: [
        { name: "csv_data", label: "Paste CSV Data", type: "textarea", placeholder: "name,email,device_count\nAcme Inc,admin@acme.com,24" },
      ],
    },
    created_at: "2025-03-05T10:00:00Z",
  },
];
