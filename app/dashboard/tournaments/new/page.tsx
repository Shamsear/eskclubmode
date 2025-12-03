import { requireAuth } from "@/lib/auth-utils";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { TournamentForm } from "@/components/TournamentForm";
import { Breadcrumb } from "@/components/Breadcrumb";

export default async function NewTournamentPage() {
  await requireAuth();

  return (
    <div>
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Tournaments", href: "/dashboard/tournaments" },
          { label: "New Tournament" },
        ]}
      />

      <div className="mb-6">
        <Link
          href="/dashboard/tournaments"
          className="text-blue-600 hover:text-blue-800 flex items-center gap-2 mb-4"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Tournaments
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Create Tournament</h1>
        <p className="text-gray-600 mt-1">
          Create a new system-wide tournament with custom point configuration
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tournament Information</CardTitle>
        </CardHeader>
        <CardContent>
          <TournamentForm mode="create" />
        </CardContent>
      </Card>
    </div>
  );
}
