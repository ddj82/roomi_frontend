import React, {useEffect, useState} from 'react';
import {useTranslation} from "react-i18next";
import {getUserById} from "../../../api/api";
import {User} from "../../../types/user";
import dayjs from "dayjs";
import {useIsHostStore} from "../../stores/IsHostStore";
import MyInfo from "./MyInfo";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faImage} from "@fortawesome/free-regular-svg-icons";

export default function MyInfoEdit() {
    const {t} = useTranslation();
    const [userInfo, setUserInfo] = useState<User | null>(null);
    const {isHost} = useIsHostStore();
    const [editMyInfo, setEditMyInfo] = useState(false);
    const [form, setForm] = useState<User | null>(null);

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const userId = localStorage.getItem('userId');
                if (userId !== null) {
                    const response = await getUserById(Number(userId));
                    const data = await response.json();
                    // console.log('response 제이슨',data);
                    setUserInfo(data);
                }
            } catch (e) {
                console.error('유저 정보 불러오기 실패:', e);
            }
        };
        fetchUserInfo();
    }, []);

    useEffect(() => {
        window.scrollTo({ top: 0 });
    }, [editMyInfo]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev!,
            [name]: value
        }));
    };

    const handleEditMyInfo = () => {
        setEditMyInfo(true);
        if (userInfo) {
            setForm({
                name: userInfo.name,
                email: userInfo.email,
                phone: userInfo.phone ?? '',
                birth: userInfo.birth ? dayjs.utc(userInfo.birth).format('YYYY-MM-DD') : '',
                password: userInfo.password,
                bank_holder: userInfo.bank_holder ?? '',
                bank: userInfo.bank ?? '',
                account: userInfo.account ?? '',
            });
        }
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        console.log('Submit 폼', form);
    };

    return (
        <div className="p-4 md:px-8">
            <form onSubmit={handleSubmit}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="font_title">{t('내 정보')}</h2>
                    {!editMyInfo ? (
                        <button
                            type="button"
                            onClick={handleEditMyInfo}
                            className="py-2 px-5 text-white text-sm rounded bg-roomi hover:bg-roomi-3">
                            {t('수정')}
                        </button>
                    ) : (
                        <div>
                            <button
                                type="button"
                                onClick={() => setEditMyInfo(false)}
                                className="py-2 px-5 mr-2 text-white text-sm rounded bg-gray-300 hover:bg-gray-400">
                                {t('취소')}
                            </button>
                            <button
                                type="submit"
                                className="py-2 px-5 text-white text-sm rounded bg-roomi hover:bg-roomi-3">
                                {t('완료')}
                            </button>
                        </div>
                    )}
                </div>

                {userInfo ? (
                    <>
                        {editMyInfo ? (
                            <div className="flex flex-col items-center gap-6">
                                {/* 프로필 이미지 */}
                                <div className="flex-shrink-0 relative">
                                    <img
                                        src={userInfo.profile_image ?? '/assets/images/profile.png'}
                                        alt="프로필 이미지"
                                        className="w-32 h-32 rounded-full border"
                                    />
                                    <button type="button" className="w-8 h-8 bg-gray-500 text-white text-sm flex_center rounded-full absolute right-0 bottom-0">
                                        <FontAwesomeIcon icon={faImage} className="w-4 h-4"/>
                                    </button>
                                </div>

                                {/* 사용자 정보 */}
                                <div className="flex-1 space-y-6 w-full">
                                    <div className="flex">
                                        <span className="w-1/4 flex items-center text-sm text-gray-500">{t('이름')}</span>
                                        <input
                                            name="name"
                                            type="text"
                                            value={form?.name}
                                            onChange={handleChange}
                                            className="w-full mt-1 pr-4 pl-2 py-2 border rounded bg-gray-100"
                                        />
                                    </div>

                                    <div className="flex">
                                        <span className="w-1/4 flex items-center text-sm text-gray-500">{t('이메일')}</span>
                                        <input
                                            name="email"
                                            type="text"
                                            value={form?.email}
                                            onChange={handleChange}
                                            className="w-full mt-1 pr-4 pl-2 py-2 border rounded bg-gray-100"
                                            disabled
                                        />
                                    </div>

                                    <div className="flex">
                                        <span className="w-1/4 flex items-center text-sm text-gray-500">{t('전화번호')}</span>
                                        <input
                                            name="phone"
                                            type="tel"
                                            value={form?.phone}
                                            onChange={handleChange}
                                            className="w-full mt-1 pr-4 pl-2 py-2 border rounded bg-gray-100"
                                        />
                                    </div>

                                    <div className="flex">
                                        <span className="w-1/4 flex items-center text-sm text-gray-500">{t('생년월일')}</span>
                                        <input
                                            name="birth"
                                            type="date"
                                            value={form?.birth}
                                            onChange={handleChange}
                                            className="w-full mt-1 pr-4 pl-2 py-2 border rounded bg-gray-100"
                                        />
                                    </div>

                                    <div className="border-t pt-4 space-y-4">
                                        <div className="flex">
                                            <span className="w-1/4 flex items-center text-sm text-gray-500">{t('비밀번호 변경')}</span>
                                            <input
                                                name="password"
                                                type="password"
                                                onChange={handleChange}
                                                className="w-full mt-1 pr-4 pl-2 py-2 border rounded"
                                                placeholder={t('새 비밀번호를 입력하세요')}
                                            />
                                        </div>

                                        <div className="flex">
                                            <span className="w-1/4 flex items-center text-sm text-gray-500">{t('비밀번호 확인')}</span>
                                            <input
                                                name="passwordConfirm"
                                                type="password"
                                                onChange={handleChange}
                                                className="w-full mt-1 pr-4 pl-2 py-2 border rounded"
                                                placeholder={t('비밀번호를 다시 입력하세요')}
                                            />
                                        </div>
                                    </div>

                                    {isHost && (
                                        <div className="border-t pt-4 space-y-4">
                                            <div className="flex">
                                                <span className="w-1/4 flex items-center text-sm text-gray-500">{t('예금주')}</span>
                                                <input
                                                    name="bank_holder"
                                                    type="text"
                                                    value={form?.bank_holder}
                                                    onChange={handleChange}
                                                    className="w-full mt-1 pr-4 pl-2 py-2 border rounded"
                                                />
                                            </div>

                                            <div className="flex">
                                                <span className="w-1/4 flex items-center text-sm text-gray-500">{t('은행명')}</span>
                                                <select
                                                    name="bank"
                                                    className="w-full mt-1 pr-4 pl-2 py-2 border rounded text-sm bg-white"
                                                    value={form?.bank}
                                                    onChange={handleChange}
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
                                                    name="account"
                                                    type="text"
                                                    value={form?.account}
                                                    onChange={handleChange}
                                                    className="w-full mt-1 pr-4 pl-2 py-2 border rounded"
                                                    placeholder={t('- 없이 입력해주세요.')}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <MyInfo user={userInfo}/>
                        )}
                    </>
                ) : (
                    <div className="text-gray-500">{t('유저 정보를 불러오는 중입니다...')}</div>
                )}
            </form>
        </div>
    );
};
