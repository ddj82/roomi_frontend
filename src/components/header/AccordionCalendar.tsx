import React, {useEffect, useState} from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import dayjs from 'dayjs';
import {useDateStore} from "src/components/stores/DateStore";
import {useTranslation} from "react-i18next";
import {faCalendarDay} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import { LuCirclePlus, LuCircleMinus } from "react-icons/lu";
import i18n from "i18next";
import './AccordionCalendar.css'; // 새로운 CSS 파일 생성

interface AccordionCalendarProps {
    onSave?: () => void; // 날짜 선택 완료 시 호출될 콜백 함수
}

const AccordionCalendar: React.FC<AccordionCalendarProps> = ({ onSave }) => {
    const {
        startDate, setStartDate,
        endDate, setEndDate,
        calUnit, setCalUnit,
        weekValue, setWeekValue
    } = useDateStore();

    const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth <= 875);
    const {t} = useTranslation();
    const [userLocale, setUserLocale] = useState(i18n.language);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 875);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleDayClick = (date: Date) => {
        const dateString = formatDate(date);
        if (calUnit) {
            if (!startDate || (startDate && endDate)) {
                setStartDate(dateString);
                setEndDate(null);
            } else {
                if (new Date(dateString) >= new Date(startDate)) {
                    setEndDate(dateString);
                } else {
                    setStartDate(dateString);
                    setEndDate(null);
                }
            }
        } else {
            weekDateSet(dateString);
        }
    };

    const weekDateSet = (dateString: string) => {
        setStartDate(dateString);
        const startDateObj = new Date(dateString);
        const endDateObj = new Date(startDateObj);
        endDateObj.setDate(startDateObj.getDate() + (weekValue * 7)); // 주 단위 계산
        const formattedEndDate = formatDate(endDateObj);
        setEndDate(formattedEndDate);
    };

    const getTileClassName = ({ date }: { date: Date }) => {
        const dateString = formatDate(date);
        if (dateString === startDate) {
            return 'start-date';
        }
        if (dateString === endDate) {
            return 'end-date';
        }
        if (startDate && endDate && date > new Date(startDate) && date < new Date(endDate)) {
            return 'in-range';
        }
        return null;
    };

    const handleConfirm = () => {
        if (startDate && endDate) {
            // 날짜 저장 시 onSave 콜백 호출
            if (onSave) {
                onSave();
            }
        }
    };

    // 날짜 문자열 변환 함수
    const formatDate = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const dayUnit = () => {
        setCalUnit(true);
        setWeekValue(1);
        setStartDate(null);
        setEndDate(null);
    };

    const weekUnit = () => {
        setCalUnit(false);
        setStartDate(null);
        setEndDate(null);
    };

    const handleWeekValue = (value: boolean) => {
        if (value) {
            // 플러스 버튼 클릭 시
            setWeekValue(prev => prev + 1);
        } else {
            // 마이너스 버튼 클릭 시
            if (weekValue === 1) return;
            setWeekValue(prev => prev - 1);
        }
    };

    useEffect(() => {
        // startDate, endDate 설정이 되어 있으면 weekDateSet 다시
        if (startDate && endDate && !calUnit) {
            weekDateSet(startDate);
        }
    }, [weekValue]);

    // 날짜 범위 표시 형식
    const getDateRangeText = () => {
        if (startDate && endDate) {
            const start = dayjs(startDate).format('YYYY-MM-DD');
            const end = dayjs(endDate).format('YYYY-MM-DD');
            return `${start} ~ ${end}`;
        }
        return t('날짜를 선택하세요');
    };

    return (
        <div className="accordion-calendar">
            <div className="calendar-header flex justify-between items-center mb-4">
                <div className="selected-dates text-sm">
                    {getDateRangeText()}
                </div>
                <div className="flex text-xs rounded-lg bg-gray-200 px-1.5 p-0.5">
                    <div className={`flex_center ${calUnit ? "bg-roomi rounded text-white" : ""}`}>
                        <button onClick={dayUnit} className="px-2.5 py-1">
                            <FontAwesomeIcon icon={faCalendarDay} className="mr-1"/>{t("일")}
                        </button>
                    </div>
                    <div className={`flex_center ${calUnit ? "" : "bg-roomi rounded text-white"}`}>
                        <button onClick={weekUnit} className="px-2.5 py-1">
                            <FontAwesomeIcon icon={faCalendarDay} className="mr-1"/>{t("주")}
                        </button>
                    </div>
                </div>
            </div>

            {!calUnit && (
                <div className="flex_center my-3">
                    <button className="text-lg" onClick={() => handleWeekValue(false)}>
                        <LuCircleMinus/>
                    </button>
                    <div className="text-xs font-bold mx-3">{weekValue}{t("주")}</div>
                    <button className="text-lg" onClick={() => handleWeekValue(true)}>
                        <LuCirclePlus />
                    </button>
                </div>
            )}

            <div className="calendar-container">
                <Calendar
                    onClickDay={handleDayClick}
                    tileClassName={getTileClassName}
                    minDate={new Date()}
                    next2Label={null}
                    prev2Label={null}
                    className="custom-calendar accordion-custom-calendar"
                    formatDay ={(locale, date) => dayjs(date).format('D')}
                    locale={userLocale}
                />
            </div>

            {startDate && endDate && (
                <button
                    className="confirm-button w-full mt-4 p-3 bg-roomi text-white rounded-lg font-medium"
                    onClick={handleConfirm}
                >
                    {t('선택 완료')}
                </button>
            )}
        </div>
    );
};

export default AccordionCalendar;