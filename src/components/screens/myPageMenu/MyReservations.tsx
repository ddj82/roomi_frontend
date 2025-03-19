import React from 'react';
import {useTranslation} from "react-i18next";

export default function MyReservations() {
    const {t} = useTranslation();

    return (
        <div className="p-4 md:px-8">
            <h2 className="mb-4 font_title">{t("예약 내역")}</h2>
        </div>
    );
};
