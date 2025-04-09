import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from "react-i18next";
import { myContractList, myRoomList } from "../../api/api";
import { ReservationHistory, RoomData } from "../../types/rooms";
import { Search, ChevronDown, X } from 'lucide-react';
import ReservationDetail from './ContractDetail';

const ContractManagement = () => {
    const { t } = useTranslation();
    const [reservations, setReservations] = useState<ReservationHistory[]>([]);
    const [filteredReservations, setFilteredReservations] = useState<ReservationHistory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("current"); // "current" or "past"

    // Room data for room title filtering
    const [rooms, setRooms] = useState<RoomData[]>([]);
    const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
    const [isRoomDropdownOpen, setIsRoomDropdownOpen] = useState(false);
    const roomDropdownRef = useRef<HTMLDivElement>(null);

    // Search query for additional filtering
    const [searchQuery, setSearchQuery] = useState("");

    // Selected reservation for detail view
    const [selectedReservation, setSelectedReservation] = useState<ReservationHistory | null>(null);

    useEffect(() => {
        fetchReservations();
        fetchRooms();
    }, []);

    // Filter reservations when activeTab or filters change
    useEffect(() => {
        filterReservations();
    }, [activeTab, reservations, selectedRoomId, searchQuery]);

    // Handle clicks outside dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (roomDropdownRef.current && !roomDropdownRef.current.contains(event.target as Node)) {
                setIsRoomDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const fetchReservations = async () => {
        setIsLoading(true);
        try {
            const response = await myContractList();
            const responseJson = await response.json();
            const items = responseJson.data;
            setReservations(items);
            console.log('Reservation data loaded:', items);
        } catch (error: unknown) {
            console.error('Failed to load reservation data:', error);
            setError(error instanceof Error ? error.message : 'Error loading reservation data.');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchRooms = async () => {
        try {
            const response = await myRoomList();
            const responseJson = await response.json();
            const items: RoomData[] = responseJson.data.items;
            setRooms(items);
            console.log('방 데이터 로드:', items);
        } catch (error) {
            console.error('방 데이터 로드 실패:', error);
        }
    };

    const filterReservations = () => {
        if (!reservations || reservations.length === 0) {
            setFilteredReservations([]);
            return;
        }

        let filtered = [...reservations];

        // Filter by tab (only two tabs now: current or past)
        if (activeTab === "current") {
            // Current: CONFIRMED and PENDING that are not completed or cancelled
            filtered = filtered.filter(res => {
                const status = res.status.toUpperCase() || '';
                return status !== 'COMPLETED' && status !== 'CANCELLED';
            });
        } else if (activeTab === "past") {
            // Past: COMPLETED or CANCELLED
            filtered = filtered.filter(res => {
                const status = res.status.toUpperCase() || '';
                return status === 'COMPLETED' || status === 'CANCELLED';
            });
        }

        // Filter by selected room
        if (selectedRoomId) {
            filtered = filtered.filter(res =>
                res.room?.id === selectedRoomId
            );
        }

        // Filter by search query (room title or address)
        if (searchQuery.trim() !== "") {
            filtered = filtered.filter(res =>
                res.room?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                res.room?.address?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredReservations(filtered);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '';

        const date = new Date(dateString);
        return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
    };

    const formatDateRange = (startDate?: string, endDate?: string) => {
        if (!startDate || !endDate) return '';

        const start = formatDate(startDate);
        const end = formatDate(endDate);

        return `${start} - ${end}`;
    };

    const formatPrice = (price: number | undefined) => {
        if (!price) return '0';
        return Number(price).toLocaleString();
    };

    const getStatusElement = (reservation: ReservationHistory) => {
        const status = reservation.status?.toUpperCase() || '';
        const paymentStatus = reservation.payment_status?.toUpperCase() || '';

        // Status badges mapping
        if (status === 'CONFIRMED' && paymentStatus === 'PAID') {
            return <span className="text-sm font-medium px-3 py-1 bg-green-100 text-green-800 rounded-full">이용중</span>;
        } else if (status === 'CANCELLED') {
            return <span className="text-sm font-medium px-3 py-1 bg-red-100 text-red-800 rounded-full">예약 취소</span>;
        } else if (status === 'PENDING') {
            return <span className="text-sm font-medium px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full">예약 대기</span>;
        } else if (status === 'COMPLETED') {
            return <span className="text-sm font-medium px-3 py-1 bg-blue-100 text-blue-800 rounded-full">이용 완료</span>;
        }

        // Default case
        return <span className="text-sm font-medium px-3 py-1 bg-gray-100 text-gray-800 rounded-full">결제 대기</span>;
    };

    const getButtonLabel = (status: string) => {
        status = status.toUpperCase();
        if (status === 'CONFIRMED') return '이용중';
        if (status === 'CANCELLED') return '예약 취소';
        if (status === 'PENDING') return '예약 대기';
        if (status === 'COMPLETED') return '이용 완료';
        return '결제 대기';
    };

    const getButtonColor = (status: string) => {
        status = status.toUpperCase();
        if (status === 'CONFIRMED') return 'bg-green-500';
        if (status === 'CANCELLED') return 'bg-red-500';
        if (status === 'PENDING') return 'bg-yellow-500';
        if (status === 'COMPLETED') return 'bg-blue-500';
        return 'bg-gray-500';
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 max-w-md mx-auto mt-10">
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Handlers for reservation actions
    const handleAcceptReservation = (id: number) => {
        console.log('Accept reservation', id);
        // Implement API call to accept reservation
        // After successful API call, refresh reservations
        // fetchReservations();
        setSelectedReservation(null);
    };

    const handleRejectReservation = (id: number) => {
        console.log('Reject reservation', id);
        // Implement API call
        setSelectedReservation(null);
    };

    const handleCancelReservation = (id: number) => {
        console.log('Cancel reservation', id);
        // Implement API call
        setSelectedReservation(null);
    };

    const handleCompleteReservation = (id: number) => {
        console.log('Complete reservation', id);
        // Implement API call
        setSelectedReservation(null);
    };

    const handleDeleteReservation = (id: number) => {
        console.log('Delete reservation', id);
        // Implement API call
        setSelectedReservation(null);
    };

    const handleRefundDeduction = (id: number) => {
        console.log('Handle refund deduction', id);
        // Implement API call
        setSelectedReservation(null);
    };

    return (
        <div className="w-full p-4">
            <div className="mx-auto my-5 flex flex-col gap-4 w-full">
                {/* Filter and Search Section - Using MyRooms styling */}
                <div className="w-full flex flex-col sm:flex-row gap-3">
                    {/* Search Input */}
                    <div className="relative flex-grow">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                            <Search className="w-4 h-4 text-gray-500"/>
                        </div>
                        <input
                            type="search"
                            className="w-full py-3 pl-10 pr-3 text-base border border-gray-200 rounded-lg
                            shadow-sm focus:outline-none"
                            placeholder="제목 또는 주소 입력"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Room Title Dropdown */}
                    <div className="relative w-full sm:w-1/3" ref={roomDropdownRef}>
                        <button
                            type="button"
                            className="w-full flex items-center justify-between px-3 py-3 text-base
                            bg-white border border-roomi-0 rounded-lg cursor-pointer"
                            onClick={() => setIsRoomDropdownOpen(!isRoomDropdownOpen)}
                        >
                            <span className="text-gray-700">
                                {selectedRoomId
                                    ? rooms.find(room => room.id === selectedRoomId)?.title || '선택된 방'
                                    : '방 선택'}
                            </span>
                            <ChevronDown className="w-5 h-5 text-gray-500" />
                        </button>

                        {/* Room Dropdown Menu */}
                        {isRoomDropdownOpen && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                <div
                                    className={`px-4 py-3 cursor-pointer hover:bg-roomi-000 
                                    ${!selectedRoomId ? 'bg-roomi-1' : ''}`}
                                    onClick={() => {
                                        setSelectedRoomId(null);
                                        setIsRoomDropdownOpen(false);
                                    }}
                                >
                                    전체 방
                                </div>
                                {rooms.map((room) => (
                                    <div
                                        key={room.id}
                                        className={`px-4 py-3 cursor-pointer hover:bg-roomi-000 
                                        ${selectedRoomId === room.id ? 'bg-roomi-1' : ''}`}
                                        onClick={() => {
                                            setSelectedRoomId(room.id || null);
                                            setIsRoomDropdownOpen(false);
                                        }}
                                    >
                                        {room.title}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Tab Navigation - Simplified to 2 tabs */}
                <div className="flex border-b mt-4 mb-6">
                    <button
                        className={`pb-3 px-6 ${activeTab === "current"
                            ? "text-black border-b-2 border-black font-medium"
                            : "text-gray-500"}`}
                        onClick={() => setActiveTab("current")}
                    >
                        현재 예약
                    </button>
                    <button
                        className={`pb-3 px-6 ${activeTab === "past"
                            ? "text-black border-b-2 border-black font-medium"
                            : "text-gray-500"}`}
                        onClick={() => setActiveTab("past")}
                    >
                        지난 예약
                    </button>
                </div>

                {/* Reservation List */}
                {filteredReservations.length === 0 ? (
                    <div className="text-center bg-gray-50 rounded-lg p-10 mt-6">
                        <div className="text-gray-500 text-lg">🔍 검색 결과가 없습니다.</div>
                        <div className="text-gray-400 mt-2">다른 검색어나 필터를 사용해보세요.</div>
                    </div>
                ) : (
                    <div className="mt-6 grid grid-cols-1 gap-6">
                        {filteredReservations.map((reservation) => (
                            <div
                                key={reservation.id}
                                className="bg-white rounded-lg overflow-hidden flex flex-col border border-gray-200 shadow-sm hover:shadow transition-shadow cursor-pointer"
                                onClick={() => setSelectedReservation(reservation)}
                            >
                                <div className="flex">
                                    {/* Thumbnail */}
                                    <div className="w-32 h-32 bg-gray-200 flex-shrink-0">
                                        {reservation.room?.detail_urls && reservation.room.detail_urls.length > 0 && (
                                            <img
                                                src={reservation.room.detail_urls[0]}
                                                alt={reservation.room?.title || "Room"}
                                                className="w-full h-full object-cover"
                                            />
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 p-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-medium text-base mb-1">
                                                    {reservation.room?.title || "Unnamed Room"}
                                                </h3>
                                                <p className="text-sm text-gray-600 mb-2">
                                                    {reservation.room?.address || "No address provided"}
                                                </p>
                                                <p className="text-sm text-gray-800">
                                                    총 금액: {formatPrice(reservation.total_price)}원
                                                </p>
                                            </div>
                                            <div className="ml-2">
                                                <div className="flex justify-end">
                                                    <span className="text-sm text-gray-500">
                                                        {formatDateRange(
                                                            reservation.check_in_date?.toString(),
                                                            reservation.check_out_date?.toString()
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="flex justify-end mt-2">
                                                    {getStatusElement(reservation)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action button */}
                                <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex justify-end">
                                    <button
                                        className={`px-3 py-1 ${getButtonColor(reservation.status || '')} text-white text-sm rounded`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedReservation(reservation);
                                        }}
                                    >
                                        {getButtonLabel(reservation.status || '')}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Reservation Detail Modal */}
            {selectedReservation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <ReservationDetail
                        reservation={selectedReservation}
                        onClose={() => setSelectedReservation(null)}
                        onAccept={handleAcceptReservation}
                        onReject={handleRejectReservation}
                        onCancel={handleCancelReservation}
                        onComplete={handleCompleteReservation}
                        onDelete={handleDeleteReservation}
                        onRefund={handleRefundDeduction}
                    />
                </div>
            )}
        </div>
    );
};

export default ContractManagement;