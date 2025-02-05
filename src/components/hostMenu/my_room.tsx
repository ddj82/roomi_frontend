import React, {useEffect, useState} from 'react';
import {myRoomList} from "src/api/api";
import { RoomData } from "src/types/rooms";

const MyComponent = () => {
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

    return (
        <div className="p-4">
            <div>
                {data.map((room, index) => (
                    <div key={index}
                         className="flex flex-col items-center bg-white border border-gray-200 rounded-lg shadow-sm md:flex-row hover:bg-gray-100 dark:border-gray-700">
                        <img
                            className="object-cover w-full rounded-t-lg h-96 md:h-auto md:w-48 md:rounded-none md:rounded-s-lg"
                            src={room.thumbnail_url || 'https://placehold.co/600x400'}
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
                    </div>
                    // <div
                    //     key={index}
                    //     className="bg-white border border-gray-200 rounded-xl shadow-md p-4"
                    // >
                    //     {/* 방 제목 */}
                    //     <h2 className="text-lg font-semibold mt-2">{room.title}</h2>
                    //
                    //     {/* 방 주소 */}
                    //     <p className="text-gray-500 mt-1">{room.address}</p>
                    //
                    //     {/* 수정/삭제 버튼 */}
                    //     <div className="flex justify-end space-x-2 mt-4">
                    //         <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                    //             수정
                    //         </button>
                    //         <button className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600">
                    //             삭제
                    //         </button>
                    //     </div>
                    // </div>
                ))}
            </div>
        </div>
    );
};

export default MyComponent;
