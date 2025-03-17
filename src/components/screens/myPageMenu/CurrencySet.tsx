import React from 'react';
import {useTranslation} from "react-i18next";

export default function CurrencySet() {
    const {t} = useTranslation();

    return (
        <div className="p-4 md:px-8">
            <div className="flex justify-between items-center mb-4">
                <h2 className="font_title">{t("통화 설정")}</h2>
                <button
                    type="button"
                    // onClick={}
                    // disabled={}  // 초기 상태이면 비활성화
                    className={`py-2 px-5 text-white text-sm rounded bg-roomi`}
                    // className={`py-2 px-5 text-white text-sm rounded
                    //     ${isInitialState ? 'bg-gray-300 cursor-not-allowed' : 'bg-roomi'}
                    // `}
                >
                    {t('수정')}
                </button>
            </div>
        </div>
    );
};
