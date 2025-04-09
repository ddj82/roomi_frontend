import React, {useEffect, useState, useRef} from 'react';
import {myRoomList} from "src/api/api";
import { RoomData } from "src/types/rooms";
import {useNavigate} from "react-router-dom";
import { Search, ChevronDown } from 'lucide-react'; // Modern icon library instead of FontAwesome

const MyRooms = () => {
    const navigate = useNavigate();
    const [data, setData] = useState<RoomData[]>([]);
    const [filteredData, setFilteredData] = useState<RoomData[]>([]); // ✅ 필터링된 데이터
    const [searchQuery, setSearchQuery] = useState(""); // ✅ 검색어 상태
    const [roomCondition, setRoomCondition] = useState(""); // ✅ 방 상태 필터
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // 드롭다운 옵션 정의
    const conditions = [
        { value: '', label: '전체' },
        { value: '활성', label: '활성' },
        { value: '비활성', label: '비활성' },
        { value: '승인대기', label: '승인대기' },
        { value: '승인거절', label: '승인거절' }
    ];

    // 현재 선택된 조건의 라벨 표시
    const displayValue = roomCondition ?
        conditions.find(item => item.value === roomCondition)?.label :
        '전체';

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

    // 드롭다운 외부 클릭 시 닫기
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleInsertBtn = () => {
        console.log('방 등록 클릭');
        navigate("/host/insert");
    };

    return (
        <div className="w-full p-4">
            <div className="mx-auto my-5 flex flex-col gap-4 w-full">
                {/* 모바일/웹 공통 레이아웃 - 드롭다운, 검색창, 버튼 배치 */}
                <div className="w-full flex flex-col sm:flex-row gap-3">
                    {/* 등록 버튼 - 왼쪽에 배치 (모바일에서는 아래) */}
                    <div className="w-full sm:w-1/6 order-last sm:order-last">
                        <button
                            type="button"
                            className="w-full py-3 px-4 text-base font-medium text-white bg-roomi rounded-lg
                        focus:outline-none flex items-center justify-center"
                            onClick={handleInsertBtn}
                        >
                            <span className="mr-1">+</span> 방 등록
                        </button>
                    </div>

                    {/* 커스텀 드롭다운 - 크기 줄임 */}
                    <div className="relative w-full sm:w-1/6" ref={dropdownRef}>
                        <button
                            type="button"
                            className="w-full flex items-center justify-between px-3 py-3 text-base
                      bg-white border rounded-lg cursor-pointer"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        >
                            <span className="text-gray-700">{displayValue}</span>
                            <ChevronDown className="w-5 h-5 text-gray-500"/>
                        </button>

                        {/* 드롭다운 메뉴 */}
                        {isDropdownOpen && (
                            <div
                                className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                                {conditions.map((condition) => (
                                    <div
                                        key={condition.value || 'empty'}
                                        className={`px-4 py-3 cursor-pointer hover:bg-roomi-000 rounded-lg
                                        ${roomCondition === condition.value ? 'bg-roomi-1' : ''}`}
                                        onClick={() => {
                                            setRoomCondition(condition.value);
                                            setIsDropdownOpen(false);
                                        }}
                                    >
                                        {condition.label}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 검색창 - 크기 줄임 */}
                    <div className="relative w-full sm:w-2/6">
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
                    <div className="relative w-full sm:w-2/6">

                    </div>
                </div>
            </div>

            {/* 필터링된 방 목록 */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredData.length > 0 ? (
                    filteredData.map((room, index) => (
                        <div
                            key={index}
                            className="flex flex-col border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow duration-300"
                        >
                            <div className="w-full h-64 rounded-md overflow-hidden mb-3">
                                <img
                                    className="object-cover w-full h-full"
                                    src={room.detail_urls?.[0]}
                                    alt="thumbnail"
                                />
                            </div>

                            <div className="flex-1 flex flex-col justify-between w-full">
                                <div>
                                <span
                                    className={`inline-block px-2 py-1 text-xs font-semibold rounded 
                                    ${getRoomStatus(room) === "활성"
                                        ? "bg-blue-100 text-blue-700"
                                        : getRoomStatus(room) === "비활성"
                                            ? "bg-gray-100 text-gray-700"
                                            : getRoomStatus(room) === "승인거절"
                                                ? "bg-red-100 text-red-700"
                                                : "bg-yellow-100 text-yellow-800"
                                    }`}
                                >
                                    {getRoomStatus(room)}
                                </span>
                                    <div className="mt-1 text-base font-semibold text-gray-900">
                                        {room.title}
                                    </div>
                                    <div className="text-sm text-gray-500">{room.address}</div>
                                    <div className="text-sm text-gray-500">
                                        ￦{room.week_price?.toLocaleString()}/주
                                    </div>
                                </div>

                                <div className="mt-3 flex space-x-2">
                                    <button className="text-xs px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 transition">
                                        삭제
                                    </button>
                                    <button className="text-xs px-3 py-1 border border-blue-300 text-blue-700 rounded hover:bg-blue-50 transition">
                                        수정
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center bg-gray-50 rounded-lg p-10 mt-6 col-span-full">
                        <div className="text-gray-500 text-lg">🔍 검색 결과가 없습니다.</div>
                        <div className="text-gray-400 mt-2">다른 검색어나 필터를 사용해보세요.</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyRooms;