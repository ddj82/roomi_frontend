import React, {useState} from 'react';
import {useTranslation} from "react-i18next";
import i18n from 'src/i18n';
import {updateLanguage} from "../../../api/api"; // i18n 초기화 파일 import

// 지원할 언어 목록
const LANGUAGES = [
    { code: 'ko', label: '한국어' },
    { code: 'en', label: 'English' },
    { code: 'ja', label: '日本語' },
    { code: 'zh', label: '中文' },
];

export default function LanguageSet() {
    const {t} = useTranslation();
    // i18n.language에는 현재 적용된 언어 코드가 들어있음
    const [currentLang, setCurrentLang] = useState(i18n.language);
    const [langCode, setLangCode] = useState('');

    // 언어 변경 함수
    const handleChangeLanguage = async (langCode: string) => {
        try {
            // api 호출
            const response = await updateLanguage(langCode);
            if (response.ok) {
                // i18n 설정
                i18n.changeLanguage(langCode);
                setCurrentLang(langCode);
                localStorage.setItem('i18nextLng', langCode);
                setLangCode('');
                window.location.reload();
            }
        } catch (e) {
            console.error('언어 설정 api 실패:', e);
        }
    };

    // 현재 적용된 언어 객체
    const currentLanguage = LANGUAGES.find((lang) => lang.code === currentLang);
    // 현재 적용된 언어를 제외한 나머지 언어 목록
    const otherLanguages = LANGUAGES.filter((lang) => lang.code !== currentLang);

    return (
        <div className="p-4 md:px-8">
            <div className="flex justify-between items-center mb-4">
                <h2 className="font_title">{t("언어 설정")}</h2>
                <button type="button"
                        onClick={() => handleChangeLanguage(langCode)}
                        className={`py-2 px-5 text-white text-sm rounded 
                        ${langCode
                            ? 'bg-roomi hover:bg-roomi'        // langCode가 있을 때
                            : 'bg-gray-300 cursor-not-allowed'  // langCode가 없을 때
                        }`}
                        disabled={!langCode} // langCode가 없으면 비활성화
                >
                    {t('수정')}
                </button>
            </div>

            <div className="mb-8">
                <p className="my-2 mt-4">{t('현재 언어')}</p>
                <p className="px-4 py-2 mb-2 rounded flex_center bg-roomi text-white">{currentLanguage?.label}</p>
                <div className="text-xs text-gray-600 mb-4">
                    {t('언어설정 가이드')}
                </div>
            </div>

            <div className="flex flex-col space-y-2">
                {/* (2) 나머지 언어 선택 버튼들 */}
                {otherLanguages.map((lang) => (
                    <button
                        key={lang.code}
                        onClick={() => setLangCode(lang.code)}
                        className={`px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 
                            ${langCode === lang.code && 'bg-roomi hover:bg-roomi text-white'}
                        `}
                    >
                        {lang.label}
                    </button>
                ))}
            </div>
        </div>
    );
};
