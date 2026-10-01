"use client";

import Link from "next/link";
import {
  AdminForm,
  type AdminFormAction,
} from "@/app/admin/_components/admin-form";
import {
  TextField,
  TextAreaField,
} from "@/app/admin/_components/form-fields";
import { siteConfig, socialLinks, clubStats } from "@/config/site";
import type { StoredSiteSettings } from "@/lib/data/site-settings";

/**
 * Site content editor. Inputs are pre-filled with whatever the club has saved;
 * the placeholder for each field shows the current fallback (from
 * `@/config/site`), and leaving a field blank keeps that fallback on the public
 * site. The server action re-validates everything before saving.
 */

function SectionHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="border-b border-white/10 pb-2">
      <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-slate-300">
        {title}
      </h2>
      <p className="mt-1 text-xs text-slate-500">{description}</p>
    </div>
  );
}

export function SettingsForm({
  action,
  defaultValues,
}: {
  action: AdminFormAction;
  defaultValues: StoredSiteSettings;
}) {
  const v = defaultValues;
  const stats = v.stats ?? [];

  return (
    <AdminForm action={action} submitLabel="Save site content">
      {(state) => (
        <>
          <SectionHeading
            title="Identity & copy"
            description="The club name and headline shown on the homepage, footer, and page metadata."
          />
          <TextField
            label="Tagline"
            name="tagline"
            defaultValue={v.tagline}
            placeholder={siteConfig.tagline}
            hint="A short headline shown under the hero title."
            error={state.errors?.tagline}
          />
          <TextAreaField
            label="Description"
            name="description"
            rows={3}
            defaultValue={v.description}
            placeholder={siteConfig.description}
            hint="One or two sentences describing the club. Used on the homepage, footer, and About page."
            error={state.errors?.description}
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              label="College name"
              name="college"
              defaultValue={v.college}
              placeholder="e.g. Your College of Engineering"
              hint="Shown on the About and Contact pages."
              error={state.errors?.college}
            />
            <TextField
              label="Department"
              name="department"
              defaultValue={v.department}
              placeholder={siteConfig.department}
              error={state.errors?.department}
            />
          </div>

          <div className="pt-2">
            <SectionHeading
              title="Contact & social"
              description="How people reach the club. Social links left blank are hidden; a valid link must start with http:// or https://."
            />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              label="Email"
              name="email"
              type="email"
              defaultValue={v.email}
              placeholder={socialLinks.email}
              error={state.errors?.email}
            />
            <TextField
              label="Address"
              name="address"
              defaultValue={v.address}
              placeholder="Block / room, campus, city"
              hint="Optional — the physical location shown on Contact."
              error={state.errors?.address}
            />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              label="Instagram URL"
              name="instagram"
              type="url"
              defaultValue={v.instagram}
              placeholder="https://instagram.com/your-handle"
              error={state.errors?.instagram}
            />
            <TextField
              label="LinkedIn URL"
              name="linkedin"
              type="url"
              defaultValue={v.linkedin}
              placeholder="https://linkedin.com/company/…"
              error={state.errors?.linkedin}
            />
            <TextField
              label="GitHub URL"
              name="github"
              type="url"
              defaultValue={v.github}
              placeholder="https://github.com/your-org"
              error={state.errors?.github}
            />
            <TextField
              label="YouTube URL"
              name="youtube"
              type="url"
              defaultValue={v.youtube}
              placeholder="https://youtube.com/@your-channel"
              error={state.errors?.youtube}
            />
          </div>

          <div className="pt-2">
            <SectionHeading
              title="About page"
              description="The club's story, mission, and vision. Left blank, the About page shows placeholder guidance instead."
            />
          </div>
          <TextAreaField
            label="Our story"
            name="story"
            rows={5}
            defaultValue={v.story}
            placeholder="When the club was founded, why it started, key milestones, and what makes it distinct within the department."
            hint="Shown as the opening paragraph on the About page."
            error={state.errors?.story}
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <TextAreaField
              label="Our mission"
              name="mission"
              rows={4}
              defaultValue={v.mission}
              placeholder="The change the club exists to create for its members and the department."
              error={state.errors?.mission}
            />
            <TextAreaField
              label="Our vision"
              name="vision"
              rows={4}
              defaultValue={v.vision}
              placeholder="Where the club is headed and what it aspires to build over the coming years."
              error={state.errors?.vision}
            />
          </div>

          <div className="pt-2">
            <SectionHeading
              title="Homepage stats"
              description="The four figures shown on the homepage and About page. Leave a pair blank to keep the current default."
            />
          </div>
          <div className="space-y-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="grid gap-5 sm:grid-cols-2">
                <TextField
                  label={`Stat ${i + 1} — label`}
                  name={`stat${i + 1}Label`}
                  defaultValue={stats[i]?.label}
                  placeholder={clubStats[i]?.label}
                  error={state.errors?.[`stat${i + 1}Label`]}
                />
                <TextField
                  label={`Stat ${i + 1} — value`}
                  name={`stat${i + 1}Value`}
                  defaultValue={stats[i]?.value}
                  placeholder={clubStats[i]?.value}
                  error={state.errors?.[`stat${i + 1}Value`]}
                />
              </div>
            ))}
          </div>

          <p className="text-xs text-slate-500">
            Changes go live across the public site as soon as you save.{" "}
            <Link href="/" className="text-slate-400 hover:text-accent">
              View the site
            </Link>
            .
          </p>
        </>
      )}
    </AdminForm>
  );
}
