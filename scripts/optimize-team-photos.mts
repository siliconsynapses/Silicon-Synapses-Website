/**
 * One-off: optimize the club-provided core team photos into committed web assets.
 *
 * For each roster entry it reads Core_team_photos/<photoFile> and writes a
 * 512×512 cover-cropped JPEG to public/team/<slug>.jpg. Those outputs are what
 * gets committed to the repo (the raw Core_team_photos/ folder is git-ignored),
 * so the Team page renders in any environment without the originals.
 *
 * Run with:  npm run team:photos
 */
import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { teamRoster } from "../prisma/team-roster";

const SRC_DIR = path.join(process.cwd(), "Core_team_photos");
const OUT_DIR = path.join(process.cwd(), "public", "team");

async function fileExists(p: string): Promise<boolean> {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  let done = 0;
  const missing: string[] = [];

  for (const member of teamRoster) {
    const src = path.join(SRC_DIR, member.photoFile);
    if (!(await fileExists(src))) {
      missing.push(`${member.name} → ${member.photoFile}`);
      continue;
    }

    const input = await readFile(src);
    const output = await sharp(input)
      .rotate() // honor EXIF orientation before cropping
      .resize(512, 512, { fit: "cover", position: "attention" })
      .jpeg({ quality: 82, mozjpeg: true })
      .toBuffer();
    await writeFile(path.join(OUT_DIR, `${member.slug}.jpg`), output);
    done += 1;
    console.log(`✔ ${member.name} → public/team/${member.slug}.jpg`);
  }

  console.log(`\nOptimized ${done}/${teamRoster.length} photos → public/team/`);
  if (missing.length > 0) {
    console.warn(
      `\n⚠ Missing ${missing.length} source photo(s) in Core_team_photos/:\n` +
        missing.map((m) => `   - ${m}`).join("\n"),
    );
  }
}

main().catch((error) => {
  console.error("❌ Photo optimization failed:", error);
  process.exit(1);
});
