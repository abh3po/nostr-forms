module.exports = [
    {
      ignores: [
        "**/node_modules/**",
        "**/dist/**",
        "**/build/**",
        "**/coverage/**",
        "**/public/**",
        "**/.well-known/**",
      ],
    },
    {
      files: ["src/**/*.{js,jsx,ts,tsx}"],
      plugins: {
        react: require("eslint-plugin-react"),
        "react-hooks": require("eslint-plugin-react-hooks"),
        "@typescript-eslint": require("@typescript-eslint/eslint-plugin"),
        import: require("eslint-plugin-import"),
        prettier: require("eslint-plugin-prettier"),
      },
      languageOptions: {
        parser: require("@typescript-eslint/parser"),
        parserOptions: {
          ecmaVersion: 2020,
          sourceType: "module",
          ecmaFeatures: {
            jsx: true,
          },
          project: ["./tsconfig.json"],
        },
      },
      settings: {
        react: {
          version: "detect",
        },
      },
      rules: {
        "react/react-in-jsx-scope": "off",
        "react/prop-types": "off",
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "@typescript-eslint/no-unused-vars": [
          "error",
          { argsIgnorePattern: "^_" },
        ],
        "import/order": [
          "error",
          {
            "newlines-between": "always",
            alphabetize: { order: "asc" },
            groups: [
              "builtin",
              "external",
              "internal",
              "parent",
              "sibling",
              "index",
            ],
          },
        ],
        "prettier/prettier": "error",
        "@typescript-eslint/no-unused-vars": [
          "error",
          {
            argsIgnorePattern: "^_|^[a-z][a-zA-Z0-9]*$",
            varsIgnorePattern: "^_|^[a-z][a-zA-Z0-9]*$",
            caughtErrorsIgnorePattern: "^_|^[a-z][a-zA-Z0-9]*$",
          },
        ],
      },
    },
  ];
  