import React, {useEffect, useState} from 'react';
import Calendar from "react-calendar";
import dayjs from "dayjs";
import {RoomData, Schedules} from "src/types/rooms";
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import {createBulkBlocks, unblockDate} from "src/api/api";
import {useDataUpdateStore} from "src/components/stores/DataUpdateStore";
import i18n from "i18next";
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);


const RoomStatusConfig = ({data, selectedRoom}: { data: RoomData[], selectedRoom?: number }) => {
    const [customBlockDatesRSC, setCustomBlockDatesRSC] = useState<string[]>([]);
    const [reservationDatesRSC, setReservationDatesRSC] = useState<string[]>([]);
    const [startDateRSC, setStartDateRSC] = useState<string | null>(null);
    const [endDateRSC, setEndDateRSC] = useState<string | null>(null);
    const [dateRangeRSC, setDateRangeRSC] = useState<string[]>([]);
    const [isReasonChk, setIsReasonChk] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [isBlockDate, setIsBlockDate] = useState('');
    const { dataUpdate, toggleDataUpdate } = useDataUpdateStore();
    const [calendarKey, setCalendarKey] = useState(0);
    const [userLocale, setUserLocale] = useState(i18n.language);

    const handleDayClick = (date: Date) => {
        const dateStringRSC = dayjs(date).format('YYYY-MM-DD');

        // 'BLOCKED' 상태이거나 손님이 예약한 날짜인 경우 클릭 비활성화
        if (customBlockDatesRSC.includes(dateStringRSC) || reservationDatesRSC.includes(dateStringRSC)) {
            // 블락 해제 모달 오픈
            setShowModal(true);
            // 블락 일자 업데이트
            setIsBlockDate(dateStringRSC);
            setStartDateRSC(null);
            setEndDateRSC(null);
            setDateRangeRSC([]);
            return;
        }

        if (!startDateRSC || (startDateRSC && endDateRSC)) {
            setStartDateRSC(dateStringRSC);
            setEndDateRSC(null);
            setDateRangeRSC([]);
            setIsReasonChk(false);
        } else {
            if (new Date(dateStringRSC) >= new Date(startDateRSC)) {
                setEndDateRSC(dateStringRSC);
            } else {
                setStartDateRSC(dateStringRSC);
                setEndDateRSC(null);
                setDateRangeRSC([]);
                setIsReasonChk(false);
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
                const selectedRoomData = data.find((room) => room.id === selectedRoom);
                // 예약 데이터 가져오기
                const reservations = selectedRoomData?.unavailable_dates?.reservations || [];
                console.log('예약 데이터 가져옴', reservations);

                // 날짜 범위 생성
                while (currentDate.isBefore(endDate) || currentDate.isSame(endDate)) {
                    const formattedDate = currentDate.format('YYYY-MM-DD');
                    // 비교용
                    const formattedDateUTC = dayjs.utc(formattedDate, 'YYYY-MM-DD');

                    // 해당 날짜가 예약된 날짜인지 확인
                    const isUnavailable = reservations.some((reservation) =>
                        reservation.status &&
                        dayjs.utc(reservation.check_in_date).isSameOrBefore(formattedDateUTC, 'day') &&
                        dayjs.utc(reservation.check_out_date).isSameOrAfter(formattedDateUTC, 'day')
                    );

                    console.log('formattedDate',formattedDate, 'isUnavailable',isUnavailable);
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

        const selectedRoomData = data.find((room) => room.id === selectedRoom);

        if (!selectedRoomData) {
            setCustomBlockDatesRSC([]);
            setReservationDatesRSC([]);
            return;
        }

        const customBlockArrRSC: string[] = [];
        const reservationArrRSC: string[] = [];

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
                        customBlockArrRSC.push(formattedDate);
                    }
                } else {
                    if (formattedDate >= today) {
                        reservationArrRSC.push(formattedDate);
                    }
                }
                currentDate = currentDate.add(1, 'day');
            }
        });

        setCustomBlockDatesRSC(customBlockArrRSC);
        setReservationDatesRSC(reservationArrRSC);
        // 페이지가 새로고침되거나 컴포넌트가 처음 마운트될 때 key를 0으로 설정
        setCalendarKey(0);
    }, [selectedRoom, data, dataUpdate]);

    const tileContent = () => {
        // 기본적으로 모든 날짜에 공통 콘텐츠 추가
        return <div className="add-content text-gray-500 text-xs">
            {data.filter((room) => room.id === selectedRoom) // 조건에 맞는 데이터 필터링
                .map((room, index) => (
                    <div key={index}>
                        {room.day_price !== undefined ? (
                            <>{(room.day_price / 10000).toFixed(2)}만</>
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

    // 블락 처리 함수
    const handleSubmitBtn = async () => {
        // 사용 불가 처리 라디오가 체크면 실행
        try {
            // 현재 선택된 방의 데이터를 가져옵니다.
            const selectedRoomData = data.find((room) => room.id === selectedRoom);
            if (selectedRoomData) {
                const roomId = selectedRoomData.id;
                const day_price: number | null = selectedRoomData.day_price ?? null;
                const schedulesData: Schedules[] = [];
                dateRangeRSC.map((date, index) => (
                    schedulesData.push({
                        "date": new Date(date),
                        "dayPrice": day_price,
                        "isAvailable": false,
                        "description": "객실 사용 불가",
                        "reason": "사용불가 사유",
                        "isBlocked": "true"
                    })
                ));
                const response = await createBulkBlocks(roomId, schedulesData);
                console.log(response);
                toggleDataUpdate();
            }
            setShowUpdateModal(false);
            setStartDateRSC(null);
            setEndDateRSC(null);
            setDateRangeRSC([]);
            setIsBlockDate('');
            setIsReasonChk(false);
            // 캘린더 리렌더링 (포커스 해제)
            setCalendarKey(prevKey => prevKey + 1);
        } catch (error) {
            console.error("실패:", error);
        }
    };

    // 블락 해제 함수
    const handleUnblockBtn = async () => {
        try {
            // 현재 선택된 방의 데이터를 가져옵니다.
            const selectedRoomData = data.find((room) => room.id === selectedRoom);
            if (selectedRoomData) {
                const roomId = selectedRoomData.id;
                const date = new Date(isBlockDate);
                const response = await unblockDate(roomId, date.toISOString());
                console.log(response);
                toggleDataUpdate();
            }
            setShowModal(false);
            setStartDateRSC(null);
            setEndDateRSC(null);
            setDateRangeRSC([]);
            setIsBlockDate('');
            // 캘린더 리렌더링 (포커스 해제)
            setCalendarKey(prevKey => prevKey + 1);
        } catch (error) {
            console.error("실패:", error);
        }
    };

    // 모달 취소, 블락 일자 업뎃
    const hanbleCencelBtn = () => {
        setIsBlockDate('');
        setShowModal(false);
        setShowUpdateModal(false);
    };


    return (
        <div className="flex flex-col md:flex-row gap-6 bg-white rounded-lg shadow-sm p-4">
            <div className="md:w-1/2 w-full">
                <h3 className="text-lg font-semibold mb-3 text-gray-800">날짜 관리</h3>
                <div className="calendar-container rounded-lg overflow-hidden">
                    <Calendar
                        minDate={new Date()}
                        formatDay={(locale, date) => dayjs(date).format('D')}
                        // tileContent={tileContent} // 날짜별 커스텀 콘텐츠 추가
                        tileClassName={tileClassName}
                        onClickDay={handleDayClick}
                        next2Label={null} // 추가로 넘어가는 버튼 제거
                        prev2Label={null} // 이전으로 돌아가는 버튼 제거
                        key={calendarKey}
                        locale={userLocale}
                        className="rounded-lg"
                    />
                </div>

                <div className="flex gap-4 mt-3 justify-center">
                    <div className="flex items-center">
                        <div className="w-4 h-4 rounded-full bg-gray-300 mr-2"></div>
                        <span className="text-xs text-gray-600">차단됨</span>
                    </div>
                </div>
            </div>

            <div className="md:w-1/2 w-full">
                <h3 className="text-lg font-semibold mb-3 text-gray-800">선택 정보</h3>
                <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="mb-4">
                        {startDateRSC !== null || endDateRSC !== null ? (
                            <div className="text-gray-800 font-medium">{startDateRSC} - {endDateRSC || ('?')}</div>
                        ) : (
                            <div className="text-red-600 font-medium">날짜를 선택해주세요.</div>
                        )}
                    </div>

                    <div className="w-full mb-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                        <div className="flex items-center mb-2">
                            <input id="blockRadio"
                                   type="checkbox"
                                   value=""
                                   className="w-4 h-4 text-white focus:ring-roomi accent-roomi"
                                   checked={isReasonChk}
                                   onChange={(e) => setIsReasonChk(e.target.checked)}
                                   disabled={startDateRSC === null || endDateRSC === null}/>
                            <label htmlFor="blockRadio" className="ms-2 text-sm font-medium text-gray-900">
                                사용불가 처리
                            </label>
                        </div>
                        {isReasonChk && (
                            <div className="mt-3">
                                <div className="text-xs text-gray-600 mb-1">
                                    <label htmlFor="reason">사용불가 사유를 입력해주세요.</label>
                                </div>
                                <input
                                    id="reason"
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-roomi"
                                    placeholder="사유 입력"
                                />
                            </div>
                        )}
                    </div>
                    {/* 가격 변경 부분 주석 처리
                <div className="w-full flex-1 my-2 px-4 py-2 border border-gray-300 rounded-md">
                    <div className="font-bold">가격 변경</div>
                    <div>
                        <input
                            type="number"
                            className="w-3/4 mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />원
                    </div>
                </div>
                */}
                    <div className="flex justify-end">
                        <button
                            className="text-white text-sm bg-roomi hover:bg-roomi rounded-md px-4 py-2 transition duration-300 ease-in-out"
                            onClick={() => setShowUpdateModal(true)}
                        >
                            완료
                        </button>
                    </div>
                </div>
            </div>
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50">
                    <div className="relative p-4 w-full max-w-md bg-white rounded-lg shadow-md">
                        <button
                            className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5"
                            onClick={() => setShowModal(false)}
                        >
                            <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                      d="M1 1l6 6m0 0l6 6M7 7l6-6M7 7L1 13"/>
                            </svg>
                        </button>
                        <div className="p-6 text-center">
                            <svg className="mx-auto mb-4 text-gray-400 w-14 h-14" xmlns="http://www.w3.org/2000/svg"
                                 fill="none" viewBox="0 0 20 20">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                      d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                            </svg>
                            <h3 className="mb-5 text-lg font-normal text-gray-500">
                                블락을 해제 하시겠습니까?
                            </h3>
                            <button
                                className="text-white bg-roomi hover:bg-roomi focus:ring-4 focus:outline-none focus:ring-roomi font-medium rounded-lg text-sm px-5 py-2.5 mr-3 transition duration-300 ease-in-out"
                                onClick={handleUnblockBtn}
                            >
                                확인
                            </button>
                            <button
                                className="text-roomi bg-white hover:bg-gray-100 border border-roomi focus:ring-4 focus:outline-none focus:ring-roomi font-medium rounded-lg text-sm px-5 py-2.5 transition duration-300 ease-in-out"
                                onClick={hanbleCencelBtn}
                            >
                                취소
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showUpdateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50">
                    <div className="relative p-4 w-full max-w-md bg-white rounded-lg shadow-md">
                        <button
                            className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5"
                            onClick={() => setShowUpdateModal(false)}
                        >
                            <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                      d="M1 1l6 6m0 0l6 6M7 7l6-6M7 7L1 13"/>
                            </svg>
                        </button>
                        <div className="p-6 text-center">
                            <svg className="mx-auto mb-4 text-gray-400 w-14 h-14" xmlns="http://www.w3.org/2000/svg"
                                 fill="none" viewBox="0 0 20 20">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                      d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                            </svg>
                            <h3 className="mb-5 text-lg font-normal text-gray-500">
                                사용불가 처리 하시겠습니까?
                            </h3>
                            <button
                                className="text-white bg-roomi hover:bg-roomi focus:ring-4 focus:outline-none focus:ring-roomi font-medium rounded-lg text-sm px-5 py-2.5 mr-3 transition duration-300 ease-in-out"
                                onClick={handleSubmitBtn}
                            >
                                확인
                            </button>
                            <button
                                className="text-roomi bg-white hover:bg-gray-100 border border-roomi focus:ring-4 focus:outline-none focus:ring-roomi font-medium rounded-lg text-sm px-5 py-2.5 transition duration-300 ease-in-out"
                                onClick={hanbleCencelBtn}
                            >
                                취소
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoomStatusConfig;
