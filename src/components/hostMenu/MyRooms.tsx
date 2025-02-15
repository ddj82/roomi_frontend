import React, {useEffect, useState} from 'react';
import {myRoomList} from "src/api/api";
import { RoomData } from "src/types/rooms";
import {faSearch} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {useNavigate} from "react-router-dom";

const MyRooms = () => {
    const navigate = useNavigate();
    const [data, setData] = useState<RoomData[]>([]);

    useEffect(() => {
        const myRoomAPI = async () => {
            try {
                const response = await myRoomList();
                const responseJson = await response.json();
                const items: RoomData[] = responseJson.data.items; // API 데이터 가져오기
                setData(items); // 상태 업데이트
                console.log('나의 방 api 리스폰스 :', items);
            } catch (error) {
                console.error('API 호출 중 에러 발생:', error);
            }
        };
        myRoomAPI();
    }, []);
    
    const handleInsertBtn = () => {
        console.log('방 등록 클릭');
        navigate("/host/insert");
    };

    return (
        <div className="w-full p-4">
            <div className="mx-auto my-5 flex md:justify-between flex-col md:flex-row">
                <div className="relative md:w-1/2">
                    <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                        <FontAwesomeIcon icon={faSearch} className="w-4 h-4 text-gray-700"/>
                    </div>
                    <input type="search"
                           className="w-full my-5 p-4 ps-10 text-sm border-[1px] border-gray-300 rounded
                           focus:ring-2 focus:ring-roomi-0 focus:border-roomi focus:outline-none"
                           placeholder="방 제목 또는 내용으로 검색해주세요." />
                </div>
                <div className="flex_center md:w-1/4">
                    <button type="button"
                            className="p-3.5 text-base text-white bg-roomi border-[1px] border-roomi rounded w-full
                            hover:text-roomi hover:bg-white focus:ring-4 focus:ring-roomi-0 focus:outline-none"
                            onClick={handleInsertBtn}>
                        + 방 등록하기
                    </button>
                </div>
            </div>
            <div>
                {data.map((room, index) => (
                    <div key={index}
                         className="flex flex-col items-center bg-white border border-gray-200 rounded-lg shadow-sm md:flex-row hover:bg-gray-100 dark:border-gray-700">
                        <div>승인상태</div>
                        <img
                            className="object-cover w-full rounded-t-lg h-96 md:h-auto md:w-48 md:rounded-none md:rounded-s-lg"
                            src={room.detail_urls?.[0]}
                            alt="thumbnail"
                        />
                        <div className="flex flex-col justify-between p-4 leading-normal">
                            <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">
                                {room.title}
                            </h5>
                            <p className="mb-3 font-normal text-gray-700">
                                {room.address}
                            </p>
                        </div>
                        <div>
                            <button>삭제</button>
                            <button>수정</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyRooms;
