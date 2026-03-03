import fs from "node:fs";
import path from "node:path";
import istanbulCoverage from "istanbul-lib-coverage";
import istanbulReport from "istanbul-lib-report";
import reports from "istanbul-reports";

const { createCoverageMap } = istanbulCoverage;
const { createContext } = istanbulReport;

const rawDir = path.resolve(process.cwd(), ".e2e-coverage", "raw");
const outputDir = path.resolve(process.cwd(), "coverage-e2e");
const fullOutputDir = path.resolve(process.cwd(), "coverage-e2e-full");

const scopedCoverageExcludes = [
  "/src/domain/",
  "/src/application/",
  "/src/infrastructure/",
  "/src/hooks/use-toast.ts",
  "/src/components/dashboard/hooks/useAddressMap.ts",
  "/src/components/dashboard/hooks/useProfilePicture.ts",
  "/src/components/dashboard/forms/image-upload/imageUtils.ts",
  "/src/components/dashboard/forms/hooks/useProductForm.ts",
  "/src/components/dashboard/users/UserProductsPage.tsx",
  "/src/components/dashboard/companies/CompanyProductsPage.tsx",
  "/src/pages/ResetPassword.tsx",
  "/src/components/dashboard/rentals/filters/calendar/CalendarNavigation.tsx",
  "/src/components/dashboard/rentals/form/utils/dateTimeUtils.ts",
  "/src/components/dashboard/categories/form/CategoryForm.tsx",
  "/src/components/dashboard/products/hooks/useProductsManagement.ts",
  "/src/components/dashboard/config/hooks/useUserConfig.ts",
  "/src/components/dashboard/upgrade/UpgradePage.tsx",
  "/src/components/dashboard/rentals/details/RentalEditableCard.tsx",
  "/src/components/dashboard/forms/ProductImagesField.tsx",
  "/src/components/dashboard/blog/BlogSingleImageUploader.tsx",
  "/src/pages/BlogPostPage.tsx",
  "/src/components/dashboard/upgrade/steps/ContactInfoStep.tsx",
  "/src/components/dashboard/products/ProductPagination.tsx",
];

if (!fs.existsSync(rawDir)) {
  console.error(`Missing E2E coverage directory: ${rawDir}`);
  console.error("Run E2E coverage tests first.");
  process.exit(1);
}

const coverageFiles = fs
  .readdirSync(rawDir)
  .filter((file) => file.endsWith(".json"))
  .map((file) => path.join(rawDir, file));

if (coverageFiles.length === 0) {
  console.error(`No E2E coverage files found in ${rawDir}`);
  process.exit(1);
}

const coverageMap = createCoverageMap({});

for (const filePath of coverageFiles) {
  try {
    const rawContent = fs.readFileSync(filePath, "utf8");
    const parsedContent = JSON.parse(rawContent);
    coverageMap.merge(parsedContent);
  } catch (error) {
    console.error(`Failed to merge coverage file: ${filePath}`);
    throw error;
  }
}

const scopedCoverageMap = createCoverageMap({});
const includedFiles = [];
const excludedFiles = [];

for (const filePath of coverageMap.files()) {
  const shouldExclude = scopedCoverageExcludes.some((pattern) => filePath.includes(pattern));

  if (shouldExclude) {
    excludedFiles.push(filePath);
    continue;
  }

  includedFiles.push(filePath);
  scopedCoverageMap.addFileCoverage(coverageMap.fileCoverageFor(filePath).toJSON());
}

fs.rmSync(outputDir, { recursive: true, force: true });
fs.rmSync(fullOutputDir, { recursive: true, force: true });
fs.mkdirSync(outputDir, { recursive: true });
fs.mkdirSync(fullOutputDir, { recursive: true });

const emitReports = (context, label) => {
  console.log(`\n[e2e-coverage] ${label}`);
  reports.create("text-summary").execute(context);
  reports.create("json-summary").execute(context);
  reports.create("lcovonly").execute(context);
  reports.create("html").execute(context);
};

const reportContext = createContext({
  dir: outputDir,
  coverageMap: scopedCoverageMap,
  defaultSummarizer: "nested",
});

emitReports(reportContext, "Scoped report summary (coverage-e2e)");

const fullReportContext = createContext({
  dir: fullOutputDir,
  coverageMap,
  defaultSummarizer: "nested",
});

emitReports(fullReportContext, "Full report summary (coverage-e2e-full)");

const scopeMetadataPath = path.join(outputDir, "scope.json");
const scopeMetadata = {
  excludedPatterns: scopedCoverageExcludes,
  includedFiles: includedFiles.sort(),
  excludedFiles: excludedFiles.sort(),
};
fs.writeFileSync(scopeMetadataPath, JSON.stringify(scopeMetadata, null, 2), "utf8");

const fullSummaryPath = path.join(fullOutputDir, "coverage-summary.json");
const scopedSummaryPath = path.join(outputDir, "coverage-summary.json");
const fullSummary = JSON.parse(fs.readFileSync(fullSummaryPath, "utf8"));
const scopedSummary = JSON.parse(fs.readFileSync(scopedSummaryPath, "utf8"));
const fullLinesPct = Number(fullSummary.total?.lines?.pct ?? 0).toFixed(2);
const scopedLinesPct = Number(scopedSummary.total?.lines?.pct ?? 0).toFixed(2);

console.log(`[e2e-coverage] scope includes ${includedFiles.length} files and excludes ${excludedFiles.length} files.`);
console.log(`[e2e-coverage] scoped lines coverage: ${scopedLinesPct}%`);
console.log(`[e2e-coverage] full lines coverage: ${fullLinesPct}%`);
console.log(`Merged ${coverageFiles.length} E2E coverage files.`);
console.log(`Scoped E2E coverage reports available in: ${outputDir}`);
console.log(`Full E2E coverage reports available in: ${fullOutputDir}`);
console.log(`Scope metadata available in: ${scopeMetadataPath}`);
