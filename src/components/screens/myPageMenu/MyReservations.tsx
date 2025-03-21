import React, {useEffect, useState} from 'react';
import {useTranslation} from "react-i18next";
import {getReservationHistory} from "../../../api/api";
import {ReservationHistory} from "../../../types/rooms";
import dayjs from "dayjs";
import {faAngleRight} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

export default function MyReservations() {
    const {t} = useTranslation();
    const [nowReserved, setNowReserved] = useState<ReservationHistory[] | null>(null);
    const [beforeReserved, setBeforeReserved] = useState<ReservationHistory[] | null>(null);
    const [reservedListSet, setReservedListSet] = useState(true);

    useEffect(() => {
        const reservationHistory = async () => {
            try {
                const response = await getReservationHistory();
                const responseJson = await response.json();
                console.log('데이터:', responseJson.data);

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
            return renderStatusUI('bg-gray-500', '계약종료');
        } else if (status === 'CANCELLED') { // 취소
            return renderStatusUI('bg-gray-700', '계약취소');
        } else { // 승인 대기, 결제전, 기본값
            return renderStatusUI('bg-gray-500', '승인대기');
        }
    };

    const renderStatusUI = (backgroundColor: string, message: string) => {
        return (
            <span className={`text-xs text-white p-1 px-2.5 rounded ${backgroundColor}`}>{message}</span>
        );
    };

    const renderReservationList = (list: ReservationHistory[]) => {
        return (
            list.map((item, index) => (
                <div key={index} className="flex flex-col md:flex-row justify-between md:p-4 bg-gray-100 my-4 rounded-lg relative">
                    <div className="w-1/4">
                        <div className="md:w-36 md:h-32 md:mr-4">
                            <img
                                className="object-cover rounded md:rounded-lg w-full h-full"
                                src={item.room.detail_urls?.[0]}
                                alt="thumbnail"
                            />
                        </div>
                    </div>
                    <div className="flex flex-col justify-center md:p-0 p-4 md:w-full">
                        <div className="mb-2">
                            <div className="flex gap-2">
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
                        <div className="font-normal text-gray-700">{item.room.address}</div>
                        <div className="flex gap-0.5">
                            <div>총 금액 : {t('원')}</div>
                            <div>{item.total_price.toLocaleString()}</div>
                        </div>
                        <div className="mt-1">
                            {renderStatus(
                                item.status,
                                item.payment_status,
                                dayjs.utc(item.check_in_date).format('YYYY-MM-DD'),
                                dayjs.utc(item.check_out_date).format('YYYY-MM-DD')
                            )}
                        </div>
                    </div>
                    <div>
                        <button type="button" className="p-2 px-3">
                            <FontAwesomeIcon icon={faAngleRight} />
                        </button>
                    </div>
                </div>
            ))
        );
    };

    return (
        <div className="p-4 md:px-8">
            <div className="flex justify-between items-center mb-4">
                <h2 className="font_title">{t("예약 내역")}</h2>
                <div>
                    <button type="button"
                            onClick={() => setReservedListSet(true)}
                            className={`py-2 px-5 text-sm rounded font-bold ${!reservedListSet && 'text-gray-400'}`}
                    >
                        현재 예약
                    </button>
                    <button type="button"
                            onClick={() => setReservedListSet(false)}
                            className={`py-2 px-4 text-sm rounded font-bold ${reservedListSet && 'text-gray-400'}`}
                    >
                        지난 예약
                    </button>
                </div>
            </div>
            <div>
                {reservedListSet ? (
                    <>{nowReserved && renderReservationUI(nowReserved, "현재 예약이 없습니다.")}</>
                ) : (
                    <>{beforeReserved && renderReservationUI(beforeReserved, "지난 예약이 없습니다.")}</>
                )}
            </div>
        </div>
    );
};
