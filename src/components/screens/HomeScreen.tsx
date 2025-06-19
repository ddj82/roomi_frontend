import React, { useState, useEffect, useCallback, useMemo } from 'react';
import 'src/css/HomeScreen.css';
import { RoomData } from "src/types/rooms";
import i18n from "src/i18n";
import GoogleMap from "../map/GoogleMap";
import RoomAccommodationCard from "../util/RoomAccommodationCard";

// Accommodation Card Component
// const AccommodationCard = memo(
//     ({ item, onClick }: { item: RoomData; onClick: () => void }) => {
//         const formatPrice = useCallback((price: number | null) => {
//             if (!price) return '가격 정보 없음';
//             return `${item.symbol} ${price.toLocaleString()}`;
//         }, []);
//
//         const {t} = useTranslation();
//
//         return (
//             <div className="homeScreen card" onClick={onClick} data-nosnippet>
//                 <div className="homeScreen card-header w-full m-0 p-0 relative">
//                     <div className="absolute top-3 right-3 z-10">
//                         <WishListButton roomId={item.id} isFavorite={item.is_favorite}/>
//                     </div>
//                     {item.detail_urls && item.detail_urls.length > 0 ? (
//                         <ImgCarousel
//                             images={item.detail_urls}
//                             customClass="h-56 w-full object-cover md:rounded-lg rounded-none"
//                         />
//                     ) : (
//                         <img
//                             src="/default-image.jpg"
//                             alt="thumbnail"
//                             className="h-56 w-full object-cover md:rounded-lg rounded-none"
//                         />
//                     )}
//                 </div>
//                 <div className="homeScreen card-content">
//                     <div className="homeScreen price-container">
//                         {typeof item.month_price === 'number' &&item.month_price > 0  && (
//                             <p className="homeScreen price">{formatPrice(item.month_price)} / {t('월')}</p>
//                         )}
//                         {typeof item.week_price === 'number' &&item.week_price > 0 && (
//                             <p className="homeScreen price">{formatPrice(item.week_price)} / {t('주')}</p>
//                         )}
//
//                     </div>
//                     <h3 className="homeScreen title">{item.title || '제목 없음'}</h3>
//                     <p className="homeScreen location">{item.address || '주소 정보 없음'}</p>
//                 </div>
//             </div>
//         );
//     },
//     (prevProps, nextProps) => prevProps.item.id === nextProps.item.id
// );

interface HomeScreenProps {
    rooms: RoomData[];
}

// Main Component
const HomeScreen: React.FC<HomeScreenProps> = ({ rooms: externalRooms }) => {
    const [rooms, setRooms] = useState<RoomData[]>([]);
    const [loading, setLoading] = useState(true);

    const handleRoomsUpdate = useCallback((newRooms: RoomData[]) => {
        console.log('Rooms updated:', newRooms);
        setRooms(newRooms);
        setLoading(false);
    }, []);

    useEffect(() => {
        setRooms(externalRooms);
    }, [externalRooms]);

    const handleCardClick = (roomId: number) => {
        const currentLocale = i18n.language; // 현재 언어 감지
        window.open(`/detail/${roomId}/${currentLocale}`, '_blank');
    };

    const renderMap = useCallback(
        () => <GoogleMap onRoomsUpdate={handleRoomsUpdate} />,
        [handleRoomsUpdate]
    );

    const renderAccommodations = useMemo(() => {
        if (loading) {
            return <div className="homeScreen loading">로딩 중...</div>;
        }

        if (rooms.length === 0) {
            return <div className="homeScreen error">표시할 숙소가 없습니다.</div>;
        }

        return (
            <div className="homeScreen accommodation-grid">
                {rooms.map((item) => (
                    <RoomAccommodationCard
                        key={item.id}
                        item={item}
                        onClick={() => handleCardClick(item.id)} // id 전달
                    />
                ))}
            </div>
        );
    }, [rooms, loading]);

    return (
        <div className="homeScreen container mx-auto">
            {renderMap()}
            <div className="homeScreen room-content-container">{renderAccommodations}</div>
        </div>
    );
};

export default HomeScreen;
