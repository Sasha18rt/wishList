// scripts/gen-api.mjs
import { promises as fs } from "node:fs";
import path from "node:path";

const API_ROOT = path.resolve(process.cwd(), "app", "api");
const HTTP_METHODS = ["GET","POST","PATCH","PUT","DELETE","OPTIONS","HEAD"];

async function* walk(dir) {
  for (const d of await fs.readdir(dir, { withFileTypes: true })) {
    const entry = path.join(dir, d.name);
    if (d.isDirectory()) yield* walk(entry);
    else yield entry;
  }
}

function toPathFromDir(dirAbs) {
  // app/api/foo/bar/[id]/route.ts -> /api/foo/bar/{id}
  const rel = path.relative(API_ROOT, dirAbs);
  const parts = rel.split(path.sep).filter(Boolean);
  const cleaned = parts
    .map(p => p.replace(/\[(\.\.\.)?(.+?)\]/g, (_, splat, name) => splat ? `{${name}*}` : `{${name}}`))
    .join("/");
  return "/api/" + cleaned;
}

function extractMethods(src) {
  const methods = new Set();
  const regex = /export\s+async?\s*function\s+(GET|POST|PATCH|PUT|DELETE|OPTIONS|HEAD)\s*\(/g;
  for (const _m of src.matchAll(regex)) methods.add(_m[1]);
  return [...methods];
}

function mdTable(paths) {
  let md = `| Method | Path |\n|---:|---|\n`;
  for (const { path, methods } of paths) {
    methods.forEach(m => { md += `| ${m} | \`${path}\` |\n`; });
  }
  return md;
}

function openApiSkeleton(paths) {
  const pathsObj = {};
  for (const { path: p, methods } of paths) {
    pathsObj[p] = pathsObj[p] || {};
    for (const m of methods) {
      pathsObj[p][m.toLowerCase()] = {
        summary: `${m} ${p}`,
        responses: { "200": { description: "OK" } }
      };
    }
  }
  return {
    openapi: "3.0.3",
    info: { title: "Wishlify API", version: "1.0.0" },
    paths: pathsObj
  };
}

async function main() {
  const entries = [];
  for await (const file of walk(API_ROOT)) {
    if (!file.endsWith(path.sep + "route.ts")) continue;
    const dir = path.dirname(file);
    const p = toPathFromDir(path.relative(API_ROOT, dir));
    const src = await fs.readFile(file, "utf8");
    const methods = extractMethods(src).filter(m => HTTP_METHODS.includes(m));
    if (methods.length) entries.push({ path: p, methods });
  }

  entries.sort((a,b) => a.path.localeCompare(b.path));

  // Вивід у консоль
  console.log("\n# API Inventory (Markdown)\n");
  console.log(mdTable(entries));

  const openapi = openApiSkeleton(entries);
  await fs.mkdir("generated", { recursive: true });
  await fs.writeFile("generated/openapi.json", JSON.stringify(openapi, null, 2));
  console.log("\nSaved OpenAPI skeleton to generated/openapi.json");
}

main().catch(e => { console.error(e); process.exit(1); });
