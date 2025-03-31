import React, { useEffect } from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCheck} from "@fortawesome/free-solid-svg-icons";
import {useNavigate} from "react-router-dom";

const SuccessPage: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const params = getUrlParams();

        const timer = setTimeout(() => {
            redirectToApp(params);
        }, 1500);

        const button = document.getElementById("openAppButton");
        button?.addEventListener("click", () => redirectToApp(params));

        return () => {
            clearTimeout(timer);
            button?.removeEventListener("click", () => redirectToApp(params));
        };
    }, []);

    const getUrlParams = (): Record<string, string> => {
        const params: Record<string, string> = {};
        window.location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi, (_, key, value) => {
            params[key] = decodeURIComponent(value);
            return "";
        });
        return params;
    };

    const redirectToApp = (params: Record<string, string>) => {
        let deepLink = `com.myno1214.roomi://success`;

        const additionalInfo = {
            timestamp: new Date().toISOString(),
            device: navigator.userAgent,
        };

        const combinedParams = { ...params, ...additionalInfo };
        const paramString = Object.entries(combinedParams)
            .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
            .join("&");

        if (paramString) deepLink += `?${paramString}`;

        const detailsElement = document.getElementById("payment-details");
        if (detailsElement && params.orderId) {
            detailsElement.innerHTML = `
                ${params.orderId ? 
                        `<p class="flex justify-between"><strong>주문번호:</strong><span>${params.orderId}</span></p>` : ""}
                ${params.amount ? 
                        `<p class="flex justify-between"><strong>결제금액:</strong><span>${parseInt(params.amount).toLocaleString()}원</span></p>` : ""}
                ${params.orderName ? 
                        `<p class="flex justify-between"><strong>상품명:</strong><span>${params.orderName}</span></p>` : ""}
                ${params.method ? 
                        `<p class="flex justify-between"><strong>결제방법:</strong><span>${getPaymentMethodName(params.method)}</span></p>` : ""}
                ${params.status ? 
                        `<p class="flex justify-between"><strong>상태:</strong><span>${getStatusName(params.status)}</span></p>` : ""}
                ${params.approvedAt ? 
                        `<p class="flex justify-between"><strong>승인시간:</strong><span>${formatDate(new Date(params.approvedAt))}</span></p>` : ""}
              `;
        }

        window.location.href = deepLink;
    };

    const getPaymentMethodName = (method: string): string => {
        const map: Record<string, string> = {
            CARD: "카드",
            VIRTUAL_ACCOUNT: "가상계좌",
            MOBILE_PHONE: "휴대폰",
            TRANSFER: "계좌이체",
            CULTURE_GIFT_CERTIFICATE: "문화상품권",
            BOOK_GIFT_CERTIFICATE: "도서문화상품권",
            GAME_GIFT_CERTIFICATE: "게임문화상품권",
        };
        return map[method] || method;
    };

    const getStatusName = (status: string): string => {
        const map: Record<string, string> = {
            READY: "준비됨",
            IN_PROGRESS: "진행중",
            WAITING_FOR_DEPOSIT: "입금대기",
            DONE: "완료",
            CANCELED: "취소됨",
            PARTIAL_CANCELED: "부분취소",
            ABORTED: "중단됨",
            EXPIRED: "만료됨",
        };
        return map[status] || status;
    };

    const formatDate = (date: Date): string =>
        `${date.getFullYear()}-${padZero(date.getMonth() + 1)}-${padZero(date.getDate())} ${padZero(date.getHours())}:${padZero(date.getMinutes())}`;

    const padZero = (num: number): string => (num < 10 ? `0${num}` : `${num}`);

    return (
        <div className="max-w-3xl mx-auto px-4 py-6 text-center font-sans">
            <div className="border border-gray-300 rounded-lg p-5 mt-5 bg-gray-100">
                <div className="w-16 h-16 mx-auto mb-5 bg-green-500 rounded-full flex_center">
                    <FontAwesomeIcon icon={faCheck} className="text-white text-xxxl" />
                </div>
                <h1 className="text-xl font-semibold mb-4">결제가 성공적으로 완료되었습니다</h1>
                <div id="payment-details" className="text-left mx-auto bg-white p-4 rounded-md border border-gray-200 max-w-md text-sm text-gray-800">
                    <p>결제 정보를 불러오는 중...</p>
                </div>
                <p className="mt-6 text-sm text-gray-600 italic">
                    자동으로 앱이 열리지 않는 경우 아래 버튼을 클릭하세요.
                </p>
                <button
                    id="openAppButton"
                    className="mt-5 bg-roomi hover:bg-roomi-3 text-white py-2 px-6 rounded text-sm"
                    onClick={() => navigate('/myPage')}
                >
                    마이페이지로 이동
                </button>
            </div>
        </div>
    );
};

export default SuccessPage;
