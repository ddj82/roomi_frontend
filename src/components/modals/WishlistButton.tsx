import React, { useState } from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa'; // react-icons/fa에서 FontAwesome 아이콘 가져오기
import 'src/css/WishlistButton.css';

interface WishlistButtonProps {
    initialState?: boolean; // 초기 찜 상태 (기본값: false)
    onToggle?: (isLiked: boolean) => void; // 상태가 변경될 때 실행되는 콜백
}

const WishlistButton: React.FC<WishlistButtonProps> = ({ initialState = false, onToggle }) => {
    const [isLiked, setIsLiked] = useState(initialState);

    // 찜 상태를 토글하는 함수
    const toggleWishlist = () => {
        const newState = !isLiked;
        setIsLiked(newState);
        if (onToggle) {
            onToggle(newState); // 외부 콜백 호출
        }
    };

    return (
        <button
            className="wishListBtn"
            onClick={toggleWishlist} // `onClick` 사용
        >
            {isLiked ? (
                <FaHeart size={21} color="rgba(255, 69, 0, 0.8)" /> // 찜 상태일 때
            ) : (
                <FaRegHeart size={21} color="#A9A9A9" /> // 찜 안된 상태일 때
            )}
        </button>
    );
};

export default WishlistButton;
