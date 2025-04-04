import React, {useState} from 'react';
import {useTranslation} from "react-i18next";
import AccordionItem from "../../util/AccodionItem";
import {FAQList, FAQTitle} from "../../../types/faq";

export default function FAQ() {
    const {t} = useTranslation();

    const faqTitles: FAQTitle[] = [
        { id: 1, listId: 'faqList1', title: t('시작 가이드') },
        { id: 2, listId: 'faqList2', title: t('공간 및 계약') },
        { id: 3, listId: 'faqList3', title: t('계약 및 취소') },
        { id: 4, listId: 'faqList4', title: t('결제 및 영수증') },
        { id: 5, listId: 'faqList5', title: t('보증금') },
        { id: 6, listId: 'faqList6', title: t('특별 기능') },
    ];

    const faqList1: FAQList[] = [
        { id: 1, title: t('루미는 어떻게 시작하나요?'), content: t('시작설명') },
        { id: 2, title: t('루미에서는 숙박과 단기 임대를 어떻게 선택할 수 있나요?'), content: t('단기임대설명') },
        { id: 3, title: t('루미는 안전한 계약을 보장하나요?'), content: t('계약설명') },
        { id: 4, title: t('주/월 단위 계약이란 무엇인가요?'), content: t('단위계약설명') },
        { id: 5, title: t('루미만의 차별화된 장점은 무엇인가요?'), content: t('장점설명') },
    ];
    const faqList2: FAQList[] = [
        { id: 1, title: t('전입신고가 가능한 공간인가요?'), content: t('전입신고내용') },
        { id: 2, title: t('공간을 실제로 보고 계약할 수 있나요?'), content: t('공간내용') },
        { id: 3, title: t('"설명된 계약 조건과 공간 상태가 다르면 어떻게 해야 하나요?'), content: t('계약설명1') },
        { id: 4, title: t('원하는 날짜만 골라서 계약할 수 있나요?'), content: t('날짜내용') },
        { id: 5, title: t('입주 후 시설 고장이 생기면 어떻게 해야 하나요?'), content: t('입주설명') },
    ];
    const faqList3: FAQList[] = [
        { id: 1, title: t('계약 취소는 어떻게 하나요?'), content: t('취소설명1') },
        { id: 2, title: t('계약 취소는 언제까지 가능한가요?'), content: t('취소설명2') },
        { id: 3, title: t('중도 퇴실 시 환불 규정은 어떻게 되나요?'), content: t('퇴실설명1') },
        { id: 4, title: t('계약 날짜를 변경할 수 있나요?'), content: t('계약날짜규정') },
    ];
    const faqList4: FAQList[] = [
        { id: 1, title: t('법인카드나 해외카드로 결제가 가능한가요?'), content: t('네, 루미는 법인카드와 해외카드 결제를 모두 지원합니다.') },
        { id: 2, title: t('현금영수증을 받을 수 있나요?'), content: t('현금영수증내용') },
        { id: 3, title: t('영수증 발급은 어떻게 하나요?'), content: t('일반영수증내용') },
        { id: 4, title: t('루미 결제 수수료는 무엇인가요?'), content: t('수수료내용') },
    ];
    const faqList5: FAQList[] = [
        { id: 1, title: t('보증금은 어떤 경우에 필요한가요?'), content: t('보증금 설명1') },
        { id: 2, title: t('보증금 금액은 어떻게 결정되나요?'), content: t('보증금 설명2') },
        { id: 3, title: t('보증금 반환은 어떻게 이루어지나요?'), content: t('보증금 설명3') },
        { id: 5, title: t('보증금 반환이 지연될 경우 어떻게 해야 하나요?'), content: t('보증금 설명4') },
        { id: 4, title: t('중도 퇴실 시 보증금은 어떻게 처리되나요?'), content: t('보증금 설명5') },
        { id: 6, title: t('보증금을 모두 받지 못하는 경우가 있나요?'), content: t('보증금 설명6') },
    ];
    const faqList6: FAQList[] = [
        { id: 1, title: t('루미에서는 원하는 기간에 따라 계약을 유연하게 선택할 수 있나요?'), content: t('부가설명1') },
        { id: 2, title: t('루미에서는 숙박과 단기 임대가 구분되어 있나요?'), content: t('부가설명2') },
        { id: 3, title: t('루미의 AI 추천 시스템은 무엇인가요?'), content: t('부가설명3') },
        { id: 4, title: t('호스트와의 소통은 어떻게 하나요?'), content: t('부가설명4') },
        { id: 5, title: t('지원되는 언어는 무엇인가요?'), content: t('지원언어설명') },
    ];

    // listId → 실제 FAQ 배열 매핑
    const listsMap: Record<string, FAQList[]> = {
        faqList1,
        faqList2,
        faqList3,
        faqList4,
        faqList5,
        faqList6,
    };

    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [selectedTitle, setSelectedTitle] = useState('faqList1');
    const [list, setList] = useState<FAQList[]>(faqList1);

    // 상단 버튼 클릭 시 FAQ 목록 변경
    const setFAQList = (listId: string) => {
        setSelectedTitle(listId);
        // listsMap에서 해당 listId 키에 맞는 배열을 가져와 상태에 저장
        setList(listsMap[listId] || []);
        // 아코디언 펼침 상태 초기화
        setExpandedId(null);
    };

    // 아코디언 토글 핸들러
    const toggleAccordion = (id: number) => {
        setExpandedId((prev) => (prev === id ? null : id));
    };

    return (
        <div className="p-4 md:px-8">
            {/* 상단 버튼들 */}
            <div className="my-8 grid md:grid-cols-3 grid-cols-2 gap-4">
                {faqTitles.map((faq) => (
                    <button
                        key={faq.id}
                        type="button"
                        onClick={() => setFAQList(faq.listId)}
                        className={`p-3 m-2 rounded-full md:text-sm text-xs font-bold focus:outline-none
                            ${selectedTitle === faq.listId ? 'text-white bg-roomi' : 'text-roomi bg-roomi-light'}
                            `}
                    >
                        {faq.title}
                    </button>
                ))}
            </div>

            {/* 아코디언 목록 */}
            {list.map((faqItem) => {
                const isOpen = expandedId === faqItem.id;
                return (
                    <div key={faqItem.id} className="border-b border-gray-300 mb-2">
                        {/* 제목 버튼 */}
                        <button
                            onClick={() => toggleAccordion(faqItem.id)}
                            className="w-full text-left p-3 bg-gray-50 cursor-pointer focus:outline-none"
                        >
                            <div className="font-bold">{faqItem.title}</div>
                        </button>

                        {/* 내용 아코디언 */}
                        <AccordionItem isOpen={isOpen}>
                            <div className="p-3 text-sm bg-white leading-relaxed whitespace-pre-wrap">
                                {faqItem.content}
                            </div>
                        </AccordionItem>
                    </div>
                );
            })}
        </div>
    );
};
