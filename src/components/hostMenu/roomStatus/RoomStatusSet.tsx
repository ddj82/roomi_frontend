import React, {useEffect, useState} from 'react';
import Calendar from "react-calendar";
import dayjs from "dayjs";
import {RoomData} from "src/types/rooms";
import i18n from "i18next";
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

const RoomStatusSet = ({data, selectedRoom}: { data: RoomData[], selectedRoom?: number }) => {
    const [customBlockDatesRSS, setCustomBlockDatesRSS] = useState<string[]>([]);
    const [reservationDatesRSS, setReservationDatesRSS] = useState<string[]>([]);
    const [userLocale, setUserLocale] = useState(i18n.language);

    // Update related dates whenever selectedRoom changes
    useEffect(() => {
        if (!selectedRoom) return;

        const selectedRoomData = data.find((room) => room.id === selectedRoom);

        if (!selectedRoomData) {
            setCustomBlockDatesRSS([]);
            setReservationDatesRSS([]);
            return;
        }

        const customBlockArrRSS: string[] = [];
        const reservationArrRSS: string[] = [];

        selectedRoomData.unavailable_dates?.reservations?.forEach((reservation) => {
            const startDate = dayjs.utc(reservation.check_in_date);
            const endDate = dayjs.utc(reservation.check_out_date);
            const today = dayjs().format('YYYY-MM-DD');

            // Generate date range
            let currentDate = startDate;
            while (currentDate.isBefore(endDate) || currentDate.isSame(endDate)) {
                const formattedDate = currentDate.format('YYYY-MM-DD');
                if (reservation.status === 'BLOCKED') {
                    if (formattedDate >= today) {
                        customBlockArrRSS.push(formattedDate);
                    }
                } else if (formattedDate >= today) {
                    reservationArrRSS.push(formattedDate);
                }
                currentDate = currentDate.add(1, 'day');
            }
        });

        setCustomBlockDatesRSS(customBlockArrRSS);
        setReservationDatesRSS(reservationArrRSS);
    }, [selectedRoom, data]);

    const tileContent = ({ date }: { date: Date }) => {
        const formattedDate = dayjs(date).format('YYYY-MM-DD');
        const roomInfo = data.find((room) => room.id === selectedRoom);

        if (!roomInfo || !roomInfo.day_price) return null;

        // Only show price for available dates
        if (!customBlockDatesRSS.includes(formattedDate) && !reservationDatesRSS.includes(formattedDate)) {
            return (
                <div className="text-gray-500 text-xs font-medium mt-1">
                    {(roomInfo.day_price / 10000).toFixed(1)}만
                </div>
            );
        }

        return null;
    };

    return (
        <div className="flex flex-col md:flex-row gap-6 bg-white rounded-lg shadow-sm p-4">
            <div className="md:w-1/2 w-full">
                <h3 className="text-lg font-semibold mb-3 text-gray-800">예약 현황</h3>
                <div className="calendar-container rounded-lg overflow-hidden ">
                    <Calendar
                        minDate={new Date()}
                        formatDay={(locale, date) => dayjs(date).format('D')}
                        // tileContent={tileContent}
                        tileClassName={({ date }) => {
                            const formattedDate = dayjs(date).format('YYYY-MM-DD');
                            let classes = "relative";

                            if (customBlockDatesRSS.includes(formattedDate)) {
                                classes += " custom-block-date";
                            }
                            if (reservationDatesRSS.includes(formattedDate)) {
                                classes += " reservation-date";
                            }
                            return classes;
                        }}
                        next2Label={null}
                        prev2Label={null}
                        locale={userLocale}
                        className="rounded-lg"
                    />
                </div>

                <div className="flex gap-4 mt-3 justify-center">
                    <div className="flex items-center">
                        <div className="w-4 h-4 rounded-full bg-red-200 mr-2"></div>
                        <span className="text-xs text-gray-600">예약중</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-4 h-4 rounded-full bg-gray-300 mr-2"></div>
                        <span className="text-xs text-gray-600">차단됨</span>
                    </div>
                </div>
            </div>

            <div className="md:w-1/2 w-full">
                <h3 className="text-lg font-semibold mb-3 text-gray-800">예약 목록</h3>
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-4 py-3 text-center">상태</th>
                            <th scope="col" className="px-4 py-3 text-center">계약자</th>
                            <th scope="col" className="px-4 py-3 text-center">입실</th>
                            <th scope="col" className="px-4 py-3 text-center">퇴실</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr className="bg-white border-b hover:bg-gray-50">
                            <td className="px-4 py-3 text-center">
                                <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-0.5 rounded">승인대기</span>
                            </td>
                            <td className="px-4 py-3 text-center">계약자1</td>
                            <td className="px-4 py-3 text-center">입실1</td>
                            <td className="px-4 py-3 text-center">퇴실1</td>
                        </tr>
                        <tr className="bg-white border-b hover:bg-gray-50">
                            <td className="px-4 py-3 text-center">
                                <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded">승인</span>
                            </td>
                            <td className="px-4 py-3 text-center">계약자2</td>
                            <td className="px-4 py-3 text-center">입실2</td>
                            <td className="px-4 py-3 text-center">퇴실2</td>
                        </tr>
                        <tr className="bg-white hover:bg-gray-50">
                            <td className="px-4 py-3 text-center">
                                <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded">승인</span>
                            </td>
                            <td className="px-4 py-3 text-center">계약자3</td>
                            <td className="px-4 py-3 text-center">입실3</td>
                            <td className="px-4 py-3 text-center">퇴실3</td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>


        </div>
    );
};

export default RoomStatusSet;