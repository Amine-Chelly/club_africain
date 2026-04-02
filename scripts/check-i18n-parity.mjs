import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const messagesDir = path.join(root, "src", "messages");
const locales = ["en", "fr", "ar"];

function collectKeys(value, prefix = "") {
  if (value === null) return [];
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => collectKeys(item, `${prefix}[${index}]`));
  }
  if (typeof value === "object") {
    return Object.entries(value).flatMap(([key, child]) => {
      const next = prefix ? `${prefix}.${key}` : key;
      return collectKeys(child, next);
    });
  }
  return [prefix];
}

async function readLocale(locale) {
  const filePath = path.join(messagesDir, `${locale}.json`);
  const raw = await readFile(filePath, "utf8");
  const parsed = JSON.parse(raw);
  const keys = new Set(collectKeys(parsed));
  return { locale, keys };
}

async function main() {
  const localeMaps = await Promise.all(locales.map(readLocale));
  const allKeys = new Set();
  for (const { keys } of localeMaps) {
    for (const key of keys) allKeys.add(key);
  }

  let hasErrors = false;
  for (const { locale, keys } of localeMaps) {
    const missing = [];
    for (const key of allKeys) {
      if (!keys.has(key)) missing.push(key);
    }
    if (missing.length > 0) {
      hasErrors = true;
      console.error(`\n[${locale}] is missing ${missing.length} translation key(s):`);
      for (const key of missing) {
        console.error(`- ${key}`);
      }
    }
  }

  if (hasErrors) {
    process.exitCode = 1;
    return;
  }

  console.log(`i18n parity OK (${allKeys.size} keys in en/fr/ar).`);
}

await main();

