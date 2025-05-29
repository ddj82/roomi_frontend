import React, {useEffect} from 'react';
import Modal from "react-modal";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import { faIdCard, faPassport } from '@fortawesome/free-solid-svg-icons';

// 아임포트 타입 정의
declare global {
    interface Window {
        IMP?: any;
    }
}

export default function RoomDetailCertificationModal({visible, onClose, isKorean, onCertificationComplete}: {
    visible: boolean,
    onClose: () => void,
    isKorean: boolean,
    onCertificationComplete: (isSuccess: boolean, imp_uid: string) => void;
}) {
    // 아임포트 스크립트 로드
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://cdn.iamport.kr/js/iamport.payment-1.2.0.js';
        script.async = true;
        document.body.appendChild(script);

        return () => {
            // 컴포넌트 언마운트 시 스크립트 제거
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
        };
    }, []);

    // 공인인증서 인증 처리
    const handleKoreanCertification = () => {
        if (!window.IMP) {
            alert('아임포트 라이브러리를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
            return;
        }

        const userCode = 'imp01154410'; // 실제 가맹점 코드로 변경
        const merchantUid = `roomi_cert_${Date.now()}`;

        window.IMP.init(userCode);

        window.IMP.certification({
            merchant_uid: merchantUid,
            company: 'Roomi',
            min_age: 18,
            carrier: '',  // 사용자 선택
            name: '',     // 사용자 입력
            phone: '',    // 사용자 입력
            m_redirect_url: window.location.origin + '/verification-result', // 모바일 리다이렉트 URL
        }, (rsp: any) => {
            console.log('📱 본인인증 결과:', rsp);

            if (rsp.success) {
                // 인증 성공 처리
                alert('본인인증이 완료되었습니다.');
                onCertificationComplete(true, rsp.imp_uid);
                onClose();
            } else {
                // 인증 실패 처리
                onCertificationComplete(false, rsp.imp_uid);
            }
        });
    };

    // MetaMap 인증 처리 (외국인용)
    const handleForeignCertification = () => {
        // MetaMap 연동 로직 구현
        alert('MetaMap 인증 기능을 구현해주세요.');
        // 실제로는 MetaMap SDK를 사용하여 구현
    };


    return (
        <Modal
            isOpen={visible}
            onRequestClose={onClose}
            contentLabel="Modal"
            className="authModal auth-modal-container"
            overlayClassName="authModal overlay"
        >
            {isKorean ? (
                <div className="p-2">
                    <div className="flex flex-col gap-6">
                        <div className="flex gap-4">
                            <div>
                                <div className="md:w-16 md:h-16 rounded-lg flex_center bg-roomi-000">
                                    <FontAwesomeIcon icon={faIdCard} className="text-roomi text-xxxl"/>
                                </div>
                            </div>
                            <div className="flex flex-col justify-center">
                                <div className="text-xl font-bold">
                                    본인 인증
                                </div>
                                <div>
                                    통합 인증으로 본인 확인
                                </div>
                            </div>
                        </div>
                        <div>
                            <div>• 인증서 필요</div>
                            <div>• 대한민국 국적 전용</div>
                            <div>• 약 1-2분 소요</div>
                        </div>
                        <div>
                            <button
                                type="button"
                                onClick={handleKoreanCertification}
                                className="flex_center bg-roomi text-white text-lg rounded-lg p-4 w-full"
                            >
                                통합 인증하기
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="p-2">
                    <div className="flex flex-col gap-6">
                        <div className="flex gap-4">
                            <div>
                                <div className="md:w-16 md:h-16 rounded-lg flex_center bg-roomi-000">
                                    <FontAwesomeIcon icon={faPassport} className="text-roomi text-xxxl"/>
                                </div>
                            </div>
                            <div className="flex flex-col justify-center">
                                <div className="text-xl font-bold">
                                    여권 인증
                                </div>
                                <div>
                                    여권과 얼굴 인증으로 빠른 확인
                                </div>
                            </div>
                        </div>
                        <div>
                            <div>• 여권 촬영</div>
                            <div>• 얼굴 인증</div>
                            <div>• 약 2-3분 소요</div>
                        </div>
                        <div>
                            <button
                                type="button"
                                onClick={handleForeignCertification}
                                className="flex_center bg-roomi text-white text-lg rounded-lg p-4 w-full"
                            >
                                MetaMap 인증하기
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Modal>
    );
};
