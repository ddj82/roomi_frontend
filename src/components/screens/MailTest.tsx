import React, {useEffect, useState} from 'react';
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import {getValidationCode, sendVerificationEmail} from "../../api/api";

dayjs.extend(duration);

export default function MailTest() {
    const [email, setEmail] = useState('');
    const [remainingTime, setRemainingTime] = useState(0); // 남은 시간 (초)
    const [isRunning, setIsRunning] = useState(false); // 타이머 실행 여부
    const [inputAuthCode, setInputAuthCode] = useState('');
    const [sendSeccess, setSendSeccess] = useState(false);
    const [isResendDisabled, setIsResendDisabled] = useState(false); // 재발송 버튼 비활성화 상태 추가
    const [isVerified, setIsVerified] = useState(false); // ✅ 인증 성공 여부 추가

    const startTimer = () => {
        setRemainingTime(300); // 5분 (300초)
        setIsRunning(true);
        setIsResendDisabled(true); // 🔹 재발송 버튼 비활성화
        setTimeout(() => setIsResendDisabled(false), 30000); // 🔹 30초 후 버튼 활성화
    };

    useEffect(() => {
        if (!isRunning || remainingTime <= 0) return;
        const timer = setInterval(() => {
            setRemainingTime((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [isRunning, remainingTime]);

    // 타이머가 끝나면 상태 초기화
    useEffect(() => {
        if (remainingTime <= 0 && isRunning) {
            setSendSeccess(false);
            setInputAuthCode("");
            setIsRunning(false);
        }
    }, [remainingTime, isRunning]);

    const handleSendEmail = async () => {
        if (!email.trim()) {
            alert("이메일을 입력하세요.");
            return;
        }
        console.log(email, "유효성 검사 후 번호생성, api호출");
        const code = String(Math.floor(100000 + Math.random() * 900000));
        try {
            const response = await sendVerificationEmail(email, code);
            const data = await response.json();
            console.log("발송 값 :", data);

            if (data.success) {
                setSendSeccess(true);
                startTimer();
            } else {
                console.error("API 호출 중 에러 발생");
            }
        } catch (e) {
            console.error("API 호출 중 에러 발생:", e);
        }
    };

    const handleVerification = async () => {
        try {
            const response = await getValidationCode(email);
            const data = await response.json()
            const authCode = data.code;
            console.log('확인 값 :', data.code);
            console.log('authCode랑 inputAuthCode가 같은지 :',authCode === inputAuthCode);
            if (authCode === inputAuthCode) {
                alert('인증 성공');
                setIsVerified(true); // ✅ 인증 성공 처리
                setIsRunning(false); // 타이머 정지
                setSendSeccess(false); // 인증 완료 후 재발송 버튼 숨김
            } else {
                alert('인증 실패');
            }
        } catch (e) {
            console.error('API 호출 중 에러 발생:', e);
        }
    };

    return (
        <div className="m-10">
            <input id="email" type="email" placeholder="이메일" className="border"
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   disabled={isVerified} // ✅ 인증 완료 시 이메일 수정 불가능
            />
            {!sendSeccess ? (
                <button type="button" className="border border-roomi text-roomi" onClick={handleSendEmail}
                        disabled={isVerified} // ✅ 인증 완료 시 발송 버튼 숨김
                >발송</button>
            ) : (
                <button
                    type="button"
                    className={`border border-roomi text-roomi ${isResendDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                    onClick={handleSendEmail}
                    disabled={isResendDisabled || isVerified} // ✅ 인증 성공 시 재발송 불가능
                >재발송</button>
            )}
            {sendSeccess && (
                <div>
                    <span className="text-red-500">{dayjs.duration(remainingTime, "seconds").format("mm:ss")}</span>
                    <div>
                        <input id="code" type="text" placeholder="인증번호 입력" className="border"
                               value={inputAuthCode}
                               onChange={(e) => setInputAuthCode(e.target.value)}/>
                        <button type="button" className="border border-roomi text-roomi" onClick={handleVerification}>확인</button>
                    </div>
                </div>
            )}
            {/* ✅ 인증 성공 시 메시지 출력 */}
            {isVerified && (
                <div className="text-green-600 font-bold mt-4">🎉 이메일 인증이 완료되었습니다!</div>
            )}
        </div>
    );
};
