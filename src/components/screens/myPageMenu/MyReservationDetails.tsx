import React, {useEffect, useState} from 'react';
import {useTranslation} from "react-i18next";
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc';
import {ReservationHistory} from "../../../types/rooms";
import {faAngleDown, faAngleUp} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import AccodionItem from "../../util/AccodionItem";

dayjs.extend(utc);

interface MyReservationDetailsProps {
    reserveData: ReservationHistory,
    statusInfo: {
        backgroundColor: string;
        message: string;
    };
}

export default function MyReservationDetails({reserveData, statusInfo}: MyReservationDetailsProps) {
    const {t} = useTranslation();
    const [reservedDetails, setReservedDetails] = useState<ReservationHistory | null>(null);
    const [basicOpen, setBasicOpen] = useState(true);
    const [priceOpen, setPriceOpen] = useState(false);
    const [hostOpen, setHostOpen] = useState(false);
    const [ruleOpen, setRuleOpen] = useState(false);

    useEffect(() => {
        setReservedDetails(reserveData);
        // window.scrollTo({ top: 0, behavior: 'smooth' });
        window.scrollTo({ top: 0 });
    }, []);

    const renderStatus = (message: string) => {
        if (message === '승인대기') {
            return renderStatusUI('bg-gray-700', '예약취소');
        } else if (message === '결제대기') {
            return renderStatusUI('bg-roomi', '결제하기');
        } else if (message === '예약완료') {
            return renderStatusUI('bg-gray-500', '환불요청');
        } else if (message === '이용중') {
            return renderStatusUI('bg-gray-500', '퇴실요청');
        }else if (message === '환급대기') {
            return renderStatusUI('bg-gray-500', '환급대기');
        }
        else { // 계약종료, 예약취소
            return renderStatusUI('bg-roomi', '삭제');
        }
    };

    const renderStatusUI = (backgroundColor: string, message: string) => {
        return (
            <button type="button" className={`w-1/2 text-white p-2 rounded ${backgroundColor}`}>
                {message}
            </button>
        );
    };

    return (
        <div>
            {/*예약 정보*/}
            <div className="flex md:flex-row flex-col gap-4 bg-gray-100 my-4 rounded-lg md:p-2">
                <div className="md:w-48 md:h-36 md:mr-4">
                    <img
                        className="object-cover rounded md:rounded w-full h-full"
                        src={reservedDetails?.room.detail_urls?.[0]}
                        alt="thumbnail"
                    />
                </div>
                <div className="flex flex-col justify-center md:gap-2 md:p-0 px-4 pb-4">
                    <span className={`text-xs text-white p-1 px-2.5 rounded w-fit mb-2 ${statusInfo.backgroundColor}`}>
                        {statusInfo.message}
                    </span>
                    <div className="font-bold text-lg">{reserveData.room.title}</div>
                    <div className="font-bold text-lg">{reserveData.room.address}</div>
                </div>
            </div>
            {/*기본 정보*/}
            <div className="border border-gray-200 rounded-lg mb-4">
                <button
                    onClick={() => setBasicOpen(prev => !prev)}
                    className="w-full p-3 px-4 focus:outline-none"
                >
                    <div className="flex justify-between">
                        <div className="font-bold">기본 정보</div>
                        <div>
                            {basicOpen ? (<FontAwesomeIcon icon={faAngleUp}/>) : (
                                <FontAwesomeIcon icon={faAngleDown}/>)}
                        </div>
                    </div>
                </button>
                <AccodionItem isOpen={basicOpen}>
                    <div className="flex flex-col gap-2 text-sm p-5 text-gray-500">
                        <div className="flex justify-between">
                            <div className="font-bold">예약번호</div>
                            <div>{reserveData.order_id}</div>
                        </div>
                        <div className="flex justify-between">
                            <div className="font-bold">체크인</div>
                            <div>{dayjs.utc(reserveData.check_in_date).format('YYYY-MM-DD')}</div>
                        </div>
                        <div className="flex justify-between">
                            <div className="font-bold">체크아웃</div>
                            <div>{dayjs.utc(reserveData.check_out_date).format('YYYY-MM-DD')}</div>
                        </div>
                        <div className="flex justify-between">
                            <div className="font-bold">게스트</div>
                            <div>{reserveData.guest_count}{t('명')}</div>
                        </div>
                        <div className="flex justify-between">
                            <div className="font-bold">예약상태</div>
                            <div>{statusInfo.message}</div>
                        </div>
                        <div className="flex justify-between">
                            <div className="font-bold">예약날짜</div>
                            <div>{dayjs.utc(reserveData.created_at).format('YYYY-MM-DD')}</div>
                        </div>
                    </div>
                </AccodionItem>
            </div>
            {/*요금 정보*/}
            <div className="border border-gray-200 rounded-lg mb-4">
                <button
                    onClick={() => setPriceOpen(prev => !prev)}
                    className="w-full p-3 px-4 focus:outline-none"
                >
                    <div className="flex justify-between">
                        <div className="font-bold">요금 정보</div>
                        <div>
                            {priceOpen ? (<FontAwesomeIcon icon={faAngleUp}/>) : (
                                <FontAwesomeIcon icon={faAngleDown}/>)}
                        </div>
                    </div>
                </button>
                <AccodionItem isOpen={priceOpen}>
                    <div className="flex flex-col gap-2 text-sm p-5 text-gray-500">
                        <div className="flex justify-between">
                            <div className="font-bold">이용요금</div>
                            <div>{reserveData.symbol}{(reserveData.price_per_unit * reserveData.unit).toLocaleString()}</div>
                        </div>
                        <div className="flex justify-between">
                            <div className="font-bold">보증금</div>
                            <div>{reserveData.symbol}{reserveData.deposit.toLocaleString()}</div>
                        </div>
                        <div className="flex justify-between">
                            <div className="font-bold">관리비</div>
                            <div>{reserveData.symbol}{(reserveData.maintenance_per_unit * reserveData.unit).toLocaleString()}</div>
                        </div>
                        <div className="flex justify-between">
                            <div className="font-bold">수수료</div>
                            <div>{reserveData.symbol}{(reserveData.fee).toLocaleString()}</div>
                        </div>
                        <div className="flex justify-between">
                            <div className="font-bold">총 결제 금액</div>
                            <div>{reserveData.symbol}{reserveData.total_price.toLocaleString()}</div>
                        </div>
                    </div>
                </AccodionItem>
            </div>
            {/*호스트 정보*/}
            <div className="border border-gray-200 rounded-lg mb-4">
                <button
                    onClick={() => setHostOpen(prev => !prev)}
                    className="w-full p-3 px-4 focus:outline-none"
                >
                    <div className="flex justify-between">
                        <div className="font-bold">호스트 정보</div>
                        <div>
                            {hostOpen ? (<FontAwesomeIcon icon={faAngleUp}/>) : (
                                <FontAwesomeIcon icon={faAngleDown}/>)}
                        </div>
                    </div>
                </button>
                <AccodionItem isOpen={hostOpen}>
                    <div className="flex flex-col gap-2 text-sm p-5 text-gray-500">
                        <div className="flex gap-6">
                            <div className="flex_center">
                                <img src={reserveData.room.host_profile_image} alt="프로필사진" className="rounded-full w-16 h-16"/>
                            </div>
                            <div className="flex_center">{reserveData.room.host_name}</div>
                        </div>
                    </div>
                </AccodionItem>
            </div>
            {/*이용 규칙 및 환불 정책*/}
            <div className="border border-gray-200 rounded-lg mb-4">
                <button
                    onClick={() => setRuleOpen(prev => !prev)}
                    className="w-full p-3 px-4 focus:outline-none"
                >
                    <div className="flex justify-between">
                        <div className="font-bold">이용 규칙 및 환불 정책</div>
                        <div>
                            {ruleOpen ? (<FontAwesomeIcon icon={faAngleUp}/>) : (
                                <FontAwesomeIcon icon={faAngleDown}/>)}
                        </div>
                    </div>
                </button>
                <AccodionItem isOpen={ruleOpen}>
                    <div className="flex flex-col gap-2 text-sm p-5 text-gray-500">
                        <div className="flex flex-col">
                            <div className="font-bold mb-1">체크인/체크아웃</div>
                            <div className="text-xs">체크인: {reserveData.room.check_in_time}, 체크아웃: {reserveData.room.check_out_time}</div>
                        </div>
                        <div className="flex flex-col">
                            <div className="font-bold mb-1">환불 정책</div>
                            <div className="text-xs whitespace-pre-line">
                                {reserveData.room.refund_policy?.replace(/\\n/g, '\n')}
                            </div>
                        </div>
                    </div>
                </AccodionItem>
            </div>
            {/*버튼*/}
            <div className="flex_center mt-8">
                {renderStatus(statusInfo.message)}
            </div>
        </div>
    );
};
