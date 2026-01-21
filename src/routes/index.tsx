import { createFileRoute } from "@tanstack/react-router";
import { ProposalForm } from "~/components/proposal-form";

export const Route = createFileRoute("/")({
  component: () => <ProposalForm />,
});
