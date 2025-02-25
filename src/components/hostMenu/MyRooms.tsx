import React, {useEffect, useState} from 'react';
import {myRoomList} from "src/api/api";
import { RoomData } from "src/types/rooms";
import {faSearch} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {useNavigate} from "react-router-dom";

const MyRooms = () => {
    const navigate = useNavigate();
    const [data, setData] = useState<RoomData[]>([]);
    const [filteredData, setFilteredData] = useState<RoomData[]>([]); // ✅ 필터링된 데이터
    const [searchQuery, setSearchQuery] = useState(""); // ✅ 검색어 상태
    const [roomCondition, setRoomCondition] = useState(""); // ✅ 방 상태 필터

    useEffect(() => {
        const myRoomAPI = async () => {
            try {
                const response = await myRoomList();
                const responseJson = await response.json();
                const items: RoomData[] = responseJson.data.items; // API 데이터 가져오기
                setData(items); // 상태 업데이트
                setFilteredData(items); // 필터링된 데이터 초기화
                console.log('나의 방 api 리스폰스 :', items);
            } catch (error) {
                console.error('API 호출 중 에러 발생:', error);
            }
        };
        myRoomAPI();
    }, []);

    // ✅ 방 상태를 문자열로 변환하는 함수
    const getRoomStatus = (room: RoomData) => {
        if (room.is_rejected) return "승인거절";
        if (!room.is_confirmed) return "승인대기";
        return room.is_active ? "활성" : "비활성";
    };

    // ✅ 필터링 함수 (검색어 & 승인 상태 반영)
    useEffect(() => {
        let filtered = data;

        // 🔹 검색어 필터 적용 (방 제목 or 주소)
        if (searchQuery.trim() !== "") {
            filtered = filtered.filter(
                (room) =>
                    room.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    room.address?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // 🔹 방 상태 필터 적용 (계층적으로 검사)
        if (roomCondition !== "") {
            filtered = filtered.filter((room) => getRoomStatus(room) === roomCondition);
        }

        setFilteredData(filtered);
    }, [searchQuery, roomCondition, data]);
    
    const handleInsertBtn = () => {
        console.log('방 등록 클릭');
        navigate("/host/insert");
    };

    return (
        <div className="w-full p-4">
            <div className="mx-auto my-5 flex flex-col md:justify-between md:flex-row">
                <div className="relative md:w-1/2 flex">
                    <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                        <FontAwesomeIcon icon={faSearch} className="w-4 h-4 text-gray-700"/>
                    </div>
                    <input
                        type="search"
                        className="w-2/3 ps-10 text-sm border border-gray-300 rounded
                            focus:ring-2 focus:ring-roomi-0 focus:border-roomi focus:outline-none"
                        placeholder="제목 또는 주소 입력"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <select
                        value={roomCondition}
                        onChange={(e) => setRoomCondition(e.target.value)}
                        className="border border-gray-300 rounded-md p-2 w-1/3 ml-4
                            focus:ring-2 focus:ring-roomi-0 focus:border-roomi focus:outline-none">
                        <option value="">전체</option>
                        <option value="활성">활성</option>
                        <option value="비활성">비활성</option>
                        <option value="승인대기">승인대기</option>
                        <option value="승인거절">승인거절</option>
                    </select>
                </div>
                <div className="flex_center md:w-1/4 mt-4 md:mt-0">
                    <button type="button"
                            className="p-3.5 text-base text-white bg-roomi border-[1px] border-roomi rounded w-full
                            hover:text-roomi hover:bg-white focus:ring-4 focus:ring-roomi-0 focus:outline-none"
                            onClick={handleInsertBtn}>
                        + 방 등록하기
                    </button>
                </div>
            </div>
            {/* ✅ 필터링된 방 목록 */}
            <div>
                {filteredData.length > 0 ? (
                    filteredData.map((room, index) => (
                        <div key={index}
                             className="flex flex-col items-center bg-gray-100 rounded my-4 p-4
                             md:flex-row md:py-0 md:px-4 ">
                            <div className="md:w-48 md:h-32">
                                <img
                                    className="object-cover rounded md:rounded-lg w-full h-full"
                                    src={room.detail_urls?.[0]}
                                    alt="thumbnail"
                                />
                            </div>
                            <div className="md:flex md:justify-between w-full">
                                <div className="flex flex-col justify-between leading-normal py-2 md:p-4">
                                    <div
                                        className={`p-2 mb-2 rounded text-sm w-fit text-white ${
                                            getRoomStatus(room) === "활성" ? "bg-roomi" :
                                                getRoomStatus(room) === "비활성" ? "bg-black" :
                                                    getRoomStatus(room) === "승인거절" ? "bg-red-500" : "bg-gray-500"
                                        }`}
                                    >
                                        {getRoomStatus(room)}
                                    </div>

                                    <div className="mb-2 text-2xl font-bold tracking-tight text-gray-900">
                                        {room.title}
                                    </div>
                                    <div className="mb-3 font-normal text-gray-700">
                                    {room.address}
                                    </div>
                                </div>
                                <div className="md:flex_center">
                                    <button className="bg-gray-300 rounded p-2 text-sm text-gray-700">삭제</button>
                                    <button className="bg-gray-300 rounded p-2 text-sm text-gray-700 ml-2">수정</button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center text-gray-500">🔍 검색 결과가 없습니다.</div>
                )}
            </div>
        </div>
    );
};

export default MyRooms;
