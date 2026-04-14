// .prettierrc.mjs
/** @type {import("prettier").Config} */
export default {
  // Prettier plugins
  plugins: ['prettier-plugin-astro'],

  // General formatting rules
  semi: true, // Use semicolons at the end of statements
  singleQuote: true, // Use single quotes where possible
  tabWidth: 2, // Set the number of spaces per indentation level
  useTabs: false, // Use spaces for indentation
  trailingComma: 'es5', // Trailing commas where valid in ES5 (objects, arrays, etc.)
  bracketSpacing: true, // Spaces between brackets in object literals
  arrowParens: 'always', // Always include parens in arrow function arguments
  printWidth: 120,

  // File-type specific overrides
  overrides: [
    {
      files: '*.astro',
      options: {
        parser: 'astro',
        // You can add Astro-specific formatting rules here if needed
      },
    },
    // Additional overrides for other file types can go here
  ],
};
