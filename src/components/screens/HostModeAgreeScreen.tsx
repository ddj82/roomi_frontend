import React, {useEffect, useState} from 'react';
import {be_host, termsOfUse} from "src/api/api";
import {useIsHostStore} from "src/components/stores/IsHostStore";
import {useNavigate} from "react-router-dom";

const HostModeAgreeScreen = () => {
    const [isChecked, setIsChecked] = useState(false);
    const [termsContent, setTermsContent] = useState(""); // 약관 내용을 저장하는 상태
    const navigate = useNavigate();
    const { setIsHost } = useIsHostStore();

    // 체크박스 상태 변경 핸들러
    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setIsChecked(event.target.checked);
    };

    useEffect(() => {
        const handleTermsOfUse = async () => {
            try {
                const response = await termsOfUse();
                const htmlContent = await response.text(); // 응답에서 HTML 텍스트 추출
                setTermsContent(htmlContent); // 상태에 HTML 텍스트 저장
            } catch (error) {
                console.log('동의 실패', error);
            }
        };
        handleTermsOfUse();
    }, []);

    const handleBeHost = async () => {
        try {
            const response = await be_host();
            if (response) {
                setIsHost(true);
                console.log('호스트 등록 성공');
                navigate('/');
            } else {
                console.log('호스트 등록 실패');
            }
        } catch (error) {
            console.error("호스트등록 실패:", error);
        }
    };

    return (
        <div>
            <h1>호스트 등록 동의 페이지</h1>
            <div
                dangerouslySetInnerHTML={{__html: termsContent}}
                style={{
                    border: "1px solid #ddd",
                    padding: "10px",
                    marginBottom: "20px",
                    height: "400px", // 고정 높이 설정
                    overflowY: "scroll", // 세로 스크롤 처리
                }}
            ></div>
            <div className="no-select">
                <input
                    id="checkboxText"
                    type="checkbox"
                    checked={isChecked}
                    onChange={handleCheckboxChange}
                />
                <label htmlFor="checkboxText">
                    동의할거야?
                </label>
            </div>
            <div>
                <button disabled={!isChecked} onClick={handleBeHost}>동의</button>
            </div>
        </div>
    );
};

export default HostModeAgreeScreen;
