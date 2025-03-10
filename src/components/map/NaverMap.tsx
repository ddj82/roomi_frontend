import React, { useCallback, useEffect, useRef } from 'react';
import { ApiResponse, RoomData } from "src/types/rooms";
import i18n from "../../i18n";

// naver.maps 타입을 명시적으로 선언
declare global {
    interface Window {
        naver: any;
    }
}

interface NaverMapViewProps {
    onRoomsUpdate: (rooms: RoomData[]) => void;
}

const NaverMap = ({ onRoomsUpdate }: NaverMapViewProps) => {
    const markers = useRef<any[]>([]);
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);
    const mapRef = useRef<any>(null);

    // 마커 초기화
    const clearMarkers = () => {
        markers.current.forEach(marker => marker.setMap(null));
        markers.current = [];
    };

    // 지도 영역 내 데이터 로드 (디바운스 적용)
    const debouncedLoadRooms = useCallback((map: any) => {
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }
        debounceTimer.current = setTimeout(() => {
            loadRoomsInBounds(map);
        }, 500);
    }, []);

    const loadRoomsInBounds = async (map: any) => {
        const bounds = map.getBounds(); // 네이버 지도에서는 getBounds() 사용
        const sw = bounds.getSW(); // 남서쪽 좌표
        const ne = bounds.getNE(); // 북동쪽 좌표
        const currentLocale = i18n.language; // 현재 언어 감지

        try {
            const response = await fetch(
                `https://roomi.co.kr/api/rooms?swLat=${sw.y}&swLng=${sw.x}&neLat=${ne.y}&neLng=${ne.x}&locale=${currentLocale}`
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result: ApiResponse = await response.json();
            const rooms = result.data?.items || [];

            // 업데이트
            onRoomsUpdate(rooms);
            updateMarkers(map, rooms);

        } catch (error) {
            console.error('Error loading rooms:', error);
            onRoomsUpdate([]);
        }
    };

    // 마커 업데이트
    const updateMarkers = (map: any, rooms: RoomData[]) => {
        clearMarkers(); // 기존 마커 삭제

        rooms.forEach(room => {
            const position = new window.naver.maps.LatLng(
                room.coordinate_lat,
                room.coordinate_long
            );

            // 마커 생성
            const marker = new window.naver.maps.Marker({
                position,
                map
            });

            // 인포윈도우 내용 설정
            const iwContent = `
                <div style="padding:10px;width:250px;">
                    <h3 style="margin:0;padding:0;font-size:14px;">${room.title}</h3>
                    <p style="margin:5px 0;font-size:13px;">
                        주소: ${room.address}<br>
                        가격: ${room.week_price}/주<br>
                        보증금: ${room.deposit}<br>
                        관리비: ${room.maintenance_fee}
                    </p>
                </div>
            `;

            const infowindow = new window.naver.maps.InfoWindow({
                content: iwContent,
                disableAnchor: true
            });

            // 마커 클릭 시 모든 인포윈도우 닫고 해당 마커만 열기
            window.naver.maps.Event.addListener(marker, 'click', () => {
                markers.current.forEach(m => {
                    if (m.infowindow) m.infowindow.close();
                });
                infowindow.open(map, marker);
            });

            // 마우스 오버 시 인포윈도우 열기
            window.naver.maps.Event.addListener(marker, 'mouseover', () => {
                infowindow.open(map, marker);
            });

            // 마우스 아웃 시 인포윈도우 닫기
            window.naver.maps.Event.addListener(marker, 'mouseout', () => {
                infowindow.close();
            });

            marker.infowindow = infowindow;
            markers.current.push(marker);
        });
    };

    useEffect(() => {
        const initMap = async () => {
            if (!window.naver || !window.naver.maps) return;
            const locale = i18n.language; // 현재 언어 감지

            const mapOptions = {
                // 강남역
                // center: new  window.naver.maps.LatLng(37.498095, 127.027610),
                center: new  window.naver.maps.LatLng(37.5558634, 126.9317907),
                zoom: 15,
                minZoom: 9,
                maxZoom: 18,
            };

            const map = new window.naver.maps.Map('map', mapOptions);
            mapRef.current = map;

            // 초기 데이터 로드
            await loadRoomsInBounds(map);

            // 지도 이동 시 룸 데이터 다시 불러오기
            window.naver.maps.Event.addListener(map, 'idle', () => {
                debouncedLoadRooms(map);
            });
        };

        // 지원하는 언어 목록
        const supportedLanguages = ["ko", "en", "ja", "zh-CN", "zh-TW"];
        const locale = supportedLanguages.includes(i18n.language) ? i18n.language : "en";

        if (window.naver && window.naver.maps) {
            initMap();
        } else {
            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=ztg68tla5j&language=${locale}`;
            script.onload = initMap;
            document.head.appendChild(script);
        }
    }, []);

    return (
        <div style={styles.mapContainer}>
            <div id="map" style={styles.map}/>
        </div>
    );
};

export default NaverMap;

const styles = {
    mapContainer: {
        width: '100%',
        height: '100%',
        position: 'relative',
        transition: 'all 0.3s ease-in-out',
    } as React.CSSProperties,
    map: {
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        transition: 'all 0.3s ease-in-out',
    } as React.CSSProperties
};