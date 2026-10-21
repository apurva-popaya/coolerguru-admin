import { PlanEditor } from "../../_components/plan-editor";

export default async function EditPlanPage({ params }: { params: Promise<{ planId: string }> }) {
  const { planId } = await params;
  return <PlanEditor planId={planId} />;
}
