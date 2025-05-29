import React, {useState} from 'react';
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

    return (
        <div className="flex flex-col items-center gap-6">
            {/*인증 모달 컴포넌트 (조건부 렌더링)*/}
            {certificationModal && (
                <RoomDetailCertificationModal
                    visible={certificationModal}
                    onClose={() => setCertificationModal(false)}
                    isKorean={!!localStorage.getItem('isKorean')}
                    onCertificationComplete={handleCertificationComplete}
                />
            )}
            {/* 프로필 이미지 */}
            <div className="flex-shrink-0">
                <img
                    src={user.profile_image ?? '/assets/images/profile.png'}
                    alt="프로필 이미지"
                    className="w-32 h-32 rounded-full border"
                />
            </div>

            {/* 본인인증 여부 */}
            <div className="w-full md:w-fit">
                <div>
                    {user.identity_verified ? (
                        <div>
                            회원님의 본인 인증이 완료되었어요.
                        </div>
                    ) : (
                        <div>
                            <button
                                type="button"
                                onClick={() => setCertificationModal(true)}
                                className="bg-roomi text-white rounded w-full p-2 md:px-4"
                            >
                                본인인증 하기
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* 사용자 정보 */}
            <div className="flex-1 space-y-6 w-full">
                <div className="flex">
                    <span className="w-1/4 flex items-center text-sm text-gray-500">{t('이름')}</span>
                    <input
                        type="text"
                        defaultValue={user.name}
                        disabled
                        className="w-full mt-1 pr-4 pl-2 py-2 border rounded bg-gray-100"
                    />
                </div>

                <div className="flex">
                    <span className="w-1/4 flex items-center text-sm text-gray-500">{t('이메일')}</span>
                    <input
                        type="email"
                        defaultValue={user.email}
                        disabled
                        className="w-full mt-1 pr-4 pl-2 py-2 border rounded bg-gray-100"
                    />
                </div>

                <div className="flex">
                    <span className="w-1/4 flex items-center text-sm text-gray-500">{t('전화번호')}</span>
                    <input
                        type="tel"
                        defaultValue={user.phone}
                        disabled
                        className="w-full mt-1 pr-4 pl-2 py-2 border rounded bg-gray-100"
                    />
                </div>

                {/* 추가 항목 예시 */}
                <div className="flex">
                    <span className="w-1/4 flex items-center text-sm text-gray-500">{t('생년월일')}</span>
                    <input
                        type="date"
                        defaultValue={dayjs.utc(user.birth).format('YYYY-MM-DD')}
                        disabled
                        className="w-full mt-1 pr-4 pl-2 py-2 border rounded bg-gray-100"
                    />
                </div>

                {isHost && (
                    <div className="border-t pt-4 space-y-4">
                        <div className="flex">
                            <span className="w-1/4 flex items-center text-sm text-gray-500">{t('예금주')}</span>
                            <input
                                type="text"
                                defaultValue={user.bank_holder}
                                disabled
                                className="w-full mt-1 pr-4 pl-2 py-2 border rounded"
                            />
                        </div>

                        <div className="flex">
                            <span className="w-1/4 flex items-center text-sm text-gray-500">{t('은행명')}</span>
                            <select
                                className="w-full mt-1 pr-4 pl-2 py-2 border rounded text-sm bg-white"
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

                        <div className="flex">
                            <span className="w-1/4 flex items-center text-sm text-gray-500">{t('계좌번호')}</span>
                            <input
                                type="text"
                                defaultValue={user.account}
                                disabled
                                className="w-full mt-1 pr-4 pl-2 py-2 border rounded"
                                placeholder={t('- 없이 입력해주세요.')}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
