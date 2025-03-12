import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate, useParams} from "react-router-dom";
import {fetchRoomData} from "../../api/api";
import {RoomData} from "../../types/rooms";
import {useTranslation} from "react-i18next";
import {useDateStore} from "../stores/DateStore";
import ImgCarousel from "../modals/ImgCarousel";
import {useGuestsStore} from "../stores/GuestsStore";
import axios from "axios";
import type {Eximbay} from "../../types/eximbay";
import {useReserSlideConStore} from "../stores/ReserSlideConStore";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    faChevronDown,
    faChevronUp,
    faUser,
    faPhone,
    faEnvelope,
    faCalendarDay,
    faCheckCircle, faMapMarkerAlt, faXmark
} from "@fortawesome/free-solid-svg-icons";
import {LuCircleMinus, LuCirclePlus} from "react-icons/lu";
import { CheckoutPage } from "src/components/toss/Checkout.jsx";
import Modal from "react-modal";

interface FormDataType {
    name: string;
    phone: string;
    email: string;
}

export default function GuestReservationScreen() {
    const {roomId, locale} = useParams();
    const [room, setRoom] = useState<RoomData | null>(null);
    const {t} = useTranslation();
    const {startDate, endDate, calUnit,} = useDateStore();
    const {guestCount, setGuestCount} = useGuestsStore();
    const navigate = useNavigate();
    const location = useLocation();

    const {
        price = 0,
        depositPrice = 0,
        maintenancePrice = 0,
        cleaningPrice = 0,
        totalPrice = 0,
        totalNight = 0,
        formData = {
            name: "",
            phone: "",
            email: "",
        },
    } = location.state || {};

    const [formDataState, setFormDataState] = useState<FormDataType>(formData);

    const [selectedPayment, setSelectedPayment] = useState<string>("KR");
    const [paymentData, setPaymentData] = useState({});
    const {slideIsOpen, setSlideIsOpen} = useReserSlideConStore();
    const [isChecked1, setIsChecked1] = useState(false);
    const [isChecked2, setIsChecked2] = useState(false);
    const [isChecked3, setIsChecked3] = useState(false);

    const [showToss, setShowToss] = useState(false);

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
    }, [roomId, locale]);

    const handleguestValue = (increase: boolean) => {
        if (increase) {
            setGuestCount(prev => prev + 1);
        } else if (guestCount > 1) {
            setGuestCount(prev => prev - 1);
        }
    };

    // Update form data state when user makes changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormDataState({
            ...formDataState,
            [e.target.id]: e.target.value
        });
    };

    // Payment method selection handler
    const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedPayment(e.target.value);
    };

    const paymentBtn = () => {
        if (!isChecked1 || !isChecked2) {
            alert('필수 약관에 동의해주세요.');
            return;
        }
        handlePayment();
    };

    useEffect(() => {
        console.log('paymentData :', paymentData);
    }, [paymentData]);

    const handlePayment = () => {
        setShowToss(true);
    };
/*
    const handlePayment = async () => {
        try {
            const payment = await getFgkey();
            const fgkey = payment.fgkey;
            const params = payment.params;
            const issuer_country = payment.issuer_country;

            const requestData: Eximbay.PaymentRequest = {
                payment: {
                    transaction_type: "PAYMENT",
                    order_id: "테스트 주문번호",
                    currency: "KRW",
                    amount: totalPrice,
                    lang: "KR",
                },
                merchant: {
                    mid: "1849705C64",
                },
                buyer: {
                    name: formDataState.name, // 수정: formData -> formDataState
                    email: formDataState.email, // 수정: formData -> formDataState
                },
                url: {
                    return_url: "http://localhost:8081/",
                    status_url: "example://status"
                },
                product: [{
                    name: params.name,
                    quantity: params.quantity,
                    unit_price: params.unit_price,
                    link: params.link,
                }],
                settings: {
                    issuer_country: issuer_country,
                },
            };

            if (window.EXIMBAY) {
                window.EXIMBAY.request_pay(
                    {fgkey, ...requestData},
                    (response: Eximbay.PaymentResponse) => {
                        if (response.status === "SUCCESS") {
                            alert("결제 성공!");
                        } else {
                            alert(`결제 실패: ${response.message}`);
                        }
                    }
                );
            } else {
                console.error("Eximbay 스크립트가 로드되지 않았습니다.");
            }
        } catch (error) {
            console.error("결제 요청 중 오류 발생:", error);
            alert("결제 요청에 실패했습니다.");
        }
    };

    const getFgkey = async () => {
        const apiUrl = "https://api-test.eximbay.com/v1/payments/ready";
        const mid = "1849705C64"; // 엑심베이에서 발급받은 상점ID
        const params = {
            product: JSON.stringify({
                name: room?.title,
                quantity: 1,
                unit_price: totalPrice,
                link: `http://localhost:8081/detail/${roomId}/${locale}`,
            }),
            issuer_country: selectedPayment,
        };

        try {
            const productData = JSON.parse(params.product);
            const requestBody: Eximbay.PaymentRequest = {
                payment: {
                    transaction_type: "PAYMENT",
                    order_id: "테스트 주문번호",
                    currency: "KRW",
                    amount: totalPrice,
                    lang: "KR",
                },
                merchant: {
                    mid: mid,
                },
                buyer: {
                    name: formDataState.name, // 수정: formData -> formDataState
                    email: formDataState.email, // 수정: formData -> formDataState
                },
                url: {
                    return_url: "http://localhost:8081/",
                    status_url: "example://status"
                },
                product: [{
                    name: productData.name,
                    quantity: productData.quantity,
                    unit_price: productData.unit_price,
                    link: productData.link,
                }],
                settings: {
                    issuer_country: params.issuer_country,
                },
            };

            const response = await axios.post(
                apiUrl,
                requestBody,
                {
                    headers: {
                        'Authorization': 'Basic dGVzdF8xODQ5NzA1QzY0MkMyMTdFMEIyRDo=',
                        "Content-Type": "application/json",
                    },
                }
            );
            const data = response.data;
            return {
                fgkey: data.fgkey,
                params: productData,
                issuer_country: params.issuer_country,
            };
        } catch (error: any) {
            throw error;
        }
    };

* */
    interface PaymentOptionProps {
        id: string;
        label: string;
        selected: boolean;
        onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    }

    function PaymentOption({id, label, selected, onChange}: PaymentOptionProps) {
        return (
            <div>
                <input
                    type="radio"
                    id={id}
                    name="paymentMethod"
                    value={id === "easy" ? "KR" : ""}
                    className="hidden"
                    checked={selected}
                    onChange={onChange}
                />
                <label
                    htmlFor={id}
                    className={`cursor-pointer flex justify-center items-center rounded-lg py-3 border transition-colors ${
                        selected ? "border-[#9370DB] text-[#9370DB]" : "border-gray-300 text-gray-500 hover:bg-gray-100"
                    }`}
                >
                    {label}
                </label>
            </div>
        );
    }

    return (
        <div className="my-8 relative overflow-visible max-w-[1200px] mx-auto">
            {room ? (
                <div className="flex flex-col md:flex-row gap-8">
                    <div className="md:w-3/5 w-full">
                        <div className="mb-8 text-xl font-bold text-gray-800">{t("결제하기")}</div>
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
                                <div className="my-3 flex items-center text-[#9370DB]">
                                    {room.is_verified ? (
                                        <><span
                                            className="inline-flex items-center text-sm font-medium px-2.5 py-0.5 text-roomi mr-2">
                                        <FontAwesomeIcon icon={faCheckCircle} className="mr-1"/>
                                            {t("인증 숙박업소")}
                                    </span></>
                                    ) : ('')}
                                </div>
                                <div className="my-3 flex items-center text-gray-600">
                                    <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2"/>
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
                                    className="w-10 h-10 rounded-full bg-[#F5EEFF] flex items-center justify-center text-[#9370DB]">
                                    <FontAwesomeIcon icon={faUser}/>
                                </div>
                                <div className="ml-3 font-medium text-gray-700">{room.host_id}</div>
                            </div>
                        </div>
                        <div className="p-6 border border-gray-200 rounded-xl shadow-sm mb-6 bg-white">
                            <div className="font-bold text-gray-800 mb-4">
                                {t("예약정보")}
                            </div>
                            {/* 예약자 정보 추가 - 고정값으로 표시 */}
                            <div className="p-4 rounded-lg bg-roomi-light mb-4">
                                <div className="text-sm text-gray-500">{t("예약자 정보")}</div>
                                <div className="font-bold text-gray-800 mt-1">
                                    <div className="grid grid-cols-1 gap-2">
                                        <div className="flex items-center">
                                            <FontAwesomeIcon icon={faUser} className="mr-2 text-[#9370DB]"/>
                                            <span>{formData.name || "이름을 입력해주세요"}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <FontAwesomeIcon icon={faPhone} className="mr-2 text-[#9370DB]"/>
                                            <span>{formData.phone || "전화번호를 입력해주세요"}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <FontAwesomeIcon icon={faEnvelope} className="mr-2 text-[#9370DB]"/>
                                            <span>{formData.email || "이메일을 입력해주세요"}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-lg bg-roomi-light">
                                    <div className="text-sm text-gray-500">{t("체크인날짜")}</div>
                                    <div className="font-bold text-gray-800 mt-1 flex items-center">
                                        <FontAwesomeIcon icon={faCalendarDay} className="mr-2 text-[#9370DB]"/>
                                        {startDate}
                                    </div>
                                </div>
                                <div className="p-4 rounded-lg bg-roomi-light">
                                    <div className="text-sm text-gray-500">{t("체크아웃날짜")}</div>
                                    <div className="font-bold text-gray-800 mt-1 flex items-center">
                                        <FontAwesomeIcon icon={faCalendarDay} className="mr-2 text-[#9370DB]"/>
                                        {endDate}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 p-4 rounded-lg bg-roomi-light">
                                <div className="text-sm text-gray-500">{t("사용인원")}</div>
                                <div className="flex items-center mt-1">
                                    <button className="text-lg text-[#9370DB] hover:text-[#7D5EC0] transition-colors"
                                            onClick={() => handleguestValue(false)}>
                                        <LuCircleMinus/>
                                    </button>
                                    <div className="font-bold text-gray-800 mx-4">{guestCount}{t("guest_unit")}</div>
                                    <button className="text-lg text-[#9370DB] hover:text-[#7D5EC0] transition-colors"
                                            onClick={() => handleguestValue(true)}>
                                        <LuCirclePlus/>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border border-gray-200 rounded-xl shadow-sm mb-6 bg-white">
                            <div className="font-bold text-gray-800 mb-6">
                                {t("결제자 정보")}
                            </div>
                            <div className="my-5">
                                <div className="relative z-0">
                                <span className="absolute start-0 bottom-2 text-[#9370DB]">
                                    <FontAwesomeIcon icon={faUser}/>
                                </span>
                                    <input type="text" id="name" value={formDataState.name} onChange={handleChange}
                                           className="block py-3 px-6 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-200 appearance-none focus:outline-none focus:ring-0 focus:border-[#9370DB] peer"
                                           placeholder=""/>
                                    <label htmlFor="name"
                                           className="absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-placeholder-shown:start-6 peer-focus:start-0 peer-focus:text-[#9370DB] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto">
                                        {t("이름")}
                                    </label>
                                </div>
                            </div>
                            <div className="my-5">
                                <div className="relative z-0">
                                <span className="absolute start-0 bottom-2 text-[#9370DB]">
                                    <FontAwesomeIcon icon={faPhone}/>
                                </span>
                                    <input type="text" id="phone" value={formDataState.phone} onChange={handleChange}
                                           className="block py-3 px-6 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-200 appearance-none focus:outline-none focus:ring-0 focus:border-[#9370DB] peer"
                                           pattern="[0-9]{3}-[0-9]{4}-[0-9]{4}" placeholder=""/>
                                    <label htmlFor="phone"
                                           className="absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-placeholder-shown:start-6 peer-focus:start-0 peer-focus:text-[#9370DB] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto">
                                        {t("전화번호")}
                                    </label>
                                </div>
                            </div>
                            <div className="my-5">
                                <div className="relative z-0">
                                <span className="absolute start-0 bottom-2 text-[#9370DB]">
                                    <FontAwesomeIcon icon={faEnvelope}/>
                                </span>
                                    <input type="text" id="email" value={formDataState.email} onChange={handleChange}
                                           className="block py-3 px-6 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-200 appearance-none focus:outline-none focus:ring-0 focus:border-[#9370DB] peer"
                                           placeholder=""/>
                                    <label htmlFor="email"
                                           className="absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-placeholder-shown:start-6 peer-focus:start-0 peer-focus:text-[#9370DB] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto">
                                        {t("이메일")}
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border border-gray-200 rounded-xl shadow-sm bg-white mb-6">
                            <div className="font-bold text-gray-800 mb-4">{t("결제 수단")}</div>
                            <div className="grid gap-4 grid-cols-2">
                                <PaymentOption id="easy" label="국내 결제" selected={selectedPayment === "KR"}
                                               onChange={handlePaymentChange}/>
                                <PaymentOption id="card" label="해외 결제" selected={selectedPayment === ""}
                                               onChange={handlePaymentChange}/>
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
                        <div className={`transition-all duration-300 ease-in-out 
                            ${slideIsOpen ? "max-h-fit opacity-100" : "max-h-0 opacity-0 overflow-hidden md:max-h-none md:opacity-100"}`}>
                            <div className="flex justify-center text-sm bg-roomi-light rounded-lg p-1 pointer-events-none">
                                <div
                                    className={`flex items-center justify-center mx-1 px-4 py-2 rounded-lg cursor-pointer transition-all 
                                    ${calUnit ? "bg-[#9370DB] text-white" : "text-gray-700 hover:bg-gray-100"}`}>
                                    <FontAwesomeIcon icon={faCalendarDay} className="mr-1.5"/>{t("day_unit")}
                                </div>
                                <div
                                    className={`flex items-center justify-center mx-1 px-4 py-2 rounded-lg cursor-pointer transition-all 
                                    ${calUnit ? "text-gray-700 hover:bg-gray-100" : "bg-[#9370DB] text-white"}`}>
                                    <FontAwesomeIcon icon={faCalendarDay} className="mr-1.5"/>{t("week_unit")}
                                </div>
                            </div>
                            <div className="font-bold text-gray-800 mb-4 mt-6">
                                {t("payment_info")}
                            </div>
                            <div className="p-5 rounded-lg bg-roomi-light">
                                {/*숙박비*/}
                                <div className="flex justify-between py-2">
                                    <div className="font-medium text-gray-700">
                                        {calUnit
                                            ? `${Math.round(price).toLocaleString()}원 × ${totalNight}일`
                                            : `${Math.round(price).toLocaleString()}원 × ${totalNight}주`
                                        }
                                    </div>
                                    <div className="font-bold text-gray-800">
                                        {(price * totalNight).toLocaleString()}원
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
                                        className="font-bold text-[#9370DB] text-xl">{totalPrice.toLocaleString()}{t("원")}</div>
                                </div>
                            </div>
                            <div className="mt-6 text-sm space-y-6 max-w-lg mx-auto">
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
                                                className="w-5 h-5 border-2 border-[#9370DB] rounded transition-all peer-checked:bg-[#9370DB] flex items-center justify-center">
                                                {isChecked1 && (
                                                    <svg className="w-3.5 h-3.5 text-white" fill="none"
                                                         stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round"
                                                              strokeWidth="3" d="M5 13l4 4L19 7"></path>
                                                    </svg>
                                                )}
                                            </div>
                                        </div>
                                        <span
                                            className="text-gray-600 group-hover:text-gray-800 transition-colors">{t('방 예약 내용을 확인했습니다. (필수)')}</span>
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
                                                className="w-5 h-5 border-2 border-[#9370DB] rounded transition-all peer-checked:bg-[#9370DB] flex items-center justify-center">
                                                {isChecked3 && (
                                                    <svg className="w-3.5 h-3.5 text-white" fill="none"
                                                         stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round"
                                                              strokeWidth="3" d="M5 13l4 4L19 7"></path>
                                                    </svg>
                                                )}
                                            </div>
                                        </div>
                                        <span
                                            className="text-gray-600 group-hover:text-gray-800 transition-colors">{t('마케팅 이메일 수신에 동의합니다. (선택)')}</span>
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
                                                className="w-5 h-5 border-2 border-[#9370DB] rounded transition-all peer-checked:bg-[#9370DB] flex items-center justify-center">
                                                {isChecked2 && (
                                                    <svg className="w-3.5 h-3.5 text-white" fill="none"
                                                         stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round"
                                                              strokeWidth="3" d="M5 13l4 4L19 7"></path>
                                                    </svg>
                                                )}
                                            </div>
                                        </div>
                                        <span
                                            className="text-gray-600 group-hover:text-gray-800 transition-colors">{t('서비스 약관, 결제 서비스 약관, 개인정보 처리방침에 동의합니다. (필수)')}</span>
                                    </label>
                                </div>

                                <button
                                    className="w-full py-3 px-4 bg-[#9370DB] hover:bg-[#8A5FD7] text-white font-medium rounded-lg transition-colors"
                                    onClick={paymentBtn}>
                                    {t("결제하기")}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center p-12">
                    <div role="status" className="inline-flex flex-col items-center">
                        <svg aria-hidden="true"
                             className="w-12 h-12 text-gray-200 animate-spin fill-[#9370DB]"
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
            <Modal
                isOpen={showToss}
                onRequestClose={() => setShowToss(false)}
                contentLabel="토스 결제 모달"
                bodyOpenClassName="toss-modal"
                style={{
                    content: {
                        width: "550px",
                        maxWidth: "90%",
                        margin: "auto",
                        inset: "50% 0px -200px 50%",
                        transform: "translate(-50%, -50%)",
                        borderRadius: "8px",
                        overflowY: "auto",
                    },
                    overlay: {
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        zIndex: 9999,
                    },
                }}
            >
                <div className="flex justify-end">
                    <button
                        onClick={() => setShowToss(false)}
                        className="px-4 py-1">
                        <FontAwesomeIcon icon={faXmark} />
                    </button>
                </div>
                <CheckoutPage/>
            </Modal>
        </div>
    );
}