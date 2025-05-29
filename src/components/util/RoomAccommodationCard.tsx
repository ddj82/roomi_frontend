import React, {memo, useCallback} from "react";
import {RoomData} from "../../types/rooms";
import {useTranslation} from "react-i18next";
import WishListButton from "./WishListButton";
import ImgCarousel from "./ImgCarousel";

const RoomAccommodationCard = memo(
    ({ item, onClick }: { item: RoomData; onClick: () => void }) => {
        const formatPrice = useCallback((price: number | null) => {
            if (!price) return '가격 정보 없음';
            return `${item.symbol} ${price.toLocaleString()}`;
        }, []);
        const {t} = useTranslation();

        return (
            <div className="homeScreen card" onClick={onClick}>
                <div className="homeScreen card-header w-full m-0 p-0 relative">
                    <div className="absolute top-3 right-3 z-10">
                        <WishListButton roomId={item.id} isFavorite={item.is_favorite}/>
                    </div>
                    {item.detail_urls && item.detail_urls.length > 0 ? (
                        <ImgCarousel
                            images={item.detail_urls}
                            customClass="h-56 w-full object-cover md:rounded-lg rounded-none"
                        />
                    ) : (
                        <img
                            src="/default-image.jpg"
                            alt="thumbnail"
                            className="h-56 w-full object-cover md:rounded-lg rounded-none"
                        />
                    )}
                </div>
                <div className="homeScreen card-content">
                    <div className="homeScreen price-container">
                        {typeof item.month_price === 'number' &&item.month_price > 0  && (
                            <p className="homeScreen price">{formatPrice(item.month_price)} / {t('월')}</p>
                        )}
                        {typeof item.week_price === 'number' &&item.week_price > 0 && (
                            <p className="homeScreen price">{formatPrice(item.week_price)} / {t('주')}</p>
                        )}

                    </div>
                    <h3 className="homeScreen title line-clamp-2">{item.title || '제목 없음'}</h3>
                    <p className="homeScreen location">{item.address || '주소 정보 없음'}</p>
                </div>
            </div>
        );
    },
    (prevProps, nextProps) => prevProps.item.id === nextProps.item.id
);

export default RoomAccommodationCard;