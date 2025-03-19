/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/**/*.{js,jsx,ts,tsx}'
    ],
    theme: {
        extend: {
            colors: {
                "roomi-light": "#fff5f3", // 완전 연하게
                "roomi-000": "#ffe7e4", // 더더더 연하게
                "roomi-00": "#ffd7d3", // 더더 연하게
                "roomi-0": "#ffc7c2", // 더 연하게
                "roomi-1": "#ffb6af", // 연하게
                "roomi-2": "#ff9a8a", // 조금 더 진한 톤
                "roomi": "#f47366", // 메인 컬러
                "roomi-3": "#d86558", // 진하게
                "roomi-4": "#be5a4e", // 더 진하게
                "roomi-5": "#a44f44" // 더더 진하게

                // "roomi-light": '#faf5ff', // 완전 연하게
                // "roomi-000": '#f0eaff', // 더더더 연하게
                // "roomi-00": '#DFC2FB', // 더더더 연하게
                // "roomi-0": '#C8A7F8', // 더더 연하게
                // "roomi-1": '#B08DF0', // 더 연하게
                // "roomi-2": '#A07EE4', // 연하게
                // roomi: '#9370db', // 메인 컬러
                // "roomi-3": '#825FCC', // 진하게
                // "roomi-4": '#724FBD', // 더 진하게
                // "roomi-5": '#603EA8', // 더더 진하게
            },
            accentColor: {
                roomi: '#9370db', // ✅ accent-roomi 추가 (체크박스 색상)
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
                '.flex_center': {
                    display: 'flex',
                    'align-items': 'center',
                    'justify-content': 'center',
                },
                '.font_title': {
                    fontWeight: 'bold',
                    fontSize: '1.125rem',
                    lineHeight: '1.75rem',
                },
                '.text-xxs': {
                    fontSize: '0.6rem',
                    lineHeight: '1rem',
                },
                '.text-xxxs': {
                    fontSize: '0.3rem',
                    lineHeight: '0.4rem',
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
