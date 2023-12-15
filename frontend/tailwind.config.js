import flowbitePlugin from "flowbite/plugin";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{html,ts,jsx,tsx,js}", // content source should be pointing to the files that use tailwind
  ],
  theme: {
    extend: {},
  },
  plugins: [flowbitePlugin],
};
