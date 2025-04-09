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
        const status = reservation.status?.toUpperCase();
        const checkInDate = reservation.check_in_date ? new Date(reservation.check_in_date) : null;
        const checkOutDate = reservation.check_out_date ? new Date(reservation.check_out_date) : null;

        if (status !== 'CONFIRMED' && status !== 'IN_USE' || !checkInDate || !checkOutDate) {
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

        const status = reservation.status?.toUpperCase() || '';
        const paymentStatus = reservation.payment_status?.toUpperCase() || '';

        const badges = [];

        // Checkout request badge
        if (reservation.is_checkout_requested && !(status === 'COMPLETED' || status === 'CHECKED_OUT')) {
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
        if ((status === 'COMPLETED' || status === 'CHECKED_OUT') && paymentStatus === 'PENDING') {
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
        if (isReservationInProgress() || status === 'IN_USE') {
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
        if (status === 'CONFIRMED') {
            return reservation.payment_status?.toUpperCase() === 'UNPAID' ? '결제대기' :
                reservation.payment_status?.toUpperCase() === 'PAID' ? '결제완료' : '이용중';
        }
        if (status === 'CANCELLED') return '예약 취소';
        if (status === 'PENDING') return '예약 대기';
        if (status === 'COMPLETED') return '이용 완료';
        if (status === 'IN_USE') return '이용중';
        if (status === 'CHECKED_OUT') return '퇴실 완료';
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

        const status = reservation.status?.toUpperCase() || '';
        const paymentStatus = reservation.payment_status?.toUpperCase() || '';

        // Special case for COMPLETED + PENDING - show deposit deduction button
        if ((status === 'COMPLETED' || status === 'CHECKED_OUT') && paymentStatus === 'PENDING') {
            return (
                <button
                    onClick={() => onRefund && onRefund(reservation.id)}
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
                        onClick={() => onAccept && onAccept(reservation.id)}
                        className="flex-1 py-3 px-4 flex items-center justify-center text-white bg-roomi rounded-lg"
                    >
                        <Check className="w-4 h-4 mr-2" />
                        예약 수락
                    </button>
                    <button
                        onClick={() => onReject && onReject(reservation.id)}
                        className="flex-1 py-3 px-4 flex items-center justify-center text-white bg-gray-700 rounded-lg"
                    >
                        <X className="w-4 h-4 mr-2" />
                        예약 거절
                    </button>
                </div>
            );
        }

        // Confirmed/IN_USE and paid
        if ((status === 'CONFIRMED' || status === 'IN_USE') && paymentStatus === 'PAID') {
            if (isReservationInProgress() || status === 'IN_USE') {
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
                            onClick={() => onComplete && onComplete(reservation.id)}
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
                            onClick={() => onCancel && onCancel(reservation.id)}
                            className="flex-1 py-3 px-4 flex items-center justify-center text-white bg-red-600 rounded-lg"
                        >
                            <X className="w-4 h-4 mr-2" />
                            예약 취소
                        </button>
                    </div>
                );
            }
        }

        // Completed, Checked Out, or Cancelled: Delete button
        if (status === 'COMPLETED' || status === 'CHECKED_OUT' || status === 'CANCELLED') {
            return (
                <button
                    onClick={() => onDelete && onDelete(reservation.id)}
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
        if (!reservation || !reservation.is_checkout_requested ||
            !(isReservationInProgress() || reservation.status?.toUpperCase() === 'IN_USE')) {
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
                    <span className="text-sm">{formatDate(reservation.checkout_requested_at.toString())}</span>
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
    function nl2br(str: string ) {
        const result = [];
        const lines = str.split('\n');

        for (let i = 0; i < lines.length; i++) {
            result.push(lines[i]);
            if (i < lines.length - 1) {
                result.push(<br key={i} />);
            }
        }

        return result;
    }
    if (!reservation) return null;

    return (
        <div className="bg-white rounded-lg overflow-hidden max-w-2xl w-full mx-auto ">
            {/* Header */}
            <div className="p-6">
                {/*<div className="flex justify-between items-start">*/}
                {/*    <button*/}
                {/*        onClick={onClose}*/}
                {/*        className="p-1 rounded-full hover:bg-gray-100"*/}
                {/*    >*/}
                {/*        <X className="w-5 h-5" />*/}
                {/*    </button>*/}
                {/*</div>*/}

                {/* Room Image and Info */}
                <div className="mt-4">
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
                                    <td className="py-2 text-right">{reservation.order_id || "-"}</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="py-2 text-gray-600">예약 날짜</td>
                                    <td className="py-2 text-right">{formatDate(reservation.created_at.toString())}</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="py-2 text-gray-600">입실</td>
                                    <td className="py-2 text-right">{formatDate(reservation.check_in_date.toString())}</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="py-2 text-gray-600">퇴실</td>
                                    <td className="py-2 text-right">{formatDate(reservation.check_out_date.toString())}</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="py-2 text-gray-600">게스트 수</td>
                                    <td className="py-2 text-right">{reservation.guest_count || 1}명</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="py-2 text-gray-600">예약 상태</td>
                                    <td className="py-2 text-right">{getStatusText(reservation.status)}</td>
                                </tr>
                                <tr>
                                    <td className="py-2 text-gray-600">결제 상태</td>
                                    <td className="py-2 text-right">{getPaymentStatusText(reservation.payment_status)}</td>
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
                                    <td className="py-2 text-right">{formatDateRange(reservation.check_in_date.toString(), reservation.check_out_date.toString())}</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="py-2 text-gray-600">기본 요금</td>
                                    <td className="py-2 text-right">{formatPrice(reservation.price)}</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="py-2 text-gray-600">서비스 비용</td>
                                    <td className="py-2 text-right">{formatPrice(reservation.maintenance_fee)}</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="py-2 text-gray-600">보증금</td>
                                    <td className="py-2 text-right">{formatPrice(reservation.deposit)}</td>
                                </tr>
                                <tr className="border-t border-gray-300">
                                    <td className="py-3 text-gray-800 font-semibold">총 요금</td>
                                    <td className="py-3 text-right font-bold">{formatPrice(reservation.total_price-reservation.fee)}</td>
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
                        <div className="p-4 pt-0 border-t border-gray-200 ">
                            <div className="flex items-start">
                                <div className="flex-1">
                                    <h4 className="font-semibold text-base mt-2">{reservation.guest?.name || "게스트 정보"}</h4>

                                    {reservation.guest?.email && (
                                        <div className="flex items-center mt-2 text-sm text-gray-600">
                                            <span className="mr-2">이메일:</span>
                                            <span>{reservation.guest.email}</span>
                                        </div>
                                    )}

                                    {reservation.guest?.phone && (
                                        <div className="flex items-center mt-1 text-sm text-gray-600">
                                            <span className="mr-2">전화번호:</span>
                                            <span>{reservation.guest.phone}</span>
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={() => {/* Handle message */}}
                                    className="px-3 py-2 border border-roomi-0 text-roomi rounded-lg flex items-center mt-4"
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
                            <ChevronUp className="w-5 h-5 text-gray-500"/>
                        ) : (
                            <ChevronDown className="w-5 h-5 text-gray-500"/>
                        )}
                    </button>

                    {isPoliciesExpanded && (
                        <div className="p-4 pt-0 border-t border-gray-200">
                            <h4 className="font-semibold mb-2 mt-2">입실/퇴실</h4>
                            <p className="text-sm text-gray-700 mb-4">
                                입실: {reservation.room?.check_in_time || '15:00'},
                                퇴실: {reservation.room?.check_out_time || '11:00'}
                            </p>

                            <h4 className="font-semibold mb-2">환불 정책</h4>
                            <div className="text-sm text-gray-700 mb-4 whitespace-pre-line">
                                {reservation.room?.refund_policy
                                    ? reservation.room.refund_policy.replace(/\\n/g, '\n').split('\n').map((line, index) => (
                                        <div key={index}>{line}</div>
                                    ))
                                    : '유연한 환불 정책\n• 체크인 24시간 전까지 무료 취소\n• 체크인 24시간 전까지: 100% 환불\n• 체크인 24시간 전 ~ 당일: 50% 환불\n• 체크인 이후: 환불 불가'.split('\n').map((line, index) => (
                                        <div key={index}>{line}</div>
                                    ))
                                }
                            </div>
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