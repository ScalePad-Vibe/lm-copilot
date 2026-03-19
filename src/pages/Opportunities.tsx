import { Shell } from "@/components/layout/Shell";
import { ApiKeyGate } from "@/components/layout/ApiKeyGate";
import { OpportunitiesWorkspace } from "@/components/workspace/OpportunitiesWorkspace";

export default function Opportunities() {
  return (
    <Shell>
      <ApiKeyGate>
        <div className="h-full overflow-y-auto p-6">
          <OpportunitiesWorkspace />
        </div>
      </ApiKeyGate>
    </Shell>
  );
}
