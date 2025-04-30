import {GoogleAuthProvider, signInWithPopup} from 'firebase/auth';
import {auth} from '../../firebase'; // 모듈화된 Firebase Auth 인스턴스

interface SocialAuthResponse {
    success: boolean;
    data?: {
        email: string;
        name?: string;
        socialId: string;
        provider: string;
    };
    error?: any;  // `error`를 `any`로 설정하여 전체 에러 객체를 반환
}

export class SocialAuth {
    private static readonly CONFIG = {
        KAKAO_CLIENT_ID: process.env.EXPO_PUBLIC_KAKAO_CLIENT_ID,
        LINE_CLIENT_ID: process.env.EXPO_PUBLIC_LINE_CLIENT_ID,
        WEIBO_CLIENT_ID: process.env.EXPO_PUBLIC_WEIBO_CLIENT_ID,
    };

    private static readonly redirectUri = process.env.REACT_APP_BASE_URL; // 웹에서는 이렇게 기본 URI를 설정해두었습니다.

    static async googleLogin(): Promise<SocialAuthResponse> {
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);

            if (!result.user) {
                throw new Error('No user information returned from Google.');
            }

            const { uid, email, displayName } = result.user;

            return {
                success: true,
                data: {
                    email: email || '',
                    name: displayName || '',
                    socialId: uid,
                    provider: 'google',
                },
            };
        } catch (error: unknown) {
            console.error('Google login failed:', error);
            return {
                success: false,
                error,
            };
        }
    }

    static async kakaoLogin(): Promise<void> {
        try {
            const REST_API_KEY=process.env.REACT_APP_REST_API_KEY; //REST API KEY
            const REDIRECT_URI = this.redirectUri + '/sign-up'; //Redirect URI
            const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${REST_API_KEY}&redirect_uri=${REDIRECT_URI}&response_type=code`;
             console.log('redirectUri',REDIRECT_URI);
            // console.log('REST_API_KEY',REST_API_KEY);
            // console.log('REDIRECT_URI',REDIRECT_URI);
            // console.log('kakaoAuthUrl',kakaoAuthUrl);
            window.location.href = kakaoAuthUrl;
            // 팝업 띄우기
            // const popup = window.open(kakaoAuthUrl, 'kakaoLogin', 'width=500,height=600');
            //
            // // 팝업 감시 → 닫히면 새로고침
            // const timer = setInterval(() => {
            //     if (!popup || popup.closed) {
            //         clearInterval(timer);
            //         window.location.reload(); // 팝업 닫히면 새로고침
            //     }
            // }, 500);

        } catch (error: unknown) {
            console.error("카카오 로그인 팝업 오류:", error);
            return;
        }
    }


    static async lineLogin(): Promise<SocialAuthResponse> {
        try {
            const redirectUri = 'https://roomi.co.kr/api/auth/social/line/callback';
            const state = Math.random().toString(36).slice(2);

            const authUrl = `https://access.line.me/oauth2/v2.1/authorize?${new URLSearchParams({
                response_type: 'code',
                // client_id: process.env.EXPO_PUBLIC_LINE_CLIENT_ID!,
                // client_secret: process.env.EXPO_PUBLIC_LINE_CLIENT_SECRET!,
                client_id: '2006686179',    
                client_secret: 'd6fbb28d95e39c6a74bed6b28c22165a',
                redirect_uri: redirectUri,
                state: state,
                scope: 'profile openid email',
                prompt: 'consent'
            }).toString()}`;

            // 웹에서는 window.location.href로 리디렉션 처리
            window.location.href = authUrl;

            // 결과를 받아오기 위한 후속 처리 (리디렉션 후 URL에서 code 추출 등)
            const urlParams = new URLSearchParams(window.location.search);
            const code = urlParams.get('code');
            const returnedState = urlParams.get('state');

            if (code && returnedState === state) {
                const response = await fetch('https://roomi.co.kr/api/auth/social/line', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ code, state })
                });

                const data = await response.json();

                if (!data.success) {
                    throw new Error(data.message || 'Login failed');
                }

                return {
                    success: true,
                    data: {
                        token: data.token,
                        ...data.user
                    }
                };
            }

            return { success: false, error: 'Login cancelled or state mismatch' };
        } catch (error: unknown) {
            console.error('LINE login failed:', error);
            return { success: false, error };  // 전체 오류 객체를 반환
        }
    }

    private static async getKakaoUserInfo(code: string) {
        // 서버 호출하여 카카오 유저 정보 받아오는 부분 (웹에서도 동일하게 처리)
        return {
            email: '',
            name: '',
            socialId: code,  // 예시로 code를 socialId로 사용
            provider: 'kakao'
        };
    }

    // Weibo 로그인 처리
    static async weiboLogin(): Promise<SocialAuthResponse> {
        try {
            const REDIRECT_URI = this.redirectUri + '/sign-up';
            const authUrl = `https://api.weibo.com/oauth2/authorize?client_id=${this.CONFIG.WEIBO_CLIENT_ID}&response_type=code&redirect_uri=${REDIRECT_URI}`;

            window.location.href = authUrl;

            const urlParams = new URLSearchParams(window.location.search);
            const code = urlParams.get('code');

            if (code) {
                const userData = await this.getWeiboUserInfo(code);
                return {
                    success: true,
                    data: userData
                };
            }
            return { success: false, error: 'Login canceled' };
        } catch (error: unknown) {
            return { success: false, error };  // 전체 오류 객체를 반환
        }
    }

    private static async getWeiboUserInfo(code: string) {
        return {
            email: '',
            name: '',
            socialId: code,
            provider: 'weibo'
        };
    }
}
