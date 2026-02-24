#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);

const getArg = (flag, defaultValue = null) => {
  const index = args.indexOf(flag);
  if (index === -1) return defaultValue;
  const value = args[index + 1];
  if (!value || value.startsWith("--")) return defaultValue;
  return value;
};

const currentPath = getArg("--current");
const basePath = getArg("--base");
const maxDropRaw = getArg("--max-drop", "0");
const minLinesRaw = getArg("--min-lines", "0");

if (!currentPath || !basePath) {
  console.error(
    "Usage: node scripts/check-coverage-regression.mjs --current <coverage-summary.json> --base <coverage-summary.json> [--max-drop <number>] [--min-lines <number>]"
  );
  process.exit(1);
}

const readSummary = (filePath) => {
  const absolutePath = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Coverage summary file not found: ${absolutePath}`);
  }

  const data = JSON.parse(fs.readFileSync(absolutePath, "utf8"));
  const linesPct = Number(data?.total?.lines?.pct);

  if (!Number.isFinite(linesPct)) {
    throw new Error(`Invalid coverage summary format: ${absolutePath}`);
  }

  return linesPct;
};

const formatPct = (value) => `${value.toFixed(2)}%`;

const maxDrop = Number(maxDropRaw);
const minLines = Number(minLinesRaw);

if (!Number.isFinite(maxDrop) || maxDrop < 0) {
  console.error(`Invalid --max-drop value: ${maxDropRaw}`);
  process.exit(1);
}

if (!Number.isFinite(minLines) || minLines < 0) {
  console.error(`Invalid --min-lines value: ${minLinesRaw}`);
  process.exit(1);
}

try {
  const currentLines = readSummary(currentPath);
  const baseLines = readSummary(basePath);
  const drop = baseLines - currentLines;

  console.log(`Base line coverage: ${formatPct(baseLines)}`);
  console.log(`Current line coverage: ${formatPct(currentLines)}`);
  console.log(`Coverage change: ${drop > 0 ? "-" : "+"}${formatPct(Math.abs(drop))}`);
  console.log(`Max allowed drop: ${formatPct(maxDrop)}`);

  if (currentLines < minLines) {
    console.error(
      `Coverage gate failed: current line coverage ${formatPct(currentLines)} is below minimum ${formatPct(minLines)}.`
    );
    process.exit(1);
  }

  if (drop > maxDrop) {
    console.error(
      `Coverage gate failed: coverage dropped by ${formatPct(drop)}, exceeding max allowed ${formatPct(maxDrop)}.`
    );
    process.exit(1);
  }

  console.log("Coverage gate passed.");
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
}

