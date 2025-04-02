import React, { useState } from "react";
import {useNavigate} from "react-router-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCheckCircle, faBuilding} from "@fortawesome/free-regular-svg-icons";
import {faArrowLeft, faElevator, faInfo, faMagnifyingGlass, faP} from "@fortawesome/free-solid-svg-icons";
import DaumPostcode from 'react-daum-postcode';
import Modal from "react-modal";

const MyRoomInsert = () => {
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false); // 모달 상태
    const [currentStep, setCurrentStep] = useState(1); // 현재 단계 (1~16)
    const totalSteps = 15; // 전체 단계 수
    // 오류 메시지 상태 추가
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [roomFormData, setRoomFormData] = useState({
        address: "",
        addressDetail: "",
        hasElevator: false,
        hasParking: false,
    });
    const [daumAddressModal, setDaumAddressModal] = useState(false);
    const [roomType, setRoomType] = useState('');

    const handleBack = () => {
        setShowModal(true); // 모달 열기
    };

    const confirmBack = () => {
        navigate('/host');
        window.location.reload();
    };

    const handleNext = () => {
        // 유효성 검사 errors 이용
        if (currentStep < totalSteps) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handleChange = (field: string, value: string) => {
        setRoomFormData(prev => ({ ...prev, [field]: value }));
    };

    const handlePrev = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
    };

    const handleAddress = (data: any) => {
        console.log('다음 주소', data.address);
        handleChange("address", data.address);
        setDaumAddressModal(false);
    };

    const renderStepTitle = (currentStep: number) => {
        let stepTitle;
        let stepContent;
        switch (currentStep) {
            case 1: {
                stepTitle = '공간 유형';
                stepContent = '게스트가 이용할 공간 유형을 선택해주세요.';
                break;
            }
            case 2: {
                stepTitle = '공간 이름';
                stepContent = '게스트에게 보여질 공간의 이름을 입력해주세요.';
                break;
            }
            case 3: {
                stepTitle = '위치 정보';
                stepContent = '공간의 정확한 주소를 입력해주세요.';
                break;
            }
            case 4: {
                stepTitle = '건물 정보';
                stepContent = '건물의 유형과 면적을 선택해주세요.';
                break;
            }
            case 5: {
                stepTitle = '555';
                stepContent = '555';
                break;
            }
            case 6: {
                stepTitle = '666';
                stepContent = '666';
                break;
            }
            case 7: {
                stepTitle = '777';
                stepContent = '777';
                break;
            }
            case 8: {
                stepTitle = '888';
                stepContent = '888';
                break;
            }
            case 9: {
                stepTitle = '999';
                stepContent = '999';
                break;
            }
            case 10: {
                stepTitle = '100';
                stepContent = '100';
                break;
            }
            case 11: {
                stepTitle = '110';
                stepContent = '110';
                break;
            }
            case 12: {
                stepTitle = '120';
                stepContent = '120';
                break;
            }
            case 13: {
                stepTitle = '130';
                stepContent = '130';
                break;
            }
            case 14: {
                stepTitle = '140';
                stepContent = '140';
                break;
            }
            case 15: {
                stepTitle = '150';
                stepContent = '150';
                break;
            }
        }
        return (
            <>
                <div className="text-xl font-bold">{stepTitle}</div>
                <div className="text-gray-600">{stepContent}</div>
            </>
        );
    };

    return (
        <div className="p-6">
            {/* 페이지 제목 */}
            <div className="mb-6 p-4 border rounded-md flex">
                <div className="flex_center">
                    {/* 뒤로 가기 버튼 */}
                    <button className="rounded-md p-2 w-10 h-10 sm:p-4 sm:w-14 sm:h-14" onClick={handleBack}>
                        <FontAwesomeIcon icon={faArrowLeft} />
                    </button>
                </div>
                <div className="mx-4">
                    {renderStepTitle(currentStep)}
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

            <form onSubmit={handleSubmit}>
                {/* 페이지 컨텐츠 */}
                <div className="mb-6 p-4 border rounded-md">
                    {currentStep === 1 && (
                        /*공간 유형*/
                        <div>
                            <div className="md:flex">
                                {/* 단기임대 */}
                                <div className="md:w-1/2">
                                    <label htmlFor="LEASE"
                                        className={`block p-4 border-2 rounded-lg cursor-pointer transition mb-4 md:m-0
                                        ${roomType === "LEASE" ? 
                                            "bg-roomi-000 border-roomi" : "border text-gray-700 hover:bg-gray-100"}`}
                                    >
                                        <div className="flex">
                                            <div className={`flex_center bg-gray-200 p-4 rounded-lg 
                                                ${roomType === "LEASE" && "bg-roomi-00 text-roomi"}`}
                                            >
                                                <FontAwesomeIcon icon={faBuilding} className="w-6 h-6"/>
                                            </div>
                                            <div className="w-full ml-4">
                                                <div className={`font-bold ${roomType === "LEASE" && "text-roomi"}`}>
                                                    주/월 단위 단기임대 공간
                                                </div>
                                                <div className="text-gray-500 md:text-sm text-xs mt-1">
                                                    주단위 또는 월단위로 운영되는 일반 임대주택 입니다.
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex text-gray-500 md:text-sm text-xs mt-2">
                                            <div className="p-4"><div className="w-6 h-6"></div></div>
                                            <div className={`w-full ml-4 p-3 ${roomType === "LEASE" && "bg-gray-50 rounded-lg"}`}>
                                                <div className="my-2">
                                                    <strong> · </strong>주단위/월단위 임대 가능
                                                </div>
                                                <div className="my-2">
                                                    <strong> · </strong>일반 임대주택
                                                </div>
                                            </div>
                                            <div className="md:p-4"><div className="w-6 h-6"></div></div>
                                        </div>
                                    </label>
                                    <input type="radio" name="roomType" id="LEASE" value="LEASE" checked={roomType === "LEASE"}
                                           onChange={() => setRoomType("LEASE")} className="hidden"/>
                                </div>
                                {/* 숙박업소 */}
                                <div className="md:w-1/2">
                                    <label htmlFor="LODGE"
                                           className={`block p-4 border-2 rounded-lg cursor-pointer transition 
                                           ${roomType === "LODGE" ?
                                               "bg-roomi-000 border-roomi" : "border text-gray-700 hover:bg-gray-100"}`}
                                    >
                                        <div className="flex">
                                            <div className={`flex_center bg-gray-200 p-4 rounded-lg 
                                                ${roomType === "LODGE" && "bg-roomi-00 text-roomi"}`}
                                            >
                                                <FontAwesomeIcon icon={faCheckCircle} className="w-6 h-6"/>
                                            </div>
                                            <div className="w-full ml-4">
                                                <div className={`font-bold ${roomType === "LODGE" && "text-roomi"}`}>
                                                    사업자 신고 완료 공간
                                                </div>
                                                <div className="text-gray-500 md:text-sm text-xs mt-1">
                                                    공식 등록된 사업자로 운영되는 공간 입니다.
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex text-gray-500 md:text-sm text-xs mt-2">
                                            <div className="p-4"><div className="w-6 h-6"></div></div>
                                            <div className={`w-full ml-4 p-3 ${roomType === "LODGE" && "bg-gray-50 rounded-lg"}`}>
                                                <div className="my-2">
                                                    <strong> · </strong>단기 거주용 쉐어하우스, 게스트하루스 등
                                                </div>
                                                <div className="my-2">
                                                    <strong> · </strong>루미 인증 공간
                                                </div>
                                            </div>
                                            <div className="md:p-4"><div className="w-6 h-6"></div></div>
                                        </div>
                                    </label>
                                    <input type="radio" name="roomType" id="LODGE" value="LODGE"
                                           checked={roomType === "LODGE"}
                                           onChange={() => setRoomType("LODGE")} className="hidden"/>
                                </div>
                            </div>
                            {/* 안내사항 */}
                            <div className="p-4 rounded-lg bg-roomi-000 mt-4">
                                <div className="flex items-center text-roomi m-2">
                                    <div className="w-5 h-5 flex_center border-2 border-roomi rounded-full">
                                        <FontAwesomeIcon icon={faInfo} className="w-3 h-3" />
                                    </div>
                                    <div className="ml-4 font-bold">안내사항</div>
                                </div>
                                <div className="text-gray-500 text-sm">
                                    <div className="p-1 px-2">
                                        <strong> · </strong>불법 숙박업소 운영 시 관련법에 따라 처벌 될 수 있습니다.
                                    </div>
                                    <div className="p-1 px-2">
                                        <strong> · </strong>선택하신 유형에 따라 필요한 서류가 요청 될 수 있습니다.
                                    </div>
                                    <div className="p-1 px-2">
                                        <strong> · </strong>허위로 공간 유형을 선택 할 경우 계정이 제한 될 수 있습니다.
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {currentStep === 2 && (
                        /*공간 이름*/
                        <div className="m-2">
                            <div className="">
                                <input type="text" placeholder="공간 이름"
                                       className="w-full p-4 border border-gray-300 rounded focus:outline-none"/>
                            </div>
                            <div className="p-4 rounded-lg bg-roomi-000 mt-4">
                                <div className="flex items-center text-roomi m-2">
                                    <div className="w-5 h-5 flex_center border-2 border-roomi rounded-full">
                                        <FontAwesomeIcon icon={faInfo} className="w-3 h-3"/>
                                    </div>
                                    <div className="ml-4 font-bold">도움말</div>
                                </div>
                                <div className="text-gray-500 text-sm">
                                    <div className="p-1 px-2">
                                        <strong> · </strong>위치, 특징, 분위기를 잘 나타내는 이름을 추천드려요.
                                    </div>
                                    <div className="p-1 px-2">
                                        <strong> · </strong>지나치게 과장 된 표현은 피해주세요.
                                    </div>
                                    <div className="p-1 px-2">
                                        <strong> · </strong>이모지 사용 가능해요.
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {currentStep === 3 && (
                        /* 위치 정보 */
                        <div className="relative">
                            <input
                                type="text"
                                value={roomFormData.address}
                                readOnly
                                onClick={() => setDaumAddressModal(true)}
                                placeholder="주소"
                                className="w-full border border-gray-300 rounded p-2 pr-10 cursor-pointer focus:outline-none"
                            />
                            <div className="absolute right-3.5 top-2 text-roomi pointer-events-none">
                                <FontAwesomeIcon icon={faMagnifyingGlass} className="w-4 h-4"/>
                            </div>
                            <Modal
                                isOpen={daumAddressModal}
                                onRequestClose={() => setDaumAddressModal(false)}
                                className="bg-white p-4 rounded shadow-lg max-w-md mx-auto"
                                overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
                            >
                                <DaumPostcode
                                    style={{height: 600}}
                                    onComplete={handleAddress}
                                />
                            </Modal>
                            <input
                                type="text"
                                value={roomFormData.addressDetail}
                                onChange={(e) => handleChange("addressDetail", e.target.value)}
                                placeholder="상세 주소"
                                className="w-full border border-gray-300 rounded p-2 mt-4 focus:outline-none"
                            />
                            <div className="p-4 rounded-lg bg-roomi-000 mt-4">
                                <div className="flex items-center text-roomi m-2">
                                    <div className="w-5 h-5 flex_center border-2 border-roomi rounded-full">
                                        <FontAwesomeIcon icon={faInfo} className="w-3 h-3"/>
                                    </div>
                                    <div className="ml-4 font-bold">개인정보 보호</div>
                                </div>
                                <div className="text-gray-500 text-sm">
                                    <div className="p-1 px-2">
                                        <strong> · </strong>정확한 위치는 예약 완료 후에만 게스트에게 공개됩니다.
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {currentStep === 4 && (
                        /* 건물 정보 */
                        <div>
                            <div className="p-4 rounded-lg bg-roomi-000 mb-4">
                                <div className="flex items-center text-roomi m-2">
                                    <div className="w-5 h-5 flex_center border-2 border-roomi rounded-full">
                                        <FontAwesomeIcon icon={faInfo} className="w-3 h-3"/>
                                    </div>
                                    <div className="ml-4 font-bold">단기 임대 공간 정보</div>
                                </div>
                                <div className="text-gray-500 text-sm">
                                    <div className="p-1 px-2">
                                        <strong> · </strong>단기 임대로 운영 되는 주거 공간에 적합한 건물 유형을 선택해주세요.
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className="mb-4">
                                    <input type="text" placeholder="건물 유형"
                                           className="w-full border border-gray-300 rounded p-2 focus:outline-none"/>
                                </div>
                                <div className="flex justify-between mb-4">
                                    <input type="number" placeholder="전용 면적"
                                           className="w-3/5 border border-gray-300 rounded p-2 focus:outline-none"/>
                                    <input type="number" placeholder="해당 층수"
                                           className="w-1/3 border border-gray-300 rounded p-2 focus:outline-none"/>
                                </div>
                                <div className="flex gap-4">
                                    <label htmlFor="hasElevator"
                                           className={`flex_center flex-col gap-2 border-2 rounded-lg w-32 h-24 text-gray-500
                                           ${roomFormData.hasElevator && "border-roomi text-roomi"}`}
                                    >
                                        <span><FontAwesomeIcon icon={faElevator} className="text-xl"/></span>
                                        <span className="text-sm font-bold">엘리베이터</span>
                                    </label>
                                    <input
                                        id="hasElevator"
                                        type="checkbox"
                                        checked={roomFormData.hasElevator}
                                        onChange={(e) =>
                                            setRoomFormData((prev) => ({
                                                ...prev,
                                                hasElevator: e.target.checked,
                                            }))
                                        }
                                        className="hidden"
                                    />

                                    {/* 주차 가능 */}
                                    <label htmlFor="hasParking"
                                           className={`flex_center flex-col gap-2 border-2 rounded-lg w-32 h-24 text-gray-500
                                           ${roomFormData.hasParking && "border-roomi text-roomi"}`}
                                    >
                                        <span><FontAwesomeIcon icon={faP} className="text-xl"/></span>
                                        <span className="text-sm font-bold">주차 가능</span>
                                    </label>
                                    <input
                                        id="hasParking"
                                        type="checkbox"
                                        checked={roomFormData.hasParking}
                                        onChange={(e) =>
                                            setRoomFormData((prev) => ({
                                                ...prev,
                                                hasParking: e.target.checked,
                                            }))
                                        }
                                        className="hidden"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                    {/*{currentStep === 5 && ()}*/}
                    {/*{currentStep === 6 && ()}*/}
                    {/*{currentStep === 7 && ()}*/}
                    {/*{currentStep === 8 && ()}*/}
                    {/*{currentStep === 9 && ()}*/}
                    {/*{currentStep === 10 && ()}*/}
                    {/*{currentStep === 11 && ()}*/}
                    {/*{currentStep === 12 && ()}*/}
                    {/*{currentStep === 13 && ()}*/}
                    {/*{currentStep === 14 && ()}*/}
                    {/*{currentStep === 15 && ()}*/}
                </div>

                {/* 이전/다음 버튼 */}
                <div className="flex justify-between">
                    {currentStep > 1 ? (
                        <button className="px-4 py-2 rounded-md text-roomi" onClick={handlePrev}>이전</button>
                    ) : (
                        <div></div>
                    )}
                    {currentStep === totalSteps ? (
                        <button className={`px-4 py-2 bg-roomi text-white rounded-md`} type="submit">등록</button>
                    ) : (
                        <button className={`px-4 py-2 bg-roomi text-white rounded-md`} onClick={handleNext}>다음</button>
                    )}
                </div>
            </form>

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
