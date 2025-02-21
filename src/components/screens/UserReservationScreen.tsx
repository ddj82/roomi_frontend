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

// interface PaymentResponse {
//     success: boolean;
//     error_msg?: string;
//     imp_uid?: string;
//     merchant_uid?: string;
//     paid_amount?: number;
//     pg_provider?: string;
//     pg_tid?: string;
//     buyer_name?: string;
//     buyer_tel?: string;
//     buyer_email?: string;
//     buyer_addr?: string;
//     buyer_postcode?: string;
// }

declare global {
    interface Window {
        IMP?: {
            init: (accountID: string) => void;
            request_pay: (params: any, callback: (response: any) => void) => void;
        };
    }
}

export default function UserReservationScreen() {
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
    } = location.state || {}; // state가 없는 경우 기본값 설정
    const [selectedPayment, setSelectedPayment] = useState<string>(""); // 선택된 결제 방법 저장
    const [paymentData, setPaymentData] = useState({});

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
    }, [roomId, locale]);

    // 라디오 버튼 변경 핸들러
    const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedPayment(e.target.value);
    };

    useEffect(() => {
        console.log('paymentData :', paymentData);
    }, [paymentData]);

    const handlePaymentBtn = () => {
        console.log('결제하자~');
        // 포트원 결제 라이브러리 로드 여부 확인
        if (!window.IMP) {
            alert("결제 모듈이 로드되지 않았습니다. 잠시 후 다시 시도해주세요.");
            return;
        }

        setPaymentData([
            price,
            depositPrice,
            maintenancePrice,
            cleaningPrice,
            totalPrice,
            totalNight,
            formData,
            selectedPayment,
        ]);

        const IMP = window.IMP;
        IMP.init('imp19424728');
        IMP.request_pay(
            {
                pg: 'eximbay',
                pay_method: selectedPayment,
                merchant_uid: `order_${new Date().getTime()}`,
                name: '숙박 예약 결제',
                amount: totalPrice,
                buyer_email: formData.email,
                buyer_name: formData.name,
                buyer_tel: formData.phone,
                buyer_addr: '서울특별시 강남구',
                buyer_postcode: '12345',
            },
            (response: any) => {
                if (response.success) {
                    alert('결제가 완료되었습니다.');
                } else {
                    alert(`결제 실패: ${response.error_msg}`);
                }
            }
        );
    };

    const getFgkey = async () => {
        const apiUrl = "https://api-test.eximbay.com/v1/payments/ready";
        const merchantKey = "test_1849705C642C217E0B2D"; // 엑심베이에서 발급받은 키
        const mid = "1849705C64"; // 엑심베이에서 발급받은 상점ID
        const encodedKey = btoa(merchantKey); // Base64 인코딩
        const params = {
            product: JSON.stringify({
                name: room?.title,
                quantity: 1,
                unit_price: totalPrice,
                link: `http://localhost:8081/detail/${roomId}/${locale}`,
            }),
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
                    name: formData.name,
                    email: formData.email,
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
            };

            const response = await axios.post(
                apiUrl,
                requestBody,
                {
                    headers: {
                        // "Authorization": `Basic ${encodedKey}`, // Base64 인코딩된 키
                        'Authorization': 'Basic dGVzdF8xODQ5NzA1QzY0MkMyMTdFMEIyRDo=',
                        "Content-Type": "application/json",
                    },
                }
            );
            const data = response.data;
            return {
                fgkey: data.fgkey,
                params: productData,
            };
        } catch (error: any) {
            throw error;
        }
    };

    const handlePayment = async () => {
        try {
            const payment = await getFgkey();
            const fgkey = payment.fgkey;
            const params = payment.params;

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
                    name: formData.name,
                    email: formData.email,
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

return (
    <div className="mt-8 relative overflow-visible">
        {room ? (
            <div className="flex md:flex-row flex-col">
                <div className="md:w-3/5">
                    <div className="mb-8 text-lg font-bold">{t("예약결제")}</div>
                    <div className="flex p-4 border-[1px] border-gray-300 rounded mb-5">
                        <div className="w-2/5">
                            {room.detail_urls && room.detail_urls.length > 0 ? (
                                <ImgCarousel images={room.detail_urls} customClass="rounded-lg h-64 md:h-[15rem]"/>
                            ) : (
                                <img src="/default-image.jpg" alt="thumbnail"
                                     className="w-full md:h-[30rem] h-64 rounded"/>
                            )}
                        </div>
                        <div className="ml-6 my-auto">
                            <div className="my-2">{room.title}</div>
                            <div className="my-2">{room.is_verified ? ('인증숙박업소 (아이콘으로변경)') : ('')}</div>
                            <div className="my-2">{room.address}</div>
                        </div>
                    </div>
                    <div className="p-4 border-b-[1px] border-gray-300 mb-5">
                        <div className="font-bold text-lg mb-3">
                            {t("예약정보")}
                        </div>
                        <div className="flex justify-between">
                            <div>{t("예약자명")}</div>
                            <div className="font-bold">{formData.name}</div>
                        </div>
                        <div className="flex justify-between">
                            <div>{t("전화번호")}</div>
                            <div className="font-bold">{formData.phone}</div>
                        </div>
                        <div className="flex justify-between">
                            <div>{t("이메일")}</div>
                            <div className="font-bold">{formData.email}</div>
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
                            <div className="font-bold">{guestCount}{t("guest_unit")}</div>
                        </div>
                    </div>
                    <div className="p-4 border-b-[1px] border-gray-300 mb-5">
                        <div className="font-bold text-lg mb-3">
                            {t("결제수단")}
                        </div>
                        <div>
                            <div className="grid w-full gap-6 md:grid-cols-3">
                                <div>
                                    <input type="radio" id="easy" name="paymentMethod" value="easy"
                                           className="hidden peer"
                                           checked={selectedPayment === "easy"}
                                           onChange={handlePaymentChange}/>
                                    <label htmlFor="easy"
                                           className="flex_center w-full p-4 text-gray-500 bg-white border border-gray-200 rounded-lg cursor-pointer peer-checked:border-roomi peer-checked:text-roomi hover:text-gray-600 hover:bg-gray-100">
                                        간편결제
                                    </label>
                                </div>
                                <div>
                                    <input type="radio" id="card" name="paymentMethod" value="card"
                                           className="hidden peer"
                                           checked={selectedPayment === "card"}
                                           onChange={handlePaymentChange}/>
                                    <label htmlFor="card"
                                           className="flex_center w-full p-4 text-gray-500 bg-white border border-gray-200 rounded-lg cursor-pointer peer-checked:border-roomi peer-checked:text-roomi hover:text-gray-600 hover:bg-gray-100">
                                        카드
                                    </label>
                                </div>
                                <div>
                                    <input type="radio" id="cash" name="paymentMethod" value="cash"
                                           className="hidden peer"
                                           checked={selectedPayment === "cash"}
                                           onChange={handlePaymentChange}/>
                                    <label htmlFor="cash"
                                           className="flex_center w-full p-4 text-gray-500 bg-white border border-gray-200 rounded-lg cursor-pointer peer-checked:border-roomi peer-checked:text-roomi hover:text-gray-600 hover:bg-gray-100">
                                        현금
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/*리모컨 영역*/}
                <div className="border-[1px] border-gray-300 p-4 break-words
                        md:w-1/3 md:ml-auto md:h-fit md:sticky md:top-10 md:rounded-lg
                        w-full fixed bottom-0 bg-white z-[100]">
                    {/*<div className="flex_center text-sm m-2">*/}
                    {/*    <div className={`flex_center mx-1 px-4 py-1.5 ${calUnit ? "bg-roomi rounded text-white" : ""}`}>*/}
                    {/*        <FontAwesomeIcon icon={faCalendarDay} className="mr-1.5"/>{t("day_unit")}*/}
                    {/*    </div>*/}
                    {/*    <div className={`flex_center mx-1 px-4 py-1.5 ${calUnit ? "" : "bg-roomi rounded text-white"}`}>*/}
                    {/*        <FontAwesomeIcon icon={faCalendarDay} className="mr-1.5"/>{t("week_unit")}*/}
                    {/*    </div>*/}
                    {/*</div>*/}
                    <div className="font-bold mb-2">
                        {t("payment_info")}
                    </div>
                    <div className="p-4 rounded-lg bg-gray-100">
                        {/*숙박비*/}
                        <div className="flex justify-between">
                            <div className="font-bold">{price} * {totalNight}{calUnit ? (`일`) : (`주`)}</div>
                            <div className="font-bold">{price * totalNight}</div>
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
                        환불정책
                    </div>
                    <div className="mt-4">
                        <button className="w-full py-2 bg-roomi rounded text-white" onClick={handlePaymentBtn}>
                            {t("결제하기")}
                        </button>
                        <button className="w-full py-2 bg-roomi rounded text-white" onClick={handlePayment}>
                            {t("결제하기")}엑심베이
                        </button>
                    </div>
                </div>
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
}
;
