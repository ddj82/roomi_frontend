/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/**/*.{js,jsx,ts,tsx}'
    ],
    theme: {
        extend: {
            colors: {
                "roomi-00": '#DFC2FB', // 더더더 연하게
                "roomi-0": '#C8A7F8', // 더더 연하게
                "roomi-1": '#B08DF0', // 더 연하게
                "roomi-2": '#A07EE4', // 연하게
                roomi: '#9370db', // 메인 컬러
                "roomi-3": '#825FCC', // 진하게
                "roomi-4": '#724FBD', // 더 진하게
                "roomi-5": '#603EA8', // 더더 진하게
            },
        },
    },
    plugins: [
        function ({ addUtilities }) {
            addUtilities({
                '.scrollbar-hidden': {
                    /* 크로스 브라우저 스크롤바 숨기기 */
                    'scrollbar-width': 'none', /* Firefox */
                    '&::-webkit-scrollbar': {
                        display: 'none', /* Chrome, Safari */
                    },
                },
            });
        },
        function ({ addComponents }) {
            addComponents({
                '.no-spinner': {
                    '-moz-appearance': 'textfield',
                    '&::-webkit-inner-spin-button, &::-webkit-outer-spin-button': {
                        '-webkit-appearance': 'none',
                        'margin': '0',
                    },
                },
            });
        },
    ],
};
