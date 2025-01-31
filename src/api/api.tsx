// api.tsx
const BASE_URL = 'https://roomi.co.kr/api';

// 로컬 스토리지에서 인증 토큰 가져오기
const getAuthToken = () => {
    try {
        const token = localStorage.getItem('authToken');
        return token;
    } catch (error) {
        console.error('토큰을 가져오는 중 오류 발생(api.tsx):', error);
        return null;
    }
};

// 요청 메소드
const request = async (endpoint: string, requireAuth: boolean = true, method: string = 'GET', data?: any) => {
    try {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        if (requireAuth) {
            const token = getAuthToken();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`; // Bearer token 추가
            } else {
                throw new Error('인증 토큰이 필요합니다.');
            }
        }

        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: method,
            headers: headers,
            body: data ? JSON.stringify(data) : undefined,
        });

        if (response.ok) {
            console.log('API 요청 성공');
            return response.json(); // 응답을 JSON으로 반환
        } else {
            const errorData = await response.json();
            throw new Error(errorData.message || 'API 요청 실패');
        }
    } catch (error) {
        console.error(`API 요청 실패: ${endpoint}`, error);
        throw error;  // 전체 오류를 전달
    }
};

// 로그인 API
export const login = async (email: string, password: string) => {
    try {
        const response = await request('/users/login', false, 'POST', {
            "email": email,
            "password": password,
        });
        const token = response.token; // 서버에서 반환한 토큰을 추출 (서버 응답 구조에 맞게 수정)
        console.log('토큰:', token);

        if (token) {
            localStorage.setItem('authToken', token); // 토큰 저장
        } else {
            throw new Error('토큰을 찾을 수 없습니다.');
        }

        return response; // 로그인 응답 데이터를 반환
    } catch (error) {
        console.error('로그인 실패(api.tsx):', error);
        throw error;  // 전체 오류를 전달
    }
};

// 로그아웃
export const logout = async () => {
    try {
        localStorage.removeItem('authToken'); // 토큰 제거
        return '로그아웃 성공';
    } catch (error) {
        console.error('로그아웃 실패:', error);
        return '로그아웃 실패';
    }
};

// 방 조회 API
export const fetchRoomData = async (id: number, locale: string) => {
    return request(`/rooms/${id}?locale=${locale}`, false);
};

