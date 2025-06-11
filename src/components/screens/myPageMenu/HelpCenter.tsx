import React, {useState} from 'react';
import {useTranslation} from "react-i18next";
import {useNavigate} from "react-router-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faClock, faCommentDots, faComments, faEnvelope, faHeading, faUser} from "@fortawesome/free-solid-svg-icons";
import {faCopy} from "@fortawesome/free-regular-svg-icons";
import {useHostModeStore} from "../../stores/HostModeStore";
import {sendHelpMessage} from "../../../api/api";

export default function HelpCenter() {
    const {t} = useTranslation();
    const navigate = useNavigate();
    const {hostMode} = useHostModeStore();
    const [sendEmailForm, setSendEmailForm] = useState({
        name: '',
        email: '',
        title: '',
        content: '',
    });
    // 오류 메시지 상태 추가
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const handleKakaoChannelBtn = () => {
        window.open(`http://pf.kakao.com/_xkEFxjn`, '_blank');
    };

    const handleCopyClipBoard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            alert("클립보드에 링크가 복사되었어요.");
        } catch (err) {
            console.log(err);
        }
    };

    const handleChange = (field: string, value: any) => {
        setSendEmailForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        const newErrors: { [key: string]: string } = {}; // 새로운 오류 객체

        if (sendEmailForm.name === "") {
            newErrors.name = "발신자를 입력해주세요.";
        }

        if (sendEmailForm.email === "") {
            newErrors.email = "발신 이메일을 입력해주세요.";
        } else if (!/^\S+@\S+\.\S+$/.test(sendEmailForm.email)) {
            newErrors.email = "올바른 이메일 형식을 입력하세요.";
        }

        if (sendEmailForm.title === "") {
            newErrors.title = "제목을 입력해주세요.";
        }

        if (sendEmailForm.content === "") {
            newErrors.content = "문의 내용을 입력해주세요.";
        }

        // 오류가 있으면 상태 업데이트 후 진행 중지
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // 오류가 없으면 다음 단계로 이동
        setErrors({}); // 오류 초기화
        const confirmCancel = window.confirm(t('이메일 전송을 하시겠습니까?'));
        if (confirmCancel) {
            try {
                const response = await sendHelpMessage(sendEmailForm);
                const responseJson = await response.json();
                if (responseJson.success) {
                    alert('이메일이 성공적으로 발송되었습니다.');
                } else {
                    alert('이메일 발송에 실패하였습니다.');
                }
                window.location.reload();
            } catch (err) {
                console.error('메일전송 실패', err);
            }
        } else {
            return;
        }
    };

    return (
        <div className="p-4 md:px-8 max-w-3xl mx-auto">
            <div className="mb-8 flex flex-col gap-2">
                <h3 className="text-lg font-bold mb-2">{t('카카오톡으로 문의하기')}</h3>
                <div className="text-xs">
                    {t('빠른 응답이 필요하시면 카카오톡 채널로 문의 해주세요.')}
                </div>
                <div>
                    <button
                        type="button"
                        className="bg-yellow-300 rounded p-2 px-8 font-bold flex_center gap-2 w-full md:w-fit"
                        onClick={handleKakaoChannelBtn}
                    >
                        <FontAwesomeIcon icon={faComments}/>
                        {t('카카오톡 채널 열기')}
                    </button>
                </div>
                <div>
                    <div className="text-sm flex gap-2 rounded bg-gray-200 w-fit p-2">
                        <span>http://pf.kakao.com/_xkEFxjn</span>
                        <button
                            type="button"
                            onClick={() => handleCopyClipBoard('http://pf.kakao.com/_xkEFxjn')}
                        >
                            <FontAwesomeIcon icon={faCopy}/>
                        </button>
                    </div>
                </div>
            </div>
            <div className="mb-8 flex flex-col gap-2">
                <h3 className="text-lg font-bold mb-2">{t('이메일로 문의하기')}</h3>
                <form onSubmit={handleSubmit} className="flex flex-col gap-1">
                    <div className="relative">
                        <div className="absolute left-3.5 top-2 pointer-events-none">
                            <FontAwesomeIcon icon={faUser} className="w-4 h-4 text-gray-400"/>
                        </div>
                        <input
                            type="text"
                            onChange={(e) => handleChange('name', e.target.value)}
                            name="name"
                            id="name"
                            placeholder={t('이름')}
                            className="w-full p-2 pl-10 border rounded focus:outline-none"
                        />
                    </div>
                    {errors.name && <p className="font-bold text-red-500 text-sm">{errors.name}</p>}
                    <div className="relative">
                        <div className="absolute left-3.5 top-2 pointer-events-none">
                            <FontAwesomeIcon icon={faEnvelope} className="w-4 h-4 text-gray-400"/>
                        </div>
                        <input
                            type="text"
                            onChange={(e) => handleChange('email', e.target.value)}
                            name="email"
                            id="email"
                            placeholder={t('이메일')}
                            className="w-full p-2 pl-10 border rounded focus:outline-none"
                        />
                    </div>
                    {errors.email && <p className="font-bold text-red-500 text-sm">{errors.email}</p>}
                    <div className="relative">
                        <div className="absolute left-3.5 top-2 pointer-events-none">
                            <FontAwesomeIcon icon={faHeading} className="w-4 h-4 text-gray-400"/>
                        </div>
                        <input
                            type="text"
                            onChange={(e) => handleChange('title', e.target.value)}
                            name="title"
                            id="title"
                            placeholder={t('제목')}
                            className="w-full p-2 pl-10 border rounded focus:outline-none"
                        />
                    </div>
                    {errors.title && <p className="font-bold text-red-500 text-sm">{errors.title}</p>}
                    <div className="relative">
                        <div className="absolute left-3.5 top-2 pointer-events-none">
                            <FontAwesomeIcon icon={faCommentDots} className="w-4 h-4 text-gray-400"/>
                        </div>
                        <textarea
                            onChange={(e) => handleChange('content', e.target.value)}
                            name="content"
                            id="content"
                            placeholder={t('문의 내용')}
                            cols={30}
                            rows={6}
                            className="w-full p-2 pl-10 border border-gray-300 rounded focus:outline-none resize-none"></textarea>
                    </div>
                    {errors.content && <p className="font-bold text-red-500 text-sm">{errors.content}</p>}
                    <button
                        type="submit"
                        className="bg-roomi rounded text-white font-bold p-2"
                    >
                        {t('문의하기')}
                    </button>
                </form>
            </div>
            <div className="flex flex-col gap-2">
                <h3 className="text-lg font-bold mb-2">{t('지원 정보')}</h3>
                <div className="flex gap-8">
                    <div className="flex_center text-gray-500"><FontAwesomeIcon icon={faClock} /></div>
                    <div>
                        <div>{t('운영 시간')}</div>
                        <div className="text-gray-500 text-sm">{t('평일')} 09:00 - 18:00 ({t('공휴일 제외')})</div>
                    </div>
                </div>
                <div className="flex gap-8">
                    <div className="flex_center text-gray-500"><FontAwesomeIcon icon={faEnvelope}/></div>
                    <div>
                        <div>{t('지원 이메일')}</div>
                        <div className="text-gray-500 text-sm">help@roomi.co.kr</div>
                    </div>
                </div>
            </div>
        </div>
    );
};
