import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();

const scanRoots = ["src", "scripts/e2e"].map((entry) => path.join(rootDir, entry));
const ignoredDirs = new Set(["node_modules", "dist", "coverage", "coverage-e2e", "coverage-e2e-full", ".e2e-coverage"]);

const rules = [
  {
    name: "body-only route assertion",
    pattern: /locator\((["'])body\1\)\)\.(?:toHaveCount\(1\)|toBeVisible\(\))/,
  },
  {
    name: "conditional expected text assertion",
    pattern: /expectedLocator\.count\(\)/,
  },
  {
    name: "coverage persistence skip in test",
    pattern: /skipCoveragePersistence/,
    allowFile: (filePath) => filePath.endsWith(`${path.sep}fixtures.ts`),
  },
  {
    name: "frontend coverage ignore directive",
    pattern: /istanbul ignore|c8 ignore|v8 ignore/,
  },
];

const files = [];

const walk = (entry) => {
  if (!fs.existsSync(entry)) {
    return;
  }

  const stat = fs.statSync(entry);

  if (stat.isDirectory()) {
    if (ignoredDirs.has(path.basename(entry))) {
      return;
    }

    for (const child of fs.readdirSync(entry)) {
      walk(path.join(entry, child));
    }

    return;
  }

  if (/\.(?:[cm]?[jt]sx?)$/.test(entry)) {
    files.push(entry);
  }
};

for (const scanRoot of scanRoots) {
  walk(scanRoot);
}

const violations = [];

for (const filePath of files) {
  const relativePath = path.relative(rootDir, filePath);
  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);

  for (const [index, line] of lines.entries()) {
    for (const rule of rules) {
      if (rule.allowFile?.(filePath)) {
        continue;
      }

      if (rule.pattern.test(line)) {
        violations.push(`${relativePath}:${index + 1} ${rule.name}`);
      }
    }
  }
}

if (violations.length > 0) {
  console.error("Meaningful test guard failed:");
  for (const violation of violations) {
    console.error(`- ${violation}`);
  }
  process.exit(1);
}

console.log("Meaningful test guard passed.");
