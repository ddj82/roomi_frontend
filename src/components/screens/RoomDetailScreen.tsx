import React, {useEffect, useState} from "react";
import {useNavigate, useParams} from 'react-router-dom';
import {fetchRoomData} from "src/api/api";
import {RoomData} from "../../types/rooms";
import ImgCarousel from "../modals/ImgCarousel";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {IconDefinition} from "@fortawesome/fontawesome-svg-core";
import {
    faBath,
    faBuilding,
    faClock,
    faDoorOpen, faElevator,
    faHome,
    faLayerGroup, faSquareParking, faUsers,
    faVectorSquare,
    faWifi, faTv, faKitchenSet, faSoap, faHandsWash,
    faSnowflake, faParking, faKitMedical, faFireExtinguisher,
    faUtensils, faCoffee, faVideo, faTree, faDumbbell,
    faCouch, faSwimmingPool, faHotTub, faMapLocationDot, faCalendarDay, faChevronUp, faChevronDown, faUser,
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


const facilityIcons: Record<string, IconDefinition> = {
    "wi_fi": faWifi,
    "tv": faTv,
    "kitchen": faKitchenSet,
    "washing_machine": faSoap,
    "dryer_machine": faHandsWash,
    "air_conditioner": faSnowflake,
    "parking": faParking,
    "aid_kit": faKitMedical,
    "fire_extinguisher": faFireExtinguisher,
};
const addFacilityIcons: Record<string, IconDefinition> = {
    "bbq": faUtensils, // 바비큐
    "cafe": faCoffee, // 카페
    "cctv": faVideo, // CCTV
    "garden": faTree, // 정원
    "gym": faDumbbell, // 헬스장
    "lounge": faCouch, // 라운지
    "pool": faSwimmingPool, // 수영장
    "sauna": faHotTub, // 사우나
};

export default function RoomDetailScreen() {
    const {roomId, locale} = useParams(); // URL 파라미터 추출
    const [room, setRoom] = useState<RoomData | null>(null);
    const {t} = useTranslation();
    const navigate = useNavigate();
    const {
        startDate, setStartDate,
        endDate, setEndDate,
        calUnit, setCalUnit,
        weekValue, setWeekValue } = useDateStore();
    const {slideIsOpen, setSlideIsOpen} = useReserSlideConStore();
    const { createRoom } = useChatStore();
    const connect = useChatStore((state) => state.connect);

    useEffect(() => {
        const loadRoomData = async () => {
            if (roomId) {
                console.log(`Room ID: ${roomId}`);
                try {
                    if (locale != null) {
                        const response = await fetchRoomData(Number(roomId), locale);
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
            token = token.replace(/^Bearer\s/, ""); // 🔥 "Bearer " 제거
            connect(token); // ✅ WebSocket 연결
        } else {
            console.error('❌ Auth Token이 없습니다.');
        }
    }, [roomId, locale]); // roomId와 locale 변경 시 실행

    const buildRoomInfoRow = (icon: IconDefinition, label: string, value: string | number | boolean) => (
        <div className="flex items-center space-x-2 text-gray-700">
            <FontAwesomeIcon icon={icon} className="text-gray-500"/>
            <div className="font-medium">{label}:</div>
            <div>{value}</div>
        </div>
    );

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

    const weekDateSet = (dateString : string) => {
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

    const handleWeekValue = (value : boolean) => {
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
        console.log('룸:', Number(roomId), '호스트:', room?.host_id);
        if (room?.host_id) {
            createRoom(Number(roomId), room.host_id);
        }
        window.location.href = '/chat';
    };

    return (
        <div className="mt-8 relative overflow-visible">
            {room ? (
                <div>
                    <div className="flex md:flex-row flex-col">
                        <div className="md:w-3/5">
                            <div className="mb-8 text-lg font-bold">{room.title}</div>
                            <div>
                            {room.detail_urls && room.detail_urls.length > 0 ? (
                                    <ImgCarousel images={room.detail_urls} customClass="md:rounded-lg h-64 md:h-[30rem]"/>
                                ) : (
                                    <img src="/default-image.jpg" alt="thumbnail"
                                         className="w-full md:h-[30rem] h-64 rounded-lg"/>
                                )}
                            </div>
                            <div className="mx-4">
                                <div className="my-2">{room.is_verified ? ('인증숙박업소') : ('')}</div>
                                <div className="my-2">{room.short_description}</div>
                                <div className="my-2">
                                    <div>{t("room_info")}</div>
                                    {/*{buildRoomInfoRow(faHome, t("숙소유형"), room.accommodation_type ?? "0")}*/}
                                    {/*{buildRoomInfoRow(faBuilding, t("건물유형"), room.building_type ?? "0")}*/}
                                    {/*{buildRoomInfoRow(faVectorSquare, t("방구조"), room.room_structure ?? "0")}*/}
                                    {room.accommodation_type && buildRoomInfoRow(faHome, t("숙소유형"), room.accommodation_type)}
                                    {room.building_type && buildRoomInfoRow(faBuilding, t("건물유형"), room.building_type)}
                                    {room.room_structure && buildRoomInfoRow(faVectorSquare, t("방구조"), room.room_structure)}
                                    {buildRoomInfoRow(faVectorSquare, t("면적"), `${room.floor_area ?? 0}m²`)}
                                    {buildRoomInfoRow(faLayerGroup, t("층수"), `${room.floor ?? 0}층`)}
                                    {buildRoomInfoRow(faDoorOpen, t("방개수"), `${room.room_count ?? 0}개`)}
                                    {buildRoomInfoRow(faBath, t("욕실개수"), `${room.bathroom_count ?? 0}개`)}
                                    {buildRoomInfoRow(faElevator, t("엘리베이터"), room.has_elevator ? "✔️" : "❌")}
                                    {buildRoomInfoRow(faSquareParking, t("주차가능"), room.has_parking ? "✔️" : "❌")}
                                    {buildRoomInfoRow(faUsers, t("최대이용인원"), `${room.max_guests ?? 0}명`)}
                                    {buildRoomInfoRow(faClock, t("check_in"), `${room.check_in_time ?? "0"} / ${t("check_out")}: ${room.check_out_time ?? "0"}`)}
                                </div>
                                <div className="my-2">
                                    <div>{t("amenities")}</div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {room?.facilities &&
                                            Object.entries(room.facilities)
                                                .filter(([_, value]) => value)
                                                .map(([key], index) => (
                                                    <div key={index}
                                                         className="flex flex-col items-center text-center m-2">
                                                        <FontAwesomeIcon icon={facilityIcons[key]}
                                                                         className="text-gray-500 text-xl"/>
                                                    </div>
                                                ))}
                                    </div>
                                </div>
                                <div className="my-2">
                                    <div>{t("additional_facilities")}</div>
                                    <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                                        {room?.additional_facilities &&
                                            Object.entries(room.additional_facilities)
                                                .filter(([_, value]) => value)
                                                .map(([key], index) => (
                                                    <div key={index}
                                                         className="flex flex-col items-center text-center">
                                                        <FontAwesomeIcon icon={addFacilityIcons[key]}
                                                                         className="text-gray-500 text-xl"/>
                                                        <div className="">{key}</div>
                                                    </div>
                                                ))}
                                    </div>
                                </div>
                                <div className="my-2">
                                    <div>{t("location_information")}</div>
                                    <div className="flex items-center space-x-2">
                                        <FontAwesomeIcon icon={faMapLocationDot} className="text-gray-500 text-xl"/>
                                        <div>{room.transportation_info}</div>
                                    </div>
                                    <div className="h-72">
                                        <NaverMapRoom room={room}/>
                                    </div>
                                </div>
                                <div className="p-2 border-[1px] border-gray-300 rounded my-2 mb-5">
                                    <div className="w-full flex justify-between">
                                        <div className="flex w-full">
                                            <div className="flex_center w-20 h-20 m-4 bg-roomi rounded-full">
                                                <FontAwesomeIcon icon={faUser} className="text-white text-3xl"/>
                                            </div>
                                            <div className="flex flex-col justify-center h-20 m-4">{room.host_id}</div>
                                        </div>
                                        <div className="flex_center w-32 m-4">
                                            <button type="button" className="border border-gray-300 rounded p-2 px-3 text-sm" 
                                                    onClick={createChatRoom}>
                                                채팅하기
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/*리모컨 영역*/}
                        <div className="md:w-1/3 md:ml-auto md:h-fit md:sticky md:top-10 md:rounded-lg
                            w-full fixed bottom-0 bg-white z-[100]
                            border-[1px] border-gray-300 p-4 break-words">
                            {/* 모바일 전용 아코디언 버튼 */}
                            <div className="md:hidden flex justify-between items-center p-4 bg-gray-200 cursor-pointer" onClick={() => setSlideIsOpen(!slideIsOpen)}>
                                <span className="font-bold">{t("payment_info")}</span>
                                <FontAwesomeIcon icon={slideIsOpen ? faChevronDown : faChevronUp} />
                            </div>
                            <div className={`transition-all duration-300 ease-in-out 
                            ${slideIsOpen ? "max-h-fit opacity-100" : "max-h-0 opacity-0 overflow-hidden md:max-h-none md:opacity-100"}`}>
                                <div className="flex_center text-sm m-2">
                                    <div className={`flex_center mx-1 ${calUnit ? "bg-roomi rounded text-white" : ""}`}>
                                        <button onClick={dayUnit} className="px-4 py-1.5">
                                            <FontAwesomeIcon icon={faCalendarDay} className="mr-1.5"/>{t("day_unit")}
                                        </button>
                                    </div>
                                    <div className={`flex_center mx-1 ${calUnit ? "" : "bg-roomi rounded text-white"}`}>
                                        <button onClick={weekUnit} className="px-4 py-1.5">
                                            <FontAwesomeIcon icon={faCalendarDay} className="mr-1.5"/>{t("week_unit")}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between">
                                        {calUnit ? (
                                            <>
                                                <div>{t("daily_price")}</div>
                                                <div className="font-bold">{room.day_price}/{t("day_unit")}</div>
                                            </>
                                        ) : (
                                            <>
                                                <div>{t("weekly_price")}</div>
                                                <div className="font-bold">{room.week_price}/{t("week_unit")}</div>
                                            </>
                                        )}
                                    </div>
                                    <div className="my-2 text-sm">
                                        4주 이상 계약 시 10% 할인
                                    </div>
                                    <div className="my-2 bg-gray-100 rounded p-2">
                                        <div className="flex justify-between">
                                            <div>{t("deposit")}</div>
                                            {calUnit ?
                                                (<div>{room.deposit}</div>) : (<div>{room.deposit_week}</div>)}
                                        </div>
                                        <div className="flex justify-between mt-1">
                                            <div>{t("service_charge")}</div>
                                            {calUnit ?
                                                (<div>{room.maintenance_fee}</div>) : (<div>{room.maintenance_fee_week}</div>)}
                                        </div>
                                        <div className="flex justify-between mt-1">
                                            <div>{t("cleaning_fee")}</div>
                                            {calUnit ?
                                                (<div>{room.cleaning_fee}</div>) : (<div>{room.cleaning_fee_week}</div>)}
                                        </div>
                                    </div>
                                </div>
                                {!calUnit && (
                                    <div className="flex_center m-4">
                                        <button className="text-lg" onClick={() => handleWeekValue(false)}>
                                            <LuCircleMinus/>
                                        </button>
                                        <div className="text-xs font-bold mx-3">{weekValue}{t("week_unit")}</div>
                                        <button className="text-lg" onClick={() => handleWeekValue(true)}>
                                            <LuCirclePlus />
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
                                    />
                                </div>
                                <div className="text-sm">
                                    {!startDate ? (
                                        <>
                                            <div>{t("check_in")} -</div>
                                            <div>{t("check_out")} -</div>
                                        </>
                                    ) : (
                                        <>
                                            {!endDate ? (
                                                <>
                                                    <div>{t("check_in")} - {startDate}</div>
                                                    <div>{t("check_out")} -</div>
                                                </>
                                            ) : (
                                                <>
                                                    <div>{t("check_in")} - {startDate}</div>
                                                    <div>{t("check_out")} - {endDate}</div>
                                                </>
                                            )}
                                        </>
                                    )}
                                </div>
                                <div className="mt-4">
                                    <button className="w-full py-2 bg-roomi rounded text-white"
                                            onClick={reservationBtn}
                                    >
                                        예약하기
                                    </button>
                                </div>
                            </div>
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