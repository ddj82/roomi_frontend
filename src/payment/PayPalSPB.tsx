import React, { useEffect, useState } from "react";
import * as PortOne from "@portone/browser-sdk/v2";
import {Currency} from "../components/screens/GuestReservationScreen";

const PayPalSPB: React.FC = () => {
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        setIsReady(true);
    }, []);

    useEffect(() => {
        if (!isReady) return;

        const initPayment = async () => {
            // 컨테이너가 존재하는지 확인
            const container = document.getElementById('portone-ui-container');
            if (!container) {
                console.error('portone-ui-container를 찾을 수 없습니다.');
                return;
            }

            const requestData: PortOne.LoadPaymentUIRequest = {
                uiType: "PAYPAL_SPB",
                storeId: "store-7bb98274-0fb5-4b2e-8d60-d3bff2f3ca85",
                paymentId: `roomi_${Date.now()}`,
                orderName: "Roomi 결제 테스트",
                totalAmount: 100,
                currency: Currency.USD as any,
                channelKey: "channel-key-32257656-6637-40bf-b343-795dbb0b1beb",
                customer: {
                    customerId: "roomi_user_" + Date.now(),
                    fullName: "Yujin",
                    email: "test@example.com"
                },
                redirectUrl: "https://roomi.co.kr/payment/complete"
            };

            const callbacks = {
                onPaymentSuccess: (response: any) => {
                    console.log("✅ 결제 성공", response);
                },
                onPaymentFail: (error: any) => {
                    console.error("❌ 결제 실패", error);
                }
            };

            try {
                await PortOne.loadPaymentUI(requestData, callbacks);
            } catch (error) {
                console.error('결제 UI 로드 실패:', error);
            }
        };

        initPayment();
    }, [isReady]);

    return (
        <div>
            {isReady && (
                <div
                    id="portone-ui-container"
                    style={{
                        minHeight: '400px',
                        width: '100%',
                        border: '1px solid #ddd',
                        borderRadius: '4px'
                    }}
                />
            )}
        </div>
    );
};

export default PayPalSPB;