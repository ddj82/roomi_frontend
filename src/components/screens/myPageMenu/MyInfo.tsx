import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useIsHostStore} from '../../stores/IsHostStore';
import {User} from '../../../types/user';
import dayjs from 'dayjs';
import RoomDetailCertificationModal from "../../modals/RoomDetailCertificationModal";
import {uploadIdentification} from "../../../api/api";

interface MyInfoEditProps {
    user: User;
}

export default function MyInfo({user}: MyInfoEditProps) {
    const {t} = useTranslation();
    const {isHost} = useIsHostStore();
    // 본인인증, 여권인증 모달
    const [certificationModal, setCertificationModal] = useState(false);
    const [userIsKorean, setUserIsKorean] = useState(true);

    // 인증 완료 콜백 함수
    const handleCertificationComplete = async (isSuccess: boolean, impUid: string) => {
        setCertificationModal(false); // 모달 닫기

        if (isSuccess) {
            console.log("인증 성공! (마이페이지)");
            const res = await handleUploadIdentification(impUid);
            if (!res) alert('인증 처리 중 문제가 발생하였습니다. 다시 시도해주세요.');
            window.location.reload();
        } else {
            console.log("인증 실패 새로고침");
            alert('본인인증에 실패했습니다. 다시 시도해주세요.');
        }
    };

    // 인증 완료 처리 api 호출 함수
    const handleUploadIdentification = async (impUid: string) => {
        try {
            const response = await uploadIdentification(impUid);
            const responseJson = await response.json();
            return responseJson.success;
        } catch (e) {
            console.error('인증 완료 처리 실패', e);
            return false;
        }
    };

    useEffect(() => {
        if (localStorage.getItem('isKorean')) {
            if (localStorage.getItem('isKorean') === 'true') {
                setUserIsKorean(true);
            } else {
                setUserIsKorean(false)
            }
        }
    }, []);

    return (
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
            {/*인증 모달 컴포넌트 (조건부 렌더링)*/}
            {certificationModal && (
                <RoomDetailCertificationModal
                    visible={certificationModal}
                    onClose={() => setCertificationModal(false)}
                    isKorean={userIsKorean}
                    onCertificationComplete={handleCertificationComplete}
                />
            )}

            <div className="space-y-6">
                {/* 프로필 이미지 */}
                <div className="flex justify-center">
                    <img
                        src={user.profile_image ?? '/assets/images/profile.png'}
                        alt="프로필 이미지"
                        className="w-24 h-24 md:w-32 md:h-32 rounded-full  object-cover"
                    />
                </div>

                {/* 본인인증 섹션 */}
                <div className="bg-gray-50 rounded-lg p-6 ">
                    <div className="text-center">
                        {user.identity_verified ? (
                            <div className="flex items-center justify-center gap-3 text-green-600">
                                <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-semibold text-lg">인증완료</p>
                                    <p className="text-sm text-gray-600">
                                        {userIsKorean ? '내국인' : '외국인'} 본인인증이 완료되었습니다
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-8 h-8 bg-gray-200 rounded-full">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5 text-gray-500"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
                                            />
                                        </svg>
                                    </div>
                                    <div className="text-left">
                                        <p className="font-medium text-gray-800">{t('인증 미완료')}</p>
                                        <p className="text-sm text-gray-600">
                                            {userIsKorean ? t('내국인') : t('외국인')} {t('본인인증을 완료해 주세요.')}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setCertificationModal(true)}
                                    className="flex items-center gap-2 px-4 py-2 text-roomi hover:text-roomi-dark transition-colors"
                                >
                                    <span className="text-sm font-medium">{t('인증하기')}</span>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 5l7 7-7 7"
                                        />
                                    </svg>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* 그리드 레이아웃 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* 기본 정보 섹션 */}
                    <div className="bg-white  rounded-lg overflow-hidden">
                        <div className="p-4 bg-gray-50">
                            <h3 className="font-semibold text-gray-800">{t('기본 정보')}</h3>
                        </div>
                        <div className="p-4 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">{t('이름')}</label>
                                <input
                                    type="text"
                                    defaultValue={user.name}
                                    disabled
                                    className="w-full px-3 py-2  rounded-lg bg-gray-50 text-gray-700"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">{t('이메일')}</label>
                                <input
                                    type="email"
                                    defaultValue={user.email}
                                    disabled
                                    className="w-full px-3 py-2  rounded-lg bg-gray-50 text-gray-700"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">{t('전화번호')}</label>
                                <input
                                    type="tel"
                                    defaultValue={user.phone}
                                    disabled
                                    className="w-full px-3 py-2  rounded-lg bg-gray-50 text-gray-700"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">{t('생년월일')}</label>
                                <input
                                    type="date"
                                    defaultValue={dayjs.utc(user.birth).format('YYYY-MM-DD')}
                                    disabled
                                    className="w-full px-3 py-2  rounded-lg bg-gray-50 text-gray-700"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 정산 정보 섹션 - 항상 표시 */}
                    <div className="bg-white  rounded-lg overflow-hidden">
                        <div className="p-4  bg-gray-50">
                            <h3 className="font-semibold text-gray-800">{t('정산 정보')}</h3>
                        </div>
                        <div className="p-4 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">{t('예금주')}</label>
                                <input
                                    type="text"
                                    defaultValue={user.bank_holder}
                                    disabled
                                    className="w-full px-3 py-2  rounded-lg bg-gray-50 text-gray-700"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">{t('은행명')}</label>
                                <select
                                    className="w-full px-3 py-2  rounded-lg bg-gray-50 text-gray-700"
                                    disabled
                                    defaultValue={user.bank}
                                >
                                    <option value="" disabled>{t('은행 선택')}</option>
                                    <option value="국민은행">국민은행</option>
                                    <option value="우리은행">우리은행</option>
                                    <option value="농협">농협</option>
                                    <option value="하나은행">하나은행</option>
                                    <option value="신한은행">신한은행</option>
                                    <option value="기업은행">기업은행</option>
                                    <option value="카카오뱅크">카카오뱅크</option>
                                    <option value="토스뱅크">토스뱅크</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">{t('계좌번호')}</label>
                                <input
                                    type="text"
                                    defaultValue={user.account}
                                    disabled
                                    className="w-full px-3 py-2  rounded-lg bg-gray-50 text-gray-700"
                                    placeholder={t('- 없이 입력해주세요.')}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}