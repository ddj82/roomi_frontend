import React from 'react';
import {useTranslation} from "react-i18next";

const Message = () => {
    const { t } = useTranslation();
    return (
        <div>
            {t('message')} 탭 컨포넌트
        </div>
    );
};

export default Message;
