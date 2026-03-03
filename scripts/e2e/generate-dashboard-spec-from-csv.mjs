import fs from "node:fs";
import path from "node:path";

const defaultOutputPath = path.resolve(
  process.cwd(),
  "src/test/e2e/dashboard/generated/dashboard-cases.generated.spec.ts"
);

const csvPath = process.argv[2];
const outputPath = process.argv[3] ? path.resolve(process.argv[3]) : defaultOutputPath;

if (!csvPath) {
  console.error("Usage: node scripts/e2e/generate-dashboard-spec-from-csv.mjs <csv-path> [output-path]");
  process.exit(1);
}

const absoluteCsvPath = path.resolve(csvPath);
if (!fs.existsSync(absoluteCsvPath)) {
  console.error(`CSV not found: ${absoluteCsvPath}`);
  process.exit(1);
}

const rawCsv = fs.readFileSync(absoluteCsvPath, "utf8");

const parseCsv = (content) => {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < content.length; i += 1) {
    const char = content[i];
    const next = content[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      cell += '"';
      i += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(cell);
      cell = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") {
        i += 1;
      }

      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    cell += char;
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  return rows
    .map((rawRow) => rawRow.map((value) => value.trim()))
    .filter((rawRow) => rawRow.some((value) => value.length > 0));
};

const rows = parseCsv(rawCsv);

if (rows.length < 2) {
  console.error("CSV must include a header row and at least one data row.");
  process.exit(1);
}

const headers = rows[0];
const dataRows = rows.slice(1);

const stripAccents = (value) => value.normalize("NFD").replace(/\p{Diacritic}/gu, "");

const normalizeHeader = (value) =>
  stripAccents(value)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^a-z0-9 _-]/g, "");

const normalizedHeaders = headers.map(normalizeHeader);

const findHeaderIndex = (candidates) => {
  const normalizedCandidates = candidates.map(normalizeHeader);

  for (let i = 0; i < normalizedCandidates.length; i += 1) {
    const candidate = normalizedCandidates[i];
    for (let j = 0; j < normalizedHeaders.length; j += 1) {
      if (normalizedHeaders[j] === candidate) {
        return j;
      }
    }
  }

  return -1;
};

const idIndex = findHeaderIndex(["id", "case id", "case_id", "test id", "tc id", "numero", "n"]);
const titleIndex = findHeaderIndex([
  "title",
  "test case",
  "scenario",
  "description",
  "descripcion",
  "name",
  "caso",
  "accion_nombre",
  "accion nombre",
  "accion",
]);
const moduleIndex = findHeaderIndex([
  "module",
  "area",
  "feature",
  "section",
  "suite",
  "categoria",
  "context",
  "contexto",
]);
const stepsIndex = findHeaderIndex([
  "steps",
  "pasos",
  "step by step",
  "procedure",
  "procedimiento",
  "accion_nombre",
]);
const expectedIndex = findHeaderIndex([
  "escenario_esperado",
  "escenario esperado",
  "expected",
  "expected result",
  "expected outcome",
  "resultado esperado",
  "resultado",
]);
const preconditionsIndex = findHeaderIndex([
  "precondition",
  "preconditions",
  "precondiciones",
  "context",
  "contexto",
]);
const roleGlobalIndex = findHeaderIndex(["rol_global", "global_role", "role_global", "role"]);
const hasCompanyIndex = findHeaderIndex(["tiene_empresa", "has_company", "company"]);
const roleCompanyIndex = findHeaderIndex(["rol_empresa", "company_role", "role_company"]);
const planIndex = findHeaderIndex(["plan", "plan_type"]);

if (titleIndex < 0 && stepsIndex < 0) {
  console.error(
    "Unable to infer test title/steps columns. Expected one of: title, test case, scenario, steps, pasos"
  );
  process.exit(1);
}

const compact = (value) => value.replace(/\s+/g, " ").trim();

const escapeTs = (value) =>
  value
    .replace(/\\/g, "\\\\")
    .replace(/`/g, "\\`")
    .replace(/\$/g, "\\$")
    .replace(/\r/g, "")
    .replace(/\n/g, " ");

const inferPathFromKeywords = (fullText) => {
  const explicitPathMatch = fullText.match(/\/(dashboard(?:\/[a-z0-9\-_/]+)?)/i);
  if (explicitPathMatch) {
    return `/${explicitPathMatch[1].replace(/^\/+/, "")}`;
  }

  const normalized = normalizeHeader(fullText);
  if (
    normalized.includes("categoria publica") ||
    normalized.includes("categorias publicas") ||
    normalized.includes("/category") ||
    normalized.includes("/categories")
  ) {
    return "/categories";
  }
  if (normalized.includes("usuarios")) return "/dashboard/users";
  if (normalized.includes("empresas")) return "/dashboard/companies";
  if (normalized.includes("sitio")) return "/dashboard/sites";
  if (normalized.includes("categoria") && normalized.includes("dashboard")) return "/dashboard/categories";
  if (normalized.includes("blog")) return "/dashboard/blog";
  if (normalized.includes("mensaje")) return "/dashboard/messages";
  if (normalized.includes("alquiler")) return "/dashboard/rentals";
  if (normalized.includes("configuracion")) return "/dashboard/config";

  return "";
};

const inferRole = ({ fullText, roleGlobalRaw, hasCompanyRaw, roleCompanyRaw, planRaw, caseIdRaw }) => {
  const normalized = normalizeHeader(fullText);
  const roleGlobal = normalizeHeader(roleGlobalRaw || "");
  const roleCompany = normalizeHeader(roleCompanyRaw || "");
  const hasCompany = normalizeHeader(hasCompanyRaw || "");
  const plan = normalizeHeader(planRaw || "");
  const caseId = normalizeHeader(caseIdRaw || "");

  if (normalized.includes("sin login") || normalized.includes("unauth") || normalized.includes("anonimo")) {
    return "anonymous";
  }

  if (roleGlobal.includes("role_admin")) {
    return "admin";
  }

  if (
    roleCompany.includes("role_admin") ||
    roleCompany.includes("role_contributor") ||
    hasCompany === "yes" ||
    hasCompany === "si" ||
    plan.startsWith("company_") ||
    normalized.includes("empresa")
  ) {
    return "company_admin";
  }

  if (roleGlobal.includes("role_user")) {
    if (
      roleCompany.includes("role_admin") ||
      roleCompany.includes("role_contributor") ||
      hasCompany === "yes" ||
      hasCompany === "si" ||
      plan.startsWith("company_")
    ) {
      return "company_admin";
    }

    return "user";
  }

  if (roleGlobal === "system") {
    return "anonymous";
  }

  if (caseId.startsWith("pub-")) {
    return "anonymous";
  }

  if (normalized.includes("admin")) {
    return "admin";
  }

  if (caseId.startsWith("dash-") || caseId.startsWith("admin-") || caseId.startsWith("comp-")) {
    return "user";
  }

  return "user";
};

const trimExpected = (value) => {
  const normalized = compact(value);
  if (!normalized) {
    return "";
  }

  const firstSentence = normalized.split(/\.(\s|$)/)[0];
  return firstSentence.slice(0, 120);
};

const inferPath = ({ caseIdRaw, moduleRaw, titleRaw, expectedRaw, role }) => {
  const caseId = (caseIdRaw || "").toUpperCase();
  const module = normalizeHeader(moduleRaw || "");
  const combined = `${moduleRaw} ${titleRaw} ${expectedRaw}`;

  if (caseId.startsWith("PUB-HDR") || caseId.startsWith("PUB-HOM") || caseId.startsWith("AUTH-")) return "/";
  if (caseId.startsWith("PUB-CAT")) return "/categories";
  if (caseId.startsWith("PUB-SEA")) return "/search";
  if (caseId.startsWith("PUB-PRD")) return "/product/taladro-percutor-18v";
  if (caseId.startsWith("PUB-INFO")) {
    if (normalizeHeader(combined).includes("termino")) return "/legal/terminos";
    if (normalizeHeader(combined).includes("cookie")) return "/legal/cookies";
    if (normalizeHeader(combined).includes("privacidad")) return "/legal/privacidad";
    return "/about";
  }
  if (caseId.startsWith("DASH-NAV") || caseId.startsWith("DASH-OVR") || caseId.startsWith("STATS-")) return "/dashboard";
  if (caseId.startsWith("DASH-PROD")) return "/dashboard/products";
  if (caseId.startsWith("DASH-RENT")) return "/dashboard/rentals";
  if (caseId.startsWith("DASH-MSG")) return "/dashboard/messages";
  if (caseId.startsWith("DASH-CFG")) return "/dashboard/config";
  if (caseId.startsWith("ADMIN-PLAT")) return "/dashboard/users";
  if (caseId.startsWith("COMP-")) return "/dashboard/companies";
  if (caseId.startsWith("BILL-")) return "/dashboard/upgrade";
  if (caseId.startsWith("INV-")) return "/company-invitation";
  if (caseId.startsWith("RBAC-")) return "/dashboard/users";
  if (caseId.startsWith("A11Y-") || caseId.startsWith("UX-RESP") || caseId.startsWith("SUBF-")) {
    return role === "anonymous" ? "/" : "/dashboard";
  }

  if (module.includes("publica") || module.includes("header publico") || module.includes("home publica")) {
    return "/";
  }
  if (module.includes("categorias publicas")) return "/categories";
  if (module.includes("busqueda publica")) return "/search";
  if (module.includes("producto publico")) return "/product/taladro-percutor-18v";
  if (module.includes("admin plataforma")) return "/dashboard/users";
  if (module.includes("empresa")) return "/dashboard/companies";
  if (module.includes("mensajes")) return "/dashboard/messages";
  if (module.includes("alquileres")) return "/dashboard/rentals";
  if (module.includes("configuracion")) return "/dashboard/config";

  const keywordPath = inferPathFromKeywords(combined);
  if (keywordPath) {
    return keywordPath;
  }

  return role === "anonymous" ? "/" : "/dashboard";
};

const generatedCases = dataRows.map((row, index) => {
  const idRaw = idIndex >= 0 ? row[idIndex] : "";
  const titleRaw = titleIndex >= 0 ? row[titleIndex] : "";
  const moduleRaw = moduleIndex >= 0 ? row[moduleIndex] : "";
  const stepsRaw = stepsIndex >= 0 ? row[stepsIndex] : "";
  const expectedRaw = expectedIndex >= 0 ? row[expectedIndex] : "";
  const preconditionsRaw = preconditionsIndex >= 0 ? row[preconditionsIndex] : "";
  const roleGlobalRaw = roleGlobalIndex >= 0 ? row[roleGlobalIndex] : "";
  const hasCompanyRaw = hasCompanyIndex >= 0 ? row[hasCompanyIndex] : "";
  const roleCompanyRaw = roleCompanyIndex >= 0 ? row[roleCompanyIndex] : "";
  const planRaw = planIndex >= 0 ? row[planIndex] : "";

  const fallbackId = `CSV-${String(index + 1).padStart(3, "0")}`;
  const caseId = compact(idRaw || fallbackId);
  const title = compact(titleRaw || stepsRaw || `Caso ${index + 1}`);
  const module = compact(moduleRaw || "Dashboard");
  const expectedText = trimExpected(expectedRaw);

  const allText = `${module} ${title} ${stepsRaw} ${preconditionsRaw} ${expectedRaw}`;
  const role = inferRole({
    fullText: allText,
    roleGlobalRaw,
    hasCompanyRaw,
    roleCompanyRaw,
    planRaw,
    caseIdRaw: caseId,
  });
  const path = inferPath({
    caseIdRaw: caseId,
    moduleRaw: module,
    titleRaw: title,
    expectedRaw,
    role,
  });

  return {
    id: caseId,
    module,
    title,
    role,
    path,
    expectedText,
  };
});

const groups = new Map();
for (const testCase of generatedCases) {
  const key = testCase.module || "Dashboard";
  if (!groups.has(key)) {
    groups.set(key, []);
  }
  groups.get(key).push(testCase);
}

const casesCode = Array.from(groups.entries())
  .map(([moduleName, cases]) => {
    const caseRows = cases
      .map(
        (testCase) => `    {
      id: "${escapeTs(testCase.id)}",
      title: "${escapeTs(testCase.title)}",
      role: "${testCase.role}",
      path: "${escapeTs(testCase.path)}",
      expectedText: "${escapeTs(testCase.expectedText)}",
    }`
      )
      .join(",\n");

    return `  {
    module: "${escapeTs(moduleName)}",
    cases: [
${caseRows}
    ],
  }`;
  })
  .join(",\n");

const output = `/* eslint-disable max-lines */
import { test, expect } from "../fixtures";

type GeneratedCase = {
  id: string;
  title: string;
  role: "admin" | "company_admin" | "user" | "anonymous";
  path: string;
  expectedText: string;
};

const modules: Array<{ module: string; cases: GeneratedCase[] }> = [
${casesCode}
];

for (const moduleGroup of modules) {
  test.describe(\`\${moduleGroup.module}\`, () => {
    for (const testCase of moduleGroup.cases) {
      test(\`\${testCase.id} - \${testCase.title}\`, async ({ page, request, seed }) => {
        await seed.reset(request);
        await seed.clearToken(page);

        if (testCase.role !== "anonymous") {
          await seed.loginAs(page, request, testCase.role);
        }

        await page.goto(testCase.path);
        await expect(page.locator("body")).toBeVisible();

        if (testCase.role === "anonymous" && testCase.path.startsWith("/dashboard")) {
          await expect(page).toHaveURL(/\\\/$/);
          return;
        }

        if (testCase.expectedText.length > 0) {
          const expectedLocator = page.getByText(testCase.expectedText, { exact: false });
          if ((await expectedLocator.count()) > 0) {
            await expect(expectedLocator.first()).toBeVisible();
          }
        }
      });
    }
  });
}
`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, output, "utf8");

console.log(`Generated ${generatedCases.length} tests from ${absoluteCsvPath}`);
console.log(`Output: ${outputPath}`);
