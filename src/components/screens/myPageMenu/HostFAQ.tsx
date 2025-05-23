import React, {useState} from 'react';
import {useTranslation} from "react-i18next";
import AccordionItem from "../../util/AccodionItem";
import {FAQList, FAQTitle} from "../../../types/faq";

export default function HostFAQ() {
    const {t} = useTranslation();

    const faqTitles: FAQTitle[] = [
        { id: 1, listId: 'faqList1', title: t('세금') },
        { id: 2, listId: 'faqList2', title: t('정산 관련') },
    ];

    const faqList1: FAQList[] = [
        { id: 1, title: t('Roomi에서 발생한 수익은 어떻게 신고해야 하나요?'), content: t('Roomi를 통해 발생한 임대 소득은 호스트 본인이 직접 세금 신고를 진행해야 합니다.\n' +
                '임대 소득은 과세 대상이며, 소득세 납부가 필요할 수 있습니다.\n' +
                '자세한 신고 절차 및 기준은 국세청 홈페이지에서 확인하시거나 세무 전문가와 상담하시길 권장드립니다.') },
        { id: 2, title: t('임대료에 대한 부가세 신고가 필요한가요?'), content: t('임대 유형에 따라 부가세 신고 여부가 다릅니다. \n\n✅ 부가세 신고가 필요 없는 경우 \n•주거용 임대 (예: 일반 주택, 원룸, 주거용 오피스텔 등) \n\n✅ 부가세 신고가 필요한 경우 \n•비주거용 공간 임대 (예: 호텔, 숙박업소, 사무용 오피스텔, 공유 오피스 등) \n\n💡 주거용 임대의 경우 부가세 신고 의무가 없지만, 비주거용 임대는 법령에 따라 부가세 신고가 필요할 수 있습니다. \n국세청 가이드라인을 확인하고 필요한 신고 절차를 진행해 주세요.') },
        { id: 3, title: t('Roomi에서 전자세금계산서 또는 현금영수증 발행이 가능한가요?'), content: t('Roomi에서 발생하는 서비스 이용 수수료에 한하여 현금영수증 및 전자세금계산서 발행이 가능합니다. \n\n💡 발행 방법 \n1.Roomi 앱 → "마이페이지" 메뉴 → "영수증 발급" 선택 \n2.영수증 종류 및 정보를 입력 후 신청') },
    ];

    // 다른 FAQ 리스트들...
    const faqList2: FAQList[] = [
        { id: 1, title: t('Roomi에서 임대료 정산은 언제, 어떻게 진행되나요?'), content: t('전입신고내용') },
        { id: 2, title: t('정산 계좌를 변경할 수 있나요?'), content: t('공간내용') },
        { id: 3, title: t('게스트가 카드 결제로 결제하면 추가 수수료가 부과되나요?'), content: t('계약설명1') },
    ];

    // listId → 실제 FAQ 배열 매핑
    const listsMap: Record<string, FAQList[]> = {
        faqList1,
        faqList2,
    };

    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [selectedTitle, setSelectedTitle] = useState('faqList1');
    const [list, setList] = useState<FAQList[]>(faqList1);

    // 상단 버튼 클릭 시 FAQ 목록 변경
    const setFAQList = (listId: string) => {
        setSelectedTitle(listId);
        setList(listsMap[listId] || []);
        setExpandedId(null);
    };

    // 아코디언 토글 핸들러
    const toggleAccordion = (id: number) => {
        setExpandedId((prev) => (prev === id ? null : id));
    };

    return (
        <div className="p-4 md:p-6 max-w-3xl mx-auto">
            <h2 className="text-xl font-bold mb-6">{t('자주 묻는 질문')}</h2>

            {/* 카테고리 선택 탭 */}
            <div className="mb-8 overflow-x-auto pb-2 scrollbar-hidden">
                <div className="flex flex-nowrap md:grid md:grid-cols-3 gap-3">
                    {faqTitles.map((faq) => (
                        <button
                            key={faq.id}
                            type="button"
                            onClick={() => setFAQList(faq.listId)}
                            className={`px-5 py-3 rounded-lg text-sm font-medium whitespace-nowrap transition-all
                                ${selectedTitle === faq.listId
                                ? 'text-white bg-roomi shadow-sm'
                                : 'text-gray-700 bg-gray-100 hover:bg-gray-200'}
                            `}
                        >
                            {faq.title}
                        </button>
                    ))}
                </div>
            </div>

            {/* FAQ 질문 목록 */}
            <div className="space-y-3">
                {list.map((faqItem) => {
                    const isOpen = expandedId === faqItem.id;
                    return (
                        <div
                            key={faqItem.id}
                            className="border rounded-lg overflow-hidden transition-all "
                        >
                            {/* 질문 버튼 */}
                            <button
                                onClick={() => toggleAccordion(faqItem.id)}
                                className="w-full text-left p-4 bg-white flex items-center justify-between cursor-pointer focus:outline-none"
                            >
                                <h3 className="font-medium text-gray-800 pr-8">{faqItem.title}</h3>
                                <div className="text-gray-400 flex-shrink-0">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className={`h-5 w-5 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </button>

                            {/* 답변 내용 */}
                            <AccordionItem isOpen={isOpen}>
                                <div className="p-4 border-t border-gray-100 bg-gray-50 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                                    {faqItem.content}
                                </div>
                            </AccordionItem>
                        </div>
                    );
                })}
            </div>

            {/* 리스트가 비어있을 때 */}
            {list.length === 0 && (
                <div className="flex items-center justify-center py-16 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="text-center">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-10 w-10 mx-auto text-gray-400 mb-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p>{t('질문 목록이 없습니다.')}</p>
                    </div>
                </div>
            )}
        </div>
    );
};