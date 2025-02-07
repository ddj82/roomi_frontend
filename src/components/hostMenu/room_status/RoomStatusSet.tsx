import React, {useEffect, useState} from 'react';
import Calendar from "react-calendar";
import dayjs from "dayjs";
import {RoomData} from "src/types/rooms";

const RoomStatusSet = ({data, selectedRoom}: { data: RoomData[], selectedRoom?: string }) => {
    const [customBlockDatesRSS, setCustomBlockDatesRSS] = useState<string[]>([]);
    const [reservationDatesRSS, setReservationDatesRSS] = useState<string[]>([]);

    // selectedRoom 값이 바뀔 때마다 관련된 날짜 업데이트
    useEffect(() => {
        if (!selectedRoom) return;

        const selectedRoomData = data.find((room) => room.title === selectedRoom);

        if (!selectedRoomData) {
            setCustomBlockDatesRSS([]);
            setReservationDatesRSS([]);
            return;
        }

        const customBlockArrRSS: string[] = [];
        const reservationArrRSS: string[] = [];

        selectedRoomData.unavailable_dates?.reservations?.forEach((reservation) => {
            const startDate = dayjs(reservation.check_in_date);
            const endDate = dayjs(reservation.check_out_date);

            // 날짜 범위 생성
            let currentDate = startDate;
            while (currentDate.isBefore(endDate) || currentDate.isSame(endDate)) {
                const formattedDate = currentDate.format('YYYY-MM-DD');
                if (reservation.status === 'BLOCKED') {
                    customBlockArrRSS.push(formattedDate);
                } else {
                    reservationArrRSS.push(formattedDate);
                }
                currentDate = currentDate.add(1, 'day');
            }
        });

        setCustomBlockDatesRSS(customBlockArrRSS);
        setReservationDatesRSS(reservationArrRSS);
    }, [selectedRoom, data]);

    const tileContent = ({ date }: { date: Date }) => {        // 기본적으로 모든 날짜에 공통 콘텐츠 추가
        let contentRSS =
            <div className="add-content text-gray-500 text-xs">
                {data.filter((room) => room.title === selectedRoom) // 조건에 맞는 데이터 필터링
                    .map((room, index) => (
                        <div key={index}>
                            {room.day_price !== undefined ? (
                                `${(room.day_price / 10000)}`
                            ) : (
                                '없음'
                            )}
                        </div>
                    ))}
            </div>;
        return contentRSS;
    };

    return (
        <div>
            <div>
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
                />
            </div>
            
            {/* 데이터 로그 */}
            <div>
                {data.filter((room) => room.title === selectedRoom) // 조건에 맞는 데이터 필터링
                    .map((room, index) => (
                        <div key={index}>
                            <div>Room: {room.title}</div>
                            {room.unavailable_dates?.reservations?.map((reservation, resIndex) => (
                                <div key={resIndex}>
                                    <p>status: {reservation.status}</p>
                                    <p>check_in_date: {reservation.check_in_date}</p>
                                    <p>check_out_date: {reservation.check_out_date}</p>
                                </div>
                            ))}
                        </div>
                    ))}
            </div>

            {/* 캘린더 포인트 비활성화 */}
            <style>
                {`
                    .react-calendar__viewContainer {
                        pointer-events: none;
                    }
                `}
            </style>
        </div>
    );
};

export default RoomStatusSet;
