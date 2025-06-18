import React, {useEffect} from 'react';
import {useTranslation} from "react-i18next";
import {useLocation, useNavigate} from "react-router-dom";

export default function CertificationRedirect() {
    const {t} = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const success = searchParams.get('success');

    const handleGoMyInfo = () => {
        navigate('/myPage/내%20정보');
        window.location.reload();
    };

    useEffect(() => {
        console.log('success값',success);
    }, [searchParams]);

    return (
        <div>
            <div>
                통합 인증 성공!, 모바일 일때만 옴, 성공처리 여기서
                <div>{success}</div>
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
