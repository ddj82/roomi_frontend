import React, { useEffect } from 'react';

const getUrlParams = (): Record<string, string> => {
    const params = new URLSearchParams(window.location.search);
    const result: Record<string, string> = {};
    for (const [key, value] of params.entries()) {
        result[key] = decodeURIComponent(value);
    }
    return result;
};

const getErrorTypeName = (errorType: string): string => {
    const errorTypeNames: Record<string, string> = {
        PROVIDER: '결제 제공자 오류',
        INVALID_REQUEST: '잘못된 요청',
        TIMEOUT: '시간 초과',
        INTERNAL: '내부 오류',
        USER_CANCELED: '사용자 취소',
        REJECT: '거부됨',
        UNAUTHORIZED: '인증 오류',
    };
    return errorTypeNames[errorType] || errorType;
};

const PaymentFailPage: React.FC = () => {
    const params = getUrlParams();

    const redirectToApp = () => {
        let deepLink = `com.myno1214.roomi://fail`;
        const additionalInfo = {
            timestamp: new Date().toISOString(),
            device: navigator.userAgent,
        };

        const allParams = { ...params, ...additionalInfo };
        const query = Object.entries(allParams)
            .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
            .join('&');
        deepLink += `?${query}`;

        window.location.href = deepLink;
    };

    useEffect(() => {
        const timer = setTimeout(redirectToApp, 1500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div style={{ fontFamily: 'Noto Sans KR, sans-serif', maxWidth: 800, margin: '0 auto', padding: 20, textAlign: 'center' }}>
            <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 20, marginTop: 20, backgroundColor: '#fff0f0' }}>
                <div style={{ width: 60, height: 60, margin: '0 auto 20px', backgroundColor: '#e74c3c', borderRadius: '50%', position: 'relative' }}>
                    <div style={{ position: 'absolute', width: 30, height: 4, backgroundColor: 'white', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(45deg)' }} />
                    <div style={{ position: 'absolute', width: 30, height: 4, backgroundColor: 'white', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-45deg)' }} />
                </div>
                <h1>결제에 실패했습니다</h1>
                <div style={{ textAlign: 'left', margin: '20px auto', maxWidth: 400, backgroundColor: '#fff', padding: 15, borderRadius: 6, border: '1px solid #ffcccc' }}>
                    {params.code && (
                        <p><span style={{ fontWeight: 500, color: '#555' }}>오류 코드</span><br /><span style={{ color: '#e74c3c' }}>{params.code}</span></p>
                    )}
                    {params.message && (
                        <p><span style={{ fontWeight: 500, color: '#555' }}>오류 메시지</span><br /><span style={{ color: '#e74c3c' }}>{params.message}</span></p>
                    )}
                    {params.orderId && (
                        <p><span style={{ fontWeight: 500, color: '#555' }}>주문번호</span><br /><span style={{ color: '#e74c3c' }}>{params.orderId}</span></p>
                    )}
                    {params.errorCode && (
                        <p><span style={{ fontWeight: 500, color: '#555' }}>상세 오류 코드</span><br /><span style={{ color: '#e74c3c' }}>{params.errorCode}</span></p>
                    )}
                    {params.errorType && (
                        <p><span style={{ fontWeight: 500, color: '#555' }}>오류 유형</span><br /><span style={{ color: '#e74c3c' }}>{getErrorTypeName(params.errorType)}</span></p>
                    )}
                    <p>잠시 후 자동으로 앱으로 이동합니다.</p>
                </div>
                <p style={{ marginTop: 30, fontSize: 14, color: '#666', fontStyle: 'italic' }}>자동으로 앱이 열리지 않는 경우 아래 버튼을 클릭하세요.</p>
                <button
                    onClick={redirectToApp}
                    style={{ marginTop: 20, backgroundColor: '#3498db', color: 'white', border: 'none', padding: '12px 24px', borderRadius: 4, fontSize: 16, cursor: 'pointer' }}
                >
                    앱으로 이동
                </button>
            </div>
        </div>
    );
};

export default PaymentFailPage;