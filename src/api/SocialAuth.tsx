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

    private static readonly redirectUri = 'http://localhost:3000/'; // 웹에서는 이렇게 기본 URI를 설정해두었습니다.

    static async kakaoLogin(): Promise<SocialAuthResponse> {
        try {
            const authUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${this.CONFIG.KAKAO_CLIENT_ID}&redirect_uri=${encodeURIComponent(this.redirectUri)}&response_type=code`;

            // 리디렉션을 위해 window.location.href를 사용
            window.location.href = authUrl;

            // 결과를 받아오기 위한 후속 처리 (리디렉션 후 URL에서 code 추출 등)
            const urlParams = new URLSearchParams(window.location.search);
            const code = urlParams.get('code');
            if (code) {
                const userData = await this.getKakaoUserInfo(code);
                return {
                    success: true,
                    data: userData
                };
            }
            return { success: false, error: 'Login canceled' };
        } catch (error: unknown) {
            console.error('Kakao login failed:', error);
            return { success: false, error };  // 전체 오류 객체를 반환
        }
    }

    static async lineLogin(): Promise<SocialAuthResponse> {
        try {
            const redirectUri = 'https://roomi.co.kr/api/auth/social/line/callback';
            const state = Math.random().toString(36).slice(2);

            const authUrl = `https://access.line.me/oauth2/v2.1/authorize?${new URLSearchParams({
                response_type: 'code',
                client_id: process.env.EXPO_PUBLIC_LINE_CLIENT_ID!,
                client_secret: process.env.EXPO_PUBLIC_LINE_CLIENT_SECRET!,
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
            const authUrl = `https://api.weibo.com/oauth2/authorize?client_id=${this.CONFIG.WEIBO_CLIENT_ID}&response_type=code&redirect_uri=${this.redirectUri}`;

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
