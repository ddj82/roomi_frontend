import React, { useState } from "react";
import {useNavigate} from "react-router-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowLeft} from "@fortawesome/free-solid-svg-icons";

const MyRoomInsert = () => {
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false); // 모달 상태
    const [currentStep, setCurrentStep] = useState(1); // 현재 단계 (1~14)
    const totalSteps = 14; // 전체 단계 수

    const handleBack = () => {
        setShowModal(true); // 모달 열기
    };

    const confirmBack = () => {
        navigate('/host');
        window.location.reload();
    };

    const handleNext = () => {
        if (currentStep < totalSteps) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        }
    };

    return (
        <div className="p-6">
            <div className="mb-6 p-4 border rounded-md flex">
                <div className="flex_center">
                    {/* 뒤로 가기 버튼 */}
                    <button className="rounded-md p-2 w-10 h-10 sm:p-4 sm:w-14 sm:h-14" onClick={handleBack}>
                        <FontAwesomeIcon icon={faArrowLeft} />
                    </button>
                </div>
                <div className="mx-4">
                    <div className="text-xl font-bold">{currentStep}번 단계</div>
                    <div className="text-gray-600">단계 설명</div>
                </div>
            </div>

            {/* 단계 진행 바 */}
            <div className="w-full mb-4">
                <div className="relative h-2 bg-gray-200 rounded-full">
                    <div className="absolute h-2 bg-roomi rounded-full transition-all duration-300"
                         style={{ width: `${(currentStep / totalSteps) * 100}%` }}>
                    </div>
                </div>
                <div className="text-sm text-gray-600 mt-1 ml-2">
                    {currentStep} / {totalSteps}
                </div>
            </div>

            {/* 페이지 컨텐츠 */}
            <div className="mb-6 p-4 border rounded-md">
                <div className="text-xl font-bold">{currentStep}번 폼</div>
            </div>

            {/* 이전/다음 버튼 */}
            <div className="flex justify-between">
                {currentStep > 1 ? (
                    <button
                        className="px-4 py-2 rounded-md text-roomi"
                        onClick={handlePrev}
                    >
                        이전
                    </button>
                ) : (
                    <div></div>
                )}
                {currentStep === totalSteps ? (
                    <button
                        className={`px-4 py-2 bg-roomi text-white rounded-md`}
                        onClick={handleNext}
                    >
                        등록
                    </button>
                ) : (
                    <button
                        className={`px-4 py-2 bg-roomi text-white rounded-md`}
                        onClick={handleNext}
                    >
                        다음
                    </button>
                )}
            </div>

            {/* 모달 */}
            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50">
                    <div className="bg-white p-6 rounded-md shadow-md">
                        <div className="mb-4">
                        방 등록을 종료하시겠습니까?
                        </div>
                        <div className="flex justify-end">
                            <button className="px-4 py-2 bg-gray-300 rounded-md" onClick={() => setShowModal(false)}>
                                취소
                            </button>
                            <button className="px-4 py-2 mr-2 bg-red-500 text-white rounded-md" onClick={confirmBack}>
                                나가기
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyRoomInsert;
