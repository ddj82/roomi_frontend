import React, {useEffect, useState} from 'react';
import {useTranslation} from "react-i18next";
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc';
import {MyReservationHistory, RefundPolicyRule, ReservationHistory} from "../../../types/rooms";
import {faAngleDown, faAngleUp} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import AccodionItem from "../../util/AccodionItem";
import {
    bookReservation,
    confirmReservation,
    earlyCheckOut,
    getReservation,
    processPartialRefund
} from "../../../api/api";
import {useNavigate} from "react-router-dom";
import Calendar from "react-calendar";

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

        if (reserveData.request_fee_refund_amount > 0) {
            const guestAccepted = reserveData.guest_accepted_fee ?? false;

            if (guestAccepted) {
                // ✅ 환불 승인 완료
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
                                <div>
                                    이용요금 환불 금액: {reserveData.symbol}
                                    {reserveData.request_fee_refund_amount.toLocaleString()}
                                </div>
                                <div>이유: {reserveData.request_fee_refund_reason}</div>
                            </div>
                        </div>
                    </div>
                );
            } else {
                // 🕓 승인 대기 중 (환불 금액은 이미 있음)
                return (
                    <div className="mt-4">
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 text-yellow-700 mt-1 flex-shrink-0"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M18 10A8 8 0 11.001 10.001 8 8 0 0118 10zm-4.707-1.707a1 1 0 10-1.414-1.414L9 9.586 7.707 8.293a1 1 0 10-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            <div className="text-sm text-yellow-800 leading-relaxed space-y-1 w-full">
                                <div className="font-semibold text-base">환불 승인 대기 중</div>
                                <div>호스트의 승인을 기다리고 있습니다.</div>
                                <div className="text-xs text-yellow-700">요청
                                    퇴실일: {dayjs(reserveData.checkout_requested_at).format('YYYY-MM-DD')}</div>
                                <div className="text-xs text-yellow-700">환불 예정
                                    금액: {reserveData.symbol}{reserveData.request_fee_refund_amount.toLocaleString()}</div>
                            </div>
                        </div>

                        {/* 버튼은 박스 밖에 마진 주면서 표시 */}
                        <div className="mt-4">
                            <button
                                onClick={async () => {
                                    const confirmResult = window.confirm('정말 환불을 승인하시겠습니까? 승인 후에는 되돌릴 수 없습니다.');

                                    if (confirmResult) {
                                        try {
                                            await processPartialRefund(reserveData.id.toString());
                                            window.location.reload();
                                        } catch (e) {
                                            console.error(e);
                                            alert('환불 승인 중 오류가 발생했습니다.');
                                        }
                                    } else {
                                        console.log('🙅‍♂️ 환불 승인 취소됨');
                                    }
                                }}
                                className="w-full bg-roomi text-white py-3 rounded-lg hover:bg-opacity-90 transition-colors"
                            >
                                승인
                            </button>
                        </div>
                    </div>
                );
            }
        } else if (reserveData.checkout_requested_at != null) {
            // 📝 중도 퇴실 요청만 있고, 아직 환불 금액 계산 전
            return (
                <div className="mt-4">
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-yellow-700 mt-1"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fillRule="evenodd"
                                d="M18 10A8 8 0 11.001 10.001 8 8 0 0118 10zm-4.707-1.707a1 1 0 10-1.414-1.414L9 9.586 7.707 8.293a1 1 0 10-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                            />
                        </svg>
                        <div className="text-sm text-yellow-800 leading-relaxed">
                            <div className="font-semibold">중도퇴실 요청됨</div>
                            <div>호스트가 퇴실 요청을 검토 중입니다.</div>
                            <div className="mt-1 text-xs text-yellow-700">
                            요청 퇴실일: {dayjs(reserveData.checkout_requested_at).format('YYYY-MM-DD')}
                            </div>
                        </div>
                    </div>
                </div>
            );
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

                        <div className="flex justify-center w-full">
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
        console.log('🔥 handleRefundRequest 호출됨');

        const reservation = reserveData; // 혹은 받아오는 방식에 따라 수정
        const now = dayjs(); // 현재 시간 (로컬)

        // 1. 결제 상태 확인
        if (reservation.payment_status === 'UNPAID') {
            console.log('✅ 결제 전 → 무조건 취소 가능');
            return true;
        }

        if (reservation.status !== 'CONFIRMED' || reservation.payment_status !== 'PAID') {
            console.log('❌ 상태가 CONFIRMED 아니거나 결제 안됨 → 취소 불가');
            return false;
        }

        // 2. 환불 정책 확인
        const refundRules = reservation.room?.refund_policy_rules;
        console.log(`✅ ${refundRules}`);
        if (!refundRules || Object.keys(refundRules).length === 0) {
            console.log('❌ 환불 규칙 없음');
            return false;
        }

        // 3. 체크인 시간 계산
        const checkInDate = dayjs(reservation.check_in_date);
        if (!checkInDate.isValid()) {
            console.log('❌ 체크인 날짜 없음');
            return false;
        }

        const checkInTimeStr = reservation.room?.check_in_time ?? '14:00';
        let checkInHour = 14;
        let checkInMinute = 0;

        try {
            const [h, m] = checkInTimeStr.split(':');
            checkInHour = parseInt(h);
            checkInMinute = parseInt(m);
        } catch (e) {
            console.warn('⚠️ 체크인 시간 파싱 오류, 기본값 사용');
        }

        const exactCheckInTime = checkInDate.set('hour', checkInHour).set('minute', checkInMinute).set('second', 0);
        const hoursToCheckIn = exactCheckInTime.diff(now, 'hour');
        console.log(`⏱️ 체크인까지 남은 시간(시간): ${hoursToCheckIn}`);

        // 4. 시간 조건별 룰 매핑
        const rules = [
            ['before_7d', (h: number) => h >= 168],
            ['within_7d', (h: number) => h < 168 && h >= 72],
            ['before_3d', (h: number) => h >= 72],
            ['within_3d', (h: number) => h < 72 && h >= 24],
            ['before_24h', (h: number) => h >= 24],
            ['within_24h', (h: number) => h < 24 && h > 0],
            ['after_checkin', (h: number) => h <= 0],
        ];

        // 규칙 이름 표시용 매핑
        const ruleDisplayNames = {
            'before_7d': '체크인 7일 이전',
            'within_7d': '체크인 7일 이내',
            'before_3d': '체크인 3일 이전',
            'within_3d': '체크인 3일 이내',
            'before_24h': '체크인 24시간 이전',
            'within_24h': '체크인 24시간 이내',
            'after_checkin': '체크인 이후'
        };

        let applicableRule = null;
        for (const [key, condition] of rules) {
            const ruleKey = key as keyof RefundPolicyRule;
            if (refundRules[ruleKey] && typeof condition === 'function' && condition(hoursToCheckIn)) {
                applicableRule = ruleKey;
                break;
            }
        }

        if (!applicableRule) {
            console.log('❌ 적용 가능한 규칙 없음');
            return false;
        }

        const refundPercentStr = refundRules[applicableRule];
        if (!refundPercentStr) {
            console.log('❌ 환불 퍼센트 없음');
            return false;
        }

        let refundPercent = 0;
        let refundAmount = 0;
        const currencySymbol = reservation.symbol ?? '';

        try {
            refundPercent = parseInt(refundPercentStr.toString().replace('%', '').trim());
            console.log(`💲 환불 퍼센트: ${refundPercent}%`);

            refundAmount = Math.floor((reservation.price ?? 0) * (refundPercent / 100));
            console.log(`💰 예상 환불 금액: ${currencySymbol}${refundAmount.toLocaleString()}`);
        } catch (e) {
            console.warn('⚠️ 환불 퍼센트 파싱 실패');
            return false;
        }

        const canCancel = refundPercent > 0;
        console.log(`🔄 취소 가능 여부: ${canCancel}`);

        if (canCancel) {
            // 적용된 규칙 이름 가져오기
            const ruleDisplayName = ruleDisplayNames[applicableRule as keyof typeof ruleDisplayNames] || applicableRule;

            // 확인 다이얼로그 표시 (적용된 규칙 포함)
            const confirmMessage = `적용 규칙: ${ruleDisplayName} (${refundPercent}%)\n환불 금액: ${currencySymbol}${refundAmount.toLocaleString()}\n\n취소를 진행하시겠습니까?`;
            const userConfirmed = window.confirm(confirmMessage);

            if (userConfirmed) {
                // 여기에 실제 예약 취소 API 호출
                console.log('🚨 예약 취소 확인 → 취소 API 호출');

                // API 호출 코드 (예시)
                // cancelReservation(reservation.id)
                //   .then(() => {
                //     alert('예약이 성공적으로 취소되었습니다.');
                //   })
                //   .catch(error => {
                //     alert('예약 취소 중 오류가 발생했습니다: ' + error.message);
                //   });

                return true;
            } else {
                console.log('🛑 사용자가 취소를 취소함');
                return false;
            }
        } else {
            window.alert('현재 시점에서는 예약을 취소할 수 없습니다.');
            return false;
        }
    };

    const handleDelete = () => {
        // 예약 취소 처리
        console.log('예약 취소 요청');
    };
    const handleCancel = () => {
        // 예약 취소 처리
        if (window.confirm('정말 예약을 취소하시겠습니까?')) {
            // 사용자가 '예'를 선택한 경우
            confirmReservation(reserveData.id.toString())
                .then(() => {
                    console.log('예약 취소 요청 성공');
                    // 페이지 새로고침
                    window.location.reload();
                })
                .catch(error => {
                    console.error('예약 취소 중 오류 발생:', error);
                    // 에러 처리 (예: 에러 메시지 표시)
                });
        }
    };
    const handleCheckout = () => {
        // 체크아웃 처리
        console.log('체크아웃 처리');
    };
    // MyReservationDetails 컴포넌트 내부, 상단에 상태 추가
    // 중도 퇴실 모달을 위한 상태 추가
    const [showDateModal, setShowDateModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date>();
// handleEarlyCheckout 함수 구현 (간단하게)
    const handleEarlyCheckout = () => {
        setShowDateModal(true);
    };
    const handleDayClick = (date: Date) => {
        const dateString = dayjs(date).format('YYYY-MM-DD');
        const today = dayjs().format('YYYY-MM-DD');
        const checkoutDate = dayjs(reserveData.check_out_date).format('YYYY-MM-DD');

        if (dateString >= today && dateString <= checkoutDate) {
            setSelectedDate(date);
            console.log('Selected date:', dateString); // 디버깅용
        }
    };
    const getTileClassName = ({ date }: { date: Date }) => {
        const dateString = dayjs(date).format('YYYY-MM-DD');
        const today = dayjs().format('YYYY-MM-DD');
        const checkoutDate = dayjs(reserveData.check_out_date).format('YYYY-MM-DD');

        // 여기가 중요! 선택된 날짜 비교를 정확하게
        if (selectedDate) {
            const selectedDateString = dayjs(selectedDate).format('YYYY-MM-DD');
            if (dateString === selectedDateString) {
                return 'selected-date';
            }
        }

        if (dateString === today) {
            return 'today-date';
        }

        if (dateString === checkoutDate) {
            return 'original-checkout-date';
        }

        if (dateString >= today && dateString <= checkoutDate) {
            return 'selectable-date';
        }

        return 'disabled-date';
    };
// 중도 퇴실 날짜 선택 모달 컴포넌트 (컴포넌트 내부에 정의)
    const EarlyCheckoutModal = () => {
        if (!showDateModal) return null;
        const today = dayjs().format('YYYY-MM-DD'); // 오늘 날짜 문자열
        const checkInDate = dayjs(reserveData.check_in_date).format('YYYY-MM-DD');
        const checkOutDate = dayjs(reserveData.check_out_date).format('YYYY-MM-DD');

        const minSelectableDate = today < checkInDate ? checkInDate : today;
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-96">
                    <h3 className="text-lg font-bold mb-4">중도 퇴실</h3>
                    <p className="text-sm text-gray-600 mb-4">퇴실하실 날짜를 선택해주세요.</p>

                    <div className="dateModal mb-4">
                        <Calendar
                            onClickDay={handleDayClick}
                            tileClassName={getTileClassName}
                            minDate={dayjs(minSelectableDate).toDate()} // ← 여기서 오늘 or 체크인 중 더 큰 날짜
                            maxDate={dayjs(reserveData.check_out_date).toDate()}
                            defaultActiveStartDate={dayjs(reserveData.check_in_date).toDate()}  // 체크인 날짜의 월로 시작
                            next2Label={null}
                            prev2Label={null}
                            className="custom-calendar"
                            formatDay={(locale, date) => dayjs(date).format('D')}
                            //locale={userLocale}
                        />
                    </div>

                    {selectedDate && (
                        <p className="text-center mb-4 text-sm">
                            선택한 날짜: {dayjs(selectedDate).format('YYYY-MM-DD')}
                        </p>
                    )}

                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                setShowDateModal(false);
                                setSelectedDate(new Date());
                            }}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                        >
                            취소
                        </button>
                        <button
                            onClick={async () => {
                                if (!selectedDate) {
                                    alert('날짜를 선택해주세요.');
                                    return;
                                }

                                const formattedDate = dayjs(selectedDate).format('YYYY-MM-DD');

                                if (window.confirm(`${formattedDate}에 중도 퇴실하시겠습니까?`)) {
                                    try {
                                        // API 호출 예시
                                        await earlyCheckOut(reserveData.id.toString(), selectedDate);

                                        console.log('중도 퇴실 처리:', {
                                            reservationId: reserveData.id,
                                            newCheckoutDate: formattedDate
                                        });

                                        setShowDateModal(false);
                                        window.location.reload();
                                    } catch (error) {
                                        console.error('Error:', error);
                                        alert('오류가 발생했습니다.');
                                    }
                                }
                            }}
                            className="flex-1 px-4 py-2 bg-roomi text-white rounded hover:bg-roomi-0"
                        >
                            확인
                        </button>
                    </div>
                </div>
            </div>
        );
    };

// HTML 날짜 입력을 사용한 버전
//     const handleEarlyCheckoutWithDateInput = () => {
//         const today = new Date().toISOString().split('T')[0];
//         const checkoutDate = reserveData.check_out_date;
//
//         // 창 팝업
//         const dateInput = window.prompt(`중도 퇴실 날짜를 입력해주세요.\n오늘(${today})부터 체크아웃일(${checkoutDate})까지만 선택 가능합니다.`);
//
//         if (dateInput && dateInput >= today && dateInput <= checkoutDate.toISOString().split('T')[0]) {
//             if (confirm(`${dateInput}에 중도 퇴실하시겠습니까?`)) {
//                 // API 호출
//                 console.log('중도 퇴실 처리:', {
//                     reservationId: reserveData.id,
//                     newCheckoutDate: dateInput
//                 });
//                 // window.location.reload();
//             }
//         } else if (dateInput) {
//             alert('올바른 날짜를 선택해주세요.');
//         }
//     };

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
            <EarlyCheckoutModal />
        </div>
    );
};
