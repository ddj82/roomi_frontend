import React, {useEffect, useState} from "react";
import {useNavigate, useParams} from 'react-router-dom';
import {addRoomHistory, fetchRoomData} from "src/api/api";
import {Reservation, RoomData} from "../../types/rooms";
import ImgCarousel from "../util/ImgCarousel";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import { facilityIcons } from "src/types/facilityIcons";
import {
    faBath,
    faBuilding,
    faClock,
    faDoorOpen,
    faElevator,
    faHome,
    faLayerGroup,
    faSquareParking,
    faUsers,
    faVectorSquare,
    faMapLocationDot,
    faCalendarDay,
    faChevronUp,
    faChevronDown,
    faCheckCircle, faUtensils, faUserCheck,
} from "@fortawesome/free-solid-svg-icons";
import {useTranslation} from "react-i18next";
import NaverMapRoom from "../map/NaverMapRoom";
import Calendar from "react-calendar";
import dayjs from "dayjs";
import {useDateStore} from "src/components/stores/DateStore";
import 'react-calendar/dist/Calendar.css';
import {LuCircleMinus, LuCirclePlus} from "react-icons/lu";
import {useChatStore} from "../stores/ChatStore";
import AuthModal from "../modals/AuthModal";
import i18n from "i18next";
import utc from 'dayjs/plugin/utc';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(utc);
dayjs.extend(isBetween);

export default function RoomDetailScreen() {
    const {roomId, locale} = useParams(); // URL 파라미터 추출
    const [room, setRoom] = useState<RoomData | null>(null);
    const {t} = useTranslation();
    const navigate = useNavigate();
    const {
        startDate, setStartDate,
        endDate, setEndDate,
        calUnit, setCalUnit,
        weekValue, setWeekValue,
        monthValue, setMonthValue
    } = useDateStore();
    const [slideIsOpen, setSlideIsOpen] = useState(false);
    const {createRoom} = useChatStore();
    const connect = useChatStore((state) => state.connect);
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [userLocale, setUserLocale] = useState(i18n.language);
    const [blockDates, setBlockDates] = useState<string[]>([]);
    // 체크인 날짜들
    const [checkInList, setCheckInList] = useState<string[]>([]);
    // 체크아웃 날짜들
    const [checkOutList, setCheckOutList] = useState<string[]>([]);
    // 1박2일 날짜들
    const [oneDayList, setOneDayList] = useState<string[]>([]);
    const [userCurrency, setUserCurrency] = useState(localStorage.getItem('userCurrency') || 'KRW');

    useEffect(() => {
        const loadRoomData = async () => {
            if (roomId) {
                console.log(`Room ID: ${roomId}`);
                try {
                    if (locale != null) {
                        const response = await fetchRoomData(Number(roomId));
                        const responseJson = await response.json();
                        const roomData = responseJson.data;
                        console.log('데이터 :', roomData);
                        setRoom(roomData);

                        // 사용불가 날짜 커스텀 클래스 추가
                        const blockDateArr: string[] = [];
                        const checkInListArr: string[] = [];
                        const checkOutListArr: string[] = [];
                        const oneDayListArr: string[] = [];

                        roomData.unavailable_dates?.reservations?.forEach((reservation: Reservation) => {
                            const startDate = dayjs.utc(reservation.check_in_date);
                            const endDate = dayjs.utc(reservation.check_out_date);
                            const today = dayjs().format('YYYY-MM-DD');

                            // 1박2일 예약 배열
                            if (endDate.diff(startDate, 'day') === 1 &&  startDate.format('YYYY-MM-DD') >= today) {
                                oneDayListArr.push(endDate.format('YYYY-MM-DD'));
                            }
                            
                            // 커스텀 블락 날짜 배열
                            // 체크인 날짜들, 체크아웃 날짜들 처리를 위한 배열 (커스텀 블락 제외)
                            if (reservation.status === 'BLOCKED') {
                                if (startDate.format('YYYY-MM-DD') >= today) {
                                    blockDateArr.push(startDate.format('YYYY-MM-DD'));
                                }
                            } else if (startDate.format('YYYY-MM-DD') >= today) {
                                checkInListArr.push(startDate.format('YYYY-MM-DD'));
                                checkOutListArr.push(endDate.format('YYYY-MM-DD'));
                            }

                            // 예약된 날짜를 체크인 다음날부터 체크아웃 하루 전까지만 막음 (체크인/체크아웃은 가능)
                            let currentDate = startDate.add(1, 'day'); // 체크인 날짜 제외, 다음날부터 차단
                            while (currentDate.isBefore(endDate)) { // 체크아웃 날짜는 제외 (체크인 가능하게 하기 위해)
                                const formattedDate = currentDate.format('YYYY-MM-DD');

                                if (formattedDate >= today) {
                                    blockDateArr.push(formattedDate);
                                }

                                currentDate = currentDate.add(1, 'day'); // 하루씩 증가
                            }
                        });

                        // checkInListArr와 checkOutListArr에 모두 포함된 날짜 찾기
                        const duplicateDates = checkInListArr.filter(date => checkOutListArr.includes(date));

                        // 해당 날짜를 checkInListArr, checkOutListArr에서 제거하고 blockDateArr에 추가
                        duplicateDates.forEach(date => {
                            blockDateArr.push(date);
                        });

                        // checkInListArr와 checkOutListArr에서 중복된 날짜 제거
                        const filteredCheckInList = checkInListArr.filter(date => !duplicateDates.includes(date));
                        const filteredCheckOutList = checkOutListArr.filter(date => !duplicateDates.includes(date));

                        setBlockDates(blockDateArr);
                        setCheckInList(filteredCheckInList);
                        setCheckOutList(filteredCheckOutList);
                        setOneDayList(oneDayListArr);
                    }
                } catch (error) {
                    console.error('방 정보 불러오기 실패:', error);
                }
            }
        };
        loadRoomData();

        let token = localStorage.getItem('authToken');
        if (token) {
            addRoomHistory(Number(roomId));
            token = token.replace(/^Bearer\s/, ""); // 🔥 "Bearer " 제거
            connect(token); // ✅ WebSocket 연결
        } else {
            console.error('❌ Auth Token이 없습니다.');
        }

    }, [roomId, locale]); // roomId와 locale 변경 시 실행

    const handleDayClick = (date: Date) => {
        const dateString = dayjs(date).format('YYYY-MM-DD');

        // checkInList 배열을 돌면서 dateString과 같은 날짜가 있는지 확인
        const isCheckInDate = checkInList.some((checkIn) => checkIn === dateString);
        // checkOutList 배열을 돌면서 dateString과 같은 날짜가 있는지 확인
        const isCheckOutDate = checkOutList.some((checkIn) => checkIn === dateString);
        if (calUnit) {
            monthDateSet(dateString);
        } else {
            weekDateSet(dateString);
        }
        // if (calUnit) {
        //     if (!startDate || (startDate && endDate)) {
        //         if (isCheckInDate) {
        //             alert('선택한 날짜 범위에 예약 불가 날짜가 포함되어 있습니다.');
        //             setStartDate(null);
        //             setEndDate(null);
        //         } else {
        //             setStartDate(dateString);
        //             setEndDate(null);
        //         }
        //     } else if (new Date(dateString) >= new Date(startDate)) {
        //         if (isCheckOutDate) {
        //             alert('선택한 날짜 범위에 예약 불가 날짜가 포함되어 있습니다.');
        //             setStartDate(null);
        //             setEndDate(null);
        //         } else {
        //             // startDate부터 dateString 사이에 하나라도 blockDates에 있으면 alert 띄우기
        //             const hasBlockedDate = blockDates.some(blockedDate =>
        //                 dayjs(blockedDate).isBetween(startDate, dateString, 'day', '[]')
        //             );
        //             const hasBlockedDate2 = oneDayList.some(date =>
        //                 dayjs(date).isBetween(dayjs(startDate).add(1, 'day').format('YYYY-MM-DD'), dateString, 'day', '[]')
        //             );
        //
        //             if (hasBlockedDate || hasBlockedDate2) {
        //                 alert('선택한 날짜 범위에 예약 불가 날짜가 포함되어 있습니다.');
        //                 setStartDate(null);
        //                 setEndDate(null);
        //             } else {
        //                 setEndDate(dateString);
        //             }
        //         }
        //     } else {
        //         setStartDate(dateString);
        //         setEndDate(null);
        //     }
        // } else {
        //     weekDateSet(dateString);
        // }
    };

    // 블록 날짜 범위 검사 함수
    function hasBlockedDatesInRange(start: string, end: string, blockDates: string[]) {
        // start ~ end 사이에 하나라도 blockDates가 있으면 true
        return blockDates.some(blockedDate =>
            dayjs(blockedDate).isBetween(start, end, 'day', '[]')
        );
    }

    const weekDateSet = (dateString: string) => {
        const startDateObj = new Date(dateString);
        const endDateObj = new Date(dateString);
        endDateObj.setDate(startDateObj.getDate() + (weekValue * 7)); // 주 단위 계산
        const formattedEndDate = dayjs(endDateObj).format('YYYY-MM-DD');

        // 블록 날짜 범위 검사
          if (hasBlockedDatesInRange(dateString, formattedEndDate, blockDates)) {
            alert('선택한 날짜 범위에 예약 불가 날짜가 포함되어 있습니다.');
            setStartDate(null);
            setEndDate(null);
          } else {
            setStartDate(dateString);
            setEndDate(formattedEndDate);
          }
    };

    const monthDateSet = (dateString: string) => {
        const startDateObj = new Date(dateString);
        const endDateObj = new Date(dateString);
        endDateObj.setDate(startDateObj.getDate() + (monthValue * 30)); // 월 단위 계산
        const formattedEndDate = dayjs(endDateObj).format('YYYY-MM-DD');

        // 블록 날짜 범위 검사
          if (hasBlockedDatesInRange(dateString, formattedEndDate, blockDates)) {
            alert('선택한 날짜 범위에 예약 불가 날짜가 포함되어 있습니다.');
            setStartDate(null);
            setEndDate(null);
          } else {
            setStartDate(dateString);
            setEndDate(formattedEndDate);
          }
    };

    const handleWeekValue = (value: boolean) => {
        if (value) {
            // 플러스 버튼 클릭 시
            setWeekValue(prev => prev + 1);
        } else {
            // 마이너스 버튼 클릭 시
            if (weekValue === 1) return;
            setWeekValue(prev => prev - 1);
        }

        // 만약 이미 startDate가 선택되어 있다면, 주(week) 값 변경 후 다시 검사
        if (startDate) {
            weekDateSet(startDate);
        }
    };

    const handleMonthValue = (value: boolean) => {
        if (value) {
            // 플러스 버튼 클릭 시
            setMonthValue(prev => prev + 1);
        } else {
            // 마이너스 버튼 클릭 시
            if (monthValue === 1) return;
            setMonthValue(prev => prev - 1);
        }
        console.log('monthValue', monthValue);

        // 만약 이미 startDate가 선택되어 있다면, 월(month) 값 변경 후 다시 검사
        if (startDate) {
            console.log('startDate', startDate);
            monthDateSet(startDate);
        }
    };

    const getTileClassName = ({date}: { date: Date }) => {
        const dateString = dayjs(date).format('YYYY-MM-DD');
        if (dateString === startDate) {
            return 'start-date';
        }
        if (dateString === endDate) {
            return 'end-date';
        }
        if (startDate && endDate && date > new Date(startDate) && date < new Date(endDate)) {
            return 'in-range';
        }
        if (blockDates.includes(dateString)) {
            return 'reservation-date';
        }
        if (checkInList.includes(dateString)) {
            return 'checkInList';
        }
        if (checkOutList.includes(dateString)) {
            return 'checkOutList';
        }
        return null;
    };

    const monthUnit = () => {
        setCalUnit(true);
        setWeekValue(1);
        setMonthValue(1);
        setStartDate(null);
        setEndDate(null);
    };

    const weekUnit = () => {
        setCalUnit(false);
        setWeekValue(1);
        setMonthValue(1);
        setStartDate(null);
        setEndDate(null);
    };

    useEffect(() => {
        // startDate, endDate 설정이 되어 있으면 weekDateSet 다시
        if (startDate && endDate && !calUnit) {
            weekDateSet(startDate);
        }
        // startDate, endDate 설정이 되어 있으면 monthDateSet 다시
        if (startDate && endDate && calUnit) {
            monthDateSet(startDate);
        }
    }, [weekValue, monthValue]);

    const reservationBtn = () => {
        const isAuthenticated = !!localStorage.getItem("authToken"); // 로그인 여부 확인
        if (!isAuthenticated) {
            alert('로그인 후 이용 가능합니다.');
            setAuthModalOpen(true);
            return;
        }

        // 기본 주간 가격 저장
        let price = (Number(room?.week_price!.toFixed(2)) || 0);
        let depositPrice = (Number(room?.deposit_week!.toFixed(2)) || 0);
        let maintenancePrice = (Number(room?.maintenance_fee_week!.toFixed(2)) || 0);
        // let feePrice = (Number(room?.cleaning_fee_week!.toFixed(2)) || 0);

        if (calUnit) {
            // 월간 가격 저장
            price = (Number(room?.month_price!.toFixed(2)) || 0);
            depositPrice = (Number(room?.deposit_month!.toFixed(2)) || 0);
            maintenancePrice = (Number(room?.maintenance_fee_month!.toFixed(2)) || 0);
            // feePrice = (Number(room?.cleaning_fee_month!.toFixed(2)) || 0);
        }

        let feePrice;
        if (userCurrency === 'USD') {
            console.log('통화 USD');
            feePrice = Math.ceil((price + maintenancePrice) * 0.08 * 100) / 100;

        } else if (userCurrency === 'JPY') {
            console.log('통화 JPY');
            feePrice = Math.ceil((price + maintenancePrice) * 0.08);

        } else {
            console.log('통화 기본(KRW)');
            feePrice = Number(((price + maintenancePrice) * 0.08).toFixed(2));
        }

        const thisRoom = room;
        navigate(`/detail/${roomId}/${locale}/reservation`, {
            state: {
                price,
                depositPrice,
                maintenancePrice,
                feePrice,
                // allOptionPrice,
                thisRoom
            },
        });
    };

    const createChatRoom = () => {
        const isAuthenticated = !!localStorage.getItem("authToken"); // 로그인 여부 확인
        if (!isAuthenticated) {
            alert('로그인 후 이용 가능합니다.');
            setAuthModalOpen(true);
            return;
        }

        console.log('룸:', Number(roomId), '호스트:', room?.host_id);
        if (room?.host_id) {
            createRoom(Number(roomId), room.host_id);
        }
        window.location.href = '/chat';
    };

    useEffect(() => {
        if (slideIsOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        // 컴포넌트 언마운트 시 스크롤 복원
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [slideIsOpen]);

    return (
        <div className="my-8 relative overflow-visible max-w-[1200px] mx-auto pb-24 md:pb-0">
            {authModalOpen && (
                <AuthModal visible={authModalOpen} onClose={() => setAuthModalOpen(false)} type="login"/>
            )}
            {room ? (
                <div className="flex flex-col md:flex-row gap-8">
                    {/* 메인 콘텐츠 영역 */}
                    <div className="md:w-3/5 w-full mx-auto px-6 md:px-0">
                        <h1 className="text-3xl font-bold mb-8 text-gray-800">{room.title}</h1>

                        {/* 이미지 갤러리 */}
                        <div className="mb-10">
                            {room.detail_urls && room.detail_urls.length > 0 ? (
                                <ImgCarousel
                                    images={room.detail_urls}
                                    customClass="md:rounded-lg h-64 md:h-[30rem] object-cover"
                                />
                            ) : (
                                <img
                                    src="/default-image.jpg"
                                    alt="thumbnail"
                                    className="w-full md:h-[30rem] h-64 object-cover rounded-lg"
                                />
                            )}
                        </div>

                        {/* 인증 및 설명 */}
                        <div className="px-1 space-y-16">
                            {room.is_verified && (
                                <div
                                    className="inline-flex items-center px-4 py-1.5 bg-indigo-50 rounded-full text-sm font-medium text-indigo-600 mb-6">
                                    <FontAwesomeIcon icon={faCheckCircle} className="mr-2"/>
                                    {t('[인증숙박업소]')}
                                </div>
                            )}

                            {/* 가격 및 관리비 설명 */}
                            <div className="space-y-4 pb-6 border-b border-gray-200">
                                <h2 className="text-xl font-semibold text-gray-800">{t("가격")}</h2>

                                {/* Main pricing grid */}
                                <div className="text-gray-700 grid md:grid-cols-2 gap-6 ml-1">
                                    {/* Monthly pricing section */}
                                    <div className="space-y-2">
                                        <h3 className="text-lg font-medium text-gray-800 mb-2 pb-1 border-b border-gray-200">월
                                            단위</h3>
                                        {room.month_price && (
                                            <div className="flex justify-between items-center py-2">
                                                <span className="text-gray-600">{t("월 가격")}</span>
                                                <span
                                                    className="font-medium">{room.symbol} {room.month_price.toLocaleString()}</span>
                                            </div>
                                        )}
                                        {room.maintenance_fee_month && (
                                            <div className="flex justify-between items-center py-2">
                                                <span className="text-gray-600">{t("월 관리비")}</span>
                                                <span
                                                    className="font-medium">{room.symbol} {room.maintenance_fee_month.toLocaleString()}</span>
                                            </div>
                                        )}
                                        {room.deposit_month && (
                                            <div className="flex justify-between items-center py-2">
                                                <span className="text-gray-600">{t("월 보증금")}</span>
                                                <span
                                                    className="font-medium">{room.symbol} {room.deposit_month.toLocaleString()}</span>
                                            </div>
                                        )}
                                    </div>
                                    {/* Weekly pricing section */}
                                    <div className="space-y-2">
                                        <h3 className="text-lg font-medium text-gray-800 mb-2 pb-1 border-b border-gray-200">주
                                            단위</h3>
                                        {room.week_price && (
                                            <div className="flex justify-between items-center py-2">
                                                <span className="text-gray-600">{t("주 가격")}</span>
                                                <span
                                                    className="font-medium">{room.symbol} {room.week_price.toLocaleString()}</span>
                                            </div>
                                        )}
                                        {room.maintenance_fee_week && (
                                            <div className="flex justify-between items-center py-2">
                                                <span className="text-gray-600">{t("주 관리비")}</span>
                                                <span
                                                    className="font-medium">{room.symbol} {room.maintenance_fee_week.toLocaleString()}</span>
                                            </div>
                                        )}
                                        {room.deposit_week && (
                                            <div className="flex justify-between items-center py-2">
                                                <span className="text-gray-600">{t("주 보증금")}</span>
                                                <span
                                                    className="font-medium">{room.symbol} {room.deposit_week.toLocaleString()}</span>
                                            </div>
                                        )}
                                    </div>


                                </div>

                                {/* Maintenance details */}
                                <div className="mt-4 ml-1">
                                    <h3 className="text-gray-800 font-medium mb-2">관리비 포함 내역</h3>
                                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                                        {t('월 관리비, 인터넷, 수도세, 전기세 포함\n관리비, 청소비, 보안서비스, 시설 유지보수비 포함\n기본 관리비, 공용공간 유지비, 24시간 경비 서비스 포함\n관리비, 냉난방비, 엘리베이터 유지비, 주차관리비 포함\n전체 관리비, 인터넷, 공용시설 이용료 포함')}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4 pb-6 border-b border-gray-200">
                                <h2 className="text-xl font-semibold text-gray-800">공간 안내</h2>
                                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap ml-1">{room.description}</p>
                            </div>

                            <div className="mb-10">
                                <h2 className="text-xl font-semibold text-gray-800">
                                    {/*<span className="w-1.5 h-6 bg-roomi rounded-full mr-2"></span>*/}
                                    {t("room_info")}
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                    {room.accommodation_type && (
                                        <div className="flex items-center">
                                            <div
                                                className="w-10 h-10 rounded-full flex_center text-gray-700 mr-3">
                                                <FontAwesomeIcon icon={faHome}/>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">{t("숙소유형")}</p>
                                                <p className="font-medium">{room.accommodation_type}</p>
                                            </div>
                                        </div>
                                    )}

                                    {room.building_type && (
                                        <div className="flex items-center">
                                            <div
                                                className="w-10 h-10 rounded-full  flex_center text-gray-700 mr-3">
                                                <FontAwesomeIcon icon={faBuilding}/>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">{t("건물유형")}</p>
                                                <p className="font-medium">{room.building_type}</p>
                                            </div>
                                        </div>
                                    )}

                                    {room.room_structure && (
                                        <div className="flex items-center">
                                            <div
                                                className="w-10 h-10 rounded-full  flex_center text-gray-700 mr-3">
                                                <FontAwesomeIcon icon={faVectorSquare}/>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">{t("방구조")}</p>
                                                <p className="font-medium">{room.room_structure}</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center">
                                        <div
                                            className="w-10 h-10 rounded-full  flex_center text-gray-700 mr-3">
                                            <FontAwesomeIcon icon={faVectorSquare}/>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">{t("면적")}</p>
                                            <p className="font-medium">{`${room.floor_area ?? 0}m²`}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center">
                                        <div
                                            className="w-10 h-10 rounded-full  flex_center text-gray-700 mr-3">
                                            <FontAwesomeIcon icon={faLayerGroup}/>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">{t("층수")}</p>
                                            <p className="font-medium">{`${room.floor ?? 0}`}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center">
                                        <div
                                            className="w-10 h-10 rounded-full  flex_center text-gray-700 mr-3">
                                            <FontAwesomeIcon icon={faDoorOpen}/>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">{t("방개수")}</p>
                                            <p className="font-medium">{`${room.room_count ?? 0}`}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center">
                                        <div
                                            className="w-10 h-10 rounded-full  flex_center text-gray-700 mr-3">
                                            <FontAwesomeIcon icon={faBath}/>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">{t("욕실개수")}</p>
                                            <p className="font-medium">{`${room.bathroom_count ?? 0}`}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center">
                                        <div
                                            className="w-10 h-10 rounded-full  flex_center text-gray-700 mr-3">
                                            <FontAwesomeIcon icon={faElevator}/>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">{t("엘리베이터")}</p>
                                            <p className="font-medium">{room.has_elevator ? "\u2714" : "\u274C"}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center">
                                        <div
                                            className="w-10 h-10 rounded-full  flex_center text-gray-700 mr-3">
                                            <FontAwesomeIcon icon={faSquareParking}/>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">{t("주차가능")}</p>
                                            <p className="font-medium">{room.has_parking ? "\u2714" : "\u274C"}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center">
                                        <div
                                            className="w-10 h-10 rounded-full  flex_center text-gray-700 mr-3">
                                            <FontAwesomeIcon icon={faUsers}/>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">{t("최대이용인원")}</p>
                                            <p className="font-medium">{`${room.max_guests ?? 0}${t('guest_unit')}`}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center">
                                        <div
                                            className="w-10 h-10 rounded-full  flex_center text-gray-700 mr-3">
                                            <FontAwesomeIcon icon={faClock}/>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">{t("check_in/out")}</p>
                                            <p className="font-medium">{`${room.check_in_time ?? "0"} / ${room.check_out_time ?? "0"}`}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 제공 서비스 */}
                            <div className="space-y-4 pb-6 border-b border-gray-200">
                                <h2 className="text-xl font-semibold text-gray-800">{t("제공 서비스")}</h2>
                                <div className="grid grid-cols-1 md:grid-cols-1 gap-4 ml-1">
                                    {room.breakfast_service && (
                                        <div className="flex items-center">
                                            <FontAwesomeIcon icon={faUtensils} className="text-gray-600 mr-3"/>
                                            <span className="text-gray-700">{room.breakfast_service}</span>
                                        </div>
                                    )}
                                    {room.checkin_service && (
                                        <div className="flex items-center">
                                            <FontAwesomeIcon icon={faUserCheck} className="text-gray-600 mr-3"/>
                                            <span className="text-gray-700">{room.checkin_service}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 편의시설 */}
                            <div className="space-y-4 pb-6 border-b border-gray-200">
                                <h2 className="text-xl font-semibold text-gray-800">{t("편의시설")}</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-4 ml-1">
                                    {room?.facilities &&
                                        Object.entries(room.facilities)
                                            .filter(([_, value]) => value)
                                            .map(([key, value], index) => (
                                                <div key={index} className="flex items-center">
                                                    <FontAwesomeIcon icon={facilityIcons[key]}
                                                                     className="text-gray-600 mr-3"/>
                                                    <span className="text-gray-700 text-sm sm:text-base">{value}</span>
                                                </div>
                                            ))}
                                </div>
                            </div>

                            {/* 추가 시설 */}
                            <div className="space-y-4 pb-6 border-b border-gray-200">
                                <h2 className="text-xl font-semibold text-gray-800">{t("추가시설")}</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-4 ml-1">
                                    {room?.additional_facilities &&
                                        Object.entries(room.additional_facilities)
                                            .filter(([_, value]) => value)
                                            .map(([key, value], index) => (
                                                <div key={index} className="flex items-center">
                                                    <FontAwesomeIcon icon={facilityIcons[key]}
                                                                     className="text-gray-600 mr-3"/>
                                                    <span className="text-gray-700 text-sm sm:text-base">{value}</span>
                                                </div>
                                            ))}
                                </div>
                            </div>

                            {/* 위치 정보 */}
                            <div className="space-y-4 pb-6 border-b border-gray-200">
                                <h2 className="text-xl font-semibold text-gray-800">{t("위치정보")}</h2>
                                <div className="flex items-center mb-4 ml-1">
                                    <FontAwesomeIcon icon={faMapLocationDot} className="text-gray-600 mr-3"/>
                                    <span className="text-gray-700">{room.transportation_info}</span>
                                </div>
                                <div className="h-60 rounded-lg overflow-hidden">
                                    <NaverMapRoom room={room}/>
                                </div>
                            </div>

                            {/* 유의사항 */}
                            <div className="space-y-4 pb-6 border-b border-gray-200">
                                <h2 className="text-xl font-semibold text-gray-800">{t("유의사항")}</h2>
                                <ul className="ml-1 space-y-1.5 text-gray-700">
                                    {room.house_rules &&
                                        room.house_rules.split(/\\n|\n/).map((rule, index) => (
                                            <li key={index} className="flex items-baseline">
                                                <span className="text-grey-700 mr-2 text-xs">•</span>
                                                {rule.trim()}
                                            </li>
                                        ))}
                                </ul>
                                <div className="mt-6 ml-1">
                                    <h3 className="text-lg font-medium text-gray-800 mb-3">{t("금지사항")}</h3>
                                    <ul className="space-y-1.5 text-gray-700">
                                        {room.prohibitions &&
                                            Object.entries(room.prohibitions).map(([key, value], index) => (
                                                <li key={index} className="flex items-baseline">
                                                    <span className="text-gray-600 mr-2 text-xs">•</span>
                                                    <span className="font-medium mr-1">{t(key)}:</span>
                                                    <span>{value ? t("허용되지 않음") : t("허용됨")}</span>
                                                </li>
                                            ))}
                                    </ul>
                                </div>
                            </div>

                            {/* 호스트 정보 */}
                            <div className="bg-gray-50 py-6 px-6 rounded-lg mb-6">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center">
                                        <div className="mr-4">
                                            <img
                                                src={room.host.profile_image ? room.host.profile_image : '/assets/images/profile.png'}
                                                alt="프로필사진"
                                                className="rounded-full w-16 h-16 object-cover"
                                            />
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-800">{room.host.name}</div>
                                            <div className="text-gray-500 text-sm">호스트</div>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        className="px-5 py-2.5 rounded-lg bg-roomi text-white text-sm font-medium hover:bg-roomi-1 transition-colors"
                                        onClick={createChatRoom}
                                    >
                                        채팅하기
                                    </button>
                                </div>
                            </div>

                            {/* 환불정책 */}
                            <div className="space-y-4">
                                <h2 className="text-xl font-semibold text-gray-800">{t("환불정책")}</h2>
                                <div className="text-gray-700 whitespace-pre-line ml-1">
                                    <div className="space-y-1.5">
                                        {room?.refund_policy
                                            ? room.refund_policy.replace(/\\n/g, '\n').split('\n').map((line, index) => (
                                                <div key={index} className="flex items-baseline">
                                                    {line.startsWith('•') ? (
                                                        <>
                                                            <span className="text-indigo-500 mr-2 text-xs">•</span>
                                                            {line.substring(1).trim()}
                                                        </>
                                                    ) : (
                                                        <span className={index === 0 ? "font-medium" : ""}>{line}</span>
                                                    )}
                                                </div>
                                            ))
                                            : '유연한 환불 정책\n• 체크인 24시간 전까지 무료 취소\n• 체크인 24시간 전까지: 100% 환불\n• 체크인 24시간 전 ~ 당일: 50% 환불\n• 체크인 이후: 환불 불가'.split('\n').map((line, index) => (
                                                <div key={index} className="flex items-baseline">
                                                    {line.startsWith('•') ? (
                                                        <>
                                                            <span className="text-indigo-500 mr-2 text-xs">•</span>
                                                            {line.substring(1).trim()}
                                                        </>
                                                    ) : (
                                                        <span className={index === 0 ? "font-medium" : ""}>{line}</span>
                                                    )}
                                                </div>
                                            ))
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>


                    {/*리모컨 영역*/}
                    <div className="md:w-2/5 md:h-fit md:sticky md:top-10 md:rounded-xl
                        border border-gray-200 md:p-6 p-4 break-words bg-white
                        w-full fixed bottom-0 z-[100]">
                        {/* 모바일 전용 아코디언 버튼 */}
                        <div
                            className="md:hidden w-full items-center p-4 rounded-lg cursor-pointer bg-roomi text-white">
                            <button type="button" className="w-full flex justify-between items-center"
                                    onClick={() => setSlideIsOpen(!slideIsOpen)}>
                                <span className="font-bold">{t("price_info")}</span>
                                <FontAwesomeIcon icon={slideIsOpen ? faChevronDown : faChevronUp}/>
                            </button>
                        </div>
                        <div className={`transition-all duration-300 ease-in-out md:max-h-none md:opacity-100 md:overflow-visible
                            ${slideIsOpen
                            // 아코디언이 열릴 때: 화면 높이 - 여유공간(예: 헤더/상단여백 80px)
                            ? "max-h-[calc(60vh)] overflow-y-auto opacity-100"
                            // 아코디언이 닫힐 때
                            : "max-h-0 overflow-hidden opacity-0"}`}
                        >
                            {/* 가격 정보 헤더 */}
                            {/* calUnit : true = 월 */}
                            {/* calUnit : false = 주 */}
                            <div className="p-3 border-b border-gray-100">
                                <h2 className="text-lg font-bold text-gray-800 mb-2">
                                    {room.symbol}{calUnit ? room.month_price?.toLocaleString() : room.week_price?.toLocaleString()}
                                    <span className="text-sm font-normal text-gray-600 ml-1">
                                        / {calUnit ? t("월") : t("주")}
                                    </span>
                                </h2>
                            </div>
                            {/* 옵션 선택 탭 */}
                            <div className="flex justify-center text-sm bg-roomi-light rounded-lg p-1 mb-6">
                                <button
                                    className={`flex items-center justify-center mx-1 px-4 py-2 rounded-lg cursor-pointer transition-all 
                                    ${calUnit ? "text-gray-700 hover:bg-roomi-000" : "bg-roomi text-white"}`}
                                    onClick={weekUnit}
                                >
                                    <FontAwesomeIcon icon={faCalendarDay} className="mr-1.5"/>{t("주")}
                                </button>
                                <button
                                    className={`flex items-center justify-center mx-1 px-4 py-2 rounded-lg cursor-pointer transition-all 
                                    ${calUnit ? "bg-roomi text-white" : "text-gray-700 hover:bg-roomi-000"}`}
                                    onClick={monthUnit}
                                >
                                    <FontAwesomeIcon icon={faCalendarDay} className="mr-1.5"/>{t("월")}
                                </button>
                            </div>
                            {/* 주 단위 선택기 */}
                            {!calUnit ? (
                                <div className="flex_center mb-3 text-sm">
                                    <button
                                        className="w-8 h-8 flex_center rounded-full border border-gray-200 text-roomi"
                                        onClick={() => handleWeekValue(false)}
                                    >
                                        <LuCircleMinus/>
                                    </button>
                                    <div className="mx-4 font-semibold">{weekValue} {t("주")}</div>
                                    <button
                                        className="w-8 h-8 flex_center rounded-full border border-gray-200 text-roomi"
                                        onClick={() => handleWeekValue(true)}
                                    >
                                        <LuCirclePlus/>
                                    </button>
                                </div>
                            ) : (
                                <div className="flex_center mb-3 text-sm">
                                    <button
                                        className="w-8 h-8 flex_center rounded-full border border-gray-200 text-roomi"
                                        onClick={() => handleMonthValue(false)}
                                    >
                                        <LuCircleMinus/>
                                    </button>
                                    <div className="mx-4 font-semibold">{monthValue} {t("달")}</div>
                                    <button
                                        className="w-8 h-8 flex_center rounded-full border border-gray-200 text-roomi"
                                        onClick={() => handleMonthValue(true)}
                                    >
                                        <LuCirclePlus/>
                                    </button>
                                </div>
                            )}
                            <div className="dateModal">
                                <Calendar
                                    onClickDay={handleDayClick}
                                    tileClassName={getTileClassName}
                                    minDate={new Date()}
                                    next2Label={null} // 추가로 넘어가는 버튼 제거
                                    prev2Label={null} // 이전으로 돌아가는 버튼 제거
                                    className="custom-calendar"
                                    formatDay={(locale, date) => dayjs(date).format('D')}
                                    locale={userLocale}
                                />
                            </div>
                            {/* 체크인/아웃 정보 */}
                            <div className="flex justify-between mb-4 text-xs">
                                <div className="flex flex-col">
                                    <span className="text-gray-500 my-2">{t("check_in")}</span>
                                    <span className="font-bold">{startDate || '-'}</span>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-gray-500 my-2">{t("check_out")}</span>
                                    <span className="font-bold">{endDate || '-'}</span>
                                </div>
                            </div>

                            {/* 비용 정보 */}
                            <div className="rounded-lg bg-roomi-light p-3 mb-4 text-sm">
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-700">{t("deposit")}</span>
                                    <span className="font-bold">
                                        {room.symbol}{calUnit ? room.deposit?.toLocaleString() : room.deposit_week?.toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-700">{t("service_charge")}</span>
                                    <span className="font-bold">
                                        {room.symbol}{calUnit ?
                                        room.maintenance_fee?.toLocaleString() : room.maintenance_fee_week?.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                            {/* 예약 버튼 */}
                            <button
                                className="w-full py-3 bg-roomi text-white text-sm rounded-lg font-medium hover:bg-roomi-3 transition-colors shadow-sm"
                                onClick={reservationBtn}
                            >
                                {t('confirm_reservation')}
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center">
                    <div role="status" className="m-10">
                        <svg aria-hidden="true"
                             className="inline w-8 h-8 text-gray-300 animate-spin fill-roomi"
                             viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                fill="currentColor"/>
                            <path
                                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                fill="currentFill"/>
                        </svg>
                        <div>로딩중...</div>
                    </div>
                </div>
            )}
        </div>
    );
}