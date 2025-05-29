import React from 'react';
import Modal from "react-modal";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import { faIdCard, faPassport } from '@fortawesome/free-solid-svg-icons';


export default function RoomDetailCertificationModal({visible, onClose, isKorean, onCertificationComplete}: {
    visible: boolean,
    onClose: () => void,
    isKorean: boolean,
    onCertificationComplete: (isSuccess: boolean) => void;
}) {
    return (
        <Modal
            isOpen={visible}
            onRequestClose={onClose}
            contentLabel="Modal"
            className="authModal auth-modal-container"
            overlayClassName="authModal overlay" // 오버레이 스타일
        >
            {/*{!isKorean ? (*/}
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
                                    공인인증서 인증
                                </div>
                                <div>
                                    한국 공인인증서로 본인 확인
                                </div>
                            </div>
                        </div>
                        <div>
                            <div>• 공인인증서 필요</div>
                            <div>• 대한민국 국적 전용</div>
                            <div>• 약 1-2분 소요</div>
                        </div>
                        <div>
                            <button
                                type="button"
                                // onClick={}
                                className="flex_center bg-roomi text-white text-lg rounded-lg p-4 w-full"
                            >
                                공인인증서 인증하기
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
                                // onClick={}
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
