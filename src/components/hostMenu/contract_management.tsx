import React from 'react';
import {useTranslation} from "react-i18next";

const MyComponent = () => {
    const { t } = useTranslation();
    return (
        <div>
            {t('contract_management')} 탭 컨포넌트
        </div>
    );
};

export default MyComponent;
