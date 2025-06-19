/** @type {import('tailwindcss').Config} */
export default {
    content: ["./src/**/*.{js,jsx,ts,tsx}", "./index.html"],
    theme: {
        colors: {
            // Primary colors from your CSS variables
            primary: '#5AA469',
            secondary: '#ffffff',

            // Accent colors
            'ac-1': '#c6c6c6',
            'ac-2': '#eeeeee',
            'ac-black': '#000000',

            // Shades
            'shade-1': '#F4FFF2',
            'shade-2': '#facfae',

            // Main color variations
            'main-60': '#f7b786',
            'main-80': '#f59f5d',
            'main-120': '#c26c2a',
            'main-140': '#915120',
            'main-160': '#613615',
            'main-180': '#301b0b',

            // Text colors
            'text-1': '#171717',
            'text-2': '#454545',

            // Keep some default Tailwind colors for flexibility
            white: '#ffffff',
            black: '#000000',
            gray: {
                100: '#f3f4f6',
                200: '#e5e7eb',
                300: '#d1d5db',
                400: '#9ca3af',
                500: '#6b7280',
                600: '#4b5563',
                700: '#374151',
                800: '#1f2937',
                900: '#111827',
            },
            red: {
                500: '#ef4444',
                600: '#dc2626',
                700: '#b91c1c',
            },
            green: {
                500: '#10b981',
                600: '#059669',
                700: '#047857',
            },
            blue: {
                500: '#3b82f6',
                600: '#2563eb',
                700: '#1d4ed8',
            },
        },
        fontFamily: {
            sans: ['Space Grotesk', 'sans-serif'], // Primary font
            secondary: ['Albert Sans', 'sans-serif'], // Secondary font
            heading: ['Space Grotesk', 'sans-serif'], // For headings
        },
        fontSize: {
            'xs': '0.75rem',
            'sm': '0.875rem',
            'base': '1rem', // 16px as per your p tag styles
            'lg': '1.125rem',
            'xl': '1.25rem',
            '2xl': '1.5rem',
            '3xl': '1.875rem',
            '4xl': '2.25rem',
            '5xl': '3rem',
            '6xl': '3.75rem',
        },
        lineHeight: {
            'paragraph': '28.8px', // Custom line height from your p styles
            'tight': '1.25',
            'snug': '1.375',
            'normal': '1.5',
            'relaxed': '1.625',
            'loose': '2',
        },
        maxWidth: {
            'container-xl': '1480px',
            'container-lg': '1280px',
            'container-md': '1024px',
            'container-sm': '768px',
            'container-xs': '640px',
        },
        extend: {
            // CSS custom properties for dynamic theming
            colors: {
                'css-primary': 'var(--primary-color)',
                'css-secondary': 'var(--secondary-color)',
                'css-ac-1': 'var(--ac-1)',
                'css-ac-2': 'var(--ac-2)',
                'css-shade-1': 'var(--shade-1)',
                'css-shade-2': 'var(--shade-2)',
                'css-main-60': 'var(--main-60)',
                'css-main-80': 'var(--main-80)',
                'css-main-120': 'var(--main-120)',
                'css-main-140': 'var(--main-140)',
                'css-main-160': 'var(--main-160)',
                'css-main-180': 'var(--main-180)',
                'css-text-1': 'var(--text-1)',
                'css-text-2': 'var(--text-2)',
                'css-ac-black': 'var(--ac-black)',
            },
            fontFamily: {
                'primary': 'var(--primary-font)',
                'secondary': 'var(--secondary-font)',
            },
            spacing: {
                '18': '4.5rem',
                '88': '22rem',
                '128': '32rem',
            },
            borderRadius: {
                'xl': '0.75rem',
                '2xl': '1rem',
                '3xl': '1.5rem',
            },
            boxShadow: {
                'custom': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                'custom-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-in-out',
                'slide-up': 'slideUp 0.3s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
            },
        },
    },
    plugins: [],
};