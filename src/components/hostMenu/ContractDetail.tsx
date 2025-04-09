import React, { useState } from 'react';
import { ChevronUp, ChevronDown, MessageSquare, Check, X, CheckCircle, AlertTriangle, LogOut } from 'lucide-react';
import {ReservationHistory} from "../../types/rooms";

interface ContractDetailProps {
    reservation: ReservationHistory;
    onClose: () => void;
    onAccept?: (id: number) => void;
    onReject?: (id: number) => void;
    onCancel?: (id: number) => void;
    onComplete?: (id: number) => void;
    onDelete?: (id: number) => void;
    onRefund?: (id: number) => void;
}
const ContractDetail = ({ reservation, onClose, onAccept, onReject, onCancel, onComplete, onDelete, onRefund }: ContractDetailProps) => {
    // Accordion expansion states
    const [isBasicInfoExpanded, setIsBasicInfoExpanded] = useState(true);
    const [isPricingExpanded, setIsPricingExpanded] = useState(false);
    const [isGuestInfoExpanded, setIsGuestInfoExpanded] = useState(false);
    const [isPoliciesExpanded, setIsPoliciesExpanded] = useState(false);

    // Refund input states
    const [refundAmount, setRefundAmount] = useState("");
    const [refundReason, setRefundReason] = useState("");

    // Check if the reservation is in progress
    const isReservationInProgress = () => {
        if (!reservation) return false;

        const now = new Date();
        const status = reservation.reservation.status?.toUpperCase();
        const checkInDate = reservation.reservation.check_in_date ? new Date(reservation.reservation.check_in_date) : null;
        const checkOutDate = reservation.reservation.check_out_date ? new Date(reservation.reservation.check_out_date) : null;

        if (status !== 'CONFIRMED' || !checkInDate || !checkOutDate) {
            return false;
        }

        return now > checkInDate && now < checkOutDate;
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '';

        const date = new Date(dateString);
        return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
    };

    const formatDateRange = (startDate: string, endDate:string) => {
        if (!startDate || !endDate) return '';

        return `${formatDate(startDate)} - ${formatDate(endDate)}`;
    };

    const formatPrice = (price: number) => {
        if (!price) return '0';
        return Number(price).toLocaleString() + '원';
    };

    const getStatusBadge = () => {
        if (!reservation) return null;

        const status = reservation.reservation.status?.toUpperCase() || '';
        const paymentStatus = reservation.reservation.payment_status?.toUpperCase() || '';

        const badges = [];

        // Checkout request badge
        if (reservation.reservation.is_checkout_requested && !(status === 'COMPLETED')) {
            badges.push(
                <div
                    key="checkout"
                    className="inline-block px-3 py-1 text-sm font-semibold bg-red-100 text-red-800 border border-red-300 rounded-full mr-2"
                >
                    퇴실 요청
                </div>
            );
        }

        // Refund in progress badge
        if (status === 'COMPLETED' && paymentStatus === 'PENDING') {
            badges.push(
                <div
                    key="refund"
                    className="inline-block px-3 py-1 text-sm font-semibold bg-orange-100 text-orange-800 border border-orange-300 rounded-full mr-2"
                >
                    환불 진행중
                </div>
            );
        }

        // In progress badge
        if (isReservationInProgress()) {
            badges.push(
                <div
                    key="inProgress"
                    className="inline-block px-3 py-1 text-sm font-semibold bg-blue-100 text-blue-800 border border-blue-300 rounded-full mr-2"
                >
                    이용 중
                </div>
            );
        }

        return badges.length > 0 ? <div className="mt-4 flex flex-wrap">{badges}</div> : null;
    };

    const getStatusText = (status:string) => {
        status = status?.toUpperCase() || '';
        if (status === 'CONFIRMED') return '이용중';
        if (status === 'CANCELLED') return '예약 취소';
        if (status === 'PENDING') return '예약 대기';
        if (status === 'COMPLETED') return '이용 완료';
        return '결제 대기';
    };

    const getPaymentStatusText = (status:string) => {
        status = status?.toUpperCase() || '';
        switch (status) {
            case 'PAID': return '결제 완료';
            case 'UNPAID': return '미결제';
            case 'REFUNDED': return '환불 완료';
            case 'PENDING': return '환불 처리중';
            default: return '알 수 없음';
        }
    };

    const renderActionButtons = () => {
        if (!reservation) return null;

        const status = reservation.reservation.status?.toUpperCase() || '';
        const paymentStatus = reservation.reservation.payment_status?.toUpperCase() || '';

        // Special case for COMPLETED + PENDING - show deposit deduction button
        if (status === 'COMPLETED' && paymentStatus === 'PENDING') {
            return (
                <button
                    onClick={() => onRefund && onRefund(reservation.reservation.id)}
                    className="w-full py-3 px-4 flex items-center justify-center text-white bg-orange-600 rounded-lg"
                >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    보증금 차감 설정
                </button>
            );
        }

        // Pending reservation: Accept/Reject buttons
        if (status === 'PENDING') {
            return (
                <div className="flex gap-4">
                    <button
                        onClick={() => onAccept && onAccept(reservation.reservation.id)}
                        className="flex-1 py-3 px-4 flex items-center justify-center text-white bg-roomi rounded-lg"
                    >
                        <Check className="w-4 h-4 mr-2" />
                        예약 수락
                    </button>
                    <button
                        onClick={() => onReject && onReject(reservation.reservation.id)}
                        className="flex-1 py-3 px-4 flex items-center justify-center text-white bg-gray-700 rounded-lg"
                    >
                        <X className="w-4 h-4 mr-2" />
                        예약 거절
                    </button>
                </div>
            );
        }

        // Confirmed and in progress
        if (status === 'CONFIRMED' && paymentStatus === 'PAID') {
            if (isReservationInProgress()) {
                return (
                    <div className="flex gap-4">
                        <button
                            onClick={() => {/* Handle message */}}
                            className="flex-1 py-3 px-4 flex items-center justify-center text-gray-700 border border-gray-300 rounded-lg"
                        >
                            <MessageSquare className="w-4 h-4 mr-2" />
                            메시지 보내기
                        </button>
                        <button
                            onClick={() => onComplete && onComplete(reservation.reservation.id)}
                            className="flex-1 py-3 px-4 flex items-center justify-center text-white bg-blue-600 rounded-lg"
                        >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            퇴실 확인
                        </button>
                    </div>
                );
            } else {
                // Confirmed but not in progress yet
                return (
                    <div className="flex gap-4">
                        <button
                            onClick={() => {/* Handle message */}}
                            className="flex-1 py-3 px-4 flex items-center justify-center text-gray-700 border border-gray-300 rounded-lg"
                        >
                            <MessageSquare className="w-4 h-4 mr-2" />
                            메시지 보내기
                        </button>
                        <button
                            onClick={() => onCancel && onCancel(reservation.reservation.id)}
                            className="flex-1 py-3 px-4 flex items-center justify-center text-white bg-red-600 rounded-lg"
                        >
                            <X className="w-4 h-4 mr-2" />
                            예약 취소
                        </button>
                    </div>
                );
            }
        }

        // Completed or Cancelled: Delete button
        if (status === 'COMPLETED' || status === 'CANCELLED') {
            return (
                <button
                    onClick={() => onDelete && onDelete(reservation.reservation.id)}
                    className="w-full py-3 px-4 flex items-center justify-center text-gray-700 border border-gray-300 rounded-lg"
                >
                    <X className="w-4 h-4 mr-2" />
                    예약 삭제
                </button>
            );
        }

        return null;
    };

    // Render checkout request info if applicable
    const renderCheckoutRequestInfo = () => {
        if (!reservation || !reservation.reservation.is_checkout_requested || !isReservationInProgress()) {
            return null;
        }

        return (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center mb-4">
                    <LogOut className="w-5 h-5 text-red-700 mr-2" />
                    <h3 className="text-lg font-semibold text-red-900">퇴실 요청 정보</h3>
                </div>

                <div className="flex items-center mb-4">
                    <span className="text-sm text-gray-700 mr-2">요청 시간:</span>
                    <span className="text-sm">{formatDate(reservation.reservation.checkout_requested_at.toString())}</span>
                </div>

                <button
                    onClick={() => {/* Handle checkout request details */}}
                    className="w-full py-2 px-4 bg-red-600 text-white rounded flex items-center justify-center"
                >
                    <span className="mr-2">퇴실 요청 상세보기</span>
                </button>
            </div>
        );
    };

    if (!reservation) return null;

    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-2xl w-full mx-auto">
            {/* Header */}
            <div className="p-6">
                <div className="flex justify-between items-start">
                    <h2 className="text-xl font-bold">예약 상세정보</h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-gray-100"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Room Image and Info */}
                <div className="mt-4">
                    <div className="rounded-lg overflow-hidden h-48 bg-gray-200">
                        {reservation.room?.detail_urls && reservation.room.detail_urls.length > 0 ? (
                            <img
                                src={reservation.room.detail_urls[0]}
                                alt={reservation.room?.title || "Room"}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                <span className="text-gray-400">이미지 없음</span>
                            </div>
                        )}
                    </div>

                    <h3 className="mt-4 text-lg font-semibold">{reservation.room?.title || "방 정보 없음"}</h3>
                    <p className="text-gray-600">{reservation.room?.address || "주소 정보 없음"}</p>

                    {/* Status Badges */}
                    {getStatusBadge()}
                </div>
            </div>

            {/* Accordion Sections */}
            <div className="px-6">
                {/* Basic Info Accordion */}
                <div className="border border-gray-300 rounded-lg mb-4">
                    <button
                        onClick={() => setIsBasicInfoExpanded(!isBasicInfoExpanded)}
                        className="w-full flex justify-between items-center p-4"
                    >
                        <span className="font-semibold">기본 예약 정보</span>
                        {isBasicInfoExpanded ? (
                            <ChevronUp className="w-5 h-5 text-gray-500" />
                        ) : (
                            <ChevronDown className="w-5 h-5 text-gray-500" />
                        )}
                    </button>

                    {isBasicInfoExpanded && (
                        <div className="p-4 pt-0 border-t border-gray-200">
                            <table className="w-full">
                                <tbody>
                                <tr className="border-b border-gray-100">
                                    <td className="py-2 text-gray-600">예약 번호</td>
                                    <td className="py-2 text-right">{reservation.reservation.order_id || "-"}</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="py-2 text-gray-600">예약 날짜</td>
                                    <td className="py-2 text-right">{formatDate(reservation.reservation.created_at.toString())}</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="py-2 text-gray-600">체크인</td>
                                    <td className="py-2 text-right">{formatDate(reservation.reservation.check_in_date.toString())}</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="py-2 text-gray-600">체크아웃</td>
                                    <td className="py-2 text-right">{formatDate(reservation.reservation.check_out_date.toString())}</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="py-2 text-gray-600">게스트 수</td>
                                    <td className="py-2 text-right">{reservation.reservation.guest_count || 1}명</td>
                                </tr>
                                <tr>
                                    <td className="py-2 text-gray-600">결제 상태</td>
                                    <td className="py-2 text-right">{getPaymentStatusText(reservation.reservation.payment_status)}</td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Pricing Info Accordion */}
                <div className="border border-gray-300 rounded-lg mb-4">
                    <button
                        onClick={() => setIsPricingExpanded(!isPricingExpanded)}
                        className="w-full flex justify-between items-center p-4"
                    >
                        <span className="font-semibold">요금 정보</span>
                        {isPricingExpanded ? (
                            <ChevronUp className="w-5 h-5 text-gray-500" />
                        ) : (
                            <ChevronDown className="w-5 h-5 text-gray-500" />
                        )}
                    </button>

                    {isPricingExpanded && (
                        <div className="p-4 pt-0 border-t border-gray-200">
                            <table className="w-full">
                                <tbody>
                                <tr className="border-b border-gray-100">
                                    <td className="py-2 text-gray-600">이용 기간</td>
                                    <td className="py-2 text-right">{formatDateRange(reservation.reservation.check_in_date.toString(), reservation.reservation.check_out_date.toString())}</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="py-2 text-gray-600">기본 요금</td>
                                    <td className="py-2 text-right">{formatPrice(reservation.reservation.price)}</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="py-2 text-gray-600">서비스 비용</td>
                                    <td className="py-2 text-right">{formatPrice(reservation.reservation.maintenance_fee)}</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="py-2 text-gray-600">보증금</td>
                                    <td className="py-2 text-right">{formatPrice(reservation.reservation.deposit)}</td>
                                </tr>
                                <tr className="border-t border-gray-300">
                                    <td className="py-3 text-gray-800 font-semibold">총 요금</td>
                                    <td className="py-3 text-right font-bold">{formatPrice(reservation.reservation.total_price-reservation.reservation.fee)}</td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Guest Info Accordion */}
                <div className="border border-gray-300 rounded-lg mb-4">
                    <button
                        onClick={() => setIsGuestInfoExpanded(!isGuestInfoExpanded)}
                        className="w-full flex justify-between items-center p-4"
                    >
                        <span className="font-semibold">게스트 정보</span>
                        {isGuestInfoExpanded ? (
                            <ChevronUp className="w-5 h-5 text-gray-500" />
                        ) : (
                            <ChevronDown className="w-5 h-5 text-gray-500" />
                        )}
                    </button>

                    {isGuestInfoExpanded && (
                        <div className="p-4 pt-0 border-t border-gray-200">
                            <div className="flex items-start">
                                <div className="flex-1">
                                    <h4 className="font-semibold text-base">{reservation.reservation.guest?.name || "게스트 정보"}</h4>

                                    {reservation.reservation.guest?.email && (
                                        <div className="flex items-center mt-2 text-sm text-gray-600">
                                            <span className="mr-2">이메일:</span>
                                            <span>{reservation.reservation.guest.email}</span>
                                        </div>
                                    )}

                                    {reservation.reservation.guest?.phone && (
                                        <div className="flex items-center mt-1 text-sm text-gray-600">
                                            <span className="mr-2">전화번호:</span>
                                            <span>{reservation.reservation.guest.phone}</span>
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={() => {/* Handle message */}}
                                    className="px-3 py-2 border border-roomi-0 text-roomi rounded-lg flex items-center"
                                >
                                    <MessageSquare className="w-4 h-4 mr-1" />
                                    메시지
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Policies Accordion */}
                <div className="border border-gray-300 rounded-lg mb-4">
                    <button
                        onClick={() => setIsPoliciesExpanded(!isPoliciesExpanded)}
                        className="w-full flex justify-between items-center p-4"
                    >
                        <span className="font-semibold">이용 규칙 및 환불 정책</span>
                        {isPoliciesExpanded ? (
                            <ChevronUp className="w-5 h-5 text-gray-500" />
                        ) : (
                            <ChevronDown className="w-5 h-5 text-gray-500" />
                        )}
                    </button>

                    {isPoliciesExpanded && (
                        <div className="p-4 pt-0 border-t border-gray-200">
                            <h4 className="font-semibold mb-2">체크인/체크아웃</h4>
                            <p className="text-sm text-gray-700 mb-4">
                                체크인: {reservation.room?.check_in_time || '15:00'},
                                체크아웃: {reservation.room?.check_out_time || '11:00'}
                            </p>

                            <h4 className="font-semibold mb-2">환불 정책</h4>
                            <p className="text-sm text-gray-700 whitespace-pre-line">
                                {reservation.room?.refund_policy ||
                                    '체크인 7일 전까지 취소 시 전액 환불.\n이후 취소 시 환불 불가.'}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Checkout Request Info */}
            <div className="px-6">
                {renderCheckoutRequestInfo()}
            </div>

            {/* Action Buttons */}
            <div className="p-6">
                {renderActionButtons()}
            </div>
        </div>
    );
};

export default ContractDetail;