import React, { useState } from "react";
import {useNavigate} from "react-router-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowLeft} from "@fortawesome/free-solid-svg-icons";
import {useTranslation} from "react-i18next";

const UserJoinScreen = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [showModal, setShowModal] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 5; // 전체 단계 수

    const [formData, setFormData] = useState({
        email: "",
        password: "",
        name: "",
        gender: "",
        birth: "",
        phone: "",
        checkboxes: [false, false, false],
    });

    const handleBack = () => setShowModal(true);
    const confirmBack = () => navigate('/');

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

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleCheckboxChange = (index: number) => {
        const newCheckboxes = [...formData.checkboxes];
        newCheckboxes[index] = !newCheckboxes[index];
        setFormData(prev => ({ ...prev, checkboxes: newCheckboxes }));
    };

    const requiredChecked = formData.checkboxes[0] && formData.checkboxes[1];

    const checkboxList = [
        { label: t("개인정보처리방침동의"), required: true },
        { label: t("약관동의동의"), required: true },
        { label: t("마케팅수신동의동의"), required: false }
    ];

    return (
        <div className="p-6">
            <div className="mb-6 p-4 border rounded-md flex">
                <div className="flex_center">
                    {/* 뒤로 가기 버튼 */}
                    <button className="rounded-md p-2 w-10 h-10 sm:p-4 sm:w-14 sm:h-14" onClick={handleBack}>
                        <FontAwesomeIcon icon={faArrowLeft} />
                    </button>
                </div>
                <div className="mx-4 flex_center">
                    <div className="text-xl font-bold">Roomi에 오신것을 환영합니다!</div>
                </div>
            </div>

            {/* 단계 진행 바 */}
            <div className="w-full mb-4">
                <div className="relative h-2 bg-gray-200 rounded-full mx-1">
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
                {currentStep === 1 && (
                    <div>
                        <label htmlFor="email">{t('이메일')}</label>
                        <input id="email" type="email" placeholder={`${t('이메일')}`} value={formData.email}
                               onChange={(e) => handleChange("email", e.target.value)}
                               className="border p-2 w-full" />
                    </div>
                )}
                {currentStep === 2 && (
                    <div>
                        <label htmlFor="password">{t('비밀번호')}</label>
                        <input id="password" type="password" placeholder={`${t("비밀번호")}`} value={formData.password}
                               onChange={(e) => handleChange("password", e.target.value)}
                               className="border p-2 w-full"/>
                    </div>
                )}
                {currentStep === 3 && (
                    <div>
                        <label htmlFor="name">{t('이름')}</label>
                        <input id="name" type="text" placeholder={`${t("이름")}`} value={formData.name}
                               onChange={(e) => handleChange("name", e.target.value)}
                               className="border p-2 w-full mb-2"/>
                        <div className="mb-2">
                            <label className="mr-4">
                                <input type="radio" name="gender" value="MALE" checked={formData.gender === "MALE"}
                                       onChange={(e) => handleChange("gender", e.target.value)}
                                       className="accent-roomi"/>{t("남")}
                            </label>
                            <label className="mr-4">
                                <input type="radio" name="gender" value="FEMALE" checked={formData.gender === "FEMALE"}
                                       onChange={(e) => handleChange("gender", e.target.value)}
                                       className="accent-roomi"/>{t("여")}
                            </label>
                            <label>
                                <input type="radio" name="gender" value="OTHER" checked={formData.gender === "OTHER"}
                                       onChange={(e) => handleChange("gender", e.target.value)}
                                       className="accent-roomi"/>{t("선택없음")}
                            </label>
                        </div>
                        <label htmlFor="birth">{t('생년월일')}</label>
                        <input id="birth" type="date" value={formData.birth}
                               onChange={(e) => handleChange("birth", e.target.value)}
                               onFocus={(e) => e.target.showPicker?.()}
                               className="border p-2 w-full"/>
                    </div>
                )}
                {currentStep === 4 && (
                    <div>
                        <label htmlFor="phone">{t('전화번호')}</label>
                        <input id="phone" type="tel" placeholder={`${t("전화번호")}`} value={formData.phone}
                               onChange={(e) => handleChange("phone", e.target.value)}
                               className="border p-2 w-full"/>
                    </div>
                )}
                {currentStep === 5 && (
                    <div>
                        {checkboxList.map((item, index) => (
                            <label key={index} className="flex items-center mb-2 w-fit">
                                <input type="checkbox" checked={formData.checkboxes[index]}
                                       onChange={() => handleCheckboxChange(index)}
                                       className={`mr-2 ${formData.checkboxes[index] ? "accent-roomi" : ""}`} />
                                {`${t(item.label)} (${t(item.required ? `${t("필수")}` : `${t("선택")}`)})`}
                            </label>
                        ))}
                    </div>
                )}
            </div>

            {/* 이전/다음 버튼 */}
            <div className="flex justify-between">
                {currentStep > 1 ? (
                    <button className="px-4 py-2 rounded-md text-roomi" onClick={handlePrev}>
                        이전
                    </button>
                ) : (
                    <div></div>
                )}
                {currentStep === 5 ? (
                    <button
                        className={`px-4 py-2 rounded-md text-white ${requiredChecked ? "bg-roomi" : "bg-gray-300 cursor-not-allowed"}`}
                        disabled={!requiredChecked}>
                        등록
                    </button>
                ) : (
                    <button className="px-4 py-2 bg-roomi text-white rounded-md" onClick={handleNext}>
                        다음
                    </button>
                )}
            </div>

            {/* 모달 */}
            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50">
                    <div className="bg-white p-6 rounded-md shadow-md">
                        <div className="mb-4">
                        회원가입을 종료하시겠습니까?
                        </div>
                        <div className="flex justify-end">
                            <button className="px-4 py-2 bg-gray-300 rounded-md" onClick={() => setShowModal(false)}>
                                {t("취소")}
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

export default UserJoinScreen;
