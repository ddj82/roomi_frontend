/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/**/*.{js,jsx,ts,tsx}'
    ],
    theme: {
        extend: {
            colors: {
                roomi: '#9370db', // 프로젝트 메인 컬러 설정
            },
        },
    },
    plugins: [
    ],
};
