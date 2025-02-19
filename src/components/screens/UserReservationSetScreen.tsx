import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from "react-router-dom";
import {fetchRoomData} from "../../api/api";
import {RoomData} from "../../types/rooms";
import {useTranslation} from "react-i18next";
import {useDateContext} from "../auth/DateContext";
import ImgCarousel from "../modals/ImgCarousel";

export default function UserReservationSetScreen() {
    const {roomId, locale} = useParams(); // URL 파라미터 추출
    const [room, setRoom] = useState<RoomData | null>(null);
    const {t} = useTranslation();
    const {startDate, setStartDate, endDate, setEndDate} = useDateContext();
    const navigate = useNavigate();

    useEffect(() => {
        const loadRoomData = async () => {
            if (roomId) {
                console.log(`Room ID: ${roomId}`);
                try {
                    if (locale != null) {
                        const response = await fetchRoomData(Number(roomId), locale);
                        const responseJson = await response.json();
                        const roomData = responseJson.data;
                        setRoom(roomData);
                    }
                } catch (error) {
                    console.error('방 정보 불러오기 실패:', error);
                }
            }
        };
        loadRoomData();
    }, [roomId, locale]);

    return (
        <div className="mt-8 relative overflow-visible">
            {room ? (
                <div className="flex md:flex-row flex-col">
                    <div className="md:w-3/5">
                        <div className="mb-8 text-lg font-bold">{t("예약확인")}</div>
                        <div className="flex p-4 border-[1px] border-gray-300 rounded mb-5">
                            <div className="w-2/5">
                                {room.detail_urls && room.detail_urls.length > 0 ? (
                                    <ImgCarousel images={room.detail_urls} customClass="rounded-lg h-64 md:h-[15rem]"/>
                                ) : (
                                    <img src="/default-image.jpg" alt="thumbnail"
                                         className="w-full md:h-[30rem] h-64 rounded"/>
                                )}
                            </div>
                            <div className="ml-6 my-auto">
                                <div className="my-2">{room.title}</div>
                                <div className="my-2">{room.is_verified ? ('인증숙박업소 (아이콘으로변경)') : ('')}</div>
                                <div className="my-2">{room.address}</div>
                            </div>
                        </div>
                        <div className="p-4 border-[1px] border-gray-300 rounded mb-5">
                            <div className="font-bold">
                                {t("호스트정보")}
                            </div>
                            <div className="flex">
                                <div>프사</div>
                                <div className="ml-2">{room.host_id}</div>
                            </div>
                        </div>
                        <div className="p-4 border-b-[1px] border-gray-300 mb-5">
                            <div className="font-bold">
                                {t("예약정보")}
                            </div>
                            <div className="flex justify-between">
                                <div>{t("체크인날짜")}</div>
                                <div>{startDate}</div>
                            </div>
                            <div className="flex justify-between">
                                <div>{t("체크아웃날짜")}</div>
                                <div>{endDate}</div>
                            </div>
                            <div className="flex justify-between">
                                <div>{t("사용인원")}</div>
                                <div>{t("guest_unit")}</div>
                            </div>
                        </div>
                        <div className="p-4 border-[1px] border-gray-300">
                            <div className="font-bold">
                                {t("예약자정보")}
                            </div>
                            <div>
                                <div>{t("예약자명")}</div>
                                <input type="text" className="focus:outline-none pl-1"/>
                            </div>
                            <div>
                                <div>{t("전화번호")}</div>
                                <input type="tel" className="focus:outline-none pl-1"/>
                            </div>
                            <div>
                                <div>{t("이메일")}</div>
                                <input type="email" className="focus:outline-none pl-1"/>
                            </div>
                        </div>
                    </div>

                    {/*리모컨 영역*/}
                    <div className="border-[1px] border-gray-300 p-4 break-words
                        md:w-1/3 md:ml-auto md:h-fit md:sticky md:top-10 md:rounded-lg
                        w-full fixed bottom-0 bg-white z-[100]">
                        <div className="font-bold">
                            {t("payment_info")}
                        </div>
                        <div className="p-4 rounded-lg bg-gray-100">
                            <div className="flex justify-between">
                                <div></div>
                                <div>값</div>
                            </div>
                            <div className="flex justify-between">
                                <div>{t("deposit")}</div>
                                <div>값</div>
                            </div>
                            <div className="flex justify-between">
                                <div>{t("service_charge")}</div>
                                <div>값</div>
                            </div>
                            <div className="flex justify-between">
                                <div>{t("cleaning_fee")}</div>
                                <div>값</div>
                            </div>
                            <div className="flex justify-between border-t border-white">
                                <div>{t("총결제금액")}</div>
                                <div>값</div>
                            </div>
                        </div>
                        <div>
                            계약 요청이 승인되기 전까지 요금이 결제 되지 않습니다.
                            ✔ [ ] 방 예약 내용을 확인했습니다.
                            ✔ [ ] 서비스 약관, 결제 서비스 약관, 개인정보 처리방침에 동의합니다.
                            ✔ [ ] 마케팅 이메일 수신에 동의합니다. (선택 사항)
                        </div>
                        <div className="mt-4">
                            <button className="w-full py-2 bg-roomi rounded text-white"
                            >
                                계약 요청하기
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center">
                    <div role="status">
                        <svg aria-hidden="true"
                             className="inline w-8 h-8 text-gray-300 animate-spin fill-roomi"
                             viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                fill="currentColor"/>
                            <path
                                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                fill="currentFill"/>
                        </svg>
                        <span className="sr-only">로딩중...</span>
                    </div>
                </div>
            )}
        </div>
    );
};
