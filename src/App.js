import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { SocialLogin } from "../api/socialLogin";
import { useAuthStore } from "../stores/AuthStore";
import { useSocketStore } from "../stores/SocketStore";

const LineLoginCallback = () => {
    const navigate = useNavigate();
    const setAuthToken = useAuthStore((state) => state.setAuthToken);
    const setIsHost = useAuthStore((state) => state.setIsHost);
    const connect = useSocketStore((state) => state.connect);

    useEffect(() => {
        const token = new URL(window.location.href).searchParams.get("token");

        if (!token) {
            navigate('/');
        } else {
            getLineUserInfo(token);
        }
    }, []);

    const getLineUserInfo = async (token: string) => {
        try {
            const res = await axios.get("https://roomi.co.kr/api/users/me", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const { id, name, email, isHost, profileImage, channel, channelUid } = res.data.data;

            console.log("✅ 서버에서 사용자 정보 가져옴:", res.data.data);

            // 로그인 처리
            await SocialLogin(channelUid, channel, setAuthToken, setIsHost, connect);

            if (email && name) {
                // 기존 사용자
                navigate("/");
            } else {
                // 이메일/이름이 없는 신규 사용자 → 회원가입 페이지로 이동
                navigate('/join/social', {
                    state: {
                        socialEmail: email || '',
                        socialName: name || '',
                        socialProfileImage: profileImage || '',
                        socialChannel: channel,
                        socialChannelUid: channelUid,
                    },
                });
            }
        } catch (err) {
            console.error("LINE 사용자 정보 요청 실패:", err);
            navigate("/");
        }
    };

    return <div>Loading...</div>;
};

export default LineLoginCallback;
