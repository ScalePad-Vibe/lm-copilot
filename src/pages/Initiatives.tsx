import { Shell } from "@/components/layout/Shell";
import { ApiKeyGate } from "@/components/layout/ApiKeyGate";
import { InitiativesManager } from "@/components/workspace/InitiativesManager";

export default function Initiatives() {
  return (
    <Shell>
      <ApiKeyGate>
        <InitiativeManagerWorkspace />
      </ApiKeyGate>
    </Shell>
  );
}
