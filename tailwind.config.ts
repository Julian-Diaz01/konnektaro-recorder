import type { Config } from 'tailwindcss'


const config: Config = {
    content: [
        "./apps/**/src/**/*.{js,ts,jsx,tsx,mdx}",
        "./packages/shared/**/*.{js,ts,jsx,tsx,mdx}"
    ],
    theme: {
        extend: {
        }
    },
    plugins: [],
}
export default config
