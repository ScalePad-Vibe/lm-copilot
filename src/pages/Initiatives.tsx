import { Shell } from "@/components/layout/Shell";
import { ApiKeyGate } from "@/components/layout/ApiKeyGate";
import { InitiativeManagerWorkspace } from "@/components/workspace/InitiativeManagerWorkspace";

export default function Initiatives() {
  return (
    <Shell title="Initiative Manager">
      <ApiKeyGate>
        <InitiativeManagerWorkspace />
      </ApiKeyGate>
    </Shell>
  );
}
