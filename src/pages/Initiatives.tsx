import { Shell } from "@/components/layout/Shell";
import { ApiKeyGate } from "@/components/layout/ApiKeyGate";
import { InitiativesManager } from "@/components/tools/InitiativesManager";

export default function Initiatives() {
  return (
    <Shell>
      <ApiKeyGate>
        <InitiativesManager />
      </ApiKeyGate>
    </Shell>
  );
}
