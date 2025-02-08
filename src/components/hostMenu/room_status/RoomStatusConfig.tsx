import React, {useEffect, useState} from 'react';
import Calendar from "react-calendar";
import dayjs from "dayjs";
import {RoomData} from "src/types/rooms";
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

const RoomStatusConfig = ({data, selectedRoom}: { data: RoomData[], selectedRoom?: string }) => {
    const [customBlockDatesRSC, setCustomBlockDatesRSC] = useState<string[]>([]);
    const [reservationDatesRSC, setReservationDatesRSC] = useState<string[]>([]);
    const [startDateRSC, setStartDateRSC] = useState<string | null>(null);
    const [endDateRSC, setEndDateRSC] = useState<string | null>(null);
    const [dateRangeRSC, setDateRangeRSC] = useState<string[]>([]);

    const handleDayClick = (date: Date) => {
        const dateStringRSC = dayjs(date).format('YYYY-MM-DD')

        // 'BLOCKED' 상태이거나 손님이 예약한 날짜인 경우 클릭 비활성화
        if (customBlockDatesRSC.includes(dateStringRSC) || reservationDatesRSC.includes(dateStringRSC)) {
            const res = window.confirm('수정할껴?');
            setStartDateRSC(null);
            setEndDateRSC(null);
            setDateRangeRSC([]);
            return;
        }

        if (!startDateRSC || (startDateRSC && endDateRSC)) {
            setStartDateRSC(dateStringRSC);
            setEndDateRSC(null);
            setDateRangeRSC([]);
        } else {
            if (new Date(dateStringRSC) >= new Date(startDateRSC)) {
                setEndDateRSC(dateStringRSC);
            } else {
                setStartDateRSC(dateStringRSC);
                setEndDateRSC(null);
                setDateRangeRSC([]);
            }
        }
    };

    // startDateRSC 또는 endDateRSC 가 변경 될 때
    useEffect(() => {
        // 둘 다 값이 있을 경우
        if (startDateRSC && endDateRSC) {
            const generateDateRange = (start: string, end: string) => {
                const startDate = dayjs(start, 'YYYY-MM-DD'); // 시작 날짜
                const endDate = dayjs(end, 'YYYY-MM-DD'); // 끝 날짜
                const dates: string[] = [];

                let currentDate = startDate;

                // 현재 선택된 방의 데이터를 가져옵니다.
                const selectedRoomData = data.find((room) => room.title === selectedRoom);
                // 예약 데이터 가져오기
                const reservations = selectedRoomData?.unavailable_dates?.reservations || [];

                // 날짜 범위 생성
                while (currentDate.isBefore(endDate) || currentDate.isSame(endDate)) {
                    const formattedDate = currentDate.format('YYYY-MM-DD');

                    // 해당 날짜가 예약된 날짜인지 확인
                    const isUnavailable = reservations.some(
                        (reservation) =>
                            reservation.status &&
                            dayjs(reservation.check_in_date).isSameOrBefore(formattedDate, 'day') &&
                            dayjs(reservation.check_out_date).isSameOrAfter(formattedDate, 'day')
                    );

                    // 예약되지 않은 날짜만 추가
                    if (!isUnavailable) {
                        dates.push(formattedDate);
                    }

                    currentDate = currentDate.add(1, 'day'); // 하루씩 증가
                }

                return dates;
            };
            // 범위 내 날짜 배열 생성
            const result = generateDateRange(startDateRSC, endDateRSC);
            setDateRangeRSC(result);
        }
    }, [startDateRSC, endDateRSC]);

    // selectedRoom 값이 바뀔 때마다 관련된 날짜 업데이트
    useEffect(() => {
        if (!selectedRoom) return;

        const selectedRoomData = data.find((room) => room.title === selectedRoom);

        if (!selectedRoomData) {
            setCustomBlockDatesRSC([]);
            setReservationDatesRSC([]);
            return;
        }

        const customBlockArrRSC: string[] = [];
        const reservationArrRSC: string[] = [];

        selectedRoomData.unavailable_dates?.reservations?.forEach((reservation) => {
            const startDate = dayjs(reservation.check_in_date);
            const endDate = dayjs(reservation.check_out_date);

            // 날짜 범위 생성
            let currentDate = startDate;
            while (currentDate.isBefore(endDate) || currentDate.isSame(endDate)) {
                const formattedDate = currentDate.format('YYYY-MM-DD');
                if (reservation.status === 'BLOCKED') {
                    customBlockArrRSC.push(formattedDate);
                } else {
                    reservationArrRSC.push(formattedDate);
                }
                currentDate = currentDate.add(1, 'day');
            }
        });

        setCustomBlockDatesRSC(customBlockArrRSC);
        setReservationDatesRSC(reservationArrRSC);
    }, [selectedRoom, data]);

    const tileContent = () => {
        // 기본적으로 모든 날짜에 공통 콘텐츠 추가
        return <div className="add-content text-gray-500 text-xs">
            {data.filter((room) => room.title === selectedRoom) // 조건에 맞는 데이터 필터링
                .map((room, index) => (
                    <div key={index}>
                        {room.day_price !== undefined ? (
                            `${(room.day_price / 10000).toFixed(2)}`
                        ) : (
                            '없음'
                        )}
                    </div>
                ))}
        </div>;
    };

    const tileClassName = ({ date }: { date: Date }) => {
        const formattedDate = dayjs(date).format('YYYY-MM-DD');

        if (formattedDate === startDateRSC) {
            return 'start-dateRCS'; // startDate에 추가할 클래스
        }
        if (formattedDate === endDateRSC) {
            return 'end-dateRCS'; // endDate에 추가할 클래스
        }
        if (dateRangeRSC.includes(formattedDate)) {
            return 'range-dateRCS'; // 범위 내 날짜에 추가할 클래스
        }
        if (customBlockDatesRSC.includes(formattedDate)) {
            return 'custom-block-date';
        }
        if (reservationDatesRSC.includes(formattedDate)) {
            return 'reservation-date';
        }
        return null; // 기본 스타일
    };

    return (
        <div>
            <div>
                <Calendar
                    minDate={new Date()}
                    formatDay={(locale, date) => dayjs(date).format('D')}
                    tileContent={tileContent} // 날짜별 커스텀 콘텐츠 추가
                    tileClassName={tileClassName}
                    onClickDay={handleDayClick}
                    next2Label={null} // 추가로 넘어가는 버튼 제거
                    prev2Label={null} // 이전으로 돌아가는 버튼 제거
                />
            </div>
            <div>
                {startDateRSC !== null ? (
                    <span>{startDateRSC}</span>
                ) : (
                    <span>날짜를 선택하세요</span>
                )}
                ~
                {endDateRSC !== null ? (
                    <span>{endDateRSC}</span>
                ) : (
                    <span>날짜를 선택하세요</span>
                )}
            </div>
            {startDateRSC && endDateRSC && (
                <div>
                    <div>선택된 날짜</div>
                    <div>
                        <ul>
                            {dateRangeRSC.map((date) => (
                                <li key={date}>{date}</li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        객실 사용 불가 설정 {'>'} 이유받기
                    </div>
                    <div>
                        가격 설정
                    </div>
                </div>
            )}
            <br/><br/>
            <div>손님예약(보라색) 안눌리게 - 클리어</div>
            <div>빨간날(호스트막기) 누르면 블락해제? - 클리어</div>
        </div>
    );
};

export default RoomStatusConfig;
