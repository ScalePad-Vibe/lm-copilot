import { useAuth } from "@/context/AuthContext";
import { ApiKeyPrompt } from "./ApiKeyPrompt";

interface ApiKeyGateProps {
  children: React.ReactNode;
}

export function ApiKeyGate({ children }: ApiKeyGateProps) {
  const { hasApiKey } = useAuth();
  if (hasApiKey) return <>{children}</>;
  return <ApiKeyPrompt />;
}
