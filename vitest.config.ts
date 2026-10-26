import type { Plugin } from "vite";
import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config";

// The @mui/icons-material barrel is ~10,000 modules; loading it made
// collecting a single test take minutes. In tests, rewrite
//   import { Edit, Save as SaveIcon } from "@mui/icons-material";
// to one deep import per icon — the same icons, a few files each. Kept on
// one line so stack traces still point at the right source line.
const splitIconImports: Plugin = {
  name: "split-mui-icon-imports",
  enforce: "pre",
  transform(code, id) {
    if (!/[\/]src[\/].*\.[jt]sx?$/.test(id) || !code.includes("@mui/icons-material")) return null;
    const out = code.replace(
      /import\s*\{([^}]+)\}\s*from\s*["']@mui\/icons-material["'];?/g,
      (_m, names: string) =>
        names
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
          .map((spec) => {
            const [imported, local] = spec.split(/\s+as\s+/).map((s) => s.trim());
            return `import ${local || imported} from "@mui/icons-material/${imported}";`;
          })
          .join(" "),
    );
    return out === code ? null : { code: out, map: null };
  },
};

// Tests run against the same Vite config the app builds with
export default mergeConfig(
  viteConfig,
  defineConfig({
    plugins: [splitIconImports],
    test: {
      environment: "jsdom",
      include: ["src/**/*.test.{ts,tsx}"],
      setupFiles: ["src/test/setup.ts"],
    },
  }),
);
