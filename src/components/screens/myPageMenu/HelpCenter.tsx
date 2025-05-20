import React from 'react';
import {useTranslation} from "react-i18next";
import {useNavigate} from "react-router-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faClock, faCommentDots, faComments, faEnvelope, faHeading, faUser} from "@fortawesome/free-solid-svg-icons";
import {faCopy} from "@fortawesome/free-regular-svg-icons";
import {useHostModeStore} from "../../stores/HostModeStore";

export default function HelpCenter() {
    const {t} = useTranslation();
    const navigate = useNavigate();
    const {hostMode} = useHostModeStore();

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

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        console.log('Submit ㅎㅇ');
    };

    return (
        <div className="p-4 md:px-8 max-w-3xl mx-auto">
            <div className="mb-8 flex flex-col gap-2">
                <h3 className="text-lg font-bold mb-2">카카오톡으로 문의하기</h3>
                <div className="text-xs">
                    빠른 응답이 필요하시면 카카오톡 채널로 문의해주세요.
                </div>
                <div>
                    <button
                        type="button"
                        className="bg-yellow-300 rounded p-2 px-8 font-bold flex_center gap-2 w-full md:w-fit"
                        onClick={handleKakaoChannelBtn}
                    >
                        <FontAwesomeIcon icon={faComments}/>
                        카카오톡 채널 열기
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
                <h3 className="text-lg font-bold mb-2">이메일로 문의하기</h3>
                <form onSubmit={handleSubmit} className="flex flex-col gap-1">
                    <div className="relative">
                        <div className="absolute left-3.5 top-2 pointer-events-none">
                            <FontAwesomeIcon icon={faUser} className="w-4 h-4 text-gray-400"/>
                        </div>
                        <input
                            type="text"
                            // onChange={(e) => handleChange(e.target.value)}
                            placeholder="이름"
                            className="w-full p-2 pl-10 border rounded focus:outline-none"
                        />
                    </div>
                    <div className="relative">
                        <div className="absolute left-3.5 top-2 pointer-events-none">
                            <FontAwesomeIcon icon={faEnvelope} className="w-4 h-4 text-gray-400"/>
                        </div>
                        <input
                            type="text"
                            // onChange={(e) => handleChange(e.target.value)}
                            placeholder="이메일"
                            className="w-full p-2 pl-10 border rounded focus:outline-none"
                        />
                    </div>
                    <div className="relative">
                        <div className="absolute left-3.5 top-2 pointer-events-none">
                            <FontAwesomeIcon icon={faHeading} className="w-4 h-4 text-gray-400"/>
                        </div>
                        <input
                            type="text"
                            // onChange={(e) => handleChange(e.target.value)}
                            // name=""
                            // id=""
                            placeholder="제목"
                            className="w-full p-2 pl-10 border rounded focus:outline-none"
                        />
                    </div>
                    <div className="relative">
                        <div className="absolute left-3.5 top-2 pointer-events-none">
                            <FontAwesomeIcon icon={faCommentDots} className="w-4 h-4 text-gray-400"/>
                        </div>
                        <textarea
                            // onChange={(e) => handleChange("", e.target.value)}
                            // name=""
                            // id=""
                            placeholder="문의 내용"
                            cols={30}
                            rows={6}
                            className="w-full p-2 pl-10 border border-gray-300 rounded focus:outline-none resize-none"></textarea>
                    </div>
                    <button
                        // type="submit"
                        type="button"
                        disabled
                        className="bg-roomi rounded text-white font-bold p-2"
                        // onClick={}
                    >
                        문의하기
                    </button>
                </form>
            </div>
            <div className="flex flex-col gap-2">
                <h3 className="text-lg font-bold mb-2">{hostMode && '호스트 '}지원 정보</h3>
                <div className="flex gap-8">
                    <div className="flex_center text-gray-500"><FontAwesomeIcon icon={faClock} /></div>
                    <div>
                        <div>운영 시간</div>
                        <div className="text-gray-500 text-sm">평일 09:00 - 18:00 (공휴일 제외)</div>
                    </div>
                </div>
                <div className="flex gap-8">
                    <div className="flex_center text-gray-500"><FontAwesomeIcon icon={faEnvelope}/></div>
                    <div>
                        <div>{hostMode && '호스트 '}지원 이메일</div>
                        <div className="text-gray-500 text-sm">help@roomi.co.kr</div>
                    </div>
                </div>
            </div>
        </div>
    );
};
