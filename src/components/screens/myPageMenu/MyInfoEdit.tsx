import React, {useEffect, useRef, useState} from 'react';
import {useTranslation} from "react-i18next";
import {getUserById, updateUserInfo} from "../../../api/api";
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
    const [confirmPassword, setConfirmPassword] = useState('');
    // 오류 메시지 상태 추가
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    // 초기 form 상태 저장용
    const initialFormRef = useRef<User | null>(null);
    // 프로필 파일 및 미리보기 관리
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string>("");

    // 사진파일 관련 ref
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const userId = localStorage.getItem('userId');
                if (userId !== null) {
                    const response = await getUserById(Number(userId));
                    const data = await response.json();
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
        setErrors({}); // 오류 초기화
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev!,
            [name]: value
        }));
    };

    const handleEditMyInfo = () => {
        setEditMyInfo(true);
        if (userInfo) {
            const init = {
                name: userInfo.name,
                email: userInfo.email,
                phone: userInfo.phone ?? '',
                birth: userInfo.birth ? dayjs.utc(userInfo.birth).format('YYYY-MM-DD') : '',
                // password: userInfo.password,
                password: '', // 비밀번호 변경 시 입력 받음
                bank_holder: userInfo.bank_holder ?? '',
                bank: userInfo.bank ?? '',
                account: userInfo.account ?? ''
            } as User;
            setForm(init);
            initialFormRef.current = init;
        }
    };

    // 취소 처리 (변경사항 확인)
    const handleCancel = () => {
        if (!form || !initialFormRef.current) {
            setEditMyInfo(false);
            return;
        }
        // 변경 체크
        const initial = initialFormRef.current;
        const hasChange = selectedFile ||
            Object.entries(form).some(([key, value]) => (initial as any)[key] !== value);
        if (hasChange) {
            const confirmCancel = window.confirm(t('변경사항이 있습니다. 수정을 종료하시겠습니까?'));
            if (!confirmCancel) return;
        }
        // 초기 상태 복원
        setForm(initial);
        setSelectedFile(null);
        setPreview("");
        setEditMyInfo(false);
        setConfirmPassword('');
        setErrors({}); // 오류 초기화
    };

    /*사진 파일 관련*/
    // 숨겨진 파일 input 클릭 트리거
    const handleInputFileSet = () => {
        fileInputRef.current?.click();
    };
    // 파일 선택 시 실행될 함수
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        if (file) {
            setSelectedFile(file);
            setPreview(URL.createObjectURL(file));
        }
        // 같은 파일 재업로드 시 이벤트 트리거
        e.target.value = "";
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!form || !initialFormRef.current || !userInfo) return;

        const newErrors: { [key: string]: string } = {}; // 새로운 오류 객체

        // 초기 유저 데이터
        const initial = initialFormRef.current;

        // 변경사항 체크
        const hasChange = selectedFile ||
            Object.entries(form).some(([key, value]) => (initial as any)[key] !== value);

        // 변경사항 없으면 종료
        if (!hasChange) {
            alert(t('수정사항이 없습니다.'));
            setEditMyInfo(false);
            return;
        } else {
            // 변경사항 있으면 유효성 검사

            // 전화번호 변경 시
            if (!/^\d{10,11}$/.test(form.phone as string)) {
                newErrors.phone = "올바른 전화번호를 입력하세요.";
            }

            // 비밀번호 변경 시
            if (form.password.length < 8) {
                newErrors.password = "비밀번호는 최소 8자리 이상이어야 합니다.";
            }
            if (form.password !== confirmPassword) {
                newErrors.confirmPassword = "비밀번호가 일치하지 않습니다.";
            }

            // 오류가 있으면 상태 업데이트 후 진행 중지
            if (Object.keys(newErrors).length > 0) {
                setErrors(newErrors);
                return;
            }
            // 오류가 없으면 다음 단계로 이동
            setErrors({}); // 오류 초기화
        }

        // 변경된 필드만 담을 객체
        const updatedData: Partial<typeof form> = {}

        Object.entries(form).forEach(([key, value]) => {
            const initialValue = (initial as any)[key]
            if (value !== initialValue) {
                // birth 필드는 ISO 포맷으로 변환
                if (key === 'birth' && typeof value === 'string') {
                    updatedData.birth = dayjs.utc(value).startOf('day').toISOString()
                } else {
                    ;(updatedData as any)[key] = value
                }
            }
        })
        
        console.log('정보 수정', updatedData);

        try {
            const response = await updateUserInfo(updatedData, selectedFile);
            if (response.ok) {
                alert("정보 수정이 완료되었습니다.");
            } else {
                alert("업데이트에 실패했습니다.");
            }
        } catch (e) {
            console.error('수정 실패', e);
        }
        setEditMyInfo(false);
        window.location.reload();
    };

    return (
        <div className="p-4 md:px-8">
            <form onSubmit={handleSubmit}>
                <div className="flex justify-between items-center mb-6">
                    {editMyInfo ? (
                        <div>
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="py-2 px-5 mr-2 text-white text-sm rounded bg-gray-300 hover:bg-gray-400"
                            >
                                {t('취소')}
                            </button>
                            <button
                                type="submit"
                                className="py-2 px-5 text-white text-sm rounded bg-roomi hover:bg-roomi-3"
                            >
                                {t('완료')}
                            </button>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={handleEditMyInfo}
                            className="py-2 px-5 text-white text-sm rounded bg-roomi hover:bg-roomi-3"
                        >
                            {t('수정')}
                        </button>
                    )}
                </div>

                {userInfo ? (
                    <>
                        {editMyInfo ? (
                            <div className="flex flex-col items-center gap-6">
                                {/* 프로필 이미지 */}
                                <div className="flex-shrink-0 relative">
                                    <img
                                        src={preview || userInfo.profile_image || '/assets/images/profile.png'}
                                        alt="프로필 이미지"
                                        className="w-32 h-32 rounded-full border"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleInputFileSet}
                                        className="w-8 h-8 bg-gray-500 text-white text-sm flex_center rounded-full absolute right-0 bottom-0"
                                    >
                                        <FontAwesomeIcon icon={faImage} className="w-4 h-4"/>
                                    </button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*" // 이미지 파일만 선택 가능
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />
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
                                    {errors.phone && (
                                        <div className="flex">
                                            <span className="w-1/4 flex items-center"></span>
                                            <p className="w-full text-red-500 text-sm">{errors.phone}</p>
                                        </div>
                                    )}

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
                                        {errors.password && (
                                            <div className="flex">
                                                <span className="w-1/4 flex items-center"></span>
                                                <p className="w-full text-red-500 text-sm">{errors.password}</p>
                                            </div>
                                        )}

                                        <div className="flex">
                                            <span className="w-1/4 flex items-center text-sm text-gray-500">{t('비밀번호 확인')}</span>
                                            <input
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full mt-1 pr-4 pl-2 py-2 border rounded"
                                                placeholder={t('비밀번호를 다시 입력하세요')}
                                            />
                                        </div>
                                        {errors.confirmPassword && (
                                            <div className="flex">
                                                <span className="w-1/4 flex items-center"></span>
                                                <p className="w-full text-red-500 text-sm">{errors.confirmPassword}</p>
                                            </div>
                                        )}
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
