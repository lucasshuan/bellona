const WEB_GENERATED = "apps/web/src/lib/apollo/generated/";

const WEB_SKIP = new Set([
  "apps/web/eslint.config.mjs",
  "apps/web/postcss.config.mjs",
  "apps/web/next-env.d.ts",
]);

/** @param {string} file */
const normalize = (file) => file.replaceAll("\\", "/");

/** @param {string} file */
const isWebGenerated = (file) => normalize(file).includes(WEB_GENERATED);

/** @param {string[]} files */
const filterWebSource = (files) =>
  files.filter((f) => {
    const path = normalize(f);
    return !isWebGenerated(path) && !WEB_SKIP.has(path);
  });

/** @param {string[]} files */
const webSourceTasks = (files) => {
  const source = filterWebSource(files);
  if (source.length === 0) return [];
  return [
    `pnpm -C apps/web exec eslint --fix ${source.join(" ")}`,
    `prettier --write --cache ${source.join(" ")}`,
  ];
};

/** @param {string[]} files */
const apiTasks = (files) => [
  `pnpm -C apps/api exec eslint --fix ${files.join(" ")}`,
  `prettier --write --cache ${files.join(" ")}`,
];

/** @param {string[]} files */
const coreTasks = (files) => [
  `pnpm -C packages/core exec eslint --fix ${files.join(" ")}`,
  `prettier --write --cache ${files.join(" ")}`,
];

/** @param {string[]} files */
const dbTasks = (files) => [
  `pnpm -C packages/db exec eslint --fix ${files.join(" ")}`,
  `prettier --write --cache ${files.join(" ")}`,
];

/** @type {import('lint-staged').Configuration} */
export default {
  "apps/web/src/lib/apollo/queries/**/*.ts": "pnpm -C apps/web codegen",
  "apps/web/**/*.{ts,tsx,js,mjs}": webSourceTasks,
  "apps/api/**/*.ts": apiTasks,
  "packages/core/**/*.{ts,tsx,js,mjs}": coreTasks,
  "packages/db/**/*.{ts,tsx,js,mjs}": dbTasks,
  "**/*.{json,md,yml,yaml}": "prettier --write --cache",
};
