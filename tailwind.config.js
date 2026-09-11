const colors = require('tailwindcss/colors');

// Discord-inspired neutrals (used by gray-* and neutral-* across the panel)
const gray = {
    50: '#f2f3f5',
    100: '#ebedef',
    200: '#dbdee1',
    300: '#b5bac1',
    400: '#949ba4',
    500: '#6d6f78',
    600: '#35373c',
    700: '#2b2d31',
    800: '#1e1f22',
    900: '#111214',
};

module.exports = {
    content: [
        './resources/scripts/**/*.{js,ts,tsx}',
    ],
    theme: {
        extend: {
            fontFamily: {
                header: ['"IBM Plex Sans"', '"Roboto"', 'system-ui', 'sans-serif'],
            },
            colors: {
                black: '#111214',
                // "primary" and "neutral" are deprecated, prefer the use of "blue" and "gray"
                // in new code.
                primary: colors.blue,
                gray: gray,
                neutral: gray,
                cyan: colors.cyan,
            },
            fontSize: {
                '2xs': '0.625rem',
            },
            transitionDuration: {
                250: '250ms',
            },
            borderColor: theme => ({
                default: theme('colors.neutral.400', 'currentColor'),
            }),
        },
    },
    plugins: [
        require('@tailwindcss/line-clamp'),
        require('@tailwindcss/forms')({
            strategy: 'class',
        }),
    ]
};
