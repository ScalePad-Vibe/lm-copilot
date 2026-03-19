import { Shell } from "@/components/layout/Shell";
import { ApiKeyGate } from "@/components/layout/ApiKeyGate";
import { OpportunitiesManager } from "@/components/tools/OpportunitiesManager";

export default function Opportunities() {
  return (
    <Shell>
      <ApiKeyGate>
        <div className="h-full overflow-y-auto p-6">
          <OpportunitiesManager />
        </div>
      </ApiKeyGate>
    </Shell>
  );
}
