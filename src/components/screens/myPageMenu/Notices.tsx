import React, {useEffect, useRef, useState} from 'react';
import {useTranslation} from "react-i18next";
import {Transition} from "react-transition-group";
import {getNotices} from "../../../api/api";
import {Notice} from "../../../types/notice";
import dayjs from "dayjs";

// 아코디언 아이템(실제 애니메이션 처리)
interface AccordionItemProps {
    isOpen: boolean;
    children: React.ReactNode;
}

// 아코디언 아이템(실제 애니메이션 처리)
interface AccordionItemProps {
    isOpen: boolean;
    children: React.ReactNode;
}

function AccordionItem({ isOpen, children }: AccordionItemProps) {
    const nodeRef = useRef<HTMLDivElement>(null);

    // 애니메이션 지속 시간(ms)
    const duration = 500;

    return (
        <Transition
            in={isOpen}
            timeout={duration}
            nodeRef={nodeRef}
            mountOnEnter
            unmountOnExit
            onEnter={() => {
                // 펼치기 시작할 때 높이를 0으로 설정
                if (nodeRef.current) {
                    nodeRef.current.style.height = '0px';
                }
            }}
            onEntering={() => {
                // 실제 내용 높이만큼 높이를 키워서 애니메이션
                if (nodeRef.current) {
                    nodeRef.current.style.height = nodeRef.current.scrollHeight + 'px';
                }
            }}
            onEntered={() => {
                // 애니메이션이 끝나면 auto로 설정해 내용이 자유롭게 표시되도록
                if (nodeRef.current) {
                    nodeRef.current.style.height = 'auto';
                }
            }}
            onExit={() => {
                // 접기 시작할 때 현재 높이를 고정
                if (nodeRef.current) {
                    nodeRef.current.style.height = nodeRef.current.scrollHeight + 'px';
                }
            }}
            onExiting={() => {
                // 0으로 줄이면서 애니메이션
                if (nodeRef.current) {
                    nodeRef.current.style.height = '0px';
                }
            }}
        >
            {() => (
                <div ref={nodeRef} className="overflow-hidden transition-all duration-300">
                    {children}
                </div>
            )}
        </Transition>
    );
}

export default function Notices() {
    const {t} = useTranslation();
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [noticeList, setNoticeList] = useState<Notice[]>([]);

    // 아코디언 토글 핸들러
    const toggleAccordion = (id: number) => {
        setExpandedId((prev) => (prev === id ? null : id));
    };

    useEffect(() => {
        const getNoticeList = async () => {
            try {
                const response = await getNotices();
                const responseJson = await response.json();
                console.log('리스폰스', responseJson.data);
                setNoticeList(responseJson.data);
            } catch (e) {
                console.error('공지사항 API 실패:', e);
            }
        };
        getNoticeList();
    }, []);

    return (
        <div className="p-4 md:px-8">
            <h2 className="mb-4 font_title">{t("공지사항")}</h2>
            {noticeList && noticeList.length > 0 ? (
                <>
                    {noticeList.map((notice) => {
                        const isOpen = expandedId === notice.id;
                        return (
                            <div key={notice.id} className="border-b border-gray-300 mb-2">
                                {/* 제목 버튼 */}
                                <button
                                    onClick={() => toggleAccordion(notice.id)}
                                    className="w-full text-left p-3 bg-gray-50 cursor-pointer focus:outline-none"
                                >
                                    {notice.is_important && (
                                        <div className="mb-2">
                                            <span className="text-xs text-red-600 bg-red-100 p-1 rounded-lg">중요</span>
                                        </div>
                                    )}
                                    <div className="font-bold">{notice.title}</div>
                                    <div className="text-xs mt-0.5 text-gray-500">{dayjs(notice.created_at).format('YYYY-MM-DD')}</div>
                                </button>

                                {/* 아코디언 내용 (Transition으로 감싸기) */}
                                <AccordionItem isOpen={isOpen}>
                                    <div className="p-3 text-sm">
                                        <p>{notice.content}</p>
                                        <div className="my-2 mt-8">
                                            {notice.tags && notice.tags?.length > 0 ? (
                                                notice.tags.map((tag, index) => (
                                                    <span key={index}
                                                          className="text-xs text-roomi bg-roomi-light rounded-lg p-1 mr-2">
                                                        #{tag}
                                                    </span>
                                                ))
                                            ) : ('')}
                                        </div>
                                    </div>
                                </AccordionItem>
                            </div>
                        );
                    })}
                </>
            ) : (
                <div>공지사항이 없습니다.</div>
            )}
        </div>
    );
};
