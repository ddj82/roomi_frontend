import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate, useParams} from "react-router-dom";
import {fetchRoomData} from "../../api/api";
import {RoomData} from "../../types/rooms";
import {useTranslation} from "react-i18next";
import {useDateStore} from "../stores/DateStore";
import ImgCarousel from "../modals/ImgCarousel";
import {useGuestsStore} from "../stores/GuestsStore";
import {LuCircleMinus, LuCirclePlus} from "react-icons/lu";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    faCalendarDay,
    faChevronDown,
    faChevronUp,
    faEnvelope,
    faPhone,
    faUser
} from "@fortawesome/free-solid-svg-icons";
import dayjs from "dayjs";
import {useReserSlideConStore} from "../stores/ReserSlideConStore";

export default function GuestReservationSetScreen() {
    //동의항목
    const [isChecked1, setIsChecked1] = useState(true);
    const [isChecked2, setIsChecked2] = useState(true);
    const [isChecked3, setIsChecked3] = useState(true);
    //
    const {roomId, locale} = useParams(); // URL 파라미터 추출
    const [room, setRoom] = useState<RoomData | null>(null);
    const {t} = useTranslation();
    const {
        startDate,
        endDate,
        calUnit,
        weekValue, } = useDateStore();
    const {guestCount, setGuestCount} = useGuestsStore();
    const [nightVal, setNightVal] = useState(0);
    const navigate = useNavigate();
    const location = useLocation();
    const {
        price = 0,
        depositPrice = 0,
        maintenancePrice = 0,
        cleaningPrice = 0,
        allOptionPrice = 0,
    } = location.state || {}; // state가 없는 경우 기본값 설정
    const [totalPrice, setTotalPrice] = useState(0);
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
    });
    const {slideIsOpen, setSlideIsOpen} = useReserSlideConStore();

    useEffect(() => {
        const loadRoomData = async () => {
            if (roomId) {
                console.log(`Room ID: ${roomId}`);
                try {
                    if (locale != null) {
                        const response = await fetchRoomData(Number(roomId));
                        const responseJson = await response.json();
                        const roomData = responseJson.data;
                        setRoom(roomData);
                    }
                } catch (error) {
                    console.error('방 정보 불러오기 실패:', error);
                }
            }
        };
        loadRoomData();
        handleNight();
    }, [roomId, locale]);

    const handleguestValue = (value : boolean) => {
        if (value) {
            // 플러스 버튼 클릭 시
            setGuestCount(prev => prev + 1);
        } else {
            // 마이너스 버튼 클릭 시
            if (guestCount === 1) return;
            setGuestCount(prev => prev - 1);
        }
    };

    const handleNight = () => {
        if (calUnit) {
            if (startDate && endDate) {
                const diffDays = dayjs(endDate).diff(dayjs(startDate), "day"); // 일(day) 단위 차이 계산
                setNightVal(diffDays);
                setTotalPrice((price * diffDays) + allOptionPrice);
            } else {
                setNightVal(0); // 날짜가 없을 경우 0박으로 설정
            }
        } else {
            setTotalPrice((price * weekValue) + allOptionPrice);
        }
    };


    // 입력값 변경 핸들러
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [id]: value, // id 속성을 key로 사용하여 동적으로 값 업데이트
        }));
    };

    const paymentBtn = () => {
        console.log('결제 할 금액 :', totalPrice);
        let totalNight = nightVal; // 기본 일 단위로 초기화
        if (!calUnit) {
            totalNight = weekValue; // 주 단위면 초기화
        }
        formData.name = '김동준';
        formData.phone = '01012312312';
        formData.email = 'qweqwe@naver.com';
        navigate(`/detail/${roomId}/${locale}/reservation/payment`, {
            state: {
                price,
                depositPrice,
                maintenancePrice,
                cleaningPrice,
                totalPrice,
                totalNight,
                formData,
            },
        });
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
            {room ? (
                <div className="flex flex-col md:flex-row gap-8">
                    <div className="md:w-3/5 w-full">
                        <div className="mb-8 text-xl font-bold text-gray-800">{t("예약확인")}</div>
                        <div className="md:flex md:p-6 border border-gray-200 rounded-xl shadow-sm mb-6 bg-white">
                            <div className="md:w-3/5">
                                {room.detail_urls && room.detail_urls.length > 0 ? (
                                    <ImgCarousel images={room.detail_urls}
                                                 customClass="md:rounded-xl h-72 md:h-64 object-cover"/>
                                ) : (
                                    <img src="/default-image.jpg" alt="thumbnail"
                                         className="w-full md:h-64 h-72 rounded-xl object-cover"/>
                                )}
                            </div>
                            <div className="md:ml-6 md:my-auto p-4">
                                <div className="text-xl font-semibold text-gray-800 my-3">{room.title}</div>
                                <div className="my-3 flex items-center text-roomi">
                                    {room.is_verified ? (
                                        <><span
                                            className="inline-flex items-center text-sm font-medium px-2.5 py-0.5 text-roomi mr-2">
                                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"
                                                 xmlns="http://www.w3.org/2000/svg">
                                                <path fillRule="evenodd"
                                                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                      clipRule="evenodd"></path>
                                            </svg>
                                            {t("인증 숙박업소")}
                                        </span></>
                                    ) : ('')}
                                </div>
                                <div className="my-3 flex items-center text-gray-600">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                         xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                    </svg>
                                    {room.address}
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border border-gray-200 rounded-xl shadow-sm mb-6 bg-white">
                            <div className="font-bold text-gray-800 mb-4">
                                {t("호스트정보")}
                            </div>
                            <div className="flex items-center">
                                <div
                                    className="w-10 h-10 rounded-full bg-roomi-000 flex items-center justify-center text-roomi">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"
                                         xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                              clipRule="evenodd"></path>
                                    </svg>
                                </div>
                                <div className="ml-3 font-medium text-gray-700">{room.host_id}</div>
                            </div>
                        </div>
                        <div className="p-6 border border-gray-200 rounded-xl shadow-sm mb-6 bg-white">
                            <div className="font-bold text-gray-800 mb-4">
                                {t("예약정보")}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-lg bg-roomi-light">
                                    <div className="text-sm text-gray-500">{t("체크인날짜")}</div>
                                    <div className="font-bold text-gray-800 mt-1 flex items-center">
                                        <svg className="w-5 h-5 mr-2 text-roomi" fill="none" stroke="currentColor"
                                             viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                        </svg>
                                        {startDate}
                                    </div>
                                </div>
                                <div className="p-4 rounded-lg bg-roomi-light">
                                    <div className="text-sm text-gray-500">{t("체크아웃날짜")}</div>
                                    <div className="font-bold text-gray-800 mt-1 flex items-center">
                                        <svg className="w-5 h-5 mr-2 text-roomi" fill="none" stroke="currentColor"
                                             viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                        </svg>
                                        {endDate}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 p-4 rounded-lg bg-roomi-light">
                                <div className="text-sm text-gray-500">{t("사용인원")}</div>
                                <div className="flex items-center mt-1">
                                    <button className="text-lg text-roomi hover:text-[#7D5EC0] transition-colors"
                                            onClick={() => handleguestValue(false)}>
                                        <LuCircleMinus/>
                                    </button>
                                    <div className="font-bold text-gray-800 mx-4">{guestCount}{t("guest_unit")}</div>
                                    <button className="text-lg text-roomi hover:text-[#7D5EC0] transition-colors"
                                            onClick={() => handleguestValue(true)}>
                                        <LuCirclePlus/>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border border-gray-200 rounded-xl shadow-sm mb-6 bg-white">
                            <div className="font-bold text-gray-800 mb-6">
                                {t("예약자정보")}
                            </div>
                            <div className="my-5">
                                <div className="relative z-0">
                                    <span className="absolute start-0 bottom-2 text-roomi">
                                        <FontAwesomeIcon icon={faUser}/>
                                    </span>
                                    <input type="text" id="name" value={formData.name} onChange={handleChange}
                                           className="block py-3 px-6 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-200 appearance-none focus:outline-none focus:ring-0 focus:border-roomi peer"
                                           placeholder=""/>
                                    <label htmlFor="name"
                                           className="absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-placeholder-shown:start-6 peer-focus:start-0 peer-focus:text-roomi peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto">
                                        {t("예약자명")}
                                    </label>
                                </div>
                            </div>
                            <div className="my-5">
                                <div className="relative z-0">
                                    <span className="absolute start-0 bottom-2 text-roomi">
                                        <FontAwesomeIcon icon={faPhone}/>
                                    </span>
                                    <input type="text" id="phone" value={formData.phone} onChange={handleChange}
                                           className="block py-3 px-6 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-200 appearance-none focus:outline-none focus:ring-0 focus:border-roomi peer"
                                           pattern="[0-9]{3}-[0-9]{4}-[0-9]{4}" placeholder=""/>
                                    <label htmlFor="phone"
                                           className="absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-placeholder-shown:start-6 peer-focus:start-0 peer-focus:text-roomi peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto">
                                        {t("전화번호")}
                                    </label>
                                </div>
                            </div>
                            <div className="my-5">
                                <div className="relative z-0">
                                    <span className="absolute start-0 bottom-2 text-roomi">
                                        <FontAwesomeIcon icon={faEnvelope}/>
                                    </span>
                                    <input type="text" id="email" value={formData.email} onChange={handleChange}
                                           className="block py-3 px-6 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-200 appearance-none focus:outline-none focus:ring-0 focus:border-roomi peer"
                                           placeholder=""/>
                                    <label htmlFor="email"
                                           className="absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-placeholder-shown:start-6 peer-focus:start-0 peer-focus:text-roomi peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto">
                                        {t("이메일")}
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/*리모컨 영역*/}
                    <div className="md:w-2/5 md:h-fit md:sticky md:top-10 md:rounded-xl md:shadow-md
                        border border-gray-200 shadow-sm p-6 break-words bg-white
                        w-full fixed bottom-0 z-[100]">
                        {/* 모바일 전용 아코디언 버튼 */}
                        <div
                            className="md:hidden flex justify-between items-center p-4 bg-roomi-light rounded-lg cursor-pointer"
                            onClick={() => setSlideIsOpen(!slideIsOpen)}>
                            <span className="font-bold text-gray-800">{t("payment_info")}</span>
                            <FontAwesomeIcon icon={slideIsOpen ? faChevronDown : faChevronUp}/>
                        </div>
                        {/*<div className={`transition-all duration-300 ease-in-out */}
                        {/*    ${slideIsOpen ? "max-h-fit opacity-100" : "max-h-0 opacity-0 overflow-hidden md:max-h-none md:opacity-100"}`}>*/}
                        <div className={`transition-all duration-300 ease-in-out md:max-h-none md:opacity-100 md:overflow-visible
                            ${slideIsOpen
                            // 아코디언이 열릴 때: 화면 높이 - 여유공간(예: 헤더/상단여백 80px)
                            ? "max-h-[calc(60vh)] overflow-y-auto opacity-100"
                            // 아코디언이 닫힐 때
                            : "max-h-0 overflow-hidden opacity-0"}`}>
                            {/*<div className="flex justify-center text-sm bg-roomi-light rounded-lg p-1 pointer-events-none">*/}
                            {/*    <div*/}
                            {/*        className={`flex items-center justify-center mx-1 px-4 py-2 rounded-lg cursor-pointer transition-all */}
                            {/*        ${calUnit ? "bg-roomi text-white" : "text-gray-700 hover:bg-gray-100"}`}>*/}
                            {/*        <FontAwesomeIcon icon={faCalendarDay} className="mr-1.5"/>{t("day_unit")}*/}
                            {/*    </div>*/}
                            {/*    <div*/}
                            {/*        className={`flex items-center justify-center mx-1 px-4 py-2 rounded-lg cursor-pointer transition-all */}
                            {/*        ${calUnit ? "text-gray-700 hover:bg-gray-100" : "bg-roomi text-white"}`}>*/}
                            {/*        <FontAwesomeIcon icon={faCalendarDay} className="mr-1.5"/>{t("week_unit")}*/}
                            {/*    </div>*/}
                            {/*</div>*/}
                            {/*결제 정보-payment_info*/}
                            <div className="font-bold text-gray-800 mb-4 mt-6">
                                {t("payment_info")}
                            </div>
                            <div className="p-5 rounded-lg bg-roomi-light">
                                {/*숙박비*/}
                                <div className="flex justify-between py-2">
                                    <div className="font-medium text-gray-700">
                                        {price.toLocaleString()}원 × {calUnit ? (`${nightVal}일`) : (`${weekValue}주`)}
                                    </div>
                                    <div className="font-bold text-gray-800">
                                        {(calUnit ? (price * nightVal) : (price * weekValue)).toLocaleString()}원
                                    </div>
                                </div>
                                {/*보증금*/}
                                <div className="flex justify-between py-2">
                                    <div className="text-gray-700">{t("deposit")}</div>
                                    <div className="font-bold text-gray-800">{depositPrice.toLocaleString()}원</div>
                                </div>
                                {/*관리비*/}
                                <div className="flex justify-between py-2">
                                    <div className="text-gray-700">{t("service_charge")}</div>
                                    <div className="font-bold text-gray-800">{maintenancePrice.toLocaleString()}원</div>
                                </div>
                                {/*청소비*/}
                                <div className="flex justify-between py-2">
                                    <div className="text-gray-700">{t("cleaning_fee")}</div>
                                    <div className="font-bold text-gray-800">{cleaningPrice.toLocaleString()}원</div>
                                </div>
                                <div className="flex justify-between border-t border-gray-200 mt-3 pt-4">
                                    <div className="text-gray-800 font-medium">{t("총결제금액")}</div>
                                    <div
                                        className="font-bold text-roomi text-xl">{totalPrice.toLocaleString()}{t("원")}</div>
                                </div>
                            </div>
                            <div className="mt-4 text-sm space-y-6 max-w-lg mx-auto">
                                <div className="bg-[#F5EEFF] p-4 rounded-lg text-roomi text-xs">
                                    {t("계약 요청이 승인되기 전까지 요금이 결제 되지 않습니다.")}
                                </div>

                                <div className="space-y-4">
                                    <label className="flex items-start gap-3 cursor-pointer group">
                                        <div className="relative flex items-center justify-center mt-0.5">
                                            <input
                                                type="checkbox"
                                                checked={isChecked1}
                                                onChange={() => setIsChecked1(!isChecked1)}
                                                className="sr-only peer"
                                            />
                                            <div
                                                className="w-5 h-5 border-2 border-roomi rounded transition-all peer-checked:bg-roomi flex items-center justify-center">
                                                {isChecked1 && (
                                                    <svg className="w-3.5 h-3.5 text-white" fill="none"
                                                         stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round"
                                                              strokeWidth="3" d="M5 13l4 4L19 7"></path>
                                                    </svg>
                                                )}
                                            </div>
                                        </div>
                                        <span className="text-gray-600 group-hover:text-gray-800 transition-colors">방 예약 내용을 확인했습니다.</span>
                                    </label>


                                    <label className="flex items-start gap-3 cursor-pointer group">
                                        <div className="relative flex items-center justify-center mt-0.5">
                                            <input
                                                type="checkbox"
                                                checked={isChecked3}
                                                onChange={() => setIsChecked3(!isChecked3)}
                                                className="sr-only peer"
                                            />
                                            <div
                                                className="w-5 h-5 border-2 border-roomi rounded transition-all peer-checked:bg-roomi flex items-center justify-center">
                                                {isChecked3 && (
                                                    <svg className="w-3.5 h-3.5 text-white" fill="none"
                                                         stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round"
                                                              strokeWidth="3" d="M5 13l4 4L19 7"></path>
                                                    </svg>
                                                )}
                                            </div>
                                        </div>
                                        <span className="text-gray-600 group-hover:text-gray-800 transition-colors">마케팅 이메일 수신에 동의합니다. (선택 사항)</span>
                                    </label>
                                    <label className="flex items-start gap-3 cursor-pointer group">
                                        <div className="relative flex items-center justify-center mt-0.5">
                                            <input
                                                type="checkbox"
                                                checked={isChecked2}
                                                onChange={() => setIsChecked2(!isChecked2)}
                                                className="sr-only peer"
                                            />
                                            <div
                                                className="w-5 h-5 border-2 border-roomi rounded transition-all peer-checked:bg-roomi flex items-center justify-center">
                                                {isChecked2 && (
                                                    <svg className="w-3.5 h-3.5 text-white" fill="none"
                                                         stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round"
                                                              strokeWidth="3" d="M5 13l4 4L19 7"></path>
                                                    </svg>
                                                )}
                                            </div>
                                        </div>
                                        <span className="text-gray-600 group-hover:text-gray-800 transition-colors">서비스 약관, 결제 서비스 약관, 개인정보 처리방침에 동의합니다.</span>
                                    </label>
                                </div>

                                <button
                                    className="w-full py-3 px-4 bg-roomi hover:bg-[#8A5FD7] text-white font-medium rounded-lg transition-colors"
                                    onClick={paymentBtn}>
                                    {t("계약 요청")}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center p-12">
                    <div role="status" className="inline-flex flex-col items-center">
                        <svg aria-hidden="true"
                             className="w-12 h-12 text-gray-200 animate-spin fill-roomi"
                             viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                fill="currentColor"/>
                            <path
                                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                fill="currentFill"/>
                        </svg>
                        <span className="mt-3 text-gray-500">로딩중...</span>
                    </div>
                </div>
            )}
        </div>
    );
};
