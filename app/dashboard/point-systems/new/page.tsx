import { requireAuth } from "@/lib/auth-utils";
import { PointSystemForm } from "@/components/PointSystemForm";
import { Card } from "@/components/ui/Card";

export default async function NewPointSystemPage() {
  await requireAuth();

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Create Point System Template
        </h1>
        <p className="text-gray-600 mt-1">
          Define a reusable point system configuration for tournaments
        </p>
      </div>

      <Card padding="lg">
        <PointSystemForm mode="create" />
      </Card>
    </div>
  );
}
