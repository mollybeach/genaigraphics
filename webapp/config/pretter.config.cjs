// path: webapp/config/prettier.config.cjs
module.exports = {
    printWidth: 1000,
    tabWidth: 4,
    plugins: [require("prettier-plugin-tailwindcss")],
    tailwindConfig: "./tailwind.config.cjs",
};
