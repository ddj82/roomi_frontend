// api.tsx
import i18n from "src/i18n";
import {Schedules} from "../types/rooms";
import {User} from "../types/user";

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
* 3. 데이터 전송 방식
* 4. 데이터
* 5. 언어 감지 확인
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

        // if (response.ok) {
        //     console.log('API 요청 성공');
        //     return response; // 응답을 JSON으로 반환
        // } else {
        //     const errorData = await response.json();
        //     throw new Error(errorData.message || 'API 요청 실패');
        // }
        return response;
    } catch (error) {
        console.error(`API 요청 실패(request): ${endpoint}`, error);
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
            localStorage.setItem('userEmail', data.data.email);
            localStorage.setItem('userName', data.data.name);
            localStorage.setItem('userIsHost', data.data.isHost);
            localStorage.setItem('userProfileImg', data.data.profile_image);

            const { accept_SMS, accept_alert, accept_email } = data.data;
            localStorage.setItem('accept_SMS', accept_SMS ? '1' : '0');
            localStorage.setItem('accept_alert', accept_alert ? '1' : '0');
            localStorage.setItem('accept_email', accept_email ? '1' : '0');

            // DB에서 받아온 언어 적용
            localStorage.setItem('i18nextLng', data.data.language);
            await i18n.changeLanguage(data.data.language);
        } else {
            console.error('로그인 실패:', data.message);
        }

        return response; // 로그인 응답 데이터를 반환
    } catch (error) {
        console.error('로그인 실패(api.tsx):', error);
        throw error;  // 전체 오류를 전달
    }
};

// 소셜 로그인 API
export const channelLogin = async (channel_uid: string, channel: string, setAuthToken: (token: string | null) => void) => {
    try {
        const response = await request(`/users/channel/login`, false, 'POST', {
            'channel_uid': channel_uid,
            'channel': channel,
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
            localStorage.setItem('userEmail', data.data.email);
            localStorage.setItem('userName', data.data.name);
            localStorage.setItem('userIsHost', data.data.isHost);
            localStorage.setItem('userProfileImg', data.data.profile_image);

            const { accept_SMS, accept_alert, accept_email } = data.data;
            localStorage.setItem('accept_SMS', accept_SMS ? '1' : '0');
            localStorage.setItem('accept_alert', accept_alert ? '1' : '0');
            localStorage.setItem('accept_email', accept_email ? '1' : '0');

            // DB에서 받아온 언어 적용
            localStorage.setItem('i18nextLng', data.data.language);
            await i18n.changeLanguage(data.data.language);
        } else {
            console.error('로그인 실패:', data.message);
        }

        return response; // 로그인 응답 데이터를 반환
    } catch (error) {
        console.error('로그인 실패(api.tsx):', error);
        throw error;  // 전체 오류를 전달
    }
};

// 소셜 로그인 중복 확인 API
export const validateUser = async (channel_uid: string, channel: string) => {
    const response = await request(`/users/validate`, false, 'POST', {
        'channel_uid': channel_uid,
        'channel': channel,
    });
    const responseJson = await response.json();
    return responseJson.statusCode;
};

// 로그아웃
export const logout = async () => {
    try {
        localStorage.removeItem('authToken'); // 토큰 제거
        localStorage.removeItem('userId'); // 유저 정보 제거
        localStorage.removeItem('userName'); // 유저 정보 제거
        localStorage.removeItem('userEmail'); // 유저 정보 제거
        localStorage.removeItem('userIsHost'); // 유저 정보 제거
        localStorage.removeItem('userProfileImg'); // 유저 정보 제거
        localStorage.removeItem('hostMode');
        localStorage.removeItem('i18nextLng');
        localStorage.removeItem('accept_SMS');
        localStorage.removeItem('accept_alert');
        localStorage.removeItem('accept_email');

        const detectedLang = i18n.services.languageDetector?.detect();
        console.log('detectedLang:', detectedLang);
        i18n.changeLanguage(detectedLang || 'ko');
        return '로그아웃 성공';
    } catch (error) {
        console.error('로그아웃 실패:', error);
        return '로그아웃 실패';
    }
};

// 회원가입 API
export const createUser = async (formData: User) => {
    return request(`/users/signUp`, false, 'POST', formData);
};

export const mainRoomData = async (swY: number, swX: number, neY: number, neX: number, currentLocale: string) => {
    const authToken = !!localStorage.getItem("authToken");
    if (authToken) {
        return request(`/rooms?swLat=${swY}&swLng=${swX}&neLat=${neY}&neLng=${neX}&locale=${currentLocale}`, true);
    } else {
        return request(`/rooms?swLat=${swY}&swLng=${swX}&neLat=${neY}&neLng=${neX}&locale=${currentLocale}`, false);
    }
};

// 방 조회 API
export const fetchRoomData = async (id: number) => {
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

// 호스트모드 나의 방 API
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

// 메일-인증 메일 전송 API
export const sendVerificationEmail = async (email: string, code: string) => {
    console.log('api.tsx에서 받은 변수 :', email, code);
    return request(`/email`, false, 'POST', {
        'recipient': email,
        'code': code,
    });
};

// 메일-인증 번호 확인 API
export const getValidationCode = async (email: string) => {
    return request(`/email`, false, 'PUT', {
        'recipient': email,
    });
};

// 찜 추가 API
export const addFavoriteRoom = async (roomId: number) => {
    return request(`/rooms/favorite/${roomId}`, true, 'POST');
};
// 찜 제거 API
export const deleteFavoriteRoom = async (roomId: number) => {
    return request(`/rooms/favorite/${roomId}`, true, 'DELETE');
};
// 찜 목록 API
export const getRoomFavoriteList = async () => {
    return request(`/rooms/favorite/list`, true, 'GET', undefined,true);
};

// 최근 본 방 추가 API
export const addRoomHistory = async (roomId: number) => {
    return request(`/rooms/history/${roomId}`, true, 'POST');
};
// 최근 본 방 목록 API
export const getRoomHistoryList = async () => {
    return request(`/rooms/history/list`, true, 'GET', undefined,true);
};

// 유저 언어 코드 변경 API
export const updateLanguage = async (langCode: string) => {
    return request(`/users/lang?language=${langCode}`, true, 'POST');
};

// 유저 알림 설정 API
export const acceptions = async (alert: boolean, SMS: boolean, email: boolean) => {
    try {
        const response = await request(
            `/users/accept?accept_alert=${alert}&accept_SMS=${SMS}&accept_email=${email}`,
            true,
            'POST'
        );
        if (response.ok) {
            localStorage.setItem('accept_alert', alert ? '1' : '0');
            localStorage.setItem('accept_SMS', SMS ? '1' : '0');
            localStorage.setItem('accept_email', email ? '1' : '0');
            return response;
        }
    } catch (error) {
        console.error('유저 알림 설정 실패:', error);
        return undefined;
    }
};

// 유저 공지사항 목록 API
export const getNotices = async () => {
    return request(`/notices`, true);
};

// 예약하기 API (결제 전 서버 저장)
export const bookReservation = async (checkIn: string, checkOut: string, selectionMode: string, roomId: number) => {
    return request(
        `/book?checkIn=${checkIn}&checkOut=${checkOut}&selectionMode=${selectionMode}&roomId=${roomId}`,
        true,
        'POST'
    );
};

// 게스트 예약내역 API
export const getReservationHistory = async () => {
    return request(`/rooms/my/history`, true, 'GET', undefined, true);
};