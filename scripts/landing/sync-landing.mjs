import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const projectRoot = process.cwd();

const parseArgs = (argv) => {
  const parsed = {
    build: false,
    install: false,
    landingRoot: undefined,
    sourceDist: undefined,
    target: undefined,
  };

  for (const arg of argv) {
    if (arg === '--build') {
      parsed.build = true;
      continue;
    }

    if (arg === '--install') {
      parsed.install = true;
      continue;
    }

    if (arg.startsWith('--landing-root=')) {
      parsed.landingRoot = arg.slice('--landing-root='.length);
      continue;
    }

    if (arg.startsWith('--source-dist=')) {
      parsed.sourceDist = arg.slice('--source-dist='.length);
      continue;
    }

    if (arg.startsWith('--target=')) {
      parsed.target = arg.slice('--target='.length);
      continue;
    }

    if (arg === '--help') {
      console.log('Usage: node scripts/landing/sync-landing.mjs [--build] [--install] [--landing-root=../appquilar-landing1] [--source-dist=../appquilar-landing1/dist] [--target=public/landing]');
      process.exit(0);
    }
  }

  return parsed;
};

const toAbsolutePath = (value) => (path.isAbsolute(value) ? value : path.resolve(projectRoot, value));

const isDirectory = (candidatePath) => {
  if (!candidatePath) {
    return false;
  }

  try {
    return fs.statSync(candidatePath).isDirectory();
  } catch {
    return false;
  }
};

const resolveLandingRoot = (explicitLandingRoot) => {
  const envLandingRoot = process.env.APPQUILAR_LANDING_ROOT;
  const candidates = [
    explicitLandingRoot,
    envLandingRoot,
    path.resolve(projectRoot, '../appquilar-landing'),
    path.resolve(projectRoot, '../appquilar-landing1'),
  ]
    .filter(Boolean)
    .map(toAbsolutePath);

  for (const candidate of candidates) {
    if (isDirectory(candidate)) {
      return candidate;
    }
  }

  return null;
};

const run = (command, args, cwd) => {
  const result = spawnSync(command, args, {
    cwd,
    stdio: 'inherit',
    env: process.env,
    shell: process.platform === 'win32',
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

const normalizeLandingIndex = (indexHtmlPath) => {
  if (!fs.existsSync(indexHtmlPath)) {
    throw new Error(`Landing index was not found at ${indexHtmlPath}`);
  }

  const rawHtml = fs.readFileSync(indexHtmlPath, 'utf8');
  const landingPathScript = `<script>(() => { const requestedPath = new URLSearchParams(window.location.search).get('appquilar_landing_path'); if (!requestedPath || !requestedPath.startsWith('/')) return; window.history.replaceState(window.history.state, '', requestedPath); })();</script>`;

  let normalizedHtml = rawHtml
    .replace(/(src|href)=(["'])\/assets\//g, '$1=$2/landing/assets/')
    .replace(/href=(["'])\/favicon\.ico\1/g, 'href=$1/landing/favicon.ico$1');

  if (!normalizedHtml.includes('appquilar_landing_path')) {
    normalizedHtml = normalizedHtml.replace('<script type="module"', `${landingPathScript}\n    <script type="module"`);
  }

  fs.writeFileSync(indexHtmlPath, normalizedHtml, 'utf8');
};

const normalizeLandingBundles = (assetsDir) => {
  if (!isDirectory(assetsDir)) {
    return;
  }

  const bundleFiles = fs
    .readdirSync(assetsDir)
    .filter((fileName) => fileName.endsWith('.js') || fileName.endsWith('.css'));

  for (const fileName of bundleFiles) {
    const filePath = path.join(assetsDir, fileName);
    const raw = fs.readFileSync(filePath, 'utf8');
    const normalized = raw
      .replace(/"\/assets\//g, '"/landing/assets/')
      .replace(/'\/assets\//g, "'/landing/assets/")
      .replace(/\(\/assets\//g, '(/landing/assets/')
      .replace(/url\(\/assets\//g, 'url(/landing/assets/');

    if (normalized !== raw) {
      fs.writeFileSync(filePath, normalized, 'utf8');
    }
  }
};

const main = () => {
  const args = parseArgs(process.argv.slice(2));

  const landingRoot = resolveLandingRoot(args.landingRoot);
  if (!landingRoot) {
    console.error('Unable to find landing folder. Checked: --landing-root, APPQUILAR_LANDING_ROOT, ../appquilar-landing, ../appquilar-landing1');
    process.exit(1);
  }

  if (args.install) {
    console.log(`[landing-sync] Installing landing dependencies in ${landingRoot}`);
    run('npm', ['install'], landingRoot);
  }

  if (args.build) {
    console.log(`[landing-sync] Building landing in ${landingRoot}`);
    run('npm', ['run', 'build'], landingRoot);
  }

  const sourceDist = toAbsolutePath(args.sourceDist ?? path.join(landingRoot, 'dist'));
  if (!isDirectory(sourceDist)) {
    console.error(`Landing dist directory was not found: ${sourceDist}`);
    console.error('Run the build first or pass --source-dist=/absolute/path/to/dist');
    process.exit(1);
  }

  const targetDir = toAbsolutePath(args.target ?? 'public/landing');

  fs.rmSync(targetDir, { recursive: true, force: true });
  fs.mkdirSync(targetDir, { recursive: true });
  fs.cpSync(sourceDist, targetDir, { recursive: true, force: true });

  normalizeLandingIndex(path.join(targetDir, 'index.html'));
  normalizeLandingBundles(path.join(targetDir, 'assets'));

  console.log(`[landing-sync] Landing synced from ${sourceDist}`);
  console.log(`[landing-sync] Output available at ${targetDir}`);
};

main();
