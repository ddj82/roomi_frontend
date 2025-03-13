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
            }
        } catch (e) {
            console.error('언어 설정 api 실패:', e);
        }
    };

    return (
        <div className="p-4 md:px-8">
            <h2 className="mb-4 font_title">{t("언어 설정")}</h2>
            {/* 현재 적용된 언어 표시 (langCode 그대로 표시하거나, label 매칭 가능) */}
            <p className="mb-4">
                {t('현재 언어')}: {currentLang}
            </p>

            <p className="text-sm text-gray-600 mb-4">
                처음에는 브라우저 언어가 자동으로 적용되지만, 아래에서 원하는 언어로 언제든 변경하실 수 있습니다.
            </p>

            {/* 언어 선택 버튼들 */}
            <div className="flex flex-col space-y-2">
                {LANGUAGES.map((lang) => (
                    <button
                        key={lang.code}
                        onClick={() => handleChangeLanguage(lang.code)}
                        className={`px-4 py-2 rounded ${
                            currentLang === lang.code
                                ? 'bg-roomi text-white' // 현재 언어인 경우 강조 표시
                                : 'bg-gray-200 hover:bg-gray-300'
                        } `}
                    >
                        {lang.label}
                    </button>
                ))}
            </div>
        </div>
    );
};
