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

    const handleRoomUpdateBtn = (roomId: number) => {
        const room = data.find((item) => item.id === roomId);
        if (!room) return;

        console.log('방수정 클릭 해당 방', room);

        navigate(`/host/update/${roomId}`, { state: { room } });
    };

    return (
        <div className="w-full h-screen flex flex-col">
            <div className="bg-white border-b border-gray-100 px-4 py-4 sm:px-5">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 sm:gap-4">

                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        <div className="flex flex-row gap-3 w-full sm:w-auto">
                            <div className="relative w-full sm:w-40" ref={dropdownRef}>
                                <button
                                    type="button"
                                    className="w-full flex items-center justify-between px-4 py-2.5 text-sm
                                        bg-white border border-gray-300 rounded-lg transition shadow-sm hover:ring-1 hover:ring-roomi transition"
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                >
                                    <span className="text-gray-700">{displayValue}</span>
                                    <ChevronDown className="w-4 h-4 text-gray-500"/>
                                </button>
                                {isDropdownOpen && (
                                    <div className="absolute z-10 w-full mt-1 bg-white rounded-lg border border-gray-200 rounder-lg shadow-lg">
                                        {conditions.map((condition) => (
                                            <div
                                                key={condition.value || 'empty'}
                                                className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 
                                                  ${roomCondition === condition.value ? 'bg-gray-100 font-medium text-roomi' : ''}`}
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

                            <div className="relative w-full sm:w-60">
                                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                    <Search className="w-4 h-4 text-gray-500"/>
                                </div>
                                <input
                                    type="search"
                                    className="w-full py-2.5 pl-10 pr-3 text-sm border border-gray-300 rounded-lg
                                        shadow-sm focus:outline-none focus:ring-1 focus:ring-roomi transition"
                                    placeholder="제목 또는 주소 입력"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="w-full sm:w-auto">
                            <button
                                type="button"
                                className="w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-white bg-roomi rounded-lg shadow hover:bg-roomi-dark transition"
                                onClick={handleInsertBtn}
                            >
                                <span className="mr-1 text-base">＋</span> 방 등록
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 스크롤될 리스트 부분 */}
            <div className="flex-1 overflow-y-auto px-4 scrollbar-hidden">
                {/* 필터링된 방 목록 */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-6">
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
                                        <button
                                            className="text-xs px-3 py-1 border border-blue-300 text-blue-700 rounded hover:bg-blue-50 transition"
                                            onClick={() => handleRoomUpdateBtn(room.id)}
                                        >
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
        </div>
    );
};

export default MyRooms;