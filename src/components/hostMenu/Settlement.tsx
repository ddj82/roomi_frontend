import React from 'react';
import {useTranslation} from "react-i18next";

const Settlement = () => {
    const { t } = useTranslation();
    return (
        <div>
            {t('settlement')} 탭 컨포넌트
        </div>
    );
};

export default Settlement;
