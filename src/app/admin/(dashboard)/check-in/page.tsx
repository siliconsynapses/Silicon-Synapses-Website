import { AdminPageHeader } from "@/app/admin/_components/page-header";
import { requirePage } from "@/lib/admin-guard";
import { CheckInConsole } from "./check-in-console";

export const dynamic = "force-dynamic";

/**
 * QR attendance check-in. Staff scan a participant's pass (or paste its link /
 * token); the server verifies the opaque token and records a single check-in.
 * The scanner never relies on data embedded in the QR beyond the token itself.
 * STAFF-gated (defense in depth beyond the sidebar and layout guards).
 */
export default async function CheckInPage() {
  await requirePage("STAFF");
  return (
    <div>
      <AdminPageHeader
        title="Check-in"
        description="Scan or paste a digital pass to record attendance at the door."
      />
      <CheckInConsole />
    </div>
  );
}
