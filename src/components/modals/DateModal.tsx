import React, { useState } from 'react';
import Modal from 'react-modal';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // 스타일 파일도 import
import '../../css/DateModal.css'; // 추가적인 CSS 스타일

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
        const dateString = date.toISOString().split('T')[0];
        if (!startDate || (startDate && endDate)) {
            setStartDate(dateString);
            setEndDate(null);
        } else {
            if (new Date(dateString) >= new Date(startDate)) {
                setEndDate(dateString);
                onSelectDates({ startDate, endDate: dateString });
            } else {
                setStartDate(dateString);
                setEndDate(null);
            }
        }
    };

    const handleConfirm = () => {
        if (startDate && endDate) {
            onSelectDates({ startDate, endDate });
            onClose();
        }
    };

    return (
        <Modal
            isOpen={visible}
            onRequestClose={onClose}
            style={{
                content: {
                    width: '350px',
                    backgroundColor: '#FFF',
                    borderRadius: '12px',
                    padding: '20px',
                    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
                    position: 'absolute',
                    top: `${position.y}px`,
                    left: `${position.x}px`,
                }
            }}
        >
            <div className="dateModal modal-container">
                <h3 className="dateModal header-text">
                    {!startDate ? '체크인 날짜를 선택하세요' :
                        !endDate ? '체크아웃 날짜를 선택하세요' :
                            `${startDate} ~ ${endDate}`}
                </h3>
                <Calendar
                    onClickDay={handleDayClick}
                    value={startDate ? new Date(startDate) : undefined}
                    selectRange
                    minDate={new Date()}
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
