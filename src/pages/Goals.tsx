import { Shell } from "@/components/layout/Shell";
import { ApiKeyGate } from "@/components/layout/ApiKeyGate";
import { GoalsManager } from "@/components/workspace/GoalsManager";

export default function Goals() {
  return (
    <Shell>
      <ApiKeyGate>
        <GoalManagerWorkspace />
      </ApiKeyGate>
    </Shell>
  );
}
