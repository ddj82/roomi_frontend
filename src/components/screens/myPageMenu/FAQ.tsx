import React from 'react';
import {useTranslation} from "react-i18next";

export default function FAQ() {
    const {t} = useTranslation();

    return (
        <div className="p-4 md:px-8">
            <h2 className="mb-4 font_title">FAQ</h2>
        </div>
    );
};
