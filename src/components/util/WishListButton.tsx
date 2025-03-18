import React, {useEffect, useState} from 'react';
import {FaHeart, FaRegHeart} from 'react-icons/fa'; // react-icons/fa에서 FontAwesome 아이콘 가져오기
import 'src/css/WishlistButton.css';
import {addFavoriteRoom, deleteFavoriteRoom} from "../../api/api";
import AuthModal from "../modals/AuthModal";

interface WishlistButtonProps {
    onToggle?: (isLiked: boolean) => void,
    roomId?: number,
    isFavorite?: boolean
}

const WishListButton: React.FC<WishlistButtonProps> = ({onToggle, roomId, isFavorite}) => {
    const [isLiked, setIsLiked] = useState(isFavorite);
    const [authModalOpen, setAuthModalOpen] = useState(false);

    // 찜 상태를 토글하는 함수
    const toggleWishlist = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation(); // 이벤트 전파 방지
        const isAuthenticated = !!localStorage.getItem("authToken"); // 로그인 여부 확인
        if (!isAuthenticated) {
            alert('로그인 후 이용 가능합니다.');
            setAuthModalOpen(true);
            return;
        }
        const newState = !isLiked;
        setIsLiked(newState);
        try {
            if (newState) {
                console.log('찜', newState);
                addFavorite();
            } else {
                console.log('ㄴ찜', newState);
                deleteFavorite();
            }
        } catch (error) {
            console.error('찜 api 실패:', error);
        }
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
        <div>
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
        </div>
    );
};

export default WishListButton;
