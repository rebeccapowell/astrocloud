import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();

const sourceDir = path.join(repoRoot, "dist", "pagefind");
const destinationDir = path.join(repoRoot, "public", "pagefind");

if (!fs.existsSync(sourceDir)) {
  console.error(`Pagefind source directory not found: ${sourceDir}`);
  process.exit(1);
}

fs.rmSync(destinationDir, { recursive: true, force: true });
fs.mkdirSync(path.dirname(destinationDir), { recursive: true });
fs.cpSync(sourceDir, destinationDir, { recursive: true });

console.log(`Copied Pagefind index to: ${destinationDir}`);
