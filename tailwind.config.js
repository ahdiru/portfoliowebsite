/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: '#F5F0E6',
        surface: '#FFFFFF',
        surfaceAlt: '#EDE7DA',
        border: '#D8CFBE',
        primary: '#1E3B2F',
        secondary: '#7F8C6A',
        accent: '#C8B48A',
        text: '#1E3B2F',
        textMuted: '#5A6650',
        onPrimary: '#F5F0E6',
        danger: '#B4442E',
        success: '#4F7A3A',
        forest: '#1E3B2F',
        sage: '#7F8C6A',
        sand: '#C8B48A',
        cream: '#F5F0E6',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backdropBlur: {
        sm: '4px',
      },
    },
  },
  plugins: [],
}
