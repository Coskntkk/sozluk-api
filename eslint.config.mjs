import globals from "globals";
import pluginJs from "@eslint/js";

/**
 * Single ESLint flat config (ESLint 9+).
 * Legacy `.eslintrc.json` was removed — it was not used when this flat file existed.
 * Previous eslintrc had stylistic rules (tabs, single quotes, etc.) that never ran;
 * add them here deliberately if you want ESLint to enforce style, or use Prettier.
 */
export default [
  { ignores: ["node_modules/**"] },
  pluginJs.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      sourceType: "commonjs",
      ecmaVersion: "latest",
      globals: globals.node,
    },
  },
];
