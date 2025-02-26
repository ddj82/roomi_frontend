import React, {useEffect, useState} from 'react';
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

dayjs.extend(duration);

export default function MailTest() {
    const [remainingTime, setRemainingTime] = useState(0); // 남은 시간 (초)
    const [isRunning, setIsRunning] = useState(false); // 타이머 실행 여부
    const startTimer = () => {
        setRemainingTime(180); // 3분 (180초)
        setIsRunning(true);
    };
    useEffect(() => {
        if (!isRunning || remainingTime <= 0) return;

        const timer = setInterval(() => {
            setRemainingTime((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [isRunning, remainingTime]);
    const [email, setEmail] = useState('');
    const [authCode, setAuthCode] = useState(0);
    const MyComponent = () => {
        setAuthCode(Math.floor(100000 + Math.random() * 900000));
        console.log(email);
        console.log(authCode);
        startTimer();
    };

    return (
        <div className="m-10">
            <input id="email" type="email" placeholder="이메일" className="border"
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}/>
            <button type="button" className="border border-roomi text-roomi" onClick={MyComponent}>발송</button>
            <div><span className="text-red-500">{dayjs.duration(remainingTime, "seconds").format("mm:ss")}</span></div>
        </div>
    );
};
