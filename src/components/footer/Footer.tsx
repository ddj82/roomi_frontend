import React from 'react';
import '../../css/Footer.css'; // CSS 파일을 import

const Footer: React.FC = () => {
    return (
        <div className="footer footer-container">
            <p className="footer footer-text">
                상호명 : 루미 (Roomi) / (주) 룸메이트 | 대표자: 진유진
            </p>
            <p className="footer footer-text">
                사업자등록번호: 159-81-03462 | 전화: 02-303-1455
            </p>
            <p className="footer footer-text">
                주소: 서울특별시 마포구 월드컵북로 1길 52, 지층44
            </p>
            <p className="footer footer-copyright">
                © 2025 ROOMMATES Co. All rights reserved.
            </p>
        </div>
    );
};

export default Footer;
