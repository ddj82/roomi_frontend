import React, { useCallback, useEffect, useRef } from 'react';
import { ApiResponse, RoomData } from "src/types/rooms";
import i18n from "../../i18n";
import { mainRoomData } from "../../api/api";
import ReactDOMServer from "react-dom/server";
import ImgCarousel from "../util/ImgCarousel";
import { createRoot } from "react-dom/client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleXmark } from "@fortawesome/free-solid-svg-icons";

// Google Maps 및 MarkerClusterer 타입 선언
declare global {
    interface Window {
        google: {
            maps: {
                Map: any;
                Marker: any;
                InfoWindow: any;
                LatLng: any;
                Point: any;
                Size: any;
                marker: {
                    AdvancedMarkerElement: any;
                    PinElement: any;
                };
            };
        };
        // @googlemaps/markerclusterer 라이브러리
        MarkerClusterer: new (options: MarkerClustererOptions) => MarkerClustererInstance;
        GridAlgorithm: new (options: { gridSize: number }) => any;
        SuperClusterAlgorithm: new (options?: any) => any;
        initMap: () => void;
    }
}

// MarkerClusterer 관련 타입 정의
interface MarkerClustererOptions {
    map: google.maps.Map;
    markers: google.maps.Marker[];
    algorithm?: any;
    renderer?: ClusterRenderer;
    onClusterClick?: (event: any, cluster: any, map: google.maps.Map) => void;
}

interface MarkerClustererInstance {
    clearMarkers(): void;
    addMarkers(markers: google.maps.Marker[]): void;
    removeMarkers(markers: google.maps.Marker[]): void;
    addMarker(marker: google.maps.Marker): void;
    removeMarker(marker: google.maps.Marker): void;
    getMarkers(): google.maps.Marker[];
    getClusters(): any[];
    render(): void;
}

interface ClusterRenderer {
    render: (cluster: ClusterRenderData, stats: any) => google.maps.Marker | HTMLElement;
}

interface ClusterRenderData {
    count: number;
    position: google.maps.LatLng;
    markers: google.maps.Marker[];
}

interface GoogleMapViewProps {
    onRoomsUpdate: (rooms: RoomData[]) => void;
}

const GoogleMap: React.FC<GoogleMapViewProps> = ({ onRoomsUpdate }) => {
    const markers = useRef<google.maps.Marker[]>([]);
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);
    const mapRef = useRef<google.maps.Map | null>(null);
    const markerCluster = useRef<MarkerClustererInstance | null>(null);
    const infoWindow = useRef<google.maps.InfoWindow | null>(null);

    // 마커 초기화
    const clearMarkers = (): void => {
        if (markerCluster.current) {
            markerCluster.current.clearMarkers();
        }
        markers.current.forEach(marker => marker.setMap(null));
        markers.current = [];
    };

    // 지도 영역 내 데이터 로드 (디바운스 적용)
    const debouncedLoadRooms = useCallback((map: google.maps.Map) => {
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }
        debounceTimer.current = setTimeout(() => {
            loadRoomsInBounds(map);
        }, 500);
    }, []);

    const loadRoomsInBounds = async (map: google.maps.Map): Promise<void> => {
        try {
            // 지도가 완전히 로드되었는지 확인
            if (!map || typeof map.getBounds !== 'function') {
                console.warn('Map not ready or getBounds method not available');
                return;
            }

            const bounds = map.getBounds();

            // bounds가 유효한지 확인
            if (!bounds) {
                console.warn('Map bounds not available yet');
                return;
            }

            const sw = bounds.getSouthWest();
            const ne = bounds.getNorthEast();

            // 좌표가 유효한지 확인
            if (!sw || !ne || typeof sw.lat !== 'function' || typeof ne.lat !== 'function') {
                console.warn('Invalid bounds coordinates');
                return;
            }

            const currentLocale = i18n.language;

            const response = await mainRoomData(sw.lat(), sw.lng(), ne.lat(), ne.lng(), currentLocale);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result: ApiResponse = await response.json();
            const rooms = result.data?.items || [];

            onRoomsUpdate(rooms);
            updateMarkers(map, rooms);

        } catch (error) {
            console.error('Error loading rooms:', error);
            onRoomsUpdate([]);
        }
    };

    // 커스텀 마커 HTML 생성
    const createMarkerContent = (room: RoomData): HTMLElement => {
        const div = document.createElement('div');
        div.innerHTML = ReactDOMServer.renderToString(
            <div
                className="relative bg-roomi text-white text-[13px] font-bold px-2 py-1 rounded-md shadow-md"
                style={{ whiteSpace: 'nowrap' }}
            >
                ₩ {Number(room.week_price).toLocaleString()}
                <div
                    className="absolute w-0 h-0"
                    style={{
                        bottom: '-6px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        borderLeft: '6px solid transparent',
                        borderRight: '6px solid transparent',
                        borderTop: '8px solid #ff8282',
                    }}
                ></div>
            </div>
        );
        return div.firstElementChild as HTMLElement;
    };

    // InfoWindow 컨텐츠 생성
    const createInfoWindowContent = (room: RoomData): HTMLElement => {
        const container = document.createElement('div');
        container.className = 'custom-info-window';

        const root = createRoot(container);
        root.render(
            <div className="relative w-[270px] bg-white rounded-xl shadow-xl overflow-hidden">
                <button
                    onClick={() => {
                        if (infoWindow.current) {
                            infoWindow.current.close();
                        }
                    }}
                    className="absolute top-3 right-3 flex_center w-2 h-2 p-2 text-lg text-gray-800 font-bold z-[100]"
                >
                    <FontAwesomeIcon icon={faCircleXmark} />
                </button>
                <div
                    role="button"
                    tabIndex={0}
                    onClick={() => handleRoomMarker(room.id)}
                    className="cursor-pointer"
                >
                    <div className="h-[180px] w-full">
                        {room.detail_urls && room.detail_urls.length > 0 ? (
                            <ImgCarousel images={room.detail_urls} customClass="h-48" />
                        ) : (
                            <img
                                src="/default-image.jpg"
                                alt="thumbnail"
                                className="h-full w-full object-cover"
                            />
                        )}
                    </div>

                    <div className="p-4 space-y-2 text-[14px]">
                        <div className="text-[16px] font-semibold text-gray-900">{room.title}</div>
                        <div className="text-gray-600">
                            <div className="flex gap-1">
                                <span className="text-blue-500">📍</span>
                                <span className="line-clamp-2">{room.address}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="text-yellow-500">💰</span>
                                <span className="font-medium text-gray-800">{Number(room.week_price).toLocaleString()} /주</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="text-green-600">💵</span>
                                <span>{room.deposit}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="text-amber-500">💡</span>
                                <span>{room.maintenance_fee}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );

        return container;
    };

    // 표준 마커 생성 헬퍼 함수
    const createStandardMarker = (position: google.maps.LatLng, room: RoomData): google.maps.Marker => {
        const svgIcon: google.maps.Icon = {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg" width="120" height="40" viewBox="0 0 120 40">
                    <rect x="5" y="5" width="110" height="25" rx="5" fill="#ff8282" stroke="white" stroke-width="2"/>
                    <text x="60" y="20" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="12" font-weight="bold">
                        ₩ ${Number(room.week_price).toLocaleString()}
                    </text>
                    <polygon points="55,30 60,40 65,30" fill="#ff8282"/>
                </svg>
            `),
            scaledSize: new window.google.maps.Size(120, 40),
            anchor: new window.google.maps.Point(60, 40),
        };

        return new window.google.maps.Marker({
            position,
            map: null,
            title: room.title,
            icon: svgIcon,
        });
    };

    // 마커 업데이트 (클러스터링 포함)
    const updateMarkers = (map: google.maps.Map, rooms: RoomData[]): void => {
        clearMarkers();

        if (!infoWindow.current) {
            infoWindow.current = new window.google.maps.InfoWindow();
        }

        const newMarkers: google.maps.Marker[] = rooms.map(room => {
            const position = new window.google.maps.LatLng(
                room.coordinate_lat,
                room.coordinate_long
            );

            let marker: google.maps.Marker;

            // 지도 ID가 있고 Advanced Marker 사용 가능한지 확인
            const hasMapId = mapRef.current && (mapRef.current as any).mapId;
            const hasAdvancedMarker = window.google.maps.marker && window.google.maps.marker.AdvancedMarkerElement;

            if (hasMapId && hasAdvancedMarker) {
                try {
                    // Advanced Marker 사용
                    const content = createMarkerContent(room);

                    marker = new window.google.maps.marker.AdvancedMarkerElement({
                        position,
                        map: null, // 클러스터에서 관리하므로 map에 직접 추가하지 않음
                        title: room.title,
                        content: content,
                    });
                } catch (error) {
                    console.warn('Advanced Marker creation failed, falling back to standard marker:', error);
                    // Advanced Marker 생성 실패 시 기본 마커로 fallback
                    marker = createStandardMarker(position, room);
                }
            } else {
                // 기본 Marker 사용
                marker = createStandardMarker(position, room);
            }

            // 마커 클릭 이벤트
            marker.addListener('click', () => {
                const content = createInfoWindowContent(room);

                if (infoWindow.current) {
                    infoWindow.current.setContent(content);
                    infoWindow.current.open(map, marker);

                    // InfoWindow 스타일 조정
                    setTimeout(() => {
                        const iwContainer = document.querySelector('.gm-style-iw-c');
                        if (iwContainer) {
                            (iwContainer as HTMLElement).style.padding = '0';
                            (iwContainer as HTMLElement).style.borderRadius = '12px';
                            (iwContainer as HTMLElement).style.overflow = 'hidden';
                        }

                        const iwCloseBtn = document.querySelector('.gm-ui-hover-effect');
                        if (iwCloseBtn) {
                            (iwCloseBtn as HTMLElement).style.display = 'none';
                        }
                    }, 100);
                }
            });

            return marker;
        });

        markers.current = newMarkers;

        // 마커 클러스터러 설정
        try {
            if (markerCluster.current) {
                markerCluster.current.clearMarkers();
            }

            // MarkerClusterer 라이브러리가 로드되었는지 확인
            if (window.MarkerClusterer && window.GridAlgorithm) {
                const clustererOptions: MarkerClustererOptions = {
                    map: map,
                    markers: newMarkers,
                    algorithm: new window.GridAlgorithm({ gridSize: 100 }),
                };

                // Advanced Marker 사용시 커스텀 렌더러 (지도 ID가 있는 경우에만)
                const hasMapId = mapRef.current && (mapRef.current as any).mapId;
                const hasAdvancedMarker = window.google.maps.marker && window.google.maps.marker.AdvancedMarkerElement;

                if (hasMapId && hasAdvancedMarker) {
                    clustererOptions.renderer = {
                        render: ({ count, position }: ClusterRenderData, stats: any) => {
                            const color: string = count > 25 ? "#ff0000" : count > 10 ? "#ff8800" : "#ffbb00";

                            try {
                                const clusterElement = document.createElement('div');
                                clusterElement.innerHTML = `
                                    <svg fill="${color}" stroke="#fff" stroke-width="2" viewBox="0 0 240 240" width="50" height="50">
                                        <circle cx="120" cy="120" opacity=".6" r="70" />
                                        <circle cx="120" cy="120" opacity=".3" r="90" />
                                        <circle cx="120" cy="120" opacity=".2" r="110" />
                                        <text x="50%" y="50%" style="fill:#fff" text-anchor="middle" font-size="50" dominant-baseline="middle" font-family="roboto,arial,sans-serif" font-weight="bold">
                                            ${count}
                                        </text>
                                    </svg>
                                `;

                                return new window.google.maps.marker.AdvancedMarkerElement({
                                    position,
                                    content: clusterElement.firstElementChild,
                                    zIndex: Number(window.google.maps.Marker.MAX_ZINDEX) + count,
                                });
                            } catch (error) {
                                console.warn('Advanced cluster marker creation failed, using standard marker');
                                // Advanced Marker 실패 시 표준 마커로 fallback
                                return new window.google.maps.Marker({
                                    position,
                                    icon: {
                                        url: 'data:image/svg+xml;base64,' + btoa(`
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="53" height="53">
                                                <circle cx="120" cy="120" opacity=".6" r="70" fill="${color}"/>
                                                <circle cx="120" cy="120" opacity=".3" r="90" fill="${color}"/>
                                                <circle cx="120" cy="120" opacity=".2" r="110" fill="${color}"/>
                                                <text x="50%" y="50%" style="fill:#fff" text-anchor="middle" font-size="50" dominant-baseline="middle" font-family="roboto,arial,sans-serif" font-weight="bold">
                                                    ${count}
                                                </text>
                                            </svg>
                                        `),
                                        scaledSize: new window.google.maps.Size(53, 53),
                                        anchor: new window.google.maps.Point(26, 26),
                                    },
                                    zIndex: Number(window.google.maps.Marker.MAX_ZINDEX) + count,
                                });
                            }
                        }
                    };
                }

                markerCluster.current = new window.MarkerClusterer(clustererOptions);
                console.log('MarkerClusterer initialized successfully with GridAlgorithm');
            } else {
                console.warn('MarkerClusterer or GridAlgorithm not available, using individual markers');
                // 클러스터링이 불가능하면 개별 마커로 표시
                newMarkers.forEach(marker => marker.setMap(map));
            }
        } catch (error) {
            console.warn('Clustering failed, using individual markers:', error);
            // 클러스터링이 실패하면 개별 마커로 표시
            newMarkers.forEach(marker => marker.setMap(map));
        }
    };

    const handleRoomMarker = (roomId: number): void => {
        const locale = i18n.language;
        window.open(`/detail/${roomId}/${locale}`, '_blank');
    };

    useEffect(() => {
        const initMap = async (): Promise<void> => {
            if (!window.google || !window.google.maps) return;

            const mapOptions: google.maps.MapOptions = {
                center: new window.google.maps.LatLng(37.5558634, 126.9317907), // 서울시청
                zoom: 15,
                minZoom: 9,
                maxZoom: 18,
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: false,
                zoomControl: true,
                // Advanced Marker 사용을 위한 지도 ID 추가
                mapId: "DEMO_MAP_ID", // Google Cloud Console에서 생성한 지도 ID 사용
                styles: [
                    {
                        featureType: "poi",
                        elementType: "labels",
                        stylers: [{ visibility: "off" }]
                    }
                ]
            };

            const map = new window.google.maps.Map(
                document.getElementById('map') as HTMLElement,
                mapOptions
            );
            mapRef.current = map;

            // 지도가 완전히 로드될 때까지 기다림
            const waitForMapLoad = (): Promise<void> => {
                return new Promise<void>((resolve) => {
                    const checkMapReady = () => {
                        if (map.getBounds && map.getBounds()) {
                            resolve();
                        } else {
                            setTimeout(checkMapReady, 100);
                        }
                    };
                    checkMapReady();
                });
            };

            // 지도 로드 완료 후 데이터 로드
            await waitForMapLoad();
            await loadRoomsInBounds(map);

            // 지도 이동 시 룸 데이터 다시 불러오기
            map.addListener('idle', () => {
                debouncedLoadRooms(map);
            });

            // 지도 초기화 완료 후 추가적인 안전장치
            map.addListener('bounds_changed', () => {
                // bounds가 변경될 때마다 디바운스된 로딩 실행
                debouncedLoadRooms(map);
            });
        };

        const loadGoogleMapsScript = (): Promise<void> => {
            return new Promise<void>((resolve, reject) => {
                if (window.google && window.google.maps) {
                    resolve();
                    return;
                }

                const supportedLanguages = ["ko", "en", "ja", "zh-CN", "zh-TW"];
                const locale = supportedLanguages.includes(i18n.language) ? i18n.language : "en";

                window.initMap = () => {
                    initMap().then(resolve).catch(reject);
                };

                const script = document.createElement('script');
                script.type = 'text/javascript';
                script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyA5uNG5ds2QbDU_HEcdnFRw1bhvhGkYelA&language=${locale}&libraries=marker&callback=initMap`;
                script.onerror = reject;
                document.head.appendChild(script);

                // MarkerClusterer 라이브러리 로드 - 최신 버전 사용
                const clusterScript = document.createElement('script');
                clusterScript.src = 'https://unpkg.com/@googlemaps/markerclusterer/dist/index.min.js';
                clusterScript.onload = () => {
                    console.log('MarkerClusterer library loaded successfully');
                    // 전역 객체에서 MarkerClusterer와 GridAlgorithm 추출
                    if ((window as any).markerClusterer) {
                        window.MarkerClusterer = (window as any).markerClusterer.MarkerClusterer;
                        window.GridAlgorithm = (window as any).markerClusterer.GridAlgorithm;
                        console.log('MarkerClusterer and GridAlgorithm are now available');
                    }
                };
                clusterScript.onerror = (error) => {
                    console.warn('MarkerClusterer library failed to load:', error);
                };
                document.head.appendChild(clusterScript);
            });
        };

        loadGoogleMapsScript().catch(console.error);

        // 컴포넌트 언마운트 시 정리
        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
            clearMarkers();
        };
    }, [debouncedLoadRooms]);

    return (
        <>
            <div style={styles.mapContainer}>
                <div id="map" style={styles.map}/>
            </div>
            <span>
                1234
            </span>
        </>

    );
};

export default GoogleMap;

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