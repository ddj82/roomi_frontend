import React from 'react';
import {useTranslation} from 'react-i18next';
import {useIsHostStore} from '../../stores/IsHostStore';
import {User} from '../../../types/user';
import dayjs from 'dayjs';

interface MyInfoEditProps {
    user: User;
}

export default function MyInfo({user}: MyInfoEditProps) {
    const {t} = useTranslation();
    const {isHost} = useIsHostStore();

    return (
        <div className="flex flex-col items-center gap-6">
            {/* 프로필 이미지 */}
            <div className="flex-shrink-0">
                <img
                    src={user.profile_image ?? '/assets/images/profile.png'}
                    alt="프로필 이미지"
                    className="w-32 h-32 rounded-full border"
                />
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
