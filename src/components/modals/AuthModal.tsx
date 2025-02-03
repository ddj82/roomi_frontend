import React, { useContext, useState } from 'react';
import Modal from 'react-modal'; // react-modal을 사용
import { AuthContext } from 'src/components/auth/AuthContext';
import { login } from 'src/api/api';
import { SocialAuth } from "src/api/SocialAuth";
import '../../css/AuthModal.css'; // CSS 파일 import
import '../../css/Modal.css';
import {HostModeContext} from "src/components/auth/HostModeContext";

const AuthModal = ({ visible, onClose, type }: { visible: boolean; onClose: () => void; type: 'login' | 'signup' }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const { setAuthToken } = useContext(AuthContext);
    const { setHostMode } = useContext(HostModeContext);

    const handleSubmit = async () => {
        try {
            console.log('로그인 버튼(모달):', { email, password });
            // 로그인 요청
            await login(email, password, setAuthToken);
            const hostStatus = localStorage.getItem('userIsHost') === 'true';
            setHostMode(hostStatus);
            console.log('로그인 성공, AuthToken 업데이트 완료'); // 로그 추가
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


    return (
        <Modal
            isOpen={visible}
            onRequestClose={onClose}
            contentLabel="Authentication Modal"
            className="authModal auth-modal-container"
            overlayClassName="authModal overlay" // 오버레이 스타일
        >
            <div className="authModal modal-content">
                <h2>{type === 'login' ? '로그인' : '회원가입'}</h2>
                <div className="authModal input-container">
                    <input
                        type="email"
                        placeholder="이메일"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="비밀번호"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    {type === 'signup' && (
                        <input
                            type="password"
                            placeholder="비밀번호 확인"
                            value={passwordConfirm}
                            onChange={(e) => setPasswordConfirm(e.target.value)}
                        />
                    )}
                </div>

                <div className="authModal button-container">
                    <button className="authModal submit-button" onClick={handleSubmit}>
                        {type === 'login' ? '로그인' : '회원가입'}
                    </button>
                    <button className="authModal cancel-button" onClick={onClose}>취소</button>
                </div>

                {type === 'login' && (
                    <div className="authModal social-login-container">
                        <h4>소셜 로그인</h4>
                        <div className="authModal social-buttons">
                            {['Kakao', 'Line'].map((channel) => (
                                <button
                                    key={channel}
                                    className="authModal social-button"
                                    onClick={() => handleSocialLogin(channel)}
                                >
                                    <img src={`/${channel.toLowerCase()}.png`} alt={channel} className="authModal social-icon" />
                                    {`Sign in with ${channel}`}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {type === 'login' && (
                    <div className="authModal footer">
                        <p className="authModal footer-text">
                            계정이 없으신가요?
                        </p>
                        <button onClick={() => {
                            onClose();
                            // TODO: 회원가입 모달로 전환하는 로직 추가
                        }}>
                            <span className="authModal footer-link">회원가입</span>
                        </button>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default AuthModal;
