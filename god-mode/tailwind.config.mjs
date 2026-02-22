/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
        './node_modules/flowbite/**/*.js'
    ],
    theme: {
        extend: {
            colors: {
                // Black & Gold Premium Theme
                bgDeep: '#050505',
                bgPrimary: '#000000',
                bgSecondary: '#0A0A0A',

                gold: {
                    50: '#FBF5B7',
                    100: '#FCF6BA',
                    200: '#E5C88D',
                    300: '#C9A961',
                    400: '#BF953F',
                    500: '#B38728',
                    600: '#9B7E46',
                    700: '#AA771C',
                    800: '#8B6914',
                    900: '#6B5010',
                },
            },
            backgroundImage: {
                'gold-metal': 'linear-gradient(135deg, #BF953F 0%, #FCF6BA 25%, #B38728 50%, #FBF5B7 75%, #AA771C 100%)',
                'grid-pattern': 'linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)',
            },
            backgroundSize: {
                'grid': '50px 50px',
            },
            boxShadow: {
                'gold-glow': '0 0 20px rgba(191, 149, 63, 0.3)',
                'gold-glow-lg': '0 0 40px rgba(191, 149, 63, 0.4)',
            },
            animation: {
                'gradient': 'gradient 8s linear infinite',
                'float': 'float 6s ease-in-out infinite',
                'float-slow': 'float-slow 15s ease-in-out infinite',
                'glow': 'glow 2s ease-in-out infinite',
                'fade-in': 'fade-in 0.5s ease-out',
                'fade-in-up': 'fade-in-up 0.8s ease-out forwards',
                'slide-in-right': 'slide-in-right 0.5s ease-out',
                'scale-in': 'scale-in 0.3s ease-out',
            },
            keyframes: {
                gradient: {
                    '0%, 100%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                'float-slow': {
                    '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
                    '50%': { transform: 'translate(50px, 50px) scale(1.1)' },
                },
                glow: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.5' },
                },
                'fade-in': {
                    from: { opacity: '0' },
                    to: { opacity: '1' },
                },
                'fade-in-up': {
                    from: {
                        opacity: '0',
                        transform: 'translateY(30px)',
                    },
                    to: {
                        opacity: '1',
                        transform: 'translateY(0)',
                    },
                },
                'slide-in-right': {
                    from: {
                        opacity: '0',
                        transform: 'translateX(-30px)',
                    },
                    to: {
                        opacity: '1',
                        transform: 'translateX(0)',
                    },
                },
                'scale-in': {
                    from: {
                        opacity: '0',
                        transform: 'scale(0.9)',
                    },
                    to: {
                        opacity: '1',
                        transform: 'scale(1)',
                    },
                },
            },
        },
    },
    plugins: [
        require('flowbite/plugin'),
        require('@tailwindcss/typography')
    ],
}
