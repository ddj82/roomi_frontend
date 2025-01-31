import React, { useEffect, useRef, useState, useCallback } from 'react';
//
// interface KakaoWebMapProps {
//     onRoomsUpdate: (rooms: any[]) => void; // 업데이트된 방 데이터 처리
// }
//
// const KakaoWebMap: React.FC<KakaoWebMapProps> = ({ onRoomsUpdate }) => {
//     const mapRef = useRef<any>(null); // 맵 참조
//     const markers = useRef<any[]>([]); // 마커들 관리
//     const debounceTimer = useRef<any>(null); // 디바운싱 처리
//     const [rooms, setRooms] = useState<any[]>([]); // 방 데이터 상태
//
//     // 디바운스된 데이터 로드 함수
//     const debouncedLoadRooms = useCallback((map: any) => {
//         if (debounceTimer.current) {
//             clearTimeout(debounceTimer.current);
//         }
//
//         debounceTimer.current = setTimeout(() => {
//             loadRoomsInBounds(map); // 지도 내 방 데이터 로드
//         }, 500);
//     }, []);
//
//     // 마커 초기화
//     const clearMarkers = () => {
//         markers.current.forEach((marker) => marker.setMap(null));
//         markers.current = [];
//     };
//
//     // 지도 내 데이터 로드
//     const loadRoomsInBounds = async (map: any) => {
//         const bounds = map.getBounds();
//         const sw = bounds.getSouthWest();
//         const ne = bounds.getNorthEast();
//
//         try {
//             const response = await fetch(
//                 `https://roomi.co.kr/api/rooms?swLat=${sw.getLat()}&swLng=${sw.getLng()}&neLat=${ne.getLat()}&neLng=${ne.getLng()}`
//             );
//
//             if (!response.ok) {
//                 throw new Error(`HTTP error! status: ${response.status}`);
//             }
//
//             const result = await response.json();
//             const roomsData = result.data?.items || [];
//             setRooms(roomsData);
//
//             // 부모 컴포넌트에 데이터 전달
//             onRoomsUpdate(roomsData);
//
//             // 지도에 마커 추가
//             updateMarkers(map, roomsData);
//         } catch (error) {
//             console.error('Error loading rooms:', error);
//             onRoomsUpdate([]); // 에러 시 빈 배열로 업데이트
//         }
//     };
//
//     // 지도에 마커 추가
//     const updateMarkers = (map: any, roomsData: any[]) => {
//         clearMarkers();
//
//         roomsData.forEach((room) => {
//             const position = new window.kakao.maps.LatLng(
//                 room.coordinate_lat,
//                 room.coordinate_long
//             );
//
//             const marker = new window.kakao.maps.Marker({
//                 position: position,
//                 map: map,
//             });
//
//             const infoWindowContent = `
//                 <div style="padding:10px;width:250px;">
//                     <h3 style="margin:0;padding:0;font-size:14px;">${room.title}</h3>
//                     <p style="margin:5px 0;font-size:13px;">
//                         주소: ${room.address}<br>
//                         가격: ${room.week_price}/주<br>
//                         보증금: ${room.deposit}<br>
//                         관리비: ${room.maintenance_fee}
//                     </p>
//                 </div>
//             `;
//
//             const infowindow = new window.kakao.maps.InfoWindow({
//                 content: infoWindowContent,
//                 removable: true,
//             });
//
//             window.kakao.maps.event.addListener(marker, 'click', () => {
//                 markers.current.forEach((m) => m.infowindow?.close());
//                 infowindow.open(map, marker);
//             });
//
//             marker.infowindow = infowindow;
//             markers.current.push(marker);
//         });
//     };
//
//     useEffect(() => {
//         const initializeMap = () => {
//             const container = document.getElementById('map');
//             const options = {
//                 center: new window.kakao.maps.LatLng(37.498095, 127.027610),
//                 level: 5,
//             };
//
//             const map = new window.kakao.maps.Map(container, options);
//             mapRef.current = map;
//
//             loadRoomsInBounds(map);
//
//             // 지도 이벤트 추가
//             window.kakao.maps.event.addListener(map, 'dragend', () => {
//                 debouncedLoadRooms(map);
//             });
//
//             window.kakao.maps.event.addListener(map, 'zoom_changed', () => {
//                 debouncedLoadRooms(map);
//             });
//
//             // 줌 컨트롤 추가
//             const zoomControl = new window.kakao.maps.ZoomControl();
//             map.addControl(zoomControl, window.kakao.maps.ControlPosition.RIGHT);
//         };
//
//         // Kakao Maps 스크립트 동적 로드
//         const script = document.createElement('script');
//         script.src =
//             '//dapi.kakao.com/v2/maps/sdk.js?appkey=85176812ff7562266360be7ddc133434&libraries=services&autoload=false';
//         script.onload = () => {
//             window.kakao.maps.load(initializeMap);
//         };
//         script.onerror = () => {
//             console.error('Kakao Maps SDK 로드 실패');
//         };
//
//         document.head.appendChild(script);
//
//         return () => {
//             if (debounceTimer.current) {
//                 clearTimeout(debounceTimer.current);
//             }
//             if (mapRef.current) {
//                 clearMarkers();
//                 mapRef.current = null;
//             }
//         };
//     }, [debouncedLoadRooms]);
//
//     return (
//         <div
//             style={{
//                 width: '100%',
//                 height: '100%',
//                 position: 'relative',
//                 overflow: 'hidden',
//             }}
//         >
//             <div
//                 id="map"
//                 style={{
//                     width: '100%',
//                     height: '100%',
//                 }}
//             />
//         </div>
//     );
// };
//
// export default KakaoWebMap;
