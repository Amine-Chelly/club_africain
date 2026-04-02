import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const scanDirs = [path.join(root, "src", "app", "[locale]"), path.join(root, "src", "components")];
const baselinePath = path.join(root, "scripts", "i18n-hardcoded-baseline.json");
const updateBaseline = process.argv.includes("--update-baseline");

function normalizeFile(absPath) {
  return path.relative(root, absPath).replaceAll("\\", "/");
}

function looksNaturalLanguage(text) {
  const trimmed = text.trim();
  if (!trimmed) return false;
  if (/^[0-9\s.,:/\-+()&]+$/.test(trimmed)) return false;
  if (trimmed.includes("{") || trimmed.includes("}")) return false;
  return /[A-Za-z\u00C0-\u024F\u0600-\u06FF]/.test(trimmed);
}

function createId(file, line, type, text) {
  return `${file}:${line}:${type}:${text}`;
}

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(full)));
      continue;
    }
    if (entry.isFile() && (full.endsWith(".tsx") || full.endsWith(".jsx"))) {
      files.push(full);
    }
  }
  return files;
}

function scanContent(file, source) {
  const findings = [];
  const lines = source.split(/\r?\n/);
  const rel = normalizeFile(file);

  for (let index = 0; index < lines.length; index += 1) {
    const lineNumber = index + 1;
    const line = lines[index];

    const jsxMatches = line.matchAll(/>\s*([^<{]+?)\s*</g);
    for (const match of jsxMatches) {
      const text = (match[1] ?? "").trim();
      if (!looksNaturalLanguage(text)) continue;
      const type = "jsx-text";
      findings.push({
        id: createId(rel, lineNumber, type, text),
        file: rel,
        line: lineNumber,
        type,
        text,
      });
    }

    const attrMatches = line.matchAll(/\b(placeholder|title|aria-label|alt)\s*=\s*["']([^"']+)["']/g);
    for (const match of attrMatches) {
      const text = (match[2] ?? "").trim();
      if (!looksNaturalLanguage(text)) continue;
      const type = "attr";
      findings.push({
        id: createId(rel, lineNumber, type, text),
        file: rel,
        line: lineNumber,
        type,
        text,
      });
    }
  }

  return findings;
}

async function readBaseline() {
  const raw = await readFile(baselinePath, "utf8");
  return JSON.parse(raw);
}

async function main() {
  const allFiles = (await Promise.all(scanDirs.map(walk))).flat();
  const findings = [];
  for (const file of allFiles) {
    const source = await readFile(file, "utf8");
    findings.push(...scanContent(file, source));
  }

  const uniqueFindings = Array.from(new Map(findings.map((f) => [f.id, f])).values()).sort((a, b) =>
    a.id.localeCompare(b.id),
  );
  const ids = uniqueFindings.map((f) => f.id);

  if (updateBaseline) {
    await writeFile(baselinePath, `${JSON.stringify(ids, null, 2)}\n`, "utf8");
    console.log(`Updated i18n hardcoded-text baseline with ${ids.length} entries.`);
    return;
  }

  const baseline = new Set(await readBaseline());
  const newFindings = uniqueFindings.filter((f) => !baseline.has(f.id));

  if (newFindings.length > 0) {
    console.error(`Found ${newFindings.length} new hardcoded UI text item(s) not in baseline:\n`);
    for (const f of newFindings) {
      console.error(`- ${f.file}:${f.line} [${f.type}] "${f.text}"`);
    }
    console.error(
      "\nUse translations/helpers for UI text, or (only when intentionally accepted) refresh baseline with: npm run i18n:hardcoded:update",
    );
    process.exitCode = 1;
    return;
  }

  console.log(`No new hardcoded UI text (baseline entries: ${baseline.size}).`);
}

await main();

