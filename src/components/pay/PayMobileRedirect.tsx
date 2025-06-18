import React, {useEffect, useState} from 'react';
import {useTranslation} from "react-i18next";
import {useLocation, useNavigate} from "react-router-dom";
import {verifyPayment} from "../../api/api";

export default function PayMobileRedirect() {
    const {t} = useTranslation();
    const navigate = useNavigate();
    const [isSuccess, setIsSuccess] = useState(false);

    /*
        성공하면 pgCode가 없음
        실패하면 pgCode가 있음
    * */
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const pgCode = searchParams.get('pgCode');
    const paymentId = searchParams.get('paymentId');

    useEffect(() => {
        redirectVerifyPayment();
    }, []);

    const redirectVerifyPayment = async () => {
        if (paymentId) {
            // 결제 후 검증
            const verifyPaymentResponse = await verifyPayment(paymentId);
            const verifyPaymentResponseJson = await verifyPaymentResponse.json();
            console.log('결제 후 검증 verifyPaymentResponse', verifyPaymentResponse);
            console.log('결제 후 검증 verifyPaymentResponseJson', verifyPaymentResponseJson);
        }
    };

    const handleGoMyInfo = () => {
        navigate('/myPage/내%20정보');
        window.location.reload();
    };

    return (
        <div>
            
        </div>
    );
};
