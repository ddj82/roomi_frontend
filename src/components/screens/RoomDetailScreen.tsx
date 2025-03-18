import React, {useEffect, useState} from "react";
import {useNavigate, useParams} from 'react-router-dom';
import {addRoomHistory, fetchRoomData} from "src/api/api";
import {RoomData} from "../../types/rooms";
import ImgCarousel from "../util/ImgCarousel";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {IconDefinition} from "@fortawesome/fontawesome-svg-core";
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
    faWifi,
    faTv,
    faKitchenSet,
    faSoap,
    faHandsWash,
    faSnowflake,
    faParking,
    faKitMedical,
    faFireExtinguisher,
    faUtensils,
    faCoffee,
    faVideo,
    faTree,
    faDumbbell,
    faCouch,
    faSwimmingPool,
    faHotTub,
    faMapLocationDot,
    faCalendarDay,
    faChevronUp,
    faChevronDown,
    faUser,
    faMugSaucer,
    faShower,
    faWindowRestore,
    faChair,
    faTable,
    faTshirt,
    faPaw,
    faSmoking,
    faSmokingBan,
    faBriefcase,
    faMartiniGlass,
    faBed,
    faTemperatureHalf,
    faPhone,
    faPlug,
    faBolt,
    faShield,
    faLock,
    faBroom,
    faBellConcierge,
    faSpa,
    faMusic,
    faDice,
    faBookOpen,
    faUmbrellaBeach,
    faCity,
    faBabyCarriage,
    faWheelchair,
    faFire,
    faCheckCircle
} from "@fortawesome/free-solid-svg-icons";
import {useTranslation} from "react-i18next";
import NaverMapRoom from "../map/NaverMapRoom";
import Calendar from "react-calendar";
import dayjs from "dayjs";
import {useDateStore} from "src/components/stores/DateStore";
import 'react-calendar/dist/Calendar.css';
import {LuCircleMinus, LuCirclePlus} from "react-icons/lu";
import {useReserSlideConStore} from "../stores/ReserSlideConStore";
import {useChatStore} from "../stores/ChatStore";
import AuthModal from "../modals/AuthModal";
import i18n from "i18next";



export default function RoomDetailScreen() {
    const {roomId, locale} = useParams(); // URL 파라미터 추출
    const [room, setRoom] = useState<RoomData | null>(null);
    const {t} = useTranslation();
    const navigate = useNavigate();
    const {
        startDate, setStartDate,
        endDate, setEndDate,
        calUnit, setCalUnit,
        weekValue, setWeekValue
    } = useDateStore();
    const [slideIsOpen, setSlideIsOpen] = useState(false);
    const {createRoom} = useChatStore();
    const connect = useChatStore((state) => state.connect);
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [userLocale, setUserLocale] = useState(i18n.language);

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
        const dateString = formatDate(date);
        if (calUnit) {
            if (!startDate || (startDate && endDate)) {
                setStartDate(dateString);
                setEndDate(null);
            } else {
                if (new Date(dateString) >= new Date(startDate)) {
                    setEndDate(dateString);
                } else {
                    setStartDate(dateString);
                    setEndDate(null);
                }
            }
        } else {
            weekDateSet(dateString);
        }
    };

    const weekDateSet = (dateString: string) => {
        setStartDate(dateString);
        const startDateObj = new Date(dateString);
        const endDateObj = new Date(startDateObj);
        endDateObj.setDate(startDateObj.getDate() + (weekValue * 7)); // 주 단위 계산
        const formattedEndDate = formatDate(endDateObj);
        setEndDate(formattedEndDate);
    };

    const getTileClassName = ({date}: { date: Date }) => {
        const dateString = formatDate(date);
        if (dateString === startDate) {
            return 'start-date';
        }
        if (dateString === endDate) {
            return 'end-date';
        }
        if (startDate && endDate && date > new Date(startDate) && date < new Date(endDate)) {
            return 'in-range';
        }
        return null;
    };

    // 날짜 문자열 변환 함수
    const formatDate = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1 필요
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const dayUnit = () => {
        setCalUnit(true);
        setWeekValue(1);
        setStartDate(null);
        setEndDate(null);
    };

    const weekUnit = () => {
        setCalUnit(false);
        setStartDate(null);
        setEndDate(null);
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
    };

    useEffect(() => {
        // startDate, endDate 설정이 되어 있으면 weekDateSet 다시
        if (startDate && endDate && !calUnit) {
            weekDateSet(startDate);
        }
    }, [weekValue]);

    const reservationBtn = () => {
        const isAuthenticated = !!localStorage.getItem("authToken"); // 로그인 여부 확인
        if (!isAuthenticated) {
            alert('로그인 후 이용 가능합니다.');
            setAuthModalOpen(true);
            return;
        }

        // 기본 일간 가격 저장
        let price = (Number(room?.day_price) || 0);
        let depositPrice = (Number(room?.deposit) || 0);
        let maintenancePrice = (Number(room?.maintenance_fee) || 0);
        let cleaningPrice = (Number(room?.cleaning_fee) || 0);

        if (!calUnit) {
            // 주간 가격 저장
            price = (Number(room?.week_price) || 0);
            depositPrice = (Number(room?.deposit_week) || 0);
            maintenancePrice = (Number(room?.maintenance_fee_week) || 0);
            cleaningPrice = (Number(room?.cleaning_fee_week) || 0);
        }
        const allOptionPrice = depositPrice + maintenancePrice + cleaningPrice;
        navigate(`/detail/${roomId}/${locale}/reservation`, {
            state: {
                price,
                depositPrice,
                maintenancePrice,
                cleaningPrice,
                allOptionPrice,
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
                    <div className="md:w-3/5 w-full">
                        <h1 className="text-2xl font-bold mb-6 text-gray-800">{room.title}</h1>

                        {/* 이미지 갤러리 */}
                        <div className="mb-8 rounded-xl overflow-hidden shadow-sm">
                            {room.detail_urls && room.detail_urls.length > 0 ? (
                                <ImgCarousel
                                    images={room.detail_urls}
                                    customClass="md:rounded-xl h-64 md:h-[30rem] object-cover"
                                />
                            ) : (
                                <img
                                    src="/default-image.jpg"
                                    alt="thumbnail"
                                    className="w-full md:h-[30rem] h-64 object-cover"
                                />
                            )}
                        </div>

                        {/* 인증 및 설명 */}
                        <div className="px-1">
                            {room.is_verified && (
                                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-roomi mb-4">
                                    <FontAwesomeIcon icon={faCheckCircle} className="mr-2"/>
                                    {t('[인증숙박업소]')}
                                </div>
                            )}

                            <p className="text-gray-700 mb-8 leading-relaxed whitespace-pre-wrap">{room.description}</p>

                            {/* 숙소 정보 */}
                            <div className="mb-10">
                                <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                                    <span className="w-1.5 h-6 bg-roomi rounded-full mr-2"></span>
                                    {t("room_info")}
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {room.accommodation_type && (
                                        <div className="flex items-center">
                                            <div
                                                className="w-10 h-10 rounded-full flex_center text-roomi mr-3">
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
                                                className="w-10 h-10 rounded-full  flex_center text-roomi mr-3">
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
                                                className="w-10 h-10 rounded-full  flex_center text-roomi mr-3">
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
                                            className="w-10 h-10 rounded-full  flex_center text-roomi mr-3">
                                            <FontAwesomeIcon icon={faVectorSquare}/>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">{t("면적")}</p>
                                            <p className="font-medium">{`${room.floor_area ?? 0}m²`}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center">
                                        <div
                                            className="w-10 h-10 rounded-full  flex_center text-roomi mr-3">
                                            <FontAwesomeIcon icon={faLayerGroup}/>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">{t("층수")}</p>
                                            <p className="font-medium">{`${room.floor ?? 0}`}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center">
                                        <div
                                            className="w-10 h-10 rounded-full  flex_center text-roomi mr-3">
                                            <FontAwesomeIcon icon={faDoorOpen}/>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">{t("방개수")}</p>
                                            <p className="font-medium">{`${room.room_count ?? 0}`}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center">
                                        <div
                                            className="w-10 h-10 rounded-full  flex_center text-roomi mr-3">
                                            <FontAwesomeIcon icon={faBath}/>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">{t("욕실개수")}</p>
                                            <p className="font-medium">{`${room.bathroom_count ?? 0}`}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center">
                                        <div
                                            className="w-10 h-10 rounded-full  flex_center text-roomi mr-3">
                                            <FontAwesomeIcon icon={faElevator}/>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">{t("엘리베이터")}</p>
                                            <p className="font-medium">{room.has_elevator ? "\u2714" : "\u274C"}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center">
                                        <div
                                            className="w-10 h-10 rounded-full  flex_center text-roomi mr-3">
                                            <FontAwesomeIcon icon={faSquareParking}/>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">{t("주차가능")}</p>
                                            <p className="font-medium">{room.has_parking ? "\u2714" : "\u274C"}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center">
                                        <div
                                            className="w-10 h-10 rounded-full  flex_center text-roomi mr-3">
                                            <FontAwesomeIcon icon={faUsers}/>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">{t("최대이용인원")}</p>
                                            <p className="font-medium">{`${room.max_guests ?? 0}${t('guest_unit')}`}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center">
                                        <div
                                            className="w-10 h-10 rounded-full  flex_center text-roomi mr-3">
                                            <FontAwesomeIcon icon={faClock}/>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">{t("check_in/out")}</p>
                                            <p className="font-medium">{`${room.check_in_time ?? "0"} / ${room.check_out_time ?? "0"}`}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 편의시설 */}
                            <div className="mb-10">
                                <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                                    <span className="w-1.5 h-6 bg-roomi rounded-full mr-2"></span>
                                    {t("편의시설")}
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {room?.facilities &&
                                        Object.entries(room.facilities)
                                            .filter(([_, value]) => value)
                                            .map(([key, value], index) => (
                                                <div key={index} className="flex items-center p-3 rounded-lg">
                                                    <FontAwesomeIcon icon={facilityIcons[key]}
                                                                     className="text-roomi mr-3"/>
                                                    <span className="text-sm font-medium">{value}</span>
                                                </div>
                                            ))
                                    }
                                </div>
                            </div>

                            {/* 추가 시설 */}
                            <div className="mb-10">
                                <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                                    <span className="w-1.5 h-6 bg-roomi rounded-full mr-2"></span>
                                    {t("추가시설")}
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {room?.additional_facilities &&
                                        Object.entries(room.additional_facilities).filter(([_, value]) => value)
                                            .map(([key, value], index) => (
                                                <div key={index}
                                                     className="flex items-center p-3 rounded-lg">
                                                    <FontAwesomeIcon icon={facilityIcons[key]}
                                                                     className="text-roomi mr-3"/>
                                                    <span className="text-sm font-medium">{value}</span>
                                                </div>
                                            ))
                                    }
                                </div>
                            </div>

                            {/* 위치 정보 */}
                            <div className="mb-10">
                                <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                                    <span className="w-1.5 h-6 bg-roomi rounded-full mr-2"></span>
                                    {t("위치정보")}
                                </h2>

                                <div className="flex items-center mb-4">
                                    <FontAwesomeIcon icon={faMapLocationDot} className="text-roomi mr-3"/>
                                    <span>{room.transportation_info}</span>
                                </div>

                                <div className="h-60 rounded-xl overflow-hidden shadow-sm">
                                    <NaverMapRoom room={room}/>
                                </div>
                            </div>

                            {/* 호스트 정보 */}
                            <div
                                className="mb-10 rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center">
                                        <div
                                            className="w-16 h-16 rounded-full bg-roomi flex_center text-white mr-4">
                                            <FontAwesomeIcon icon={faUser} className="text-2xl"/>
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800">{room.host_id}</p>
                                            <p className="text-sm text-gray-500">호스트</p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        className="px-5 py-2.5 rounded-lg bg-roomi text-white text-sm font-medium hover:bg-opacity-90 transition-colors shadow-sm"
                                        onClick={createChatRoom}
                                    >
                                        채팅하기
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/*리모컨 영역*/}
                    <div className="md:w-2/5 md:h-fit md:sticky md:top-10 md:rounded-xl md:shadow-md
                        border border-gray-200 shadow-sm md:p-6 p-4 break-words bg-white
                        w-full fixed bottom-0 z-[100]">
                        {/* 모바일 전용 아코디언 버튼 */}
                        <div className="md:hidden w-full items-center p-4 rounded-lg cursor-pointer bg-roomi text-white">
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
                            <div className="p-3 pt-5 border-b border-gray-100">
                                <h2 className="text-lg font-bold text-gray-800 mb-2">
                                    {t("원")}{calUnit ? room.day_price?.toLocaleString() : room.week_price?.toLocaleString()}
                                    <span className="text-sm font-normal text-gray-600 ml-1">
                                        / {calUnit ? t("일") : t("주")}
                                    </span>
                                </h2>
                            </div>
                            {/* 옵션 선택 탭 */}
                            <div className="flex justify-center text-sm bg-roomi-light rounded-lg p-1 mb-6">
                                <button
                                    className={`flex items-center justify-center mx-1 px-4 py-2 rounded-lg cursor-pointer transition-all 
                                    ${calUnit ? "bg-roomi text-white" : "text-gray-700 hover:bg-roomi-000"}`}
                                    onClick={dayUnit}
                                >
                                    <FontAwesomeIcon icon={faCalendarDay} className="mr-1.5"/>{t("일")}
                                </button>
                                <button
                                    className={`flex items-center justify-center mx-1 px-4 py-2 rounded-lg cursor-pointer transition-all 
                                    ${calUnit ? "text-gray-700 hover:bg-roomi-000" : "bg-roomi text-white"}`}
                                    onClick={weekUnit}
                                >
                                    <FontAwesomeIcon icon={faCalendarDay} className="mr-1.5"/>{t("주")}
                                </button>
                            </div>
                            {/* 주 단위 선택기 */}
                            {!calUnit && (
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
                                        {t("원")}{calUnit ? room.deposit?.toLocaleString() : room.deposit_week?.toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-700">{t("service_charge")}</span>
                                    <span className="font-bold">
                                        {t("원")}{calUnit ?
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
                        {/*<span className="sr-only">로딩중...</span>*/}
                        <div>로딩중...</div>
                    </div>
                </div>
            )}
        </div>
    );
}

const addFacilityIcons: Record<string, IconDefinition> = {};

export const facilityIcons: Record<string, IconDefinition> = {
    "bbq": faUtensils, // 바비큐
    "cafe": faCoffee, // 카페
    "cctv": faVideo, // CCTV
    "garden": faTree, // 정원
    "gym": faDumbbell, // 헬스장
    "weekend": faCouch, // 라운지
    "pool": faSwimmingPool, // 수영장
    "hot_tub": faHotTub, // 사우나
    "wifi": faWifi,
    "tv": faTv,
    "kitchen": faKitchenSet,
    "ac_unit": faSnowflake,
    // "laundry": faSoap,
    "washing_machine": faSoap,
    "dry": faHandsWash,
    "bathtub": faBath,
    "shower": faShower,
    "desk": faTable,
    "iron": faTshirt,
    "coffee": faMugSaucer,
    "refrigerator": faKitchenSet,
    "microwave": faKitchenSet,
    "park": faTree,
    "pets": faPaw,
    "smoking": faSmoking,
    "smoke_free": faSmokingBan,
    "fitness": faDumbbell,
    "grill": faFire,
    "business": faBriefcase,
    "restaurant": faUtensils,
    "bar": faMartiniGlass,
    "parking": faParking,
    "medical_services": faKitMedical,
    "fire_extinguisher": faFireExtinguisher,
    "videocam": faVideo,
    "bed": faBed,
    "door_sliding": faDoorOpen,
    "window": faWindowRestore,
    "thermostat": faTemperatureHalf,
    "chair": faChair,
    "fridge": faKitchenSet,
    "outlet": faPlug,
    "charging_station": faBolt,
    "phone": faPhone,
    "beach_access": faUmbrellaBeach,
    "city_view": faCity,
    "non_smoking": faSmokingBan,
    "baby_care": faBabyCarriage,
    "accessible": faWheelchair,
    "room_service": faBellConcierge,
    "cleaning_services": faBroom,
    "spa": faSpa,
    "library": faBookOpen,
    "games": faDice,
    "music": faMusic,
    "safe": faLock,
    "security": faShield
};