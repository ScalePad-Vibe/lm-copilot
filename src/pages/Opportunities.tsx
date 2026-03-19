import { Shell } from "@/components/layout/Shell";
import { ApiKeyGate } from "@/components/layout/ApiKeyGate";
import { OpportunitiesWorkspace } from "@/components/workspace/OpportunitiesWorkspace";
import { MarketplaceApp } from "@/lib/constants";

// Minimal app descriptor — OpportunitiesWorkspace only needs this for type compatibility
const OPPS_APP: MarketplaceApp = {
  id: "app-007",
  name: "List Opportunities",
  description: "View all sales opportunities across your clients.",
  how_it_works: "Calls the ScalePad List Opportunities endpoint.",
  category: "Reporting",
  icon: "💰",
  status: "active",
  version: "1.0.0",
  author: "ScalePad Team",
  api_endpoint: "/core/v1/opportunities",
  input_schema: { realApi: true },
  created_at: "2025-03-10T10:00:00Z",
};

export default function Opportunities() {
  return (
    <Shell title="List Opportunities">
      <ApiKeyGate>
        <div className="h-full overflow-y-auto p-6">
          <OpportunitiesWorkspace app={OPPS_APP} />
        </div>
      </ApiKeyGate>
    </Shell>
  );
}
