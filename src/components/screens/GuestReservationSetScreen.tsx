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
                        const response = await fetchRoomData(Number(roomId), locale);
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

    return (
        <div className="mt-8 relative overflow-visible">
            {room ? (
                <div className="flex md:flex-row flex-col">
                    <div className="md:w-3/5">
                        <div className="mb-8 text-lg font-bold">{t("예약확인")}</div>
                        <div className="md:flex md:p-4 md:border-[1px] border-gray-300 md:rounded mb-5">
                            <div className="md:w-2/5">
                                {room.detail_urls && room.detail_urls.length > 0 ? (
                                    <ImgCarousel images={room.detail_urls} customClass="md:rounded-lg h-64 md:h-[15rem]"/>
                                ) : (
                                    <img src="/default-image.jpg" alt="thumbnail"
                                         className="w-full md:h-[30rem] h-64 rounded"/>
                                )}
                            </div>
                            <div className="md:ml-2 md:my-auto p-4">
                                <div className="my-2">{room.title}</div>
                                <div className="my-2">{room.is_verified ? ('인증숙박업소 (아이콘으로변경)') : ('')}</div>
                                <div className="my-2">{room.address}</div>
                            </div>
                        </div>
                        <div className="p-4 border-[1px] border-gray-300 rounded mb-5">
                            <div className="font-bold">
                                {t("호스트정보")}
                            </div>
                            <div className="flex">
                                <div>프사</div>
                                <div className="ml-2">{room.host_id}</div>
                            </div>
                        </div>
                        <div className="p-4 border-b-[1px] border-gray-300 mb-5">
                            <div className="font-bold">
                                {t("예약정보")}
                            </div>
                            <div className="flex justify-between">
                                <div>{t("체크인날짜")}</div>
                                <div className="font-bold">{startDate}</div>
                            </div>
                            <div className="flex justify-between">
                                <div>{t("체크아웃날짜")}</div>
                                <div className="font-bold">{endDate}</div>
                            </div>
                            <div className="flex justify-between">
                                <div>{t("사용인원")}</div>
                                <div className="flex">
                                    <button className="text-lg" onClick={() => handleguestValue(false)}>
                                        <LuCircleMinus/>
                                    </button>
                                    <div className="font-bold mx-2">{guestCount}{t("guest_unit")}</div>
                                    <button className="text-lg" onClick={() => handleguestValue(true)}>
                                        <LuCirclePlus/>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-[1px] border-gray-300">
                            <div className="font-bold mb-6">
                                {t("예약자정보")}
                            </div>
                            <div className="my-5">
                                <div className="relative z-0">
                                    <span className="absolute start-0 bottom-2 text-roomi">
                                        <FontAwesomeIcon icon={faUser} />
                                    </span>
                                    <input type="text" id="name" value={formData.name} onChange={handleChange}
                                           className="block py-2.5 px-6 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-roomi peer"
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
                                        <FontAwesomeIcon icon={faPhone} />
                                    </span>
                                    <input type="text" id="phone" value={formData.phone} onChange={handleChange}
                                           className="block py-2.5 px-6 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-roomi peer"
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
                                        <FontAwesomeIcon icon={faEnvelope} />
                                    </span>
                                    <input type="text" id="email" value={formData.email} onChange={handleChange}
                                           className="block py-2.5 px-6 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-roomi peer"
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
                    <div className="md:w-1/3 md:ml-auto md:h-fit md:sticky md:top-10 md:rounded-lg
                        border-[1px] border-gray-300 p-4 break-words
                        w-full fixed bottom-0 bg-white z-[100]">
                        {/* 모바일 전용 아코디언 버튼 */}
                        <div className="md:hidden flex justify-between items-center p-4 bg-gray-200 cursor-pointer" onClick={() => setSlideIsOpen(!slideIsOpen)}>
                            <span className="font-bold">{t("payment_info")}</span>
                            <FontAwesomeIcon icon={slideIsOpen ? faChevronDown : faChevronUp} />
                        </div>
                        <div className={`transition-all duration-300 ease-in-out 
                        ${slideIsOpen ? "max-h-fit opacity-100" : "max-h-0 opacity-0 overflow-hidden md:max-h-none md:opacity-100"}`}>
                            <div className="flex_center text-sm m-2">
                                <div
                                    className={`flex_center mx-1 px-4 py-1.5 ${calUnit ? "bg-roomi rounded text-white" : ""}`}>
                                    <FontAwesomeIcon icon={faCalendarDay} className="mr-1.5"/>{t("day_unit")}
                                </div>
                                <div
                                    className={`flex_center mx-1 px-4 py-1.5 ${calUnit ? "" : "bg-roomi rounded text-white"}`}>
                                    <FontAwesomeIcon icon={faCalendarDay} className="mr-1.5"/>{t("week_unit")}
                                </div>
                            </div>
                            <div className="font-bold mb-2">
                                {t("payment_info")}
                            </div>
                            <div className="p-4 rounded-lg bg-gray-100">
                                {/*숙박비*/}
                                <div className="flex justify-between">
                                    <div
                                        className="font-bold">{price} * {calUnit ? (`${nightVal}일`) : (`${weekValue}주`)}</div>
                                    <div
                                        className="font-bold">{calUnit ? (price * nightVal) : (price * weekValue)}</div>
                                </div>
                                {/*보증금*/}
                                <div className="flex justify-between">
                                    <div>{t("deposit")}</div>
                                    <div className="font-bold">{depositPrice}</div>
                                </div>
                                {/*관리비*/}
                                <div className="flex justify-between">
                                    <div>{t("service_charge")}</div>
                                    <div className="font-bold">{maintenancePrice}</div>
                                </div>
                                {/*청소비*/}
                                <div className="flex justify-between">
                                    <div>{t("cleaning_fee")}</div>
                                    <div className="font-bold">{cleaningPrice}</div>
                                </div>
                                <div className="flex justify-between border-t border-white mt-3">
                                    <div>{t("총결제금액")}</div>
                                    <div className="font-bold">{totalPrice}{t("원")}</div>
                                </div>
                            </div>
                            <div>
                                계약 요청이 승인되기 전까지 요금이 결제 되지 않습니다.
                                ✔ [ ] 방 예약 내용을 확인했습니다.
                                ✔ [ ] 서비스 약관, 결제 서비스 약관, 개인정보 처리방침에 동의합니다.
                                ✔ [ ] 마케팅 이메일 수신에 동의합니다. (선택 사항)
                            </div>
                            <div className="mt-4">
                                <button className="w-full py-2 bg-roomi rounded text-white" onClick={paymentBtn}>
                                    계약 요청하기
                                </button>
                            </div>
                        </div>
                    </div>
                    {/*리모컨 영역*/}
                    {/*<div className="border-[1px] border-gray-300 p-4 break-words*/}
                    {/*    md:w-1/3 md:ml-auto md:h-fit md:sticky md:top-10 md:rounded-lg*/}
                    {/*    w-full fixed bottom-0 bg-white z-[100]">*/}
                    {/*    <div className="flex_center text-sm m-2">*/}
                    {/*        <div*/}
                    {/*            className={`flex_center mx-1 px-4 py-1.5 ${calUnit ? "bg-roomi rounded text-white" : ""}`}>*/}
                    {/*            <FontAwesomeIcon icon={faCalendarDay} className="mr-1.5"/>{t("day_unit")}*/}
                    {/*        </div>*/}
                    {/*        <div*/}
                    {/*            className={`flex_center mx-1 px-4 py-1.5 ${calUnit ? "" : "bg-roomi rounded text-white"}`}>*/}
                    {/*            <FontAwesomeIcon icon={faCalendarDay} className="mr-1.5"/>{t("week_unit")}*/}
                    {/*        </div>*/}
                    {/*    </div>*/}
                    {/*    <div className="font-bold mb-2">*/}
                    {/*        {t("payment_info")}*/}
                    {/*    </div>*/}
                    {/*    <div className="p-4 rounded-lg bg-gray-100">*/}
                    {/*        /!*숙박비*!/*/}
                    {/*        <div className="flex justify-between">*/}
                    {/*            <div className="font-bold">{price} * {calUnit ? (`${nightVal}일`) : (`${weekValue}주`)}</div>*/}
                    {/*            <div className="font-bold">{calUnit ? (price * nightVal) : (price * weekValue)}</div>*/}
                    {/*        </div>*/}
                    {/*        /!*보증금*!/*/}
                    {/*        <div className="flex justify-between">*/}
                    {/*            <div>{t("deposit")}</div>*/}
                    {/*            <div className="font-bold">{depositPrice}</div>*/}
                    {/*        </div>*/}
                    {/*        /!*관리비*!/*/}
                    {/*        <div className="flex justify-between">*/}
                    {/*            <div>{t("service_charge")}</div>*/}
                    {/*            <div className="font-bold">{maintenancePrice}</div>*/}
                    {/*        </div>*/}
                    {/*        /!*청소비*!/*/}
                    {/*        <div className="flex justify-between">*/}
                    {/*            <div>{t("cleaning_fee")}</div>*/}
                    {/*            <div className="font-bold">{cleaningPrice}</div>*/}
                    {/*        </div>*/}
                    {/*        <div className="flex justify-between border-t border-white mt-3">*/}
                    {/*            <div>{t("총결제금액")}</div>*/}
                    {/*            <div className="font-bold">{totalPrice}{t("원")}</div>*/}
                    {/*        </div>*/}
                    {/*    </div>*/}
                    {/*    <div>*/}
                    {/*        계약 요청이 승인되기 전까지 요금이 결제 되지 않습니다.*/}
                    {/*        ✔ [ ] 방 예약 내용을 확인했습니다.*/}
                    {/*        ✔ [ ] 서비스 약관, 결제 서비스 약관, 개인정보 처리방침에 동의합니다.*/}
                    {/*        ✔ [ ] 마케팅 이메일 수신에 동의합니다. (선택 사항)*/}
                    {/*    </div>*/}
                    {/*    <div className="mt-4">*/}
                    {/*        <button className="w-full py-2 bg-roomi rounded text-white" onClick={paymentBtn}>*/}
                    {/*            계약 요청하기*/}
                    {/*        </button>*/}
                    {/*    </div>*/}
                    {/*</div>*/}
                </div>
            ) : (
                <div className="text-center">
                    <div role="status">
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
                        <span className="sr-only">로딩중...</span>
                    </div>
                </div>
            )}
        </div>
    );
};
