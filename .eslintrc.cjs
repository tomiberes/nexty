"use strict";

const MOD_EXT = ".{js,jsx,cjs,mjs,ts,tsx}";

const JSBaseExtends = ["eslint:recommended", "eslint-config-prettier"];
const JSReactNextExtends = [
  "plugin:react/recommended",
  "plugin:@next/next/recommended",
  "next",
  "next/core-web-vitals",
];
const TSBaseExtends = [
  "plugin:@typescript-eslint/eslint-recommended",
  "plugin:@typescript-eslint/recommended",
];
const CodeRules = {
  // Enforce & treat it with "--fix" option.
  "prettier/prettier": 2,
};

module.exports = {
  root: true,
  env: {
    es2017: true,
    browser: true,
    node: true,
    jest: true,
  },
  ignorePatterns: ["**/node_modules", ".next", "out"],
  extends: [...JSBaseExtends, ...JSReactNextExtends],
  rules: {
    ...CodeRules,
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2017,
    ecmaFeatures: {
      jsx: true,
    },
    sourceType: "module",
  },
  plugins: [
    "@typescript-eslint",
    "@next/eslint-plugin-next",
    "mdx",
    "prettier",
    "react",
  ],
  overrides: [
    {
      files: ["*" + MOD_EXT],
      extends: [...JSBaseExtends, ...TSBaseExtends, ...JSReactNextExtends],
      rules: {
        ...CodeRules,
      },
    },
    {
      files: ["*.md"],
      rules: {
        "prettier/prettier": [
          2,
          {
            // Required to use together w/ `eslint-plugin-prettier`.
            parser: "markdown",
          },
        ],
      },
    },
    {
      files: ["*.mdx"],
      extends: ["plugin:mdx/recommended"],
      rules: {
        "prettier/prettier": [
          1,
          {
            // Required to use together w/ `eslint-plugin-prettier`.
            parser: "mdx",
          },
        ],
      },
      settings: {
        // Optional, to lint code blocks at the same time
        "mdx/code-blocks": true,
        // Optional, to to disable language mapper, set it to `false` to
        // override the default language mapper inside, own can be provided
        "mdx/language-mapper": {},
      },
    },
    {
      files: ["./**/*.test" + MOD_EXT, "./**/__mocks__/**/*" + MOD_EXT],
      env: {
        jest: true,
      },
    },
  ],
};
