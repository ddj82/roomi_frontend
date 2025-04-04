import React, {useEffect, useState} from 'react';
import {useTranslation} from "react-i18next";
import {getReservationHistory} from "../../../api/api";
import {ReservationHistory} from "../../../types/rooms";
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc';
import MyReservationDetails from "./MyReservationDetails";
import {useMediaQuery} from "react-responsive";

dayjs.extend(utc);

export default function MyReservations() {
    const {t} = useTranslation();
    const [nowReserved, setNowReserved] = useState<ReservationHistory[] | null>(null);
    const [beforeReserved, setBeforeReserved] = useState<ReservationHistory[] | null>(null);
    const [reservedListSet, setReservedListSet] = useState(true);
    const [reservedDetails, setReservedDetails] = useState<ReservationHistory | null>(null);
    const isMobile = useMediaQuery({ maxWidth: 768 }); // 768px 이하를 모바일로 간주

    useEffect(() => {
        const reservationHistory = async () => {
            try {
                const response = await getReservationHistory();
                const responseJson = await response.json();
                console.log('예약내역 데이터:', responseJson.data);

                const today = dayjs().format('YYYY-MM-DD');

                // 🔥 예약을 nowReserved와 beforeReserved로 분류
                const nowReservedData = responseJson.data.filter(
                    (reservation: ReservationHistory) =>
                        dayjs.utc(reservation.check_in_date).format('YYYY-MM-DD') >= today ||
                        dayjs.utc(reservation.check_out_date).format('YYYY-MM-DD') >= today
                );

                const beforeReservedData = responseJson.data.filter(
                    (reservation: ReservationHistory) =>
                        dayjs.utc(reservation.check_out_date).format('YYYY-MM-DD') < today
                );

                setNowReserved(nowReservedData);
                setBeforeReserved(beforeReservedData);
            } catch (e) {
                console.error('예약내역 가져오기 실패', e);
            }
        };
        reservationHistory();
    }, []);

    const renderReservationUI = (reservations: ReservationHistory[], emptyMessage: string) => {
        if (!reservations || reservations.length === 0) {
            return <div className="flex_center">{emptyMessage}</div>;
        }
        return renderReservationList(reservations);
    };

    const renderStatus = (status: string, paymentStatus: string, checkIn: string, checkOut: string) => {
        const today = dayjs().format('YYYY-MM-DD');

        if (status === 'CONFIRMED') { // 승인 완료
            if (paymentStatus === 'UNPAID') { // 승인 완료, 결제전
                return renderStatusUI('bg-gray-700', '결제대기');
            } else if (paymentStatus === 'PAID') { // 승인 완료, 결제 완료
                if (checkOut >= today && checkIn <= today) { // 이용중
                    return renderStatusUI('bg-green-500', '이용중');
                }
                return renderStatusUI('bg-roomi', '예약완료');
            }
        } else if (status === 'COMPLETED') { // 계약 종료
            // 보증금환불여부 확인
            return renderStatusUI('bg-gray-500', '계약종료');
        } else if (status === 'CANCELLED') { // 취소
            return renderStatusUI('bg-gray-700', '계약취소');
        } else if (status === 'REJECTED') { // 승인 거절
            return renderStatusUI('bg-gray-700', '승인거절');
        } else { // 승인 대기, 결제전, 기본값
            return renderStatusUI('bg-gray-500', '승인대기');
        }
    };

    const renderStatusUI = (backgroundColor: string, message: string) => {
        return (
            <span className={`text-xs text-white p-1 px-2.5 rounded ${backgroundColor}`}>{message}</span>
        );
    };

    // 텍스트 메시지를 결정하는 로직만 따로 분리
    const getStatusMessage = (
        status: string,
        paymentStatus: string,
        checkIn: string,
        checkOut: string
    ): { backgroundColor: string, message: string } => {
        const today = dayjs().format('YYYY-MM-DD');

        if (status === 'CONFIRMED') {
            if (paymentStatus === 'UNPAID') {
                return { backgroundColor: 'bg-gray-700', message: '결제대기' };
            } else if (paymentStatus === 'PAID') {
                if (checkOut >= today && checkIn <= today) {
                    return { backgroundColor: 'bg-green-500', message: '이용중' };
                }
                return { backgroundColor: 'bg-roomi', message: '예약완료' };
            }
        } else if (status === 'COMPLETED') {
            return { backgroundColor: 'bg-gray-500', message: '계약종료' };
        } else if (status === 'CANCELLED') {
            return { backgroundColor: 'bg-gray-700', message: '계약취소' };
        }
        return { backgroundColor: 'bg-gray-500', message: '승인대기' };
    };


    const renderReservationList = (list: ReservationHistory[]) => {
        return (
            list.map((item) => (
                <div key={item.order_id} className="flex flex-col md:flex-row justify-between md:p-2 bg-gray-100 my-4 rounded-lg relative">
                    <div className="md:w-1/4">
                        <div className="md:w-36 md:h-32 md:mr-4">
                            <img
                                className="object-cover rounded md:rounded-lg w-full h-full"
                                src={item.room.detail_urls?.[0]}
                                alt="thumbnail"
                            />
                        </div>
                    </div>
                    <div className="flex flex-col justify-center md:p-0 p-4 md:w-full">
                        <button type="button" onClick={() => setReservedDetails(item)} className="text-left">
                            <div className="mb-2">
                                <div className="flex md:gap-2 md:flex-row flex-col">
                                    <span className="text-xl font-bold tracking-tight text-gray-900">
                                        {item.room.title}
                                    </span>
                                    <span className="flex items-end gap-1">
                                        <span>{dayjs.utc(item.check_in_date).format('YYYY-MM-DD')}</span>
                                        <span>~</span>
                                        <span>{dayjs.utc(item.check_out_date).format('YYYY-MM-DD')}</span>
                                    </span>
                                </div>
                            </div>
                        </button>
                        <div className="font-normal text-gray-700">{item.room.address}</div>
                        <div className="flex gap-0.5">
                            <div>총 금액 : {t('원')}</div>
                            <div>{item.total_price.toLocaleString()}</div>
                        </div>
                        <div className="md:mt-1 mt-2">
                            {renderStatus(
                                item.status,
                                item.payment_status,
                                dayjs.utc(item.check_in_date).format('YYYY-MM-DD'),
                                dayjs.utc(item.check_out_date).format('YYYY-MM-DD')
                            )}
                        </div>
                    </div>
                </div>
            ))
        );
    };

    return (
        <div className="p-4 md:px-8">
            {/*타이틀*/}
            <div className="flex justify-between items-center mb-4">
                {reservedDetails ? (
                    /*예약 상세 정보*/
                    <>
                        <button type="button" onClick={() => setReservedDetails(null)} className="py-2 px-4 text-sm rounded font-bold">
                            목록 보기
                        </button>
                    </>
                ) : (
                    /*예약 내역*/
                    <>
                        <div>
                            <button type="button" onClick={() => setReservedListSet(true)}
                                    className={`py-2 px-4 text-sm rounded font-bold ${!reservedListSet && 'text-gray-400'}`}
                            >
                                현재 예약
                            </button>
                            <button type="button" onClick={() => setReservedListSet(false)}
                                    className={`py-2 px-4 text-sm rounded font-bold ${reservedListSet && 'text-gray-400'}`}
                            >
                                지난 예약
                            </button>
                        </div>
                    </>
                )}
            </div>
            {/*컨텐츠*/}
            <div>
                {reservedDetails ? (
                    /*예약 상세 정보*/
                    <MyReservationDetails
                        reserveData={reservedDetails}
                        statusInfo={getStatusMessage(
                            reservedDetails.status,
                            reservedDetails.payment_status,
                            dayjs.utc(reservedDetails.check_in_date).format('YYYY-MM-DD'),
                            dayjs.utc(reservedDetails.check_out_date).format('YYYY-MM-DD')
                        )}
                    />
                ) : (
                    /*예약 내역*/
                    <>
                        {reservedListSet ? (
                            <>{nowReserved && renderReservationUI(nowReserved, "현재 예약이 없습니다.")}</>
                        ) : (
                            <>{beforeReserved && renderReservationUI(beforeReserved, "지난 예약이 없습니다.")}</>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};
