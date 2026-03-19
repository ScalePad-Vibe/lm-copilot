import { Shell } from "@/components/layout/Shell";
import { ApiKeyGate } from "@/components/layout/ApiKeyGate";
import { GoalManagerWorkspace } from "@/components/workspace/GoalManagerWorkspace";

export default function Goals() {
  return (
    <Shell>
      <ApiKeyGate>
        <GoalManagerWorkspace />
      </ApiKeyGate>
    </Shell>
  );
}
