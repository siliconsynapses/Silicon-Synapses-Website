/**
 * Silicon Synapses core team roster — the real club members, roles, and photo
 * filenames provided by the club. Single source of truth shared by:
 *   - scripts/optimize-team-photos.mts — reads Core_team_photos/<photoFile> and
 *     writes the optimized, committed asset public/team/<slug>.jpg, and
 *   - prisma/seed.ts (seedTeam) — create-if-absent with photoUrl /team/<slug>.jpg.
 *
 * `departmentSlug` links a member to a seeded department (src/config/site.ts);
 * office-bearers, digital-team, and logistics roles have no domain (null).
 */

export type RosterMember = {
  /** Full display name as provided by the club. */
  name: string;
  /** Role label shown on the card (the club's own terms). */
  role: string;
  /** Seeded department slug, or null for non-domain roles. */
  departmentSlug: string | null;
  /** Source image filename inside Core_team_photos/. */
  photoFile: string;
  /** URL-safe id → committed asset public/team/<slug>.jpg. */
  slug: string;
};

export const teamRoster: RosterMember[] = [
  // Office bearers
  { name: "K. Harshika", role: "President", departmentSlug: null, photoFile: "Harshika.jpg", slug: "harshika" },
  { name: "R. Sidharth", role: "Vice President", departmentSlug: null, photoFile: "Sidharth.jpg", slug: "sidharth" },
  { name: "K. Akul Kumar", role: "Vice President", departmentSlug: null, photoFile: "Akul.jpg", slug: "akul" },
  { name: "S. Brijeshwar Reddy", role: "Secretary", departmentSlug: null, photoFile: "Brijeshwar.jpg", slug: "brijeshwar" },
  { name: "N. Vishnu", role: "Finance Head", departmentSlug: null, photoFile: "Vishnu.jpg", slug: "vishnu" },

  // VLSI
  { name: "D. Siri Chandana", role: "Domain Lead", departmentSlug: "vlsi", photoFile: "Siri_Chandana.jpg", slug: "siri-chandana" },
  { name: "G. Pranay", role: "Sub-Lead", departmentSlug: "vlsi", photoFile: "Pranay.jpg", slug: "pranay" },
  { name: "Deekshitha Singh", role: "Sub-Lead", departmentSlug: "vlsi", photoFile: "Deekshitha.jpg", slug: "deekshitha" },
  { name: "K. Ashok", role: "Sub-Lead", departmentSlug: "vlsi", photoFile: "Ashok.jpg", slug: "ashok" },

  // AI / ML
  { name: "K. Bhavya", role: "Domain Lead", departmentSlug: "ai-ml", photoFile: "Bhavya.jpg", slug: "bhavya" },
  { name: "Ch. Srikar", role: "Sub-Lead", departmentSlug: "ai-ml", photoFile: "Srikar.jpg", slug: "srikar" },
  { name: "B. Sreekar", role: "Sub-Lead", departmentSlug: "ai-ml", photoFile: "Sreekar.jpg", slug: "sreekar" },
  { name: "G. Vyshnavi", role: "Sub-Lead", departmentSlug: "ai-ml", photoFile: "Vyshnavi.jpg", slug: "vyshnavi" },

  // Embedded Systems
  { name: "A. Vishal", role: "Domain Lead", departmentSlug: "embedded-systems", photoFile: "Vishal.png", slug: "vishal" },
  { name: "Rajkumar", role: "Sub-Lead", departmentSlug: "embedded-systems", photoFile: "Rajkumar.png", slug: "rajkumar" },
  { name: "Y. Satvik", role: "Sub-Lead", departmentSlug: "embedded-systems", photoFile: "Satvik.jpg", slug: "satvik" },
  { name: "B. Swati", role: "Sub-Lead", departmentSlug: "embedded-systems", photoFile: "Swati.png", slug: "swati" },

  // Web Development
  { name: "E. Shivani", role: "Domain Lead", departmentSlug: "web-development", photoFile: "Shivani.jpg", slug: "shivani" },
  { name: "Afsha Fariha", role: "Sub-Lead", departmentSlug: "web-development", photoFile: "Afsha.jpg", slug: "afsha" },
  { name: "K. Yamini", role: "Sub-Lead", departmentSlug: "web-development", photoFile: "Yamini.png", slug: "yamini" },
  { name: "B. Shritha Reddy", role: "Sub-Lead", departmentSlug: "web-development", photoFile: "Shritha.jpg", slug: "shritha" },

  // Code Mode
  { name: "S. Sai Siddharth", role: "Domain Lead", departmentSlug: "code-mode", photoFile: "Sai_Sidharth.jpg", slug: "sai-sidharth" },
  { name: "N. Anurag Reddy", role: "Sub-Lead", departmentSlug: "code-mode", photoFile: "Anurag.jpg", slug: "anurag" },
  { name: "M. Shishir Reddy", role: "Sub-Lead", departmentSlug: "code-mode", photoFile: "Shishir.jpg", slug: "shishir" },

  // Digital team & Logistics (no domain)
  { name: "Bala Koushik", role: "Digital Team Head", departmentSlug: null, photoFile: "Bala_Koushik.png", slug: "bala-koushik" },
  { name: "M. Chaitra", role: "Digital Team Head", departmentSlug: null, photoFile: "Chaitra.jpg", slug: "chaitra" },
  { name: "Koushik Polishetty", role: "Logistics Head", departmentSlug: null, photoFile: "Koushik.png", slug: "koushik" },
];
