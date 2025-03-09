import React, {useEffect, useState} from 'react';
import {FaHeart, FaRegHeart} from 'react-icons/fa'; // react-icons/fa에서 FontAwesome 아이콘 가져오기
import 'src/css/WishlistButton.css';
import {addFavoriteRoom, deleteFavoriteRoom} from "../../api/api";

interface WishlistButtonProps {
    initialState?: boolean,
    onToggle?: (isLiked: boolean) => void,
    roomId?: number
}

const WishlistButton: React.FC<WishlistButtonProps> = ({initialState = false, onToggle, roomId}) => {
    const [isLiked, setIsLiked] = useState(initialState);

    // 찜 상태를 토글하는 함수
    const toggleWishlist = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation(); // 이벤트 전파 방지
        const newState = !isLiked;
        setIsLiked(newState);
        if (newState) {
            console.log('찜', newState);
            try {
                addFavorite();
            } catch (error) {
                console.error('찜 추가 실패:', error);
            }
        } else {
            console.log('ㄴ찜', newState);
            try {
                deleteFavorite();
            } catch (error) {
                console.error('찜 추가 실패:', error);
            }
        }
        // if (onToggle) {
        //     onToggle(newState); // 외부 콜백 호출
        // }
    };
    const addFavorite = async () => {
        if (roomId != null) {
            const response = await addFavoriteRoom(roomId);
            const responseJson = await response.json();
            const roomData = responseJson.data;
            console.log('데이터 :', roomData);
        }
    };
    const deleteFavorite = async () => {
        if (roomId != null) {
            const response = await deleteFavoriteRoom(roomId);
            const responseJson = await response.json();
            const roomData = responseJson.data;
            console.log('데이터 :', roomData);
        }
    };

    return (
        <button
            className="wishListBtn z-40"
            onClick={toggleWishlist} // `onClick` 사용
        >
            {isLiked ? (
                <FaHeart size={21} color="rgba(255, 69, 0, 0.8)"/> // 찜 상태일 때
            ) : (
                <FaRegHeart size={21} color="#A9A9A9"/> // 찜 안된 상태일 때
            )}
        </button>
    );
};

export default WishlistButton;
