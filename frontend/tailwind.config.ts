import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        emerald: {
          400: '#00ff88',
          500: '#00ff88',
        },
        cyan: {
          400: '#00d4ff',
          500: '#00d4ff',
        },
      },
    },
  },
  plugins: [],
}
export default config
