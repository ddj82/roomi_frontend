import React, {useRef} from 'react';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    faCalendarDay,
    faChevronDown,
    faLocationDot,
    faSearch,
    faTimes,
    faUserPlus
} from "@fortawesome/free-solid-svg-icons";
import dayjs from "dayjs";
import AccordionCalendar from "./AccordionCalendar";
import Modal from "react-modal";
import {useTranslation} from "react-i18next";
import {useLocationStore} from "../stores/LocationStore";
import {useDateStore} from "../stores/DateStore";
import {useGuestsStore} from "../stores/GuestsStore";
import '../../css/SearchModal.css';

type LocationOption = {
    name: string;
    country: string;
};

type ActiveCardType = 'location' | 'date' | 'guests' | null;

interface SearchBarProps {
    visible: boolean,
    onClose: () => void,
    openSearchModal: () => void,
    closeSearchModal: () => void,
    toggleCard: (cardName: ActiveCardType) => void,
    activeCard: "location" | "date" | "guests" | null,
    performSearch: () => void,
    handleSelectLocation: (location: LocationOption) => void
}

export const SearchBar: React.FC<SearchBarProps> = ({
                                                        visible,
                                                        onClose,
                                                        openSearchModal,
                                                        closeSearchModal,
                                                        toggleCard,
                                                        activeCard,
                                                        performSearch,
                                                        handleSelectLocation
                                                    }) => {
    const {t} = useTranslation();
    const modalRef = useRef<HTMLDivElement>(null);
    const {startDate, endDate,} = useDateStore();
    const {guestCount, setGuestCount} = useGuestsStore();
    const {selectedLocation, setSelectedLocation} = useLocationStore();

    // 위치 옵션 데이터
    const locationOptions: LocationOption[] = [
        {name: 'Seoul', country: '대한민국'},
        {name: 'Busan', country: '대한민국'},
        {name: 'Jeju', country: '대한민국'},
        {name: 'Daejeon', country: '대한민국'}
    ];

    return (
        <Modal
            isOpen={visible}
            onRequestClose={onClose}
            overlayClassName="overlay-searchBar"
            className="w-1/2 h-[100vh] overflow-auto focus:outline-none scrollbar-hidden"
        >
            <div className="search-modal inset-0 bg-white bg-opacity-95 z-[9999] overflow-y-auto">
                <div className="container mx-auto px-4 py-6 md:max-w-2xl lg:max-w-3xl">
                    {/* 모달 헤더 */}
                    <div className="flex items-center mb-6">
                        <button
                            className="p-2 rounded-full hover:bg-gray-100"
                            onClick={closeSearchModal}
                        >
                            <FontAwesomeIcon icon={faTimes} className="text-gray-800"/>
                        </button>
                        <h1 className="text-xl font-semibold text-center flex-1">{t('Search')}</h1>
                        <div className="w-8"></div>
                        {/* 정렬을 위한 여백 */}
                    </div>

                    <div ref={modalRef} className="search-content pb-20">
                        {/* 위치 선택 카드 */}
                        <div
                            className={`search-card bg-white rounded-xl shadow-md border border-gray-200 mb-4 overflow-hidden transition-all duration-300 ${activeCard !== 'location' ? 'search-card-collapsed' : ''}`}
                        >
                            {/* 카드 헤더 - 클릭 시 접기/펼치기 */}
                            <div
                                className="p-4 flex justify-between items-center cursor-pointer"
                                onClick={() => toggleCard('location')}
                            >
                                <div className="flex items-center">
                                    <FontAwesomeIcon icon={faLocationDot} className="text-roomi text-lg mr-3"/>
                                    <div>
                                        <h2 className="text-lg font-semibold">{t('Where')}</h2>
                                        <p className="text-sm text-gray-500">
                                            {selectedLocation || t('Add destination')}
                                        </p>
                                    </div>
                                </div>
                                <FontAwesomeIcon
                                    icon={faChevronDown}
                                    className={`transition-transform duration-300 ${activeCard === 'location' ? 'transform rotate-180' : ''}`}
                                />
                            </div>

                            {/* 카드 내용 - 접기/펼치기 */}
                            <div
                                className={`search-card-content p-4 ${activeCard === 'location' ? 'block' : 'hidden'}`}>
                                <div className="search-input-container p-3 bg-gray-50 rounded-xl mb-4">
                                    <div className="flex items-center">
                                        <FontAwesomeIcon icon={faSearch}
                                                         className="text-gray-400 text-lg mr-3"/>
                                        <input
                                            type="text"
                                            className="flex-1 outline-none border-none text-base bg-transparent"
                                            placeholder={t('Where are you going?')}
                                            value={selectedLocation || ''}
                                            onChange={(e) => setSelectedLocation(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="popular-locations">
                                    <h3 className="text-md font-medium mb-3">{t('Popular destinations')}</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        {locationOptions.map((location, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer border border-gray-100"
                                                onClick={() => handleSelectLocation(location)}
                                            >
                                                <FontAwesomeIcon icon={faLocationDot}
                                                                 className="text-gray-400 mr-3"/>
                                                <div>
                                                    <p className="font-medium">{t(location.name.toLowerCase())}</p>
                                                    <p className="text-sm text-gray-500">{t(location.country)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 날짜 선택 카드 */}
                        <div
                            className={`search-card bg-white rounded-xl shadow-md border border-gray-200 mb-4 overflow-hidden transition-all duration-300 ${activeCard !== 'date' ? 'search-card-collapsed' : ''}`}
                        >
                            {/* 카드 헤더 - 클릭 시 접기/펼치기 */}
                            <div
                                className="p-4 flex justify-between items-center cursor-pointer"
                                onClick={() => toggleCard('date')}
                            >
                                <div className="flex items-center">
                                    <FontAwesomeIcon icon={faCalendarDay} className="text-roomi text-lg mr-3"/>
                                    <div>
                                        <h2 className="text-lg font-semibold">{t('When')}</h2>
                                        <p className="text-sm text-gray-500">
                                            {(startDate && endDate)
                                                ? `${dayjs(startDate).format('MM-DD')} ~ ${dayjs(endDate).format('MM-DD')}`
                                                : t('Add dates')}
                                        </p>
                                    </div>
                                </div>
                                <FontAwesomeIcon
                                    icon={faChevronDown}
                                    className={`transition-transform duration-300 ${activeCard === 'date' ? 'transform rotate-180' : ''}`}
                                />
                            </div>

                            {/* 카드 내용 - 접기/펼치기 */}
                            <div
                                className={`search-card-content p-4 ${activeCard === 'date' ? 'block' : 'hidden'}`}>
                                <AccordionCalendar onSave={() => toggleCard('guests')}/>
                            </div>
                        </div>

                        {/* 인원 선택 카드 */}
                        <div
                            className={`search-card bg-white rounded-xl shadow-md border border-gray-200 mb-4 overflow-hidden transition-all duration-300 ${activeCard !== 'guests' ? 'search-card-collapsed' : ''}`}
                        >
                            {/* 카드 헤더 - 클릭 시 접기/펼치기 */}
                            <div
                                className="p-4 flex justify-between items-center cursor-pointer"
                                onClick={() => toggleCard('guests')}
                            >
                                <div className="flex items-center">
                                    <FontAwesomeIcon icon={faUserPlus} className="text-roomi text-lg mr-3"/>
                                    <div>
                                        <h2 className="text-lg font-semibold">{t('Who')}</h2>
                                        <p className="text-sm text-gray-500">
                                            {guestCount > 0
                                                ? `${t('guest')} ${guestCount}${t('guest_unit')}`
                                                : t('Add guests')}
                                        </p>
                                    </div>
                                </div>
                                <FontAwesomeIcon
                                    icon={faChevronDown}
                                    className={`transition-transform duration-300 ${activeCard === 'guests' ? 'transform rotate-180' : ''}`}
                                />
                            </div>

                            {/* 카드 내용 - 접기/펼치기 */}
                            <div
                                className={`search-card-content p-4 ${activeCard === 'guests' ? 'block' : 'hidden'}`}>
                                <div className="guests-picker-container p-4 bg-gray-50 rounded-xl">
                                    <div className="flex justify-between items-center py-2">
                                        <div>
                                            <h4 className="font-medium">{t('Adults')}</h4>
                                            <p className="text-sm text-gray-500">{t('Age 13+')}</p>
                                        </div>
                                        <div className="flex items-center">
                                            <button
                                                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center bg-white"
                                                onClick={() => setGuestCount(prev => (prev > 0 ? prev - 1 : 0))}
                                                disabled={guestCount <= 0}
                                            >
                                                <span className="text-lg">-</span>
                                            </button>
                                            <span className="mx-4 w-6 text-center">{guestCount}</span>
                                            <button
                                                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center bg-white"
                                                onClick={() => setGuestCount(prev => prev + 1)}
                                            >
                                                <span className="text-lg">+</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 하단 검색 버튼 */}
                    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-gray-200">
                        <div className="mx-auto md:max-w-2xl lg:max-w-3xl">
                            <button
                                className="w-full p-3 md:p-2 bg-roomi hover:bg-roomi-3 text-white rounded-lg font-medium md:text-sm lg:text-base"
                                onClick={performSearch}
                            >
                                {t('Search')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};
