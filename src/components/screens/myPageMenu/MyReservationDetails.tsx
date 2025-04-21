import React, {useEffect, useState} from 'react';
import {useTranslation} from "react-i18next";
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc';
import {MyReservationHistory, ReservationHistory} from "../../../types/rooms";
import {faAngleDown, faAngleUp} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import AccodionItem from "../../util/AccodionItem";
import {bookReservation, confirmReservation, getReservation, processPartialRefund} from "../../../api/api";
import {useNavigate} from "react-router-dom";

dayjs.extend(utc);

interface MyReservationDetailsProps {
    reserveData: ReservationHistory,
    statusInfo: {
        backgroundColor: string;
        message: string;
    };
}

export default function MyReservationDetails({reserveData, statusInfo}: MyReservationDetailsProps) {
    const {t} = useTranslation();
    const [reservedDetails, setReservedDetails] = useState<ReservationHistory | null>(null);
    const [basicOpen, setBasicOpen] = useState(true);
    const [priceOpen, setPriceOpen] = useState(false);
    const [hostOpen, setHostOpen] = useState(false);
    const [ruleOpen, setRuleOpen] = useState(false);

    const navigate = useNavigate();
    useEffect(() => {
        setReservedDetails(reserveData);
        // window.scrollTo({ top: 0, behavior: 'smooth' });
        window.scrollTo({ top: 0 });
    }, []);

    const renderStatus = (message: string) => {

        if (reserveData.is_checkout_requested && reserveData.request_fee_refund_amount > 0) {
            const guestAcceptedDeposit = reserveData.guest_accepted_fee ?? false;

            if (!guestAcceptedDeposit) {
                // 승인되지 않은 경우 승인 버튼 표시
                return (
                    <div className="mt-4">
                        <div className="flex justify-between items-center">
                            <div className="text-sm text-gray-700">
                                환불 금액: {reserveData.symbol}{reserveData.request_fee_refund_amount.toLocaleString()}
                            </div>
                        </div>
                        <div className="mt-4">
                            <button
                                onClick={() => processPartialRefund(reserveData.id.toString())}
                                className="w-full bg-roomi text-white py-3 rounded-lg hover:bg-opacity-90 transition-colors"
                            >
                                승인
                            </button>
                        </div>
                    </div>
                );
            } else {
                // 이미 승인된 경우 승인 완료 메시지 표시
                return (
                    <div className="mt-4">
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 text-green-700 mt-1"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            <div className="text-sm text-green-800 leading-relaxed">
                                <div className="font-semibold">환불 승인 완료</div>
                                <div>이용요금 환불 금액: {reserveData.symbol}{reserveData.request_fee_refund_amount.toLocaleString()}</div>
                                <div>이유: {reserveData.request_fee_refund_reason}</div>
                            </div>
                        </div>
                    </div>
                );
            }
        }

        switch (message) {
            case '승인대기':
                return (
                    <div className="space-y-3 w-full">
                        <div className="rounded-lg border border-gray-200 p-3 bg-gray-50 w-full">
                            <div className="flex items-center">
                                <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center mr-2">
                                    <span className="text-white text-xs font-bold">i</span>
                                </div>
                                <span className="text-sm text-gray-700">
          호스트의 승인을 기다리고 있습니다.
        </span>
                            </div>
                        </div>

                        <div className="flex space-x-2 w-full">
                            {renderStatusUI('bg-gray-700', '예약취소', handleCancel)}
                        </div>
                    </div>
                );

            case '결제대기':
                return (
                    <div className="flex space-x-2 w-full">
                        {renderStatusUI('bg-roomi', '결제하기', handlePayment)}
                        {renderStatusUI('bg-gray-700', '예약취소', handleCancel)}
                    </div>
                );

            case '예약완료':
                return renderStatusUI('bg-gray-500', '환불요청', handleRefundRequest);

            case '이용중':
                return (
                    <div className="flex space-x-2 w-full">
                        {renderStatusUI('bg-gray-500', '일반퇴실', handleCheckout)}
                        {renderStatusUI('bg-red-500', '중도퇴실', handleEarlyCheckout)}
                    </div>
                );

            case '환급대기':
                return (<div className="rounded-lg border border-gray-200 p-3 bg-gray-50 w-full">
                    <div className="flex items-center">
                        <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center mr-2">
                            <span className="text-white text-xs font-bold">i</span>
                        </div>
                        <span className="text-sm text-gray-700">
          보증금 환급 절차가 진행중 입니다.
        </span>
                    </div>
                </div>);

            default: // 계약종료, 예약취소 등
                return renderStatusUI('bg-roomi', '삭제', handleDelete);
        }
    };

    const renderStatusUI = (backgroundColor: string, message: string, onClick: () => void) => {
        return (
            <button onClick={onClick} type="button" className={`w-1/2 text-white p-2 rounded ${backgroundColor}`}>
                {message}
            </button>
        );
    };
    const navigateToPayment = (reservationInfo: MyReservationHistory): void =>  {
        if(reservationInfo.reservation.payment_status == "PAID"){
            // 이미 결제된 메시지 출력 + 새로고침

        }else{
            // 결제 페이지로 이동
            navigate(`/detail/${reserveData.room.id}/${localStorage.getItem('userCurrency')}/reservation/payment`, {
                state: {
                    price: Number(reservationInfo.reservation.price),
                    depositPrice: Number(reservationInfo.reservation.deposit),
                    maintenancePrice: Number(reservationInfo.reservation.maintenance_fee),
                    fee: Number(reservationInfo.reservation.fee),
                    totalPrice: Number(reservationInfo.reservation.total_price),
                    totalNight: reservationInfo.reservation.unit,
                    formData :{
                        name : reservationInfo.reservation.guest_name,
                        phone: reservationInfo.reservation.guest_phone,
                        email: reservationInfo.reservation.guest_email,
                    },
                    thisRoom : reservationInfo.room,
                    bookData: {
                        reservation: reservationInfo,
                        room: reservationInfo.room,
                    },
                    JPY: reservationInfo.reservation.yen_price,
                    USD: reservationInfo.reservation.dollar_price,
                    unit: reservationInfo.reservation.unit,
                    maintenancePerUnit: reservationInfo.reservation.maintenance_per_unit,
                    pricePerUnit: reservationInfo.reservation.price_per_unit,
                },
            });
        }

    };
    // 예약 취소, 체크인, 체크아웃, 후기 작성 ...등 버튼 클릭 핸들러
    const handlePayment = async () => {

        const response = await getReservation(reserveData.id);
        const responseJson = await response.json();
        console.log(responseJson)
        const bookData = responseJson.data as MyReservationHistory;
        console.log(responseJson.data)
         navigateToPayment(bookData);

    };
    const handleRefundRequest = () => {
        // 예약 취소 처리
        console.log('예약 취소 요청');
    };
    const handleDelete = () => {
        // 예약 취소 처리
        console.log('예약 취소 요청');
    };
    const handleCancel = () => {
        // 예약 취소 처리
        confirmReservation(reserveData.id.toString());
        console.log('예약 취소 요청');
    };
    const handleCheckout = () => {
        // 체크아웃 처리
        console.log('체크아웃 처리');
    };
    const handleEarlyCheckout = () => {
        // 체크아웃 처리
        console.log('중도 퇴실 처리');
    };

    return (
        <div>
            {/*예약 정보*/}
            <div className="flex md:flex-row flex-col gap-4 bg-gray-100 my-4 rounded-lg md:p-2">
                <div className="md:w-48 md:h-36 md:mr-4">
                    <img
                        className="object-cover rounded md:rounded w-full h-full"
                        src={reservedDetails?.room.detail_urls?.[0]}
                        alt="thumbnail"
                    />
                </div>
                <div className="flex flex-col justify-center md:gap-2 md:p-0 px-4 pb-4">
                    <span className={`text-xs text-white p-1 px-2.5 rounded w-fit mb-2 ${statusInfo.backgroundColor}`}>
                        {statusInfo.message}
                    </span>
                    <div className="font-bold text-lg">{reserveData.room.title}</div>
                    <div className="font-bold text-lg">{reserveData.room.address}</div>
                </div>
            </div>
            {/*기본 정보*/}
            <div className="border border-gray-200 rounded-lg mb-4">
                <button
                    onClick={() => setBasicOpen(prev => !prev)}
                    className="w-full p-3 px-4 focus:outline-none"
                >
                    <div className="flex justify-between">
                        <div className="font-bold">기본 정보</div>
                        <div>
                            {basicOpen ? (<FontAwesomeIcon icon={faAngleUp}/>) : (
                                <FontAwesomeIcon icon={faAngleDown}/>)}
                        </div>
                    </div>
                </button>
                <AccodionItem isOpen={basicOpen}>
                    <div className="flex flex-col gap-2 text-sm p-5 text-gray-500">
                        <div className="flex justify-between">
                            <div className="font-bold">예약번호</div>
                            <div>{reserveData.order_id}</div>
                        </div>
                        <div className="flex justify-between">
                            <div className="font-bold">체크인</div>
                            <div>{dayjs.utc(reserveData.check_in_date).format('YYYY-MM-DD')}</div>
                        </div>
                        <div className="flex justify-between">
                            <div className="font-bold">체크아웃</div>
                            <div>{dayjs.utc(reserveData.check_out_date).format('YYYY-MM-DD')}</div>
                        </div>
                        <div className="flex justify-between">
                            <div className="font-bold">게스트</div>
                            <div>{reserveData.guest_count}{t('명')}</div>
                        </div>
                        <div className="flex justify-between">
                            <div className="font-bold">예약상태</div>
                            <div>{statusInfo.message}</div>
                        </div>
                        <div className="flex justify-between">
                            <div className="font-bold">예약날짜</div>
                            <div>{dayjs.utc(reserveData.created_at).format('YYYY-MM-DD')}</div>
                        </div>
                    </div>
                </AccodionItem>
            </div>
            {/*요금 정보*/}
            <div className="border border-gray-200 rounded-lg mb-4">
                <button
                    onClick={() => setPriceOpen(prev => !prev)}
                    className="w-full p-3 px-4 focus:outline-none"
                >
                    <div className="flex justify-between">
                        <div className="font-bold">요금 정보</div>
                        <div>
                            {priceOpen ? (<FontAwesomeIcon icon={faAngleUp}/>) : (
                                <FontAwesomeIcon icon={faAngleDown}/>)}
                        </div>
                    </div>
                </button>
                <AccodionItem isOpen={priceOpen}>
                    <div className="flex flex-col gap-2 text-sm p-5 text-gray-500">
                        <div className="flex justify-between">
                            <div className="font-bold">이용요금</div>
                            <div>{reserveData.symbol}{(reserveData.price_per_unit * reserveData.unit).toLocaleString()}</div>
                        </div>
                        <div className="flex justify-between">
                            <div className="font-bold">보증금</div>
                            <div>{reserveData.symbol}{reserveData.deposit.toLocaleString()}</div>
                        </div>
                        <div className="flex justify-between">
                            <div className="font-bold">관리비</div>
                            <div>{reserveData.symbol}{(reserveData.maintenance_per_unit * reserveData.unit).toLocaleString()}</div>
                        </div>
                        <div className="flex justify-between">
                            <div className="font-bold">수수료</div>
                            <div>{reserveData.symbol}{(reserveData.fee).toLocaleString()}</div>
                        </div>
                        <div className="flex justify-between">
                            <div className="font-bold">총 결제 금액</div>
                            <div>{reserveData.symbol}{reserveData.total_price.toLocaleString()}</div>
                        </div>
                    </div>
                </AccodionItem>
            </div>
            {/*호스트 정보*/}
            <div className="border border-gray-200 rounded-lg mb-4">
                <button
                    onClick={() => setHostOpen(prev => !prev)}
                    className="w-full p-3 px-4 focus:outline-none"
                >
                    <div className="flex justify-between">
                        <div className="font-bold">호스트 정보</div>
                        <div>
                            {hostOpen ? (<FontAwesomeIcon icon={faAngleUp}/>) : (
                                <FontAwesomeIcon icon={faAngleDown}/>)}
                        </div>
                    </div>
                </button>
                <AccodionItem isOpen={hostOpen}>
                    <div className="flex flex-col gap-2 text-sm p-5 text-gray-500">
                        <div className="flex gap-6">
                            <div className="flex_center">
                                <img src={reserveData.room.host_profile_image} alt="프로필사진"
                                     className="rounded-full w-16 h-16"/>
                            </div>
                            <div className="flex_center">{reserveData.room.host_name}</div>
                        </div>
                    </div>
                </AccodionItem>
            </div>
            {/*이용 규칙 및 환불 정책*/}
            <div className="border border-gray-200 rounded-lg mb-4">
                <button
                    onClick={() => setRuleOpen(prev => !prev)}
                    className="w-full p-3 px-4 focus:outline-none"
                >
                    <div className="flex justify-between">
                        <div className="font-bold">이용 규칙 및 환불 정책</div>
                        <div>
                            {ruleOpen ? (<FontAwesomeIcon icon={faAngleUp}/>) : (
                                <FontAwesomeIcon icon={faAngleDown}/>)}
                        </div>
                    </div>
                </button>
                <AccodionItem isOpen={ruleOpen}>
                    <div className="flex flex-col gap-2 text-sm p-5 text-gray-500">
                        <div className="flex flex-col">
                            <div className="font-bold mb-1">체크인/체크아웃</div>
                            <div className="text-xs">체크인: {reserveData.room.check_in_time},
                                체크아웃: {reserveData.room.check_out_time}</div>
                        </div>
                        <div className="flex flex-col">
                            <div className="font-bold mb-1">환불 정책</div>
                            <div className="text-xs whitespace-pre-line">
                                {reserveData.room.refund_policy?.replace(/\\n/g, '\n')}
                            </div>
                        </div>
                    </div>
                </AccodionItem>
            </div>
            {/*버튼*/}
            <div className="flex_center mt-8">
                {renderStatus(statusInfo.message)}
            </div>

        </div>
    );
};
