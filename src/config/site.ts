/**
 * TEMPORARY placeholder content used to scaffold the UI.
 *
 * In a later phase this moves to the database (SiteSetting + Department tables)
 * so the club can edit it from the admin dashboard without code changes.
 *
 *   [DEMO CONTENT]     — sample data, safe to show, replace when convenient.
 *   [CONTENT REQUIRED] — must be replaced with real information before production.
 */

export const siteConfig = {
  name: "Silicon Synapses",
  tagline: "Where Electronics Meets Innovation", // [DEMO CONTENT]
  description:
    "The student technology club of the ECE Department — building across AI/ML, VLSI, embedded systems, competitive programming, and the web.", // [DEMO CONTENT]
  college: "[College Name]", // [CONTENT REQUIRED]
  department: "Department of Electronics & Communication Engineering",
  url: "http://localhost:3000",
} as const;

export type NavItem = { label: string; href: string };

export const navItems: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Departments", href: "/departments" },
  { label: "Events", href: "/events" },
  { label: "Team", href: "/team" },
  { label: "Newton's Apple", href: "/newtons-apple" },
  { label: "Learning", href: "/learning" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

// [CONTENT REQUIRED] — real handles/links before production.
export const socialLinks = {
  instagram: "#",
  linkedin: "#",
  github: "#",
  youtube: "#",
  email: "hello@example.com",
} as const;

export type DepartmentPreview = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  icon: string; // lucide icon name (see icon map in departments-preview.tsx)
  accent: string; // tailwind gradient color stops
};

// [DEMO CONTENT] — seeded for the UI; becomes DB-managed Departments later.
export const departmentsPreview: DepartmentPreview[] = [
  {
    slug: "ai-ml",
    name: "AI / ML",
    tagline: "Intelligent systems",
    description:
      "Machine learning, deep learning, and applied AI — from computer vision to language models.",
    icon: "BrainCircuit",
    accent: "from-cyan-400/25 to-blue-500/10",
  },
  {
    slug: "vlsi",
    name: "VLSI",
    tagline: "Silicon by design",
    description:
      "Digital & analog IC design, RTL, verification, and semiconductor fundamentals.",
    icon: "Cpu",
    accent: "from-violet-400/25 to-fuchsia-500/10",
  },
  {
    slug: "web-development",
    name: "Web Development",
    tagline: "The modern web",
    description:
      "Full-stack engineering and product UI/UX — including the platform you're reading now.",
    icon: "Code2",
    accent: "from-emerald-400/25 to-cyan-500/10",
  },
  {
    slug: "code-mode",
    name: "Code Mode",
    tagline: "Competitive programming",
    description:
      "Data structures, algorithms, and contest practice to sharpen problem-solving.",
    icon: "Terminal",
    accent: "from-amber-400/25 to-orange-500/10",
  },
  {
    slug: "embedded-systems",
    name: "Embedded Systems",
    tagline: "Hardware meets code",
    description:
      "Microcontrollers, IoT, robotics, and real-time systems built close to the metal.",
    icon: "CircuitBoard",
    accent: "from-rose-400/25 to-red-500/10",
  },
];

// [DEMO CONTENT] / [CONTENT REQUIRED] — real numbers before production.
export const clubStats = [
  { label: "Domains", value: "5" },
  { label: "Members", value: "120+" },
  { label: "Events hosted", value: "30+" },
  { label: "Projects", value: "40+" },
];
