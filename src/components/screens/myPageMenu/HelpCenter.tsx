import React from 'react';
import {useTranslation} from "react-i18next";

export default function HelpCenter() {
    const {t} = useTranslation();

    return (
        <div className="p-4 md:px-8">
            <h2 className="mb-4 font_title">{t("고객센터")}</h2>
        </div>
    );
};
