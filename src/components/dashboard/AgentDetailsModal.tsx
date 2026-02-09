import { AgentPerformance } from "@/types/dashboard";
import { Modal } from "@/components/ui/Modal";

type AgentDetailsModalProps = {
  agent: AgentPerformance | null;
  onClose: () => void;
};

export function AgentDetailsModal({ agent, onClose }: AgentDetailsModalProps) {
  return (
    <Modal isOpen={Boolean(agent)} title="Agent Details" onClose={onClose}>
      {agent ? (
        <div className="space-y-2">
          <p>
            <span className="font-medium">Name:</span> {agent.name}
          </p>
          <p>
            <span className="font-medium">Sales:</span> ${agent.sales.toLocaleString()}
          </p>
          <p>
            <span className="font-medium">Target:</span> ${agent.target.toLocaleString()}
          </p>
          <p>
            <span className="font-medium">Conversion Rate:</span> {agent.conversionRate}%
          </p>
          <p>
            <span className="font-medium">Status:</span> {agent.status}
          </p>
        </div>
      ) : null}
    </Modal>
  );
}
