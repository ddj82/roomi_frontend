import React, {useEffect, useState} from 'react';
import {useTranslation} from "react-i18next";
import {getUserById} from "../../../api/api";
import {User} from "../../../types/user";
export default function MyInfoEdit() {
    const {t} = useTranslation();
    const [userInfo, setUserInfo] = useState<User | null>(null);

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const userId = localStorage.getItem('userId');
                console.log('userId',userId);
                if (userId !== null) {
                    const response = await getUserById(Number(userId));
                    const data = await response.json();
                    console.log('response 제이슨',data);
                    setUserInfo(data);
                }
            } catch (e) {
                console.error('유저 정보 불러오기 실패:', e);
            }
        };
        fetchUserInfo();
    }, []);

    return (
        <div className="p-4 md:px-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="font_title">{t('내 정보')}</h2>
                <button type="button" className="py-2 px-5 text-white text-sm rounded bg-roomi hover:bg-roomi-dark">
                    {t('수정')}
                </button>
            </div>

            {userInfo ? (
                <div className="flex flex-col md:flex-row items-center gap-6">
                    {/* 프로필 이미지 */}
                    <div className="flex-shrink-0">
                        <img
                            src={userInfo.profile_image ?? '/assets/images/profile.png'}
                            alt="프로필 이미지"
                            className="w-32 h-32 rounded-full border"
                        />
                    </div>

                    {/* 사용자 정보 */}
                    <div className="flex-1 space-y-4 w-full">
                        <div className="border-b pb-2">
                            <label className="block text-sm text-gray-500">{t('이름')}</label>
                            <div className="text-base">{userInfo.name}</div>
                        </div>
                        <div className="border-b pb-2">
                            <label className="block text-sm text-gray-500">{t('이메일')}</label>
                            <div className="text-base">{userInfo.email}</div>
                        </div>
                        {userInfo.phone && (
                            <div className="border-b pb-2">
                                <label className="block text-sm text-gray-500">{t('전화번호')}</label>
                                <div className="text-base">{userInfo.phone}</div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="text-gray-500">{t('유저 정보를 불러오는 중입니다...')}</div>
            )}
        </div>
    );
};
