import React, {useState} from 'react';
import Modal from "react-modal";
import CommonModal from "./CommonModal";

export default function Test() {
    const [open, setOpen] = useState(false);
    const [open2, setOpen2] = useState(false);

    return (
        <div className="h-[100dvh]">
            <div className="bg-black m-4">
                <CommonModal
                    isOpen={open}
                    onRequestClose={() => setOpen(false)}
                    title="ㅇ"
                >
                    <h2>공용 모달</h2>
                    <div>width, height 설정 없는 기본 사이즈</div>
                    <button onClick={() => setOpen(false)}>닫기</button>
                </CommonModal>
                <button
                    type="button"
                    className="flex_center w-full text-lg py-10 text-white"
                    onClick={() => setOpen(true)}
                >
                    공용모달테스트
                </button>
            </div>

            <div className="bg-black m-4">
                <CommonModal
                    isOpen={open2}
                    onRequestClose={() => setOpen2(false)}
                    widthClassName="md:w-full w-[200px]"
                    heightClassName=""
                >
                    <h2>공용 모달</h2>
                    <div>내용을 여기에 작성</div>
                    <div>내용을 여기에 작성</div>
                    <div>내용을 여기에 작성</div>
                    <div>내용을 여기에 작성</div>
                    <div>내용을 여기에 작성</div>
                    <div>내용을 여기에 작성</div>
                    <div>내용을 여기에 작성</div>
                    <div>내용을 여기에 작성</div>
                    <button onClick={() => setOpen2(false)}>닫기</button>
                </CommonModal>
                <button
                    type="button"
                    className="flex_center w-full text-lg py-10 text-white"
                    onClick={() => setOpen2(true)}
                >
                    공용모달테스트2
                </button>
            </div>
        </div>
    );
};
