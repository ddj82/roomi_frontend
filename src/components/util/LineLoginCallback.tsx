import React, { useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function LineLoginCallback() {
    const navigate = useNavigate();

    useEffect(() => {
        const code = new URL(window.location.href).searchParams.get("code");
        const state = new URL(window.location.href).searchParams.get("state");

        if (!code) {
            navigate('/');
        } else {
            getAccessToken(code);
        }
    }, []);

    const getAccessToken = async (code: string) => {
        try {
            const res = await axios.post(
                'https://api.line.me/oauth2/v2.1/token',
                new URLSearchParams({
                    grant_type: 'authorization_code',
                    code: code,
                    redirect_uri: 'http://localhost:8081/sign-up/line', // 리디렉트 URI
                    client_id: '2006686179',
                    client_secret: 'd6fbb28d95e39c6a74bed6b28c22165a',
                }),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                }
            );

            const accessToken = res.data.access_token;
            await getLineProfile(accessToken);
        } catch (err) {
            console.error("LINE 토큰 요청 실패:", err);
        }
    };

    const getLineProfile = async (accessToken: string) => {
        try {
            const res = await axios.get("https://api.line.me/v2/profile", {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const { userId, displayName, pictureUrl } = res.data;

            console.log("✅ LINE 사용자 정보:", res.data);

            // 👉 여기서 기존 회원 확인 → 로그인 or 회원가입 처리
            // await validateUser(userId, 'line') 등

            // 예시로 홈으로 이동
            navigate('/');
        } catch (err) {
            console.error("LINE 사용자 정보 가져오기 실패:", err);
        }
    };

    return (
        <div className="text-center">
            <div>LINE 로그인 처리 중입니다...</div>
        </div>
    );
}