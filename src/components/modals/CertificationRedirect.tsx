import React from 'react';
import {useTranslation} from "react-i18next";
import {useNavigate} from "react-router-dom";

export default function CertificationRedirect() {
    const {t} = useTranslation();
    const navigate = useNavigate();

    const handleGoMyInfo = () => {
        navigate('/myPage/내%20정보');
        window.location.reload();
    };

    return (
        <div>
            <div>
                통합 인증 성공!
            </div>
            <button
                type="button"
                onClick={handleGoMyInfo}
            >
                마이페이지로
            </button>
        </div>
    );
};
