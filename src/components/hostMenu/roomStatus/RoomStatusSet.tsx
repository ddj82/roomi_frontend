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

    // selectedRoom 값이 바뀔 때마다 관련된 날짜 업데이트
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

            // 날짜 범위 생성
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

    const tileContent = () => {
        return (
            <div className="add-content text-gray-500 text-xs">
                {data.filter((room) => room.id === selectedRoom) // 조건에 맞는 데이터 필터링
                    .map((room, index) => (
                        <div key={index}>
                            {room.day_price !== undefined ? (
                                <>{(room.day_price / 10000).toFixed(2)}만</>
                            ) : (
                                '없음'
                            )}
                        </div>
                    ))
                }
            </div>
        );
    };

    return (
        <div className="flex md:flex-row flex-col">
            <div className="md:w-[50%]">
                <Calendar
                    minDate={new Date()}
                    formatDay={(locale, date) => dayjs(date).format('D')}
                    tileContent={tileContent} // 날짜별 커스텀 콘텐츠 추가
                    tileClassName={({ date }) => {
                        const formattedDate = dayjs(date).format('YYYY-MM-DD');
                        if (customBlockDatesRSS.includes(formattedDate)) {
                            return 'custom-block-date';
                        }
                        if (reservationDatesRSS.includes(formattedDate)) {
                            return 'reservation-date';
                        }
                        return null; // 기본 스타일
                    }}
                    next2Label={null} // 추가로 넘어가는 버튼 제거
                    prev2Label={null} // 이전으로 돌아가는 버튼 제거
                    locale={userLocale}
                />
            </div>
            {/* 캘린더 포인트 비활성화 */}
            <style>{`.react-calendar__viewContainer { pointer-events: none; }`}</style>

            <div className="md:w-[50%] m-4 md:my-0">
                <div className="relative overflow-x-auto sm:rounded-lg">
                    <table className="w-full text-xs md:text-sm text-center text-gray-500" role="table">
                        <thead className="md:text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="md:px-6 py-3">상태</th>
                                <th scope="col" className="md:px-6 py-3">계약자</th>
                                <th scope="col" className="md:px-6 py-3">입실</th>
                                <th scope="col" className="md:px-6 py-3">퇴실</th>
                            </tr>
                        </thead>
                        <tbody>
                        <tr className="bg-white border-b border-gray-200">
                            <td className="md:px-6 py-4">승인대기</td>
                            <td className="md:px-6 py-4">계약자1</td>
                            <td className="md:px-6 py-4">입실1</td>
                            <td className="md:px-6 py-4">퇴실1</td>
                        </tr>
                        <tr className="bg-white border-b border-gray-200">
                            <td className="md:px-6 py-4">승인</td>
                            <td className="md:px-6 py-4">계약자2</td>
                            <td className="md:px-6 py-4">입실2</td>
                            <td className="md:px-6 py-4">퇴실2</td>
                        </tr>
                        <tr className="bg-white border-b border-gray-200">
                            <td className="md:px-6 py-4">승인</td>
                            <td className="md:px-6 py-4">계약자3</td>
                            <td className="md:px-6 py-4">입실3</td>
                            <td className="md:px-6 py-4">퇴실3</td>
                        </tr>
                        </tbody>

                    </table>
                </div>
            </div>
        </div>
    );
};

export default RoomStatusSet;
