import React from 'react';
import {useHostHeaderBtnVisibility} from "../stores/HostHeaderBtnStore";
import {useFooterVisibility} from "../stores/FooterStore";

const Footer: React.FC = () => {
    const isVisibleHostScreen = useHostHeaderBtnVisibility();
    const isFooterVisible = useFooterVisibility();


    if (isVisibleHostScreen || isFooterVisible) {
        return <div></div>
    } else {
        return (
            <div className="border-t border-gray-200 py-5 px-4 md:py-6">
                <div className="container mx-auto xl:max-w-[1500px] px-[20px]">
                    <div className="text-xs md:text-sm text-gray-500">
                        <div>상호명 : 루미(Roomi) / (주) 룸메이트 | 대표자: 진유진</div>
                        <div>사업자등록번호: 159-81-03462 | 전화: 02-303-1455</div>
                        <div>주소: 서울특별시 마포구 월드컵북로 1길 52, 지층44</div>
                    </div>
                    <div className="text-xs text-gray-400 mt-3 leading-[20px]">
                        루미(Roomi)는 모든 거래에 대한 책임과 배송, 교환, 환불 민원 등의 처리를 (주) 룸메이트에서 진행합니다.
                        <br/>자세한 문의는 e-mail: help@roomi.co.kr, 유선: 02-303-1455 로 가능합니다.
                    </div>
                    <div className="text-xs text-gray-400 mt-3 leading-[20px]">
                        © 2025 ROOMMATES Co. All rights reserved.
                    </div>
                </div>
            </div>
        );
    }
};

export default Footer;
