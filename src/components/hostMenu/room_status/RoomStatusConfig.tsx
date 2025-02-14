import React, {FC, useEffect, useState} from 'react';
import Calendar from "react-calendar";
import dayjs from "dayjs";
import {RoomData, schedules} from "src/types/rooms";
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import {createBulkBlocks, unblockDate} from "src/api/api";
import {useDataUpdate} from "src/components/auth/DataUpdateContext";

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);


const RoomStatusConfig = ({data, selectedRoom}: { data: RoomData[], selectedRoom?: string }) => {
    const [customBlockDatesRSC, setCustomBlockDatesRSC] = useState<string[]>([]);
    const [reservationDatesRSC, setReservationDatesRSC] = useState<string[]>([]);
    const [startDateRSC, setStartDateRSC] = useState<string | null>(null);
    const [endDateRSC, setEndDateRSC] = useState<string | null>(null);
    const [dateRangeRSC, setDateRangeRSC] = useState<string[]>([]);
    const [isReasonChk, setIsReasonChk] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [isBlockDate, setIsBlockDate] = useState('');
    const { dataUpdate, toggleDataUpdate } = useDataUpdate();

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
                    reservationArrRSC.push(formattedDate);
                }
                currentDate = currentDate.add(1, 'day');
            }
        });

        setCustomBlockDatesRSC(customBlockArrRSC);
        setReservationDatesRSC(reservationArrRSC);
    }, [selectedRoom, data, dataUpdate]);

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

    const handlereasonChk = (event: React.ChangeEvent<HTMLInputElement>): void => {
        setIsReasonChk(event.target.checked);
    };

    // 블락 처리 함수
    const handleSubmitBtn = async () => {
        // 사용 불가 처리 라디오가 체크면 실행
        try {
            // 현재 선택된 방의 데이터를 가져옵니다.
            const selectedRoomData = data.find((room) => room.title === selectedRoom);
            if (selectedRoomData) {
                const roomId = selectedRoomData.id;
                const dayPrice: number | null = selectedRoomData.day_price ?? null;
                const schedulesData: schedules[] = [];
                dateRangeRSC.map((date, index) => (
                    schedulesData.push({
                        "date": new Date(date),
                        "dayPrice": dayPrice,
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
        } catch (error) {
            console.error("실패:", error);
        }
    };

    // 블락 해제 함수
    const handleUnblockBtn = async () => {
        try {
            // 현재 선택된 방의 데이터를 가져옵니다.
            const selectedRoomData = data.find((room) => room.title === selectedRoom);
            if (selectedRoomData) {
                const roomId = selectedRoomData.id;
                const date = new Date(isBlockDate);
                const response = await unblockDate(roomId, date.toISOString());
                console.log(response);
                toggleDataUpdate();
            }
            setShowModal(false);
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
        <div className="flex">
            <Calendar
                minDate={new Date()}
                formatDay={(locale, date) => dayjs(date).format('D')}
                tileContent={tileContent} // 날짜별 커스텀 콘텐츠 추가
                tileClassName={tileClassName}
                onClickDay={handleDayClick}
                next2Label={null} // 추가로 넘어가는 버튼 제거
                prev2Label={null} // 이전으로 돌아가는 버튼 제거
            />
            <div className="w-[50%] flex flex-col mx-4">
                <div className="m-2">
                    {startDateRSC !== null || endDateRSC !== null ? (
                        <div>{startDateRSC} - {endDateRSC || ('?')}</div>
                    ) : (
                        <div className="text-red-600 font-bold">날짜를 선택해주세요.</div>
                    )}
                </div>

                <div className="m-2">
                    <div className="w-full flex-1 my-2 px-4 py-2 border-[1px] border-gray-300 rounded">
                        <div className="flex items-center me-4">
                            <input id="useRadio" type="radio" value="" name="useBlockRadio"
                                   className="w-4 h-4 focus:border-none"
                                   disabled={startDateRSC === null || endDateRSC === null}/>
                            <label htmlFor="useRadio" className="ms-2 text-sm text-gray-900">
                                사용가능
                            </label>
                        </div>
                        <div className="flex items-center me-4">
                            <input id="blockRadio" type="radio" value="" name="useBlockRadio"
                                   className="w-4 h-4 focus:border-none"
                                   disabled={startDateRSC === null || endDateRSC === null}/>
                            <label htmlFor="blockRadio" className="ms-2 text-sm text-gray-900">
                                사용불가 처리
                            </label>
                        </div>
                        {isReasonChk && (
                            <div>
                                <div className="text-xs">
                                    <label htmlFor="reason">사용불가 사유를 입력해주세요.</label>
                                </div>
                                <input id="reason" type="text"/>
                            </div>
                        )}
                    </div>
                    <div className="w-full flex-1 my-2 px-4 py-2 border-[1px] border-gray-300 rounded">
                        <div className="font-bold">가격 변경</div>
                        <div>
                            <input type="number" className="no-spinner pl-2 text-sm focus:outline-none"/>원
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <button className="text-white text-sm bg-roomi rounded px-4 py-1" onClick={()=>setShowUpdateModal(true)}>
                            완료
                        </button>
                    </div>
                </div>
            </div>
            {showModal && (
                <div className="fixed inset-0 z-50 flex_center w-full h-full bg-black bg-opacity-50">
                    <div className="relative p-4 w-full max-w-md bg-white rounded-lg shadow-lg">
                        <button
                            className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8"
                            onClick={() => setShowModal(false)}
                        >
                            <svg className="mx-auto w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none"
                                 viewBox="0 0 14 14">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                      d="M1 1l6 6m0 0l6 6M7 7l6-6M7 7L1 13"/>
                            </svg>
                        </button>
                        <div className="p-4 text-center">
                            <svg className="mx-auto mb-4 text-gray-400 w-12 h-12" xmlns="http://www.w3.org/2000/svg"
                                 fill="none" viewBox="0 0 20 20">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                      d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                            </svg>
                            <h3 className="mb-5 text-lg font-normal text-gray-500">
                                블락을 해제 하시겠습니까?
                            </h3>
                            <button
                                className="text-white bg-roomi hover:bg-roomi-5 focus:ring-4 focus:outline-none focus:ring-roomi-0 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5"
                                onClick={handleUnblockBtn}
                            >
                                확인
                            </button>
                            <button
                                className="py-2.5 px-5 ml-3 text-sm font-medium text-roomi bg-white border border-roomi rounded-lg hover:bg-gray-100 hover:border-roomi focus:ring-4 focus:ring-roomi-0"
                                onClick={hanbleCencelBtn}
                            >
                                취소
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showUpdateModal && (
                <div className="fixed inset-0 z-50 flex_center w-full h-full bg-black bg-opacity-50">
                    <div className="relative p-4 w-full max-w-md bg-white rounded-lg shadow-lg">
                        <button
                            className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8"
                            onClick={() => setShowModal(false)}
                        >
                            <svg className="mx-auto w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none"
                                 viewBox="0 0 14 14">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                      d="M1 1l6 6m0 0l6 6M7 7l6-6M7 7L1 13"/>
                            </svg>
                        </button>
                        <div className="p-4 text-center">
                            <svg className="mx-auto mb-4 text-gray-400 w-12 h-12" xmlns="http://www.w3.org/2000/svg"
                                 fill="none" viewBox="0 0 20 20">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                      d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                            </svg>
                            <h3 className="mb-5 text-lg font-normal text-gray-500">
                                수정 하시겠습니까?
                            </h3>
                            <button
                                className="text-white bg-roomi hover:bg-roomi-5 focus:ring-4 focus:outline-none focus:ring-roomi-0 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5"
                                onClick={handleSubmitBtn}
                            >
                                확인
                            </button>
                            <button
                                className="py-2.5 px-5 ml-3 text-sm font-medium text-roomi bg-white border border-roomi rounded-lg hover:bg-gray-100 hover:border-roomi focus:ring-4 focus:ring-roomi-0"
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
