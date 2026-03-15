import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";
import pluginLit from "eslint-plugin-lit";
import pluginWc from "eslint-plugin-wc";
import pluginLitA11y from "eslint-plugin-lit-a11y";
import globals from "globals";

export default tseslint.config(
  {
    ignores: [
      "src/resources/lit-virtualizer/*",
      "homeassistant-frontend/**",
      "build/**",
      "node_modules/**",
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  pluginLit.configs["flat/recommended"],
  pluginWc.configs["flat/recommended"],
  pluginLitA11y.configs.recommended,
  eslintConfigPrettier,
  {
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: { modules: true },
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.browser,
        __DEV__: "readonly",
        __DEMO__: "readonly",
        __BUILD__: "readonly",
        __VERSION__: "readonly",
        __STATIC_PATH__: "readonly",
        Polymer: "writable",
      },
    },
    rules: {
      "no-bitwise": "error",
      "no-console": "error",
      "no-restricted-globals": ["error", "event"],
      "no-restricted-syntax": [
        "error",
        "LabeledStatement",
        "WithStatement",
      ],
      "no-shadow": "off",
      "@typescript-eslint/no-shadow": "error",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-use-before-define": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-unused-expressions": "off",
      "@typescript-eslint/no-require-imports": "off",
      "wc/no-self-class": "off",
      "lit/attribute-value-entities": "off",
    },
  },
);
