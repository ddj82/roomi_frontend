import React, {useEffect, useState, useRef} from 'react';
import {useTranslation} from "react-i18next";
import 'react-calendar/dist/Calendar.css';
import {RoomData, Schedules} from "src/types/rooms";
import {myRoomList, createBulkBlocks, unblockDate} from "src/api/api";
import {useDataUpdateStore} from "../stores/DataUpdateStore";
import { ChevronDown } from 'lucide-react';
import dayjs, {Dayjs} from "dayjs";
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import i18n from "i18next";
import utc from 'dayjs/plugin/utc';
import ConfirmationModal from "../modals/ComfirmationModal";

dayjs.extend(utc);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

interface AirbnbStyleCalendarProps {
    blockDates: string[];
    reservationDates: string[];
    locale: string;
    onDateClick?: (dateString: string) => void;
    startDate: string | null;
    endDate: string | null;
}

// 모던한 스타일 캘린더 컴포넌트
const AirbnbStyleCalendar: React.FC<AirbnbStyleCalendarProps> = ({
                                                                     blockDates,
                                                                     reservationDates,
                                                                     locale,
                                                                     onDateClick,
                                                                     startDate,
                                                                     endDate
                                                                 }) => {
    const [isDesktop, setIsDesktop] = useState(false);

    useEffect(() => {
        const checkIfDesktop = () => {
            setIsDesktop(window.innerWidth >= 768);
        };
        checkIfDesktop();
        window.addEventListener('resize', checkIfDesktop);
        return () => window.removeEventListener('resize', checkIfDesktop);
    }, []);

    const today = dayjs();
    const months = Array.from({ length: 12 }, (_, i) => today.add(i, 'month'));
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];

    const generateDaysForMonth = (month: Dayjs) => {
        const firstDayOfMonth = month.startOf('month');
        const lastDayOfMonth = month.endOf('month');
        const firstDayOfCalendar = firstDayOfMonth.subtract(firstDayOfMonth.day(), 'day');
        const lastDayOfCalendar = lastDayOfMonth.add(6 - lastDayOfMonth.day(), 'day');

        const days = [];
        let day = firstDayOfCalendar;

        while (day.isBefore(lastDayOfCalendar) || day.isSame(lastDayOfCalendar, 'day')) {
            days.push({
                date: day,
                isCurrentMonth: day.month() === month.month()
            });
            day = day.add(1, 'day');
        }

        return days;
    };

    const isInRange = (date: Dayjs) => {
        if (!startDate || !endDate) return false;
        const start = dayjs(startDate);
        const end = dayjs(endDate);
        return date.isAfter(start) && date.isBefore(end);
    };

    const isStartDate = (date: Dayjs) => {
        if (!startDate) return false;
        return date.format('YYYY-MM-DD') === startDate;
    };

    const isEndDate = (date: Dayjs) => {
        if (!endDate) return false;
        return date.format('YYYY-MM-DD') === endDate;
    };

    return (
        <div className="w-full h-full overflow-y-auto scrollbar-hidden">
            <div className="">
                {months.map((month, monthIndex) => (
                    <div key={monthIndex} className="mb-12">
                        {/* 월 헤더 */}
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-1">
                                {month.format('YYYY년 M월')}
                            </h2>
                        </div>

                        {/* 요일 헤더 */}
                        <div className="grid grid-cols-7 mb-2">
                            {weekdays.map((day, i) => (
                                <div
                                    key={i}
                                    className="text-center text-sm font-medium text-gray-500 py-2"
                                >
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* 날짜 그리드 */}
                        <div className="grid grid-cols-7 ">
                            {generateDaysForMonth(month).map((dayObj, dayIndex) => {
                                if (!dayObj.isCurrentMonth) {
                                    return <div key={dayIndex} className="h-20"></div>;
                                }

                                const dateString = dayObj.date.format('YYYY-MM-DD');
                                const isBlocked = blockDates.includes(dateString);
                                const isReserved = reservationDates.includes(dateString);
                                const isPast = dayObj.date.isBefore(today, 'day');
                                const isToday = dayObj.date.isSame(today, 'day');
                                const isSelectable = !isPast;

                                const isStart = isStartDate(dayObj.date);
                                const isEnd = isEndDate(dayObj.date);
                                const isRange = isInRange(dayObj.date);

                                return (
                                    <div
                                        key={dayIndex}
                                        className={`
                h-20 border border-gray-100 relative transition-all duration-200
                ${isStart || isEnd ? 'bg-gray-100 border-gray-200' : ''}
                ${isRange ? 'bg-gray-50' : ''}
                ${isBlocked ? 'bg-roomi-1' : ''}
                ${isReserved ? 'bg-gray-300' : ''}
                ${!isSelectable ? 'opacity-50' : ''}
                ${isSelectable && !isReserved ? 'cursor-pointer hover:bg-gray-50' : ''}
                ${isReserved ? 'cursor-not-allowed' : ''}
                ${isBlocked ? 'cursor-pointer hover:bg-red-50' : ''}
            `}
                                        onClick={() => {
                                            if (isSelectable) {
                                                onDateClick?.(dateString);
                                            }
                                        }}
                                    >
                                        {/* 날짜 번호 */}
                                        <div className={`
                absolute top-2 left-2 w-8 h-8 flex items-center justify-center
                text-sm font-medium rounded-full
                ${isToday ? 'bg-black text-white' : ''}
                ${isStart || isEnd ? 'bg-gray-500 text-white' : ''}
                ${isBlocked && !isStart && !isEnd ? 'text-gray-600 font-bold' : ''}
                ${isReserved && !isStart && !isEnd ? 'text-gray-600 font-bold' : ''}
                ${!isBlocked && !isReserved && !isStart && !isEnd && !isToday ? 'text-gray-900' : ''}
            `}>
                                            {dayObj.date.date()}
                                        </div>

                                        {/*/!* 상태 표시 아이콘/텍스트 *!/*/}
                                        {/*<div className="absolute top-2 right-2">*/}
                                        {/*    {isBlocked && (*/}
                                        {/*        <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">*/}
                                        {/*            <span className="text-white text-xs font-bold">X</span>*/}
                                        {/*        </div>*/}
                                        {/*    )}*/}
                                        {/*    {isReserved && (*/}
                                        {/*        <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">*/}
                                        {/*            <span className="text-white text-xs font-bold">R</span>*/}
                                        {/*        </div>*/}
                                        {/*    )}*/}
                                        {/*</div>*/}

                                        {/* 하단 상태 텍스트 */}
                                        {/*<div className="absolute bottom-1 left-1 right-1">*/}
                                        {/*    {isBlocked && (*/}
                                        {/*        <div className="text-xs font-medium text-red-600 text-center bg-red-50 rounded px-1">*/}
                                        {/*            블락*/}
                                        {/*        </div>*/}
                                        {/*    )}*/}
                                        {/*    {isReserved && (*/}
                                        {/*        <div className="text-xs font-medium text-white text-center rounded px-1">*/}

                                        {/*        </div>*/}
                                        {/*    )}*/}
                                        {/*</div>*/}

                                        {/* 블락된 날짜의 사선 표시 (기존 유지하되 색상 변경) */}
                                        {/*{isBlocked && (*/}
                                        {/*    <div className="absolute inset-0 flex items-center justify-center">*/}
                                        {/*        <div className="bg-red-500 h-0.5 w-1/2 rotate-45"></div>*/}
                                        {/*    </div>*/}
                                        {/*)}*/}

                                        {/* 예약된 날짜의 점선 표시 */}
                                        {isReserved && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div
                                                    className="text-xs font-medium text-white text-center rounded px-1">
                                                    예약
                                                </div>
                                            </div>
                                        )}
                                        {isBlocked && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div
                                                    className="text-xs font-medium text-white text-center rounded px-1">
                                                    차단
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const RoomStatus = () => {
    const { t } = useTranslation();
    const [data, setData] = useState<RoomData[]>([]);
    const [selectedRoom, setSelectedRoom] = useState(0);
    const { dataUpdate, toggleDataUpdate } = useDataUpdateStore();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    const [customBlockDatesRSC, setCustomBlockDatesRSC] = useState<string[]>([]);
    const [reservationDatesRSC, setReservationDatesRSC] = useState<string[]>([]);
    const [startDateRSC, setStartDateRSC] = useState<string | null>(null);
    const [endDateRSC, setEndDateRSC] = useState<string | null>(null);
    const [dateRangeRSC, setDateRangeRSC] = useState<string[]>([]);
    const [isReasonChk, setIsReasonChk] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [isBlockDate, setIsBlockDate] = useState('');
    const [calendarKey, setCalendarKey] = useState(0);
    const [userLocale, setUserLocale] = useState(i18n.language);
    const [isDesktop, setIsDesktop] = useState(false);

    const selectedRoomData = data.find(room => room.id === selectedRoom);
    const displayValue = selectedRoomData ? `${selectedRoomData.title} ${selectedRoomData.id}` : '선택하세요';

    useEffect(() => {
        const checkIfDesktop = () => {
            setIsDesktop(window.innerWidth >= 768);
        };
        checkIfDesktop();
        window.addEventListener('resize', checkIfDesktop);
        return () => window.removeEventListener('resize', checkIfDesktop);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const myRoomAPI = async () => {
            try {
                const response = await myRoomList();
                const responseJson = await response.json();
                const items: RoomData[] = responseJson.data.items;
                setData(items);
                if (items.length > 0) {
                    if (selectedRoom > 0) {
                        items.map((room, index) => {
                            const selectRoomId = room.id;
                            if (selectRoomId === selectedRoom) {
                                setSelectedRoom(room.id);
                            }
                        });
                    } else {
                        setSelectedRoom(items[0].id);
                    }
                }
            } catch (error) {
                console.error('API 호출 중 에러 발생:', error);
            }
        };
        myRoomAPI();
    }, [dataUpdate]);

    const handleSelectRoom = (roomId: number) => {
        setSelectedRoom(Number(roomId));
        setIsDropdownOpen(false);
    };
    const [showBlockConflictModal, setShowBlockConflictModal] = useState(false);
    const handleDayClick = (dateString: string) => {
        if (reservationDatesRSC.includes(dateString)) return;

        if (customBlockDatesRSC.includes(dateString)) {
            setShowBlockConflictModal(true);
            setIsReasonChk(true);
            setIsBlockDate(dateString);
            setStartDateRSC(null);
            setEndDateRSC(null);
            setDateRangeRSC([]);
            return;
        }

        const clicked = new Date(dateString);
        const start = startDateRSC ? new Date(startDateRSC) : null;
        const end = endDateRSC ? new Date(endDateRSC) : null;

        // 1. 아무것도 선택 안 됨
        if (!start && !end) {
            setStartDateRSC(dateString);
            setEndDateRSC(dateString);
            setDateRangeRSC([dateString]);
            setIsReasonChk(false);
            setIsReasonChk(true);
            return;
        }

        // 2. 단일 선택 상태
        if (start && (!end || start.getTime() === end.getTime())) {
            if (clicked.getTime() === start.getTime()) {
                // 같은 날짜 → 리셋
                setStartDateRSC(null);
                setEndDateRSC(null);
                setDateRangeRSC([]);
                setIsReasonChk(true);
            } else if (clicked > start) {
                // 🔒 [여기서 검사]: 예약 또는 차단일 껴 있는지
                const hasConflict = (() => {
                    const temp = new Date(start);
                    temp.setDate(temp.getDate() + 1);
                    while (temp < clicked) {
                        const dateStr = temp.toISOString().split('T')[0];
                        if (customBlockDatesRSC.includes(dateStr) || reservationDatesRSC.includes(dateStr)) {
                            return true;
                        }
                        temp.setDate(temp.getDate() + 1);
                    }
                    return false;
                })();

                if (hasConflict) {
                    // ❗ 모달 띄우기
                    setShowBlockConflictModal(true);
                    setStartDateRSC(null);
                    setEndDateRSC(null);
                    setDateRangeRSC([]);
                    return;
                }

                // ✅ 통과 시 범위 설정
                const range: string[] = [];
                let current = new Date(start);
                while (current <= clicked) {
                    range.push(current.toISOString().split('T')[0]);
                    current.setDate(current.getDate() + 1);
                }
                setEndDateRSC(dateString);
                setIsReasonChk(true);
                setDateRangeRSC(range);
            } else {
                // 이전 날짜 → 단일 선택 새로 시작
                setStartDateRSC(dateString);
                setEndDateRSC(dateString);
                setDateRangeRSC([dateString]);
                setIsReasonChk(true);

            }
            return;
        }

        // 3. start < end 상태 → 다시 시작
        setStartDateRSC(dateString);
        setEndDateRSC(dateString);
        setDateRangeRSC([dateString]);
        setIsReasonChk(false);
    };

    // 나머지 로직은 기존과 동일...
    useEffect(() => {
        if (startDateRSC && endDateRSC) {
            const generateDateRange = (start: string, end: string) => {
                const startDate = dayjs(start, 'YYYY-MM-DD');
                const endDate = dayjs(end, 'YYYY-MM-DD');
                const dates: string[] = [];
                let currentDate = startDate;
                const selectedRoomData = data.find((room) => room.id === selectedRoom);
                const reservations = selectedRoomData?.unavailable_dates?.reservations || [];

                while (currentDate.isBefore(endDate) || currentDate.isSame(endDate)) {
                    const formattedDate = currentDate.format('YYYY-MM-DD');
                    const formattedDateUTC = dayjs.utc(formattedDate, 'YYYY-MM-DD');
                    const isUnavailable = reservations.some((reservation) =>
                        reservation.status &&
                        dayjs.utc(reservation.check_in_date).isSameOrBefore(formattedDateUTC, 'day') &&
                        dayjs.utc(reservation.check_out_date).isSameOrAfter(formattedDateUTC, 'day')
                    );

                    if (!isUnavailable) {
                        dates.push(formattedDate);
                    }
                    currentDate = currentDate.add(1, 'day');
                }
                return dates;
            };
            const result = generateDateRange(startDateRSC, endDateRSC);
            setDateRangeRSC(result);
        }
    }, [startDateRSC, endDateRSC, data, selectedRoom]);

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
        setCalendarKey(0);
    }, [selectedRoom, data, dataUpdate]);

    const handleSubmitBtn = async () => {
        try {
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
            setCalendarKey(prevKey => prevKey + 1);
        } catch (error) {
            console.error("실패:", error);
        }
    };

    const handleUnblockBtn = async () => {
        try {
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
            setCalendarKey(prevKey => prevKey + 1);
        } catch (error) {
            console.error("실패:", error);
        }
    };

    const hanbleCencelBtn = () => {
        setIsBlockDate('');
        setShowModal(false);
        setShowUpdateModal(false);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* 헤더 영역 */}
            <div className="bg-white border-b border-gray-200 p-6">
                <div className="relative w-full md:w-1/3" ref={dropdownRef}>
                    <button
                        type="button"
                        className="w-full flex items-center justify-between px-4 py-3 text-base
                        bg-white border border-gray-300 rounded-full cursor-pointer focus:outline-none
                        hover:border-gray-500 transition-colors shadow-sm"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                        <span className="text-gray-700 font-medium">{displayValue}</span>
                        <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${isDropdownOpen ? 'transform rotate-180' : ''}`} />
                    </button>

                    {isDropdownOpen && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                            {data.map((room) => (
                                <div
                                    key={room.id}
                                    className={`px-4 py-3 cursor-pointer transition-colors
                                    hover:bg-gray-50 
                                    ${selectedRoom === room.id ? 'bg-gray-100 text-gray-700 font-medium' : 'text-gray-700'}`}
                                    onClick={() => handleSelectRoom(room.id)}
                                >
                                    {room.title} {room.id}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* 메인 컨텐츠 */}
            <div className="flex h-[calc(100vh-140px)] ">
                {/* 캘린더 영역 */}
                <div className="flex-1 bg-white md:pb-0 pb-64 ">
                    <AirbnbStyleCalendar
                        blockDates={customBlockDatesRSC}
                        reservationDates={reservationDatesRSC}
                        locale={userLocale}
                        onDateClick={handleDayClick}
                        startDate={startDateRSC}
                        endDate={endDateRSC}
                    />
                </div>

                {/* 데스크톱 사이드바 */}
                <div className="w-80 bg-white border-l border-gray-200 p-6 flex-col hidden md:flex">
                    <div className="mb-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">예약 차단</h3>

                        {/* 선택된 날짜 */}
                        <div className="mb-6">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">선택된 날</h4>
                            {startDateRSC ? (
                                <div className="text-lg font-medium text-gray-900">
                                    {startDateRSC}
                                    {endDateRSC && ` - ${endDateRSC}`}
                                </div>
                            ) : (
                                <div className="text-gray-500">차단할 날을 선택해주세요</div>
                            )}
                        </div>

                        {/* 사용불가 처리 체크박스 */}
                        <div className="mb-6">
                            <label className="flex items-center space-x-3">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 text-gray-600 border-gray-300 rounded focus:ring-gray-400 focus:ring-1"
                                    checked={isReasonChk}
                                    onChange={(e) => setIsReasonChk(e.target.checked)}
                                    disabled={!startDateRSC || !endDateRSC}
                                />
                                <span className="text-sm font-medium text-gray-900">차단하기</span>
                            </label>
                        </div>

                        {/* 완료 버튼 */}
                        <button
                            className="w-full bg-roomi  text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:cursor-not-allowed"
                            onClick={() => setShowUpdateModal(true)}
                            disabled={!startDateRSC || !isReasonChk}
                        >
                            확인
                        </button>
                    </div>

                    {/* Base Price */}
                    {/*<div className="mb-6">*/}
                    {/*    <h4 className="text-sm font-medium text-gray-700 mb-2">Base Price</h4>*/}
                    {/*    <div className="text-2xl font-bold text-gray-900">₩66,600</div>*/}
                    {/*    <div className="text-sm text-gray-500">per night</div>*/}
                    {/*</div>*/}

                    {/* Legend */}
                    <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Legend</h4>
                        <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                                <div className="w-4 h-4 bg-gray-100 border border-gray-200 rounded"></div>
                                <span className="text-sm text-gray-600">Selected</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="w-4 h-4 bg-red-100 border border-red-200 rounded"></div>
                                <span className="text-sm text-gray-600">Unavailable</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="w-4 h-4 bg-black rounded-full"></div>
                                <span className="text-sm text-gray-600">Today</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 모바일 하단 고정 리모콘 */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 p-4 shadow-lg">
                <div className="mb-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">예약 차단</h3>

                    {/* 선택된 날짜 */}
                    <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-1">선택된 날</h4>
                        {startDateRSC ? (
                            <div className="text-base font-medium text-gray-900">
                                {startDateRSC}
                                {endDateRSC && ` - ${endDateRSC}`}
                            </div>
                        ) : (
                            <div className="text-gray-500 text-sm">날짜를 선택해주세요</div>
                        )}
                    </div>

                    {/* 사용불가 처리 체크박스 */}
                    <div className="mb-4">
                        <label className="flex items-center space-x-3">
                            <input
                                type="checkbox"
                                className="w-4 h-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
                                checked={isReasonChk}
                                onChange={(e) => setIsReasonChk(e.target.checked)}
                                disabled={!startDateRSC || !endDateRSC}
                            />
                            <span className="text-sm font-medium text-gray-900">차단하기</span>
                        </label>
                    </div>

                    {/* 완료 버튼 */}
                    <button
                        className="w-full bg-roomi text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:cursor-not-allowed"
                        onClick={() => setShowUpdateModal(true)}
                        disabled={!startDateRSC || !endDateRSC || !isReasonChk}
                    >
                        확인
                    </button>
                </div>

                {/* Base Price & Legend (모바일에서는 간소화) */}
                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                    <div>
                        <div className="text-lg font-bold text-gray-900">₩66,600</div>
                        <div className="text-xs text-gray-500">per night</div>
                    </div>
                    <div className="flex space-x-4 text-xs">
                        <div className="flex items-center space-x-1">
                            <div className="w-3 h-3 bg-gray-100 border border-gray-200 rounded"></div>
                            <span className="text-gray-600">Selected</span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <div className="w-3 h-3 bg-red-100 border border-red-200 rounded"></div>
                            <span className="text-gray-600">Unavailable</span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <div className="w-3 h-3 bg-black rounded-full"></div>
                            <span className="text-gray-600">Today</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 기존 모달들 */}
            {showModal && (
                <ConfirmationModal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    onConfirm={handleUnblockBtn}
                    title="블락을 해제하시겠습니까?"
                    confirmText="확인"
                    cancelText="취소"
                    icon="question"
                    confirmButtonStyle="primary"
                />
            )}

            {showUpdateModal && (
                <ConfirmationModal
                    isOpen={showUpdateModal}
                    onClose={() => setShowUpdateModal(false)}
                    onConfirm={handleSubmitBtn}
                    title="사용불가 처리 하시겠습니까?"
                    confirmText="확인"
                    cancelText="취소"
                    icon="warning"
                    confirmButtonStyle="primary"
                />
            )}
            {showBlockConflictModal && (
                <ConfirmationModal
                    isOpen={showBlockConflictModal}
                    onClose={() => setShowBlockConflictModal(false)}
                    onConfirm={() => setShowBlockConflictModal(false)}
                    title="선택한 범위에 예약 또는 차단일이 포함되어 있어요!"
                    confirmText="확인"
                    cancelText=""
                    icon="warning"
                    confirmButtonStyle="primary"
                />
            )}
        </div>
    );
};

export default RoomStatus;