import React from 'react';
import {useTranslation} from "react-i18next";

export default function CurrencySet() {
    const {t} = useTranslation();

    return (
        <div className="p-4 md:px-8">
            <h2 className="mb-4 font_title">{t("통화 설정")}</h2>
        </div>
    );
};
