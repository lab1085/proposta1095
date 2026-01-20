import { ProposalForm } from "@/components/proposal-form";

export default function Home() {
  return (
    <div className="min-h-screen bg-secondary">
      <main className="container py-8">
        <ProposalForm />
      </main>
    </div>
  );
}
