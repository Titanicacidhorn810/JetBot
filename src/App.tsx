import { useConfigStore } from './store/configStore';
import { useAgentStore } from './store/agentStore';
import { WelcomeScreen } from './components/WelcomeScreen';
import { ChatPanel } from './components/ChatPanel';
import { InputBar } from './components/InputBar';
import { StatusBar } from './components/StatusBar';
import { PermissionDialog } from './components/PermissionDialog';

export default function App() {
  const isConfigured = useConfigStore(s => s.validate().valid);
  const agent = useAgentStore(s => s.agent);

  if (!isConfigured || !agent) {
    return (
      <div className="flex flex-col h-dvh bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
        <WelcomeScreen />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-dvh bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <StatusBar />
      <ChatPanel />
      <InputBar />
      <PermissionDialog />
    </div>
  );
}
