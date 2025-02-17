// api.tsx
import i18n from "src/i18n";
import {Schedules} from "../types/rooms";

const BASE_URL = 'https://roomi.co.kr/api';

// 로컬 스토리지에서 인증 토큰 가져오기
const getAuthToken = () => {
    try {
        return localStorage.getItem('authToken');
    } catch (error) {
        console.error('토큰을 가져오는 중 오류 발생(api.tsx):', error);
        return null;
    }
};

// 요청 메소드
/*
* 공용 request 메소드 매개 변수
* 1. url 패턴
* 2. 로그인 확인
* 3. 언어 감지 확인
* 4. 데이터 전송 방식
* 5. 데이터
* */
const request = async (endpoint: string, requireAuth: boolean = true, method: string = 'GET', data?: any, requireLocale: boolean = false) => {
    try {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        if (requireAuth) {
            const token = getAuthToken();
            if (token) {
                headers['Authorization'] = `${token}`; // Bearer token 추가
            } else {
                throw new Error('인증 토큰이 필요합니다.');
            }
        }

        let API_URL = BASE_URL + `${endpoint}`;
        if (requireLocale) {
            const locale = i18n.language; // 현재 언어 감지
            API_URL = API_URL + `?locale=${locale}`;
        }

        const response = await fetch(`${API_URL}`, {
            method: method,
            headers: headers,
            body: data ? JSON.stringify(data) : undefined,
        });

        if (response.ok) {
            console.log('API 요청 성공');
            return response; // 응답을 JSON으로 반환
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
export const login = async (email: string, password: string, setAuthToken: (token: string | null) => void) => {
    try {
        const response = await request('/users/login', false, 'POST', {
            "email": email,
            "password": password,
        });
        const token = response.headers.get('Authorization'); // 응답에서 토큰 추출
        console.log('토큰:', token);
        if (token) {
            localStorage.setItem('authToken', token); // 토큰 저장
            setAuthToken(token); // 전역 상태 업데이트
        } else {
            throw new Error('토큰을 찾을 수 없습니다.');
        }

        const data = await response.json();
        if (data.success) {
            console.log('사용자 정보:', data.data);
            localStorage.setItem('userId', data.data.id);
            localStorage.setItem('userName', data.data.name);
            localStorage.setItem('userIsHost', data.data.isHost);
        } else {
            console.error('로그인 실패:', data.message);
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
        localStorage.removeItem('userId'); // 유저 정보 제거
        localStorage.removeItem('userName'); // 유저 정보 제거
        localStorage.removeItem('userIsHost'); // 유저 정보 제거
        localStorage.removeItem('hostMode');
        return '로그아웃 성공';
    } catch (error) {
        console.error('로그아웃 실패:', error);
        return '로그아웃 실패';
    }
};

// 방 조회 API
export const fetchRoomData = async (id: number, locale: string) => {
    return request(`/rooms/${id}`, false, 'GET', undefined, true);
};

// host 등록 동의 API
export const termsOfUse = async () => {
    return request(`/policies/terms-of-use`, true);
};

// host 등록 API
export const be_host = async () => {
    try {
        const response = await request(`/users/be_host`, true, 'POST');
        if (response.ok) {
            localStorage.setItem('userIsHost', 'true');
            return response.ok;
        }
    } catch (error) {
        console.error('호스트 등록 실패:', error);
        return false;
    }
};

// 나의 방 API
export const myRoomList = async () => {
    return request(`/rooms/my/list`, true, 'GET', undefined, true);
};

// 방 사용 불가 처리 API
export const createBulkBlocks = async (id: number, schedulesData: Schedules[]) => {
    return request(`/rooms/schedule/bulk`, true, 'POST', {
        'roomId': id,
        'schedules': schedulesData,
    });
};

// 방 언블락 처리 API
export const unblockDate = async (id: number, date: string) => {
    return request(`/rooms/schedule/unblock`, true, 'POST', {
        'roomId': id,
        'date': date,
    });
};
