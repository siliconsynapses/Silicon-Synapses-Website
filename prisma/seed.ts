/**
 * Idempotent database seed.
 *
 * Safe to run repeatedly (uses upserts / create-if-absent). It seeds:
 *   - Resource categories (structural taxonomy)
 *   - Departments (from src/config/site.ts)
 *   - The real team roster (from prisma/team-roster.ts; create-if-absent)
 *   - A demo learning branch + subjects              [DEMO CONTENT]
 *   - A demo magazine issue and event (unpublished)  [DEMO CONTENT]
 *   - The first SUPER_ADMIN — ONLY from env vars; never fabricated.
 *
 * Real club content (events, magazines, resources) is entered through the admin
 * dashboard. The team roster is the exception: the club provided the real names,
 * roles, and photos, so seedTeam() imports them (create-if-absent) from
 * prisma/team-roster.ts, with photos committed under public/team.
 *
 * Run with:  npm run db:seed
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { departmentsPreview } from "../src/config/site";
import { teamRoster } from "./team-roster";

const db = new PrismaClient();

async function seedResourceCategories() {
  const categories = [
    { slug: "notes", name: "Notes" },
    { slug: "pyqs", name: "Previous Year Questions" },
    { slug: "reference-books", name: "Reference Books" },
    { slug: "video-lectures", name: "Video Lectures" },
    { slug: "lab-manuals", name: "Lab Manuals" },
  ];

  for (const category of categories) {
    await db.resourceCategory.upsert({
      where: { slug: category.slug },
      update: { name: category.name },
      create: category,
    });
  }
  console.log(`✔ Resource categories (${categories.length})`);
}

async function seedDepartments() {
  for (const [index, dept] of departmentsPreview.entries()) {
    await db.department.upsert({
      where: { slug: dept.slug },
      update: {
        name: dept.name,
        tagline: dept.tagline,
        description: dept.description,
        icon: dept.icon,
        accent: dept.accent,
        order: index,
      },
      create: {
        slug: dept.slug,
        name: dept.name,
        tagline: dept.tagline,
        description: dept.description,
        icon: dept.icon,
        accent: dept.accent,
        order: index,
        isActive: true,
      },
    });
  }
  console.log(`✔ Departments (${departmentsPreview.length})`);
}

async function seedTeam() {
  // Real club roster (names, roles, photos) provided by the club. Photos are
  // committed as optimized static assets under public/team (produced by
  // scripts/optimize-team-photos.mts). Non-destructive: create-if-absent by name
  // so admin edits and additions survive re-seeds.
  const departments = await db.department.findMany({
    select: { id: true, slug: true },
  });
  const deptIdBySlug = new Map(departments.map((d) => [d.slug, d.id]));

  let created = 0;
  for (const [index, member] of teamRoster.entries()) {
    const existing = await db.teamMember.findFirst({ where: { name: member.name } });
    if (existing) continue;

    await db.teamMember.create({
      data: {
        name: member.name,
        role: member.role,
        photoUrl: `/team/${member.slug}.jpg`,
        departmentId: member.departmentSlug
          ? deptIdBySlug.get(member.departmentSlug) ?? null
          : null,
        order: index,
        isActive: true,
      },
    });
    created += 1;
  }
  console.log(
    `✔ Team roster (${created} created, ${teamRoster.length - created} already present)`,
  );
}

async function seedDemoLearning() {
  const branch = await db.branch.upsert({
    where: { slug: "ece" },
    update: { name: "Electronics & Communication" },
    create: { slug: "ece", name: "Electronics & Communication" },
  });

  // [DEMO CONTENT] — illustrative subjects; replace with the real curriculum.
  const subjects = [
    { name: "Signals & Systems", code: "EC301", semester: 3 },
    { name: "Digital Electronics", code: "EC302", semester: 3 },
    { name: "Analog Circuits", code: "EC401", semester: 4 },
  ];

  for (const subject of subjects) {
    await db.subject.upsert({
      where: {
        branchId_semester_name: {
          branchId: branch.id,
          semester: subject.semester,
          name: subject.name,
        },
      },
      update: { code: subject.code },
      create: {
        branchId: branch.id,
        semester: subject.semester,
        name: subject.name,
        code: subject.code,
      },
    });
  }
  console.log(`✔ Demo learning branch + subjects (${subjects.length})`);
}

async function seedDemoContent() {
  // Kept UNPUBLISHED/DRAFT so demo data never masquerades as real content.
  await db.magazine.upsert({
    where: { slug: "newtons-apple-vol-1" },
    update: {},
    create: {
      slug: "newtons-apple-vol-1",
      title: "Newton's Apple — Vol. 1",
      issue: "Vol. 1",
      description:
        "[DEMO CONTENT] Placeholder issue. Replace with the real magazine archive.",
      isPublished: false,
    },
  });

  await db.event.upsert({
    where: { slug: "demo-tech-talk" },
    update: {},
    create: {
      slug: "demo-tech-talk",
      title: "[DEMO CONTENT] Intro Tech Talk",
      summary:
        "Sample event so listings, registration, and QR attendance can be exercised in development.",
      description:
        "[DEMO CONTENT] Replace with a real event before publishing. Kept as DRAFT so it is not publicly visible.",
      venue: "[ASSET REQUIRED] Venue",
      startsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      status: "DRAFT",
    },
  });
  console.log("✔ Demo magazine + event (hidden)");
}

async function seedSuperAdmin() {
  const email = process.env.SEED_SUPERADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_SUPERADMIN_PASSWORD;
  const name = process.env.SEED_SUPERADMIN_NAME?.trim() || "Club Admin";

  if (!email || !password) {
    console.log(
      "ℹ Skipped super-admin (set SEED_SUPERADMIN_EMAIL and SEED_SUPERADMIN_PASSWORD to create one).",
    );
    return;
  }

  if (password.length < 8) {
    console.warn(
      "⚠ SEED_SUPERADMIN_PASSWORD is shorter than 8 characters — skipping. Use a strong password.",
    );
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  // On re-seed we do NOT reset the password (avoid surprise credential resets);
  // we only ensure the account is an active super-admin.
  await db.user.upsert({
    where: { email },
    update: { role: "SUPER_ADMIN", isActive: true },
    create: {
      email,
      name,
      hashedPassword,
      role: "SUPER_ADMIN",
      isActive: true,
    },
  });
  console.log(`✔ Super-admin ready: ${email}`);
}

async function main() {
  console.log("→ Seeding database…");
  await seedResourceCategories();
  await seedDepartments();
  await seedTeam();
  await seedDemoLearning();
  await seedDemoContent();
  await seedSuperAdmin();
  console.log("✅ Seed complete.");
}

main()
  .then(async () => {
    await db.$disconnect();
  })
  .catch(async (error) => {
    console.error("❌ Seed failed:", error);
    await db.$disconnect();
    process.exit(1);
  });
