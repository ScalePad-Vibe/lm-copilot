import { Shell } from "@/components/layout/Shell";
import { ApiKeyGate } from "@/components/layout/ApiKeyGate";
import { GoalsManager } from "@/components/tools/GoalsManager";

export default function Goals() {
  return (
    <Shell>
      <ApiKeyGate>
        <GoalsManager />
      </ApiKeyGate>
    </Shell>
  );
}
