import React, {useEffect, useState} from 'react';
import Modal from 'react-modal';
import Calendar from 'react-calendar';
import 'src/css/DateModal.css';
import 'react-calendar/dist/Calendar.css'; // 스타일 파일도 import
import dayjs from 'dayjs';

interface DateModalProps {
    visible: boolean;
    onSelectDates: (dates: { startDate: string; endDate: string }) => void;
    onClose: () => void;
    position: { x: number; y: number };
}

const DateModal = ({ visible, onSelectDates, onClose, position }: DateModalProps) => {
    const [startDate, setStartDate] = useState<string | null>(null);
    const [endDate, setEndDate] = useState<string | null>(null);

    const handleDayClick = (date: Date) => {
        const dateString = formatDate(date);
        if (!startDate || (startDate && endDate)) {
            setStartDate(dateString);
            setEndDate(null);
        } else {
            if (new Date(dateString) >= new Date(startDate)) {
                setEndDate(dateString);
                onSelectDates({
                    startDate: startDate,
                    endDate: dateString,
                });
            } else {
                setStartDate(dateString);
                setEndDate(null);
            }
        }
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
            onSelectDates({ startDate, endDate });
            onClose();
        }
    };

    // 날짜 문자열 변환 함수
    const formatDate = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1 필요
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    useEffect(() => {
        if (visible) {
            document.body.style.overflow = 'hidden'; // 스크롤 방지
        } else {
            document.body.style.overflow = 'auto'; // 스크롤 복원
        }
        return () => {
            document.body.style.overflow = 'auto'; // 컴포넌트 언마운트 시 복원
        };
    }, [visible]);

    return (
        <Modal
            isOpen={visible}
            onRequestClose={onClose}
            overlayClassName="overlay"
            style={{
                content: {
                    width: '350px',
                    backgroundColor: '#FFF',
                    borderRadius: '12px',
                    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
                    position: 'absolute',
                    top: `${position.y}px`,
                    left: `${position.x}px`,
                }
            }}
            className="dateModal"
        >
            <div className="dateModal modal-container">
                <h3 className="dateModal header-text">
                    {!startDate ? '체크인 날짜를 선택하세요' :
                        !endDate ? '체크아웃 날짜를 선택하세요' :
                            `${startDate} ~ ${endDate}`}
                </h3>
                <Calendar
                    onClickDay={handleDayClick}
                    tileClassName={getTileClassName}
                    minDate={new Date()}
                    next2Label={null} // 추가로 넘어가는 버튼 제거
                    prev2Label={null} // 이전으로 돌아가는 버튼 제거
                    className="custom-calendar"
                    formatDay ={(locale, date) => dayjs(date).format('D')}
                />
                {startDate && endDate && (
                    <button className="dateModal confirm-button" onClick={handleConfirm}>
                        선택 완료
                    </button>
                )}
            </div>
        </Modal>
    );
};

export default DateModal;
