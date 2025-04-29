import React, { useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {validateUser} from "../../api/api";
import {SocialLogin} from "./authUtils";
import {useAuthStore} from "../stores/AuthStore";
import {useIsHostStore} from "../stores/IsHostStore";
import {useSignUpChannelStore} from "../stores/SignUpChannelStore";
import {useChatStore} from "../stores/ChatStore";

export default function LineLoginCallback() {
    const navigate = useNavigate();
    const { setAuthToken } = useAuthStore();
    const { setIsHost } = useIsHostStore();
    const connect = useChatStore((state) => state.connect);
    const { setSignUpChannel } = useSignUpChannelStore();
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
                    redirect_uri: 'https://roomi.co.kr/sign-up/line', // 리디렉트 URI
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

            const socialChannel = 'line';
            const socialChannelUid = userId;
            const socialName = displayName;
            const socialProfileImage = pictureUrl || '';
            const socialEmail = ''; // LINE은 email을 별도 동의 받아야 하므로 기본값

            const statusCode = await validateUser(socialChannelUid, socialChannel);
            if (statusCode === 409) {
                navigate('/join/social', {
                    state: {
                        socialEmail,
                        socialName,
                        socialProfileImage,
                        socialChannel,
                        socialChannelUid,
                    },
                });
            } else if (statusCode === 200) {
                await SocialLogin(socialChannelUid, socialChannel, setAuthToken, setIsHost, connect);
                navigate("/");
            } else {
                console.error("예상치 못한 상태 코드:", statusCode);
                navigate("/");
            }
        } catch (err) {
            console.error("LINE 사용자 정보 가져오기 실패:", err);
            navigate("/");
        }
    };

    return (
        <div className="text-center">
            <div>LINE 로그인 처리 중입니다...</div>
        </div>
    );
}