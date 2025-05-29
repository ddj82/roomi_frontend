import React, {useEffect, useState} from 'react';
import {mainSlideList} from "../../types/MainSlideList";

export default function MainSlides() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const slides = mainSlideList;
    // 마우스 호버 시 자동 슬라이드 일시정지
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        if (isHovered) return; // 호버 중이면 자동 슬라이드 정지

        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) =>
                prevIndex === slides.length - 1 ? 0 : prevIndex + 1
            );
        }, 3000); // 자동 슬라이드 시간

        return () => clearInterval(interval);
    }, [slides.length, isHovered]);

    return (
        <div className="relative w-full bg-[#f4f4f4]">
            {/* Carousel wrapper */}
            <div className="relative overflow-hidden rounded-lg h-56 md:h-80">
                {/* 슬라이드 컨테이너 */}
                <div
                    className="flex transition-transform duration-700 ease-in-out h-full"
                    style={{
                        transform: `translateX(-${currentIndex * 100}%)`
                    }}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    {slides.map((slide, index) => (
                        <div
                            key={index}
                            className="w-full flex-shrink-0 relative flex"
                        >
                            {/* 배경 이미지 */}
                            <img
                                src={slide.image}
                                className="h-full"
                                alt={`Slide ${index + 1}`}
                            />

                            {/* 텍스트 오버레이 */}
                            <div className="flex_center">
                                <div className="text-black p-6 w-full flex flex-col gap-8">
                                    <h3 className="text-lg md:text-2xl font-bold mb-2 transform translate-y-0 transition-transform duration-500">
                                        {slide.title}
                                    </h3>
                                    <p className="text-sm md:text-lg opacity-90 transform translate-y-0 transition-transform duration-500 delay-100">
                                        {slide.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 슬라이드 인디케이터 (점) */}
            <div className="flex justify-center space-x-2 mt-4 absolute bottom-2 right-1/2">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                            index === currentIndex
                                ? 'bg-gray-800 scale-110'
                                : 'bg-gray-400 hover:bg-gray-600'
                        }`}
                        onClick={() => setCurrentIndex(index)}
                    />
                ))}
            </div>
        </div>
    );
};
