import { AdminPageHeader } from "@/app/admin/_components/page-header";
import { DbUnavailableNotice } from "@/app/admin/_components/states";
import { requirePage } from "@/lib/admin-guard";
import { DB_UNAVAILABLE } from "@/lib/data/admin";
import { getStoredSiteSettings } from "@/lib/data/site-settings";
import { updateSiteSettings } from "./actions";
import { SettingsForm } from "./settings-form";

export const dynamic = "force-dynamic";

/**
 * Site content editor (ADMIN). Lets the club edit copy, contact details, social
 * links, and homepage stats without a code change — backed by the SiteSetting
 * row. Guarded server-side; the nav entry never grants access on its own.
 */
export default async function SiteSettingsPage() {
  await requirePage("ADMIN");
  const stored = await getStoredSiteSettings();

  return (
    <div className="max-w-2xl">
      <AdminPageHeader
        title="Site content"
        description="Edit the club details, contact info, social links, and homepage stats shown across the public site. Anything left blank keeps the built-in default."
      />
      {stored === DB_UNAVAILABLE ? (
        <DbUnavailableNotice />
      ) : (
        <SettingsForm action={updateSiteSettings} defaultValues={stored} />
      )}
    </div>
  );
}
