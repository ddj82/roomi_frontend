import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ApiResponse, RoomData } from "@/types/rooms";

interface KakaoMapViewProps {
    onRoomsUpdate: (rooms: RoomData[]) => void;
}

export default function KakaoWebMap({ onRoomsUpdate }: KakaoMapViewProps) {
    const mapInstance = useRef<any>(null);
    const mapInitialized = useRef(false);
    const resizeObserver = useRef<ResizeObserver | null>(null);
    const markers = useRef<any[]>([]);
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);

    const [rooms, setRooms] = useState<RoomData[]>([]);

    // 디바운스 데이터 로드 함수
    const debouncedLoadRooms = useCallback((map: any) => {
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }
        debounceTimer.current = setTimeout(() => {
            loadRoomsInBounds(map);
        }, 500);
    }, []);

    // 마커 초기화
    const clearMarkers = () => {
        markers.current.forEach(marker => marker.setMap(null));
        markers.current = [];
    };

    // 지도 영역 내 데이터 로드
    interface MapBounds {
        getSouthWest: () => { getLat: () => number; getLng: () => number };
        getNorthEast: () => { getLat: () => number; getLng: () => number };
    }

    interface Map {
        getBounds: () => MapBounds;
    }

    const loadRoomsInBounds = async (map: Map) => {
        const bounds = map.getBounds();
        const sw = bounds.getSouthWest();
        const ne = bounds.getNorthEast();

        try {
            const response = await fetch(
                `https://roomi.co.kr/api/rooms?swLat=${sw.getLat()}&swLng=${sw.getLng()}&neLat=${ne.getLat()}&neLng=${ne.getLng()}`
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
        clearMarkers();

        rooms.forEach(room => {
            const position = new window.kakao.maps.LatLng(
                room.coordinate_lat,
                room.coordinate_long
            );

            const marker = new window.kakao.maps.Marker({
                position,
                map
            });

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

            const infowindow = new window.kakao.maps.InfoWindow({
                content: iwContent,
                removable: true
            });

            window.kakao.maps.event.addListener(marker, 'click', function() {
                markers.current.forEach(m => {
                    if (m.infowindow) m.infowindow.close();
                });
                infowindow.open(map, marker);
            });

            marker.infowindow = infowindow;
            markers.current.push(marker);
        });
    };

    useEffect(() => {
        if (!mapInitialized.current) {
            const script = document.createElement('script');
            script.src = '//dapi.kakao.com/v2/maps/sdk.js?appkey=85176812ff7562266360be7ddc133434&libraries=services&autoload=false';
            script.async = true;

            script.onload = () => {
                if (window.kakao && window.kakao.maps) {
                    window.kakao.maps.load(async () => {
                        const container = document.getElementById('map');
                        if (!container) return;

                        const options = {
                            center: new window.kakao.maps.LatLng(37.498095, 127.027610),
                            level: 5
                        };

                        const map = new window.kakao.maps.Map(container, options);
                        mapInstance.current = map;

                        // 초기 데이터 로드
                        await loadRoomsInBounds(map);

                        // 지도 이벤트 리스너
                        window.kakao.maps.event.addListener(map, 'dragend', () => {
                            debouncedLoadRooms(map);
                        });

                        window.kakao.maps.event.addListener(map, 'zoom_changed', () => {
                            debouncedLoadRooms(map);
                        });

                        // ResizeObserver 설정
                        resizeObserver.current = new ResizeObserver(() => {
                            requestAnimationFrame(() => {
                                map.relayout();
                            });
                        });

                        resizeObserver.current.observe(container);

                        // 줌 컨트롤 추가
                        const zoomControl = new window.kakao.maps.ZoomControl();
                        map.addControl(zoomControl, window.kakao.maps.ControlPosition.RIGHT);
                    });
                }
            };

            document.head.appendChild(script);
            mapInitialized.current = true;

            return () => {
                if (debounceTimer.current) {
                    clearTimeout(debounceTimer.current);
                }
                if (resizeObserver.current) {
                    resizeObserver.current.disconnect();
                }
                mapInitialized.current = false;
                mapInstance.current = null;
            };
        }
    }, [debouncedLoadRooms]);

    return (
        <div style={styles.mapContainer}>
            <div id="map" style={styles.map} />
        </div>
    );
}

const styles = {
    mapContainer: {
        width: '100%',
        height: '100%',
        position: 'relative',
        transition: 'all 0.3s ease-in-out'
    } as React.CSSProperties,
    map: {
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        transition: 'all 0.3s ease-in-out'
    } as React.CSSProperties
};
