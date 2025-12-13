/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                // Primary palette
                dark: {
                    900: '#0a0a0b',
                    800: '#111113',
                    700: '#1a1a1e',
                    600: '#232328',
                    500: '#2d2d33',
                },
                // Orange accent
                accent: {
                    DEFAULT: '#ff6b35',
                    light: '#ff8c5a',
                    dark: '#e55a2b',
                    glow: 'rgba(255, 107, 53, 0.4)',
                    subtle: 'rgba(255, 107, 53, 0.1)',
                },
            },
            fontFamily: {
                sans: ['Outfit', 'system-ui', 'sans-serif'],
                mono: ['Space Mono', 'ui-monospace', 'monospace'],
            },
            animation: {
                'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
                'float': 'float 3s ease-in-out infinite',
                'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
                'blink': 'blink 1s step-end infinite',
            },
            keyframes: {
                fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-8px)' },
                },
                pulseGlow: {
                    '0%, 100%': { boxShadow: '0 0 0 0 rgba(255, 107, 53, 0.4)', opacity: '1' },
                    '50%': { boxShadow: '0 0 10px 3px rgba(255, 107, 53, 0.4)', opacity: '0.8' },
                },
                blink: {
                    '0%, 50%': { opacity: '1' },
                    '51%, 100%': { opacity: '0' },
                },
            },
            boxShadow: {
                'glow': '0 0 20px rgba(255, 107, 53, 0.4), 0 0 40px rgba(255, 107, 53, 0.2)',
                'glow-sm': '0 0 10px rgba(255, 107, 53, 0.3)',
            },
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
}
