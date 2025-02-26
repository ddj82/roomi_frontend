import React, {useEffect, useState} from 'react';
import Modal from 'react-modal'; // react-modal을 사용
import { useAuthStore } from 'src/components/stores/AuthStore';
import { login } from 'src/api/api';
import { SocialAuth } from "src/api/SocialAuth";
import 'src/css/AuthModal.css'; // CSS 파일 import
import { useIsHostStore } from "src/components/stores/IsHostStore";
import {useChatStore} from "../stores/ChatStore";
import {useNavigate} from "react-router-dom";

const AuthModal = ({ visible, onClose, type }: { visible: boolean; onClose: () => void; type: 'login' | 'signup' }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const { setAuthToken } = useAuthStore();
    const { setIsHost } = useIsHostStore();
    const connect = useChatStore((state) => state.connect);
    const navigate = useNavigate();

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            console.log('로그인 버튼(모달):', { email, password });
            // 로그인 요청
            await login(email, password, setAuthToken);
            // isHost 가 ture 이면 hostStatus = ture
            // isHost 가 false 이면 hostStatus = false
            const hostStatus = localStorage.getItem('userIsHost') === 'true';
            console.log('hostStatus값 :',hostStatus);
            // 로그인 유저의 isHost 값으로 전역 상태 관리
            setIsHost(hostStatus);

            let token = localStorage.getItem('authToken');
            if (token) {
                token = token.replace(/^Bearer\s/, ""); // 🔥 "Bearer " 제거
                connect(token); // ✅ WebSocket 연결
            } else {
                console.error('❌ Auth Token이 없습니다.');
            }

            console.log('로그인 성공, AuthToken, isHost 업데이트 완료'); // 로그 추가
            onClose();
        } catch (error) {
            console.error('로그인 실패(모달):', error);
        }
    };

    const handleSocialLogin = async (channel: string) => {
        console.log(`${channel} 로그인 시도`);

        let loginResult; // loginResult 타입을 명확히 지정

        switch (channel) {
            case 'Google':
                // Implement Google login logic here
                break;
            case 'Apple':
                // Implement Apple login logic here
                break;
            case 'Facebook':
                // Implement Facebook login logic here
                break;
            case 'Kakao':
                loginResult = await SocialAuth.kakaoLogin();
                break;
            case 'Line':
                try {
                    loginResult = await SocialAuth.lineLogin();
                    onClose(); // 모달만 닫아주기
                } catch (error) {
                    console.error('LINE 로그인 에러:', error);
                    alert('로그인 시도 중 문제가 발생했습니다. 다시 시도해주세요.');
                }
                break;
            case 'WeChat':
                loginResult = await SocialAuth.weiboLogin(); // Adjust for WeChat login if needed
                break;
            default:
                console.log('Unknown social platform');
                return;
        }

        if (loginResult && loginResult.success) { // loginResult가 undefined가 아닌지 확인
            console.log(`${channel} 로그인 성공!`, loginResult.data);
        } else {
            console.log(`${channel} 로그인 실패`, loginResult?.error);
        }
    };

    const handleJoin = () => {
        navigate('/join');
        onClose();
    };

    useEffect(() => {
        if (visible) {
            document.body.style.overflow = 'hidden'; // 스크롤 방지
        } else {
            document.body.style.overflow = 'auto'; // 스크롤 복원
        }
        return () => {
            document.body.style.overflow = 'auto'; // 컴포넌트 언마운트 시 복원
        };
    }, [visible]);

    return (
        <Modal
            isOpen={visible}
            onRequestClose={onClose}
            contentLabel="Authentication Modal"
            className="authModal auth-modal-container"
            overlayClassName="authModal overlay" // 오버레이 스타일
        >
            <div className="authModal modal-content">
                <div className="text-lg font-bold mb-4">{type === 'login' ? '로그인' : '회원가입'}</div>
                <form onSubmit={handleSubmit} className="authModal input-container">
                    <div className="authModal input-container">
                        <input
                            type="text"
                            placeholder="이메일"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="authInput mb-2 h-10 pl-2 text-base"
                        />
                        <input
                            type="password"
                            placeholder="비밀번호"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="authInput mb-2 h-10 pl-2 text-base"
                        />
                        {type === 'signup' && (
                            <input
                                type="password"
                                placeholder="비밀번호 확인"
                                value={passwordConfirm}
                                onChange={(e) => setPasswordConfirm(e.target.value)}
                                className="authInput mb-2 h-10 pl-2 text-base"
                            />
                        )}
                    </div>

                    <div className="authModal button-container">
                        <button type="submit" className="authModal submit-button">
                            {type === 'login' ? '로그인' : '회원가입'}
                        </button>
                        <button type="button" className="authModal cancel-button" onClick={onClose}>취소</button>
                    </div>
                </form>

                {type === 'login' && (
                    <div className="authModal social-login-container">
                        <h4>소셜 로그인</h4>
                        <div className="authModal social-buttons">
                            {['Kakao', 'Line', '3','4','5','6'].map((channel) => (
                                <button
                                    key={channel}
                                    className="authModal social-button"
                                    onClick={() => handleSocialLogin(channel)}
                                >
                                    <img src={`/assets/images/${channel.toLowerCase()}.png`} alt={channel} className="authModal social-icon" />
                                    {`Sign in with ${channel}`}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {type === 'login' && (
                    <div className="flex_center">
                        <div className="text-sm">계정이 없으신가요?</div>
                        <button onClick={handleJoin}>
                            <span className="text-sm text-roomi ml-1">회원가입</span>
                        </button>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default AuthModal;
