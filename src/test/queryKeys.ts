// Reads every useQuery/useQueries definition in src/ and reports, for each
// key prefix, which endpoint its queryFn calls and what it returns. Used by
// queryKeys.test.ts to hold the rule in CLAUDE.md §3: a key identifies one
// shape — same key, same endpoint, same return, everywhere.
//
// It reads source text, not a type checker: a key is the literal array after
// `queryKey:`, its prefix the first string in it, and the queryFn is the
// function body after `queryFn:`, matched brace for brace.
import fs from "node:fs";
import path from "node:path";

export type QueryDef = { prefix: string; key: string; where: string; endpoints: string[]; returns: string[] };

const squash = (s: string) => s.replace(/\s+/g, " ").trim();

// The balanced span starting at s[i] (one of "[", "{", "(")
const takeBalanced = (s: string, i: number) => {
  const open = s[i];
  const close = open === "[" ? "]" : open === "{" ? "}" : ")";
  let depth = 0;
  for (let j = i; j < s.length; j++) {
    const c = s[j];
    if (c === '"' || c === "'" || c === "`") {
      // skip string literals (template ${} nesting is rare in queryFns)
      const q = c;
      for (j++; j < s.length && s[j] !== q; j++) if (s[j] === "\\") j++;
      continue;
    }
    if (c === open) depth++;
    else if (c === close && --depth === 0) return s.slice(i, j + 1);
  }
  return null;
};

// Template vars and concatenated ids collapse to :param
const normEndpoint = (e: string) =>
  e.replace(/\$\{[^}]+\}/g, ":param").replace(/['"`]\s*\+\s*[\w.?]+/g, ":param").replace(/['"`]/g, "");

// The queryFn's own body: `queryFn: async () => { ... }`, `queryFn: () => expr`,
// or `queryFn: name` (a function defined elsewhere — returned as null)
const queryFnBody = (src: string, from: number, limit: number) => {
  const rel = src.slice(from, limit).search(/queryFn\s*:/);
  if (rel < 0) return undefined;
  let i = from + rel;
  const arrow = src.slice(i, i + 200).search(/=>/);
  if (arrow < 0) return null;
  i += arrow + 2;
  while (/\s/.test(src[i])) i++;
  if (src[i] === "{") return takeBalanced(src, i);
  // expression body: up to the end of the property
  const m = src.slice(i).match(/^[\s\S]*?(?=,\s*\n|\n\s*\}\s*\)|\n\s*\})/);
  return m ? `{ return ${m[0]} }` : null;
};

// Top-level `return` statements of a function body (not nested callbacks)
const topLevelReturns = (body: string) => {
  const out: string[] = [];
  let depth = 0;
  for (let j = 0; j < body.length; j++) {
    const c = body[j];
    if (c === '"' || c === "'" || c === "`") {
      const q = c;
      for (j++; j < body.length && body[j] !== q; j++) if (body[j] === "\\") j++;
      continue;
    }
    if (c === "{" || c === "(" || c === "[") depth++;
    else if (c === "}" || c === ")" || c === "]") depth--;
    // depth 1 = directly inside the body's braces; also count try { } blocks
    else if (body.startsWith("return", j) && !/\w/.test(body[j - 1] || "") && !/\w/.test(body[j + 6] || "")) {
      const inTry = depth === 2 && /try\s*\{[^{}]*$/.test(body.slice(0, j).replace(/\{[^{}]*\}/g, ""));
      if (depth === 1 || inTry) {
        const end = body.slice(j).search(/;|\n/);
        out.push(squash(body.slice(j + 6, j + (end < 0 ? body.length : end))));
      }
    }
  }
  return out;
};

export function collectQueryDefs(srcRoot: string): QueryDef[] {
  const files: string[] = [];
  const walk = (d: string) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (/\.(ts|tsx)$/.test(e.name) && !/\.test\.tsx?$/.test(e.name) && !p.includes(`${path.sep}test${path.sep}`)) files.push(p);
    }
  };
  walk(srcRoot);

  const defs: QueryDef[] = [];
  for (const file of files) {
    // Commented-out code isn't a query; blank it, keeping line numbers
    const src = fs
      .readFileSync(file, "utf8")
      .replace(/^\s*\/\/.*$/gm, "")
      .replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, ""));
    const rel = path.relative(path.dirname(srcRoot), file).replace(/\\/g, "/");
    const keyAts = [...src.matchAll(/queryKey\s*:\s*\[/g)].map((m) => ({ idx: m.index!, at: m.index! + m[0].length - 1 }));
    keyAts.forEach(({ idx, at }, n) => {
      const before = src.slice(Math.max(0, idx - 80), idx);
      // invalidateQueries({ queryKey }) etc. are references, not definitions
      if (/(invalidate|refetch|remove|cancel|reset)Queries\s*\(\s*\{?\s*$|(set|get)QueryData\s*\(\s*$/.test(before)) return;
      const key = squash(takeBalanced(src, at) || "");
      const limit = n + 1 < keyAts.length ? keyAts[n + 1].idx : src.length;
      const body = queryFnBody(src, at, Math.min(limit, at + 1500));
      if (body === undefined) return; // no queryFn: not a definition
      const prefix = (key.match(/^\[\s*(['"`])([^'"`]+)\1/) || [])[2] || "(dynamic)";
      const endpoints = body
        ? [...body.matchAll(/(?:SERVER|axios)\.(get|post|put|delete)\(\s*([`'"][^`'"]*[`'"](?:\s*\+\s*[\w.?]+)?)/g)]
            .map((x) => `${x[1].toUpperCase()} ${normEndpoint(x[2])}`)
        : [];
      const returns = body ? topLevelReturns(body) : [];
      defs.push({ prefix, key, where: `${rel}:${src.slice(0, idx).split("\n").length}`, endpoints: [...new Set(endpoints)], returns: [...new Set(returns)] });
    });
  }
  return defs;
}
