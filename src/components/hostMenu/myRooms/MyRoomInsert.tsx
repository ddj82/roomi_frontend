import React, {useEffect, useMemo, useRef, useState} from "react";
import {useNavigate} from "react-router-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCheckCircle, faCircle, faBuilding} from "@fortawesome/free-regular-svg-icons";
import {
    faArrowLeft, faCheck,
    faElevator, faHashtag,
    faImages,
    faInfo,
    faMagnifyingGlass,
    faP,
    faPlus, faWonSign, faX
} from "@fortawesome/free-solid-svg-icons";
import DaumPostcode from 'react-daum-postcode';
import Modal from "react-modal";
import { buildingTypes, roomStructures } from "src/types/roomOptions";
import {facilityIcons} from "src/types/facilityIcons";
import {ImageItem, RoomFormData} from "../../../types/rooms";

const MyRoomInsert = () => {
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false); // 모달 상태
    const [currentStep, setCurrentStep] = useState(1); // 현재 단계 (1~16)

    // 주소 모달
    const [daumAddressModal, setDaumAddressModal] = useState(false);

    // 오류 메시지 상태 추가
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const [roomFormData, setRoomFormData] = useState<RoomFormData>({
        room_type: "",
        title: "",
        address: "",
        address_detail: "",
        detail_urls: [],
        has_elevator: false,
        has_parking: false,
        building_type: "",
        room_structure: "",
        facilities : {},
        additional_facilities: {},
        is_auto_accepted: false,
        week_enabled: true,
        month_enabled: false,
        cleaning_time: 0,
        breakfast_service: "",
        checkin_service: "",
        tags: [],
        prohibitions: [],
        floor_area: 0,
        floor: 0,
        room_count: 0,
        bathroom_count: 0,
        max_guests: 0,
        description: "",
        house_rules: "",
        transportation_info: "",
        check_in_time: "",
        check_out_time: "",
        week_price: 0,
        deposit_week: 0,
        maintenance_fee_week: 0,
        month_price: 0,
        deposit_month: 0,
        maintenance_fee_month: 0,
        discounts: [
            { type: "weekly", days: 14, percentage: 0 },
            { type: "weekly", days: 28, percentage: 0 },
            { type: "weekly", days: 84, percentage: 0 },
            { type: "monthly", days: 30, percentage: 0 },
            { type: "monthly", days: 90, percentage: 0 },
            { type: "monthly", days: 180, percentage: 0 },
        ],
        refund_policy: "",
    });

    // 전체 단계 수
    const totalSteps = useMemo(() => {
        if (roomFormData.room_type === "LODGE") return 15;
        if (roomFormData.room_type === "LEASE") return 14;
        return 15; // 기본값
    }, [roomFormData.room_type]);

    // 기본시설
    const basicFacilities = [
        { key: "wifi", label: "와이파이" },
        { key: "tv", label: "테레비" },
        { key: "kitchen", label: "주방" },
        { key: "washing_machine", label: "세탁기" },
        { key: "dry", label: "건조기" },
        { key: "ac_unit", label: "에어컨" },
        { key: "medical_services", label: "구급상자" },
        { key: "fire_extinguisher", label: "소화기" },
    ];
    const [basic_facilitiesModal, setBasic_facilitiesModal] = useState(false);
    const [addFacilities, setAddFacilities] = useState<{ key: string; label: string; iconKey: string }[]>([]);
    const [customFacilityName, setCustomFacilityName] = useState("");
    const [selectedIconKey, setSelectedIconKey] = useState<string | null>(null);
    const [editingFacility, setEditingFacility] = useState<{ key: string; label: string; iconKey: string } | null>(null);

    // 추가시설
    const additionalFacilities = [
        { key: "gym", label: "헬스장" },
        { key: "pool", label: "수영장" },
        { key: "hot_tub", label: "사우나" },
        { key: "cafe", label: "카페" },
        { key: "garden", label: "정원" },
        { key: "grill", label: "바베큐" },
        { key: "weekend", label: "라운지" },
        { key: "cctv", label: "CCTV" },
    ];
    const [additional_facilitiesModal, setAdditional_facilitiesModal] = useState(false);
    const [addAdditionalFacilities, setAddAdditionalFacilities] = useState<{ key: string; label: string; iconKey: string }[]>([]);
    const [customAdditionalFacilityName, setCustomAdditionalFacilityName] = useState("");
    const [selectedAdditionalIconKey, setSelectedAdditionalIconKey] = useState<string | null>(null);
    const [editingAdditionalFacility, setEditingAdditionalFacility] = useState<{ key: string; label: string; iconKey: string } | null>(null);

    // 사진파일 관련
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedImages, setSelectedImages] = useState<ImageItem[]>([]);

    // 태그상태
    const [tagInput, setTagInput] = useState("");

    // 금지사항 목록
    const prohibitionsList = [
        "파티 금지",
        "반려동물 금지",
        "흡연 금지",
        "음식 조리 금지",
        "추가 인원 금지",
    ];

    useEffect(() => {
        if (currentStep > totalSteps) {
            setCurrentStep(totalSteps);
        }
    }, [totalSteps]);


    const handleBack = () => {
        setShowModal(true); // 모달 열기
    };

    const confirmBack = () => {
        navigate('/host');
        window.location.reload();
    };

    const handleNext = () => {
        console.log('폼데이터 확인', roomFormData);
        // 유효성 검사 errors 이용
        if (currentStep < totalSteps) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handleChange = (field: string, value: any) => {
        setRoomFormData(prev => ({ ...prev, [field]: value }));
    };

    const handlePrev = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
    };

    const handleAddress = (data: any) => {
        console.log('다음 주소', data.address);
        handleChange("address", data.address);
        setDaumAddressModal(false);
    };

    useEffect(() => {
        if (basic_facilitiesModal || editingFacility || additional_facilitiesModal || editingAdditionalFacility) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }

        return () => {
            document.body.style.overflow = "";
        };
    }, [basic_facilitiesModal, editingFacility, additional_facilitiesModal, editingAdditionalFacility]);

    // 주요 시설 렌더링 함수
    const renderFacilities = (type: string) => {
        if (type === 'basic') {
            /*필수 시설*/
            return (
                <div className="border border-gray-300 rounded p-4 mt-4">
                    <div className="flex justify-between font-bold">
                        <div className="flex_center">필수 시설</div>
                        <button
                            onClick={() => setBasic_facilitiesModal(true)}
                            className="p-2 rounded-lg text-roomi text-sm bg-roomi-000"
                        >
                            <FontAwesomeIcon icon={faPlus} className="mr-2"/>
                            커스텀 시설 추가
                        </button>
                    </div>
                    {/*커스텀 시설 추가 모달*/}
                    <Modal
                        isOpen={basic_facilitiesModal}
                        onRequestClose={() => setBasic_facilitiesModal(false)}
                        className="bg-white p-4 rounded shadow-lg mx-auto w-[400px] h-fit"
                        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
                    >
                        <div className="font-bold text-lg mb-2">커스텀 시설 추가</div>

                        <div className="mb-2">
                            <input
                                type="text"
                                value={customFacilityName}
                                placeholder="시설 이름"
                                onChange={(e) => setCustomFacilityName(e.target.value)}
                                className="w-full p-2 mt-1 border rounded"
                            />
                        </div>

                        <div className="mb-2">
                            <span className="text-sm text-gray-700">아이콘 선택</span>
                            <div className="grid grid-cols-6 gap-2 mt-1 max-h-[200px] overflow-y-auto">
                                {Object.entries(facilityIcons)
                                    // ✅ 이미 사용된 아이콘 key 제외
                                    .filter(([key]) => !basicFacilities.some(b => b.key === key))
                                    .map(([key, icon]) => (
                                        <button key={key} onClick={() => setSelectedIconKey(key)}>
                                            <div
                                                className={`border p-4 rounded cursor-pointer flex_center 
                                                                ${selectedIconKey === key ? "border-roomi bg-roomi-000" : ""}`}
                                            >
                                                <FontAwesomeIcon icon={icon}/>
                                            </div>
                                        </button>
                                    ))}

                            </div>
                        </div>

                        <div className="flex justify-end gap-4 mt-6">
                            <button onClick={() => setBasic_facilitiesModal(false)} className="text-roomi px-4 py-2">
                                취소
                            </button>
                            <button
                                onClick={() => {
                                    if (!customFacilityName || !selectedIconKey) return;

                                    // ✅ key는 icon key로, value는 사용자 입력 이름
                                    const key = selectedIconKey;

                                    // 중복 방지
                                    if (addFacilities.some(f => f.key === key)) return;

                                    // 커스텀 시설 목록 추가
                                    setAddFacilities(prev => [
                                        ...prev,
                                        {key, label: customFacilityName, iconKey: selectedIconKey}
                                    ]);

                                    // ✅ roomFormData에 추가 (key: iconKey, value: label)
                                    setRoomFormData(prev => ({
                                        ...prev,
                                        facilities: {
                                            ...prev.facilities,
                                            [key]: customFacilityName
                                        }
                                    }));

                                    setCustomFacilityName("");
                                    setSelectedIconKey(null);
                                    setBasic_facilitiesModal(false);
                                }}
                                className="bg-roomi text-white px-4 py-2 rounded"
                            >
                                추가
                            </button>
                        </div>
                    </Modal>
                    {/*시설 표시*/}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                        {basicFacilities.map((item) => (
                            <label
                                key={item.key}
                                className={`flex items-center gap-2 border rounded-md p-2 cursor-pointer hover:shadow transition-all 
                                                ${roomFormData.facilities[item.key] ?
                                    "bg-roomi-000 border-roomi text-roomi font-bold" :
                                    "border text-gray-700 hover:bg-gray-100"}
                                                `}
                            >
                                <input
                                    type="checkbox"
                                    checked={roomFormData.facilities[item.key] !== undefined}
                                    onChange={(e) =>
                                        setRoomFormData((prev) => {
                                            const updated = {...prev.facilities};
                                            if (e.target.checked) {
                                                updated[item.key] = item.label; // ✅ key: label
                                            } else {
                                                delete updated[item.key];
                                            }
                                            return {...prev, facilities: updated};
                                        })
                                    }
                                    className="hidden"
                                />
                                <FontAwesomeIcon icon={facilityIcons[item.key]}
                                                 className={`${roomFormData.facilities[item.key] ?
                                                     "bg-roomi-000" : "text-gray-700 hover:bg-gray-100"}`}
                                />
                                <span className="text-sm">{item.label}</span>
                            </label>
                        ))}
                        {addFacilities.map((item) => (
                            <button
                                key={item.key}
                                type="button"
                                onClick={(e) => {
                                    // 체크박스 직접 클릭한 경우는 무시
                                    if ((e.target as HTMLElement).tagName !== "INPUT") {
                                        setEditingFacility(item);
                                    }
                                }}
                                className={`flex items-center gap-2 border rounded-md p-2 cursor-pointer hover:shadow transition-all w-full text-left
                                                    ${roomFormData.facilities[item.key]
                                    ? "bg-roomi-000 border-roomi text-roomi font-bold"
                                    : "border text-gray-700 hover:bg-gray-100"}`}
                            >
                                <input
                                    type="checkbox"
                                    checked={roomFormData.facilities[item.key] !== undefined}
                                    onChange={(e) =>
                                        setRoomFormData((prev) => {
                                            const updated = {...prev.facilities};
                                            if (e.target.checked) {
                                                updated[item.key] = item.label; // ✅ key: 사용자 입력값
                                            } else {
                                                delete updated[item.key];
                                            }
                                            return {...prev, facilities: updated};
                                        })
                                    }
                                    className="hidden"
                                />
                                <FontAwesomeIcon icon={facilityIcons[item.iconKey]}/>
                                <span className="text-sm">{item.label}</span>
                            </button>
                        ))}
                        {editingFacility && (
                            <Modal
                                isOpen={!!editingFacility}
                                onRequestClose={() => setEditingFacility(null)}
                                className="bg-white p-4 rounded shadow-lg mx-auto w-[400px] h-fit"
                                overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
                            >
                                <div className="font-bold text-lg mb-2">커스텀 시설 수정</div>

                                <div className="mb-2">
                                    <input
                                        type="text"
                                        value={editingFacility.label}
                                        onChange={(e) =>
                                            setEditingFacility({...editingFacility, label: e.target.value})
                                        }
                                        className="w-full p-2 mt-1 border rounded"
                                    />
                                </div>

                                <div className="mb-2">
                                    <span className="text-sm text-gray-700">아이콘 선택</span>
                                    <div className="grid grid-cols-6 gap-2 mt-1 max-h-[200px] overflow-y-auto">
                                        {Object.entries(facilityIcons)
                                            // ✅ 기본 시설에 없는 아이콘만 보여줌
                                            .filter(([key]) => !basicFacilities.some(b => b.key === key))
                                            .map(([key, icon]) => (
                                                <button
                                                    key={key}
                                                    onClick={() =>
                                                        setEditingFacility((prev) =>
                                                            prev ? {...prev, iconKey: key} : prev
                                                        )
                                                    }
                                                >
                                                    <div
                                                        className={`border p-4 rounded cursor-pointer flex_center 
                                                                        ${editingFacility.iconKey === key ? "border-roomi bg-roomi-000" : ""}`}
                                                    >
                                                        <FontAwesomeIcon icon={icon}/>
                                                    </div>
                                                </button>
                                            ))}

                                    </div>
                                </div>

                                <div className="flex justify-end gap-4 mt-6">
                                    {/* 삭제 버튼 */}
                                    <button
                                        onClick={() => {
                                            setAddFacilities((prev) =>
                                                prev.filter((f) => f.key !== editingFacility.key)
                                            );
                                            setRoomFormData((prev) => {
                                                const newAdditional = {...prev.facilities};
                                                delete newAdditional[editingFacility.key];
                                                return {
                                                    ...prev,
                                                    facilities: newAdditional,
                                                };
                                            });
                                            setEditingFacility(null);
                                        }}
                                        className="text-red-500 px-4 py-2"
                                    >
                                        삭제
                                    </button>

                                    {/* 저장 버튼 */}
                                    <button
                                        onClick={() => {
                                            setAddFacilities((prev) =>
                                                prev.map((f) =>
                                                    f.key === editingFacility.key ? editingFacility : f
                                                )
                                            );
                                            setEditingFacility(null);
                                        }}
                                        className="bg-roomi text-white px-4 py-2 rounded"
                                    >
                                        저장
                                    </button>
                                </div>
                            </Modal>
                        )}
                    </div>
                </div>
            )
        } else { // (type === 'additional')
            /*추가 시설*/
            return (
                <div className="border border-gray-300 rounded p-4 mt-4">
                    <div className="flex justify-between font-bold">
                        <div className="flex_center">추가 시설</div>
                        <button
                            onClick={() => setAdditional_facilitiesModal(true)}
                            className="p-2 rounded-lg text-roomi text-sm bg-roomi-000"
                        >
                            <FontAwesomeIcon icon={faPlus} className="mr-2"/>
                            커스텀 시설 추가
                        </button>
                    </div>
                    {/*커스텀 시설 추가 모달*/}
                    <Modal
                        isOpen={additional_facilitiesModal}
                        onRequestClose={() => setAdditional_facilitiesModal(false)}
                        className="bg-white p-4 rounded shadow-lg mx-auto w-[400px] h-fit"
                        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
                    >
                        <div className="font-bold text-lg mb-2">커스텀 시설 추가</div>

                        <div className="mb-2">
                            <input
                                type="text"
                                value={customAdditionalFacilityName}
                                placeholder="시설 이름"
                                onChange={(e) => setCustomAdditionalFacilityName(e.target.value)}
                                className="w-full p-2 mt-1 border rounded"
                            />
                        </div>

                        <div className="mb-2">
                            <span className="text-sm text-gray-700">아이콘 선택</span>
                            <div className="grid grid-cols-6 gap-2 mt-1 max-h-[200px] overflow-y-auto">
                                {Object.entries(facilityIcons)
                                    // ✅ 이미 사용된 아이콘 key 제외
                                    .filter(([key]) => !additionalFacilities.some(b => b.key === key))
                                    .map(([key, icon]) => (
                                        <button key={key} onClick={() => setSelectedAdditionalIconKey(key)}>
                                            <div
                                                className={`border p-4 rounded cursor-pointer flex_center 
                                                                ${selectedAdditionalIconKey === key ? "border-roomi bg-roomi-000" : ""}`}
                                            >
                                                <FontAwesomeIcon icon={icon}/>
                                            </div>
                                        </button>
                                    ))}

                            </div>
                        </div>

                        <div className="flex justify-end gap-4 mt-6">
                            <button onClick={() => setAdditional_facilitiesModal(false)}
                                    className="text-roomi px-4 py-2">
                                취소
                            </button>
                            <button
                                onClick={() => {
                                    if (!customAdditionalFacilityName || !selectedAdditionalIconKey) return;

                                    // ✅ key는 icon key로, value는 사용자 입력 이름
                                    const key = selectedAdditionalIconKey;

                                    // 중복 방지
                                    if (addAdditionalFacilities.some(f => f.key === key)) return;

                                    // 커스텀 시설 목록 추가
                                    setAddAdditionalFacilities(prev => [
                                        ...prev,
                                        {key, label: customAdditionalFacilityName, iconKey: selectedAdditionalIconKey}
                                    ]);

                                    // ✅ roomFormData에 추가 (key: iconKey, value: label)
                                    setRoomFormData(prev => ({
                                        ...prev,
                                        additional_facilities: {
                                            ...prev.additional_facilities,
                                            [key]: customAdditionalFacilityName
                                        }
                                    }));

                                    setCustomAdditionalFacilityName("");
                                    setSelectedAdditionalIconKey(null);
                                    setAdditional_facilitiesModal(false);
                                }}
                                className="bg-roomi text-white px-4 py-2 rounded"
                            >
                                추가
                            </button>
                        </div>
                    </Modal>
                    {/*시설 표시*/}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                        {additionalFacilities.map((item) => (
                            <label
                                key={item.key}
                                className={`flex items-center gap-2 border rounded-md p-2 cursor-pointer hover:shadow transition-all 
                                                ${roomFormData.additional_facilities[item.key] ?
                                    "bg-roomi-000 border-roomi text-roomi font-bold" :
                                    "border text-gray-700 hover:bg-gray-100"}
                                                `}
                            >
                                <input
                                    type="checkbox"
                                    checked={roomFormData.additional_facilities[item.key] !== undefined}
                                    onChange={(e) =>
                                        setRoomFormData((prev) => {
                                            const updated = {...prev.additional_facilities};
                                            if (e.target.checked) {
                                                updated[item.key] = item.label; // ✅ key: label
                                            } else {
                                                delete updated[item.key];
                                            }
                                            return {...prev, additional_facilities: updated};
                                        })
                                    }
                                    className="hidden"
                                />
                                <FontAwesomeIcon icon={facilityIcons[item.key]}
                                                 className={`${roomFormData.additional_facilities[item.key] ?
                                                     "bg-roomi-000" : "text-gray-700 hover:bg-gray-100"}`}
                                />
                                <span className="text-sm">{item.label}</span>
                            </label>
                        ))}
                        {addAdditionalFacilities.map((item) => (
                            <button
                                key={item.key}
                                type="button"
                                onClick={(e) => {
                                    // 체크박스 직접 클릭한 경우는 무시
                                    if ((e.target as HTMLElement).tagName !== "INPUT") {
                                        setEditingAdditionalFacility(item);
                                    }
                                }}
                                className={`flex items-center gap-2 border rounded-md p-2 cursor-pointer hover:shadow transition-all w-full text-left
                                                    ${roomFormData.additional_facilities[item.key]
                                    ? "bg-roomi-000 border-roomi text-roomi font-bold"
                                    : "border text-gray-700 hover:bg-gray-100"}`}
                            >
                                <input
                                    type="checkbox"
                                    checked={roomFormData.additional_facilities[item.key] !== undefined}
                                    onChange={(e) =>
                                        setRoomFormData((prev) => {
                                            const updated = {...prev.additional_facilities};
                                            if (e.target.checked) {
                                                updated[item.key] = item.label; // ✅ key: 사용자 입력값
                                            } else {
                                                delete updated[item.key];
                                            }
                                            return {...prev, additional_facilities: updated};
                                        })
                                    }
                                    className="hidden"
                                />
                                <FontAwesomeIcon icon={facilityIcons[item.iconKey]}/>
                                <span className="text-sm">{item.label}</span>
                            </button>
                        ))}
                        {editingAdditionalFacility && (
                            <Modal
                                isOpen={!!editingAdditionalFacility}
                                onRequestClose={() => setEditingAdditionalFacility(null)}
                                className="bg-white p-4 rounded shadow-lg mx-auto w-[400px] h-fit"
                                overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
                            >
                                <div className="font-bold text-lg mb-2">커스텀 시설 수정</div>

                                <div className="mb-2">
                                    <input
                                        type="text"
                                        value={editingAdditionalFacility.label}
                                        onChange={(e) =>
                                            setEditingAdditionalFacility({
                                                ...editingAdditionalFacility,
                                                label: e.target.value
                                            })
                                        }
                                        className="w-full p-2 mt-1 border rounded"
                                    />
                                </div>

                                <div className="mb-2">
                                    <span className="text-sm text-gray-700">아이콘 선택</span>
                                    <div className="grid grid-cols-6 gap-2 mt-1 max-h-[200px] overflow-y-auto">
                                        {Object.entries(facilityIcons)
                                            // ✅ 기본 시설에 없는 아이콘만 보여줌
                                            .filter(([key]) => !additionalFacilities.some(b => b.key === key))
                                            .map(([key, icon]) => (
                                                <button
                                                    key={key}
                                                    onClick={() =>
                                                        setEditingAdditionalFacility((prev) =>
                                                            prev ? {...prev, iconKey: key} : prev
                                                        )
                                                    }
                                                >
                                                    <div
                                                        className={`border p-4 rounded cursor-pointer flex_center 
                                                                        ${editingAdditionalFacility.iconKey === key ? "border-roomi bg-roomi-000" : ""}`}
                                                    >
                                                        <FontAwesomeIcon icon={icon}/>
                                                    </div>
                                                </button>
                                            ))}

                                    </div>
                                </div>

                                <div className="flex justify-end gap-4 mt-6">
                                    {/* 삭제 버튼 */}
                                    <button
                                        onClick={() => {
                                            setAddAdditionalFacilities((prev) =>
                                                prev.filter((f) => f.key !== editingAdditionalFacility.key)
                                            );
                                            setRoomFormData((prev) => {
                                                const newAdditional = {...prev.additional_facilities};
                                                delete newAdditional[editingAdditionalFacility.key];
                                                return {
                                                    ...prev,
                                                    additional_facilities: newAdditional,
                                                };
                                            });
                                            setEditingAdditionalFacility(null);
                                        }}
                                        className="text-red-500 px-4 py-2"
                                    >
                                        삭제
                                    </button>

                                    {/* 저장 버튼 */}
                                    <button
                                        onClick={() => {
                                            setAddAdditionalFacilities((prev) =>
                                                prev.map((f) =>
                                                    f.key === editingAdditionalFacility.key ? editingAdditionalFacility : f
                                                )
                                            );
                                            setEditingAdditionalFacility(null);
                                        }}
                                        className="bg-roomi text-white px-4 py-2 rounded"
                                    >
                                        저장
                                    </button>
                                </div>
                            </Modal>
                        )}
                    </div>
                </div>
            )
        }
    };

    /*사진 파일 관련*/
    // 숨겨진 파일 input 클릭 트리거
    const handleInputFileSet = () => {
        fileInputRef.current?.click();
    };
    // 파일 선택 시 실행될 함수
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;

        // FileList를 배열로 변환
        const filesArray = Array.from(e.target.files);
        // 이미지 파일만 필터링 (MIME 타입이 image/로 시작하는지 확인)
        let validImageFiles = filesArray.filter((file) => file.type.startsWith("image/"));

        // 총 이미지 수가 10장을 넘지 않도록 체크
        if (validImageFiles.length + selectedImages.length > 10) {
            alert("최대 10장까지만 업로드가 가능합니다.");
            validImageFiles = validImageFiles.slice(0, 10 - selectedImages.length);
        }

        // 각 파일에 대해 미리보기 URL 생성
        const newImages = validImageFiles.map((file) => ({
            file,
            previewUrl: URL.createObjectURL(file),
        }));

        // 상태 업데이트
        setSelectedImages((prev) => [...prev, ...newImages]);

        // 폼 데이터의 detail_urls 필드에 업로드된 previewUrl만 배열에 담아서 저장
        setRoomFormData((prev) => ({
            ...prev,
            detail_urls: [
                ...(prev.detail_urls || []),
                ...newImages.map((image) => image.previewUrl),
            ],
        }));

        // 같은 파일 재업로드 시 onChange 이벤트가 발생하도록 input value 초기화
        e.target.value = "";
    };
    // 특정 인덱스의 이미지 삭제 함수
    const handleRemoveImage = (index: number) => {
        setSelectedImages((prev) => {
            // 메모리 누수를 막기 위해 object URL 해제
            URL.revokeObjectURL(prev[index].previewUrl);
            return prev.filter((_, i) => i !== index);
        });
    };

    /*태그 관련*/
    // 중복 태그 추가 방지 로직 포함 태그 추가 함수
    const handleAddTag = () => {
        const newTag = tagInput.trim();
        if (!newTag) return;

        // 중복된 태그가 있다면 추가하지 않음
        if (roomFormData.tags && roomFormData.tags.includes(newTag)) {
            alert("이미 추가된 태그입니다.");
            setTagInput(""); // 입력값 초기화
            return;
        }

        setRoomFormData((prev) => ({
            ...prev,
            tags: [...(prev.tags || []), newTag],
        }));
        setTagInput(""); // 입력 후 입력창 초기화
    };
    // 태그 삭제 함수
    const handleRemoveTag = (index: number) => {
        setRoomFormData((prev) => {
            if (!prev.tags) return prev;
            const updatedTags = [...prev.tags];
            updatedTags.splice(index, 1);
            return {
                ...prev,
                tags: updatedTags,
            };
        });
    };

    /*입 퇴실 시간 선택 함수*/
    const generateTimeOptions = () => {
        const times = [];
        for (let h = 1; h <= 24; h++) {
            if (h === 24) {
                times.push('24:00');
                continue;
            }
            const hour = h.toString().padStart(2, '0');
            times.push(`${hour}:00`);
        }
        return times;
    };
    const timeOptions = generateTimeOptions();

    /*요금 설정 함수*/
    const renderSetPriceInput = (unit: boolean, field: string, placeholder: string) => {
        const value = roomFormData[field as keyof RoomFormData];
        const isEmpty = value === 0 || value === null || value === undefined;
        let placeholderUnit;

        if (placeholder === "기본 요금") { // 기본 요금
            placeholderUnit = unit ? "월 기본 요금" : "주 기본 요금";
        } else if (placeholder === "보증금") { // 보증금
            placeholderUnit = unit ? "월 보증금" : "주 보증금";
        } else if (placeholder === "관리비") { // 관리비
            placeholderUnit = unit ? "월 관리비" : "주 관리비";
        }

        return (
            <div className="relative mb-2">
                <div className="absolute left-3.5 top-2 pointer-events-none">
                    <FontAwesomeIcon icon={faWonSign} className="w-4 h-4 text-gray-400"/>
                </div>
                <input
                    type="text"
                    inputMode="numeric"
                    id={field}
                    name={field}
                    placeholder={placeholderUnit}
                    value={isEmpty ? "" : formatWithComma(value as number)}
                    onChange={(e) => {
                        const raw = e.target.value.replace(/,/g, ''); // 콤마 제거
                        handleChange(field, raw);
                    }}
                    className="w-full border border-gray-300 rounded p-2 pl-10 focus:outline-none appearance-none"
                />
            </div>
        );
    };
    // 천 단위 콤마 포맷 함수
    const formatWithComma = (value: string | number) => {
        const numStr = value.toString().replace(/[^0-9]/g, '');
        if (!numStr) return '';
        return Number(numStr).toLocaleString();
    };

    /*할인 설정 함수*/
    const renderDiscountsSet = (type: string, dayUnit: number) => {
        const isWeekly = type === "weekly";
        const days = isWeekly ? dayUnit * 7 : dayUnit * 30;
        const discountLabel = `${dayUnit}${isWeekly ? "주" : "개월"} 이상`;

        return (
            <div className="flex flex-col">
                <div>{discountLabel}</div>
                <div className="relative">
                    <input
                        type="number"
                        min="0"
                        value={getDiscountValue(type, days)}
                        onChange={(e) => handleDiscountsChange(e, type, days)}
                        className="w-full border border-gray-300 rounded p-2 pr-10 focus:outline-none appearance-none"
                    />
                    <span
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-700 text-sm font-bold">
                        %
                    </span>
                </div>
            </div>
        );
    };
    const handleDiscountsChange = (e: React.ChangeEvent<HTMLInputElement>, type: string, days: number) => {
        const value = Number(e.target.value);

        setRoomFormData((prev) => ({
            ...prev,
            discounts: prev.discounts.map((item) =>
                item.type === type && item.days === days
                    ? {...item, percentage: value}
                    : item
            ),
        }));
    };
    const getDiscountValue = (type: string, days: number): string | number => {
        const discount = roomFormData.discounts.find(
            (d) => d.type === type && d.days === days
        );
        return !discount || discount.percentage === 0 ? "" : discount.percentage;
    };


    // 폼 데이터 단계별 렌더링 함수 
    const renderStepTitle = (currentStep: number) => {
        let stepTitle;
        let stepContent;
        switch (currentStep) {
            case 1: {
                stepTitle = '공간 유형';
                stepContent = '게스트가 이용할 공간 유형을 선택해주세요.';
                break;
            }
            case 2: {
                stepTitle = '공간 이름';
                stepContent = '게스트에게 보여질 공간의 이름을 입력해주세요.';
                break;
            }
            case 3: {
                stepTitle = '위치 정보';
                stepContent = '공간의 정확한 주소를 입력해주세요.';
                break;
            }
            case 4: {
                stepTitle = '건물 정보';
                stepContent = '건물의 유형과 면적을 선택해주세요.';
                break;
            }
            case 5: {
                stepTitle = '공간 구조';
                stepContent = '공간의 구조와 형태를 선택해주세요.';
                break;
            }
            case 6: {
                stepTitle = '주요 시설';
                stepContent = '건물의 주요 시설을 선택해주세요.';
                break;
            }
            case 7: {
                stepTitle = '사진 등록';
                stepContent = '공간의 사진을 등록해주세요. (최소 5장)';
                break;
            }
            case 8: {
                stepTitle = '공간 소개';
                stepContent = '공간의 특징과 장점을 소개해주세요.';
                break;
            }
            case 9: {
                stepTitle = '이용 안내';
                stepContent = '게스트를 위한 이용 방법을 설명해주세요.';
                break;
            }
            case 10: {
                stepTitle = '체크인/체크아웃';
                stepContent = '체크인/체크아웃 시간을 설정해주세요.';
                break;
            }
            case 11: {
                stepTitle = '요금 설정';
                stepContent = '기본 요금과 보증금을 설정해주세요.';
                break;
            }
            case 12: {
                stepTitle = '할인 설정';
                stepContent = '장기 이용, 등의 할인을 설정해주세요.';
                break;
            }
            case 13: {
                stepTitle = '예약 규정';
                stepContent = '예약 방식과 환불 규정을 선택해주세요.';
                break;
            }
            case 14: {
                if (roomFormData.room_type === "LEASE") {
                    stepTitle = '미리보기';
                    stepContent = '입력한 내용을 확인해주세요.';
                } else if (roomFormData.room_type === "LODGE") {
                    stepTitle = '추가 정보';
                    stepContent = '사업자 공간의 추가 정보를 입력해주세요.';
                }
                break;
            }
            case 15: {
                if (roomFormData.room_type === "LODGE") {
                    stepTitle = '미리보기';
                    stepContent = '입력한 내용을 확인해주세요.';
                }
                break;
            }

        }
        return (
            <>
                <div className="text-xl font-bold">{stepTitle}</div>
                <div className="text-gray-600">{stepContent}</div>
            </>
        );
    };

    return (
        <div className="p-6">
            {/* 페이지 제목 */}
            <div className="mb-6 p-4 border rounded-md flex">
                <div className="flex_center">
                    {/* 뒤로 가기 버튼 */}
                    <button className="rounded-md p-2 w-10 h-10 sm:p-4 sm:w-14 sm:h-14" onClick={handleBack}>
                        <FontAwesomeIcon icon={faArrowLeft}/>
                    </button>
                </div>
                <div className="mx-4">
                    {renderStepTitle(currentStep)}
                </div>
            </div>

            {/* 단계 진행 바 */}
            <div className="w-full mb-4">
                <div className="relative h-2 bg-gray-200 rounded-full">
                    <div className="absolute h-2 bg-roomi rounded-full transition-all duration-300"
                         style={{width: `${(currentStep / totalSteps) * 100}%`}}>
                    </div>
                </div>
                <div className="text-sm text-gray-600 mt-1 ml-2">
                    {currentStep} / {totalSteps}
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                {/* 페이지 컨텐츠 */}
                <div className="mb-6 p-4 border rounded-md">
                    {currentStep === 1 && (
                        /*공간 유형*/
                        <div>
                            {/*안내*/}
                            <div className="p-4 rounded-lg bg-roomi-000">
                                <div className="flex items-center text-roomi m-2">
                                    <div className="w-5 h-5 flex_center border-2 border-roomi rounded-full">
                                        <FontAwesomeIcon icon={faInfo} className="w-3 h-3"/>
                                    </div>
                                    <div className="ml-4 font-bold">안내사항</div>
                                </div>
                                <div className="text-gray-500 text-sm">
                                    <div className="p-1 px-2">
                                        <strong> · </strong>불법 숙박업소 운영 시 관련법에 따라 처벌 될 수 있습니다.
                                    </div>
                                    <div className="p-1 px-2">
                                        <strong> · </strong>선택하신 유형에 따라 필요한 서류가 요청 될 수 있습니다.
                                    </div>
                                    <div className="p-1 px-2">
                                        <strong> · </strong>허위로 공간 유형을 선택 할 경우 계정이 제한 될 수 있습니다.
                                    </div>
                                </div>
                            </div>
                            <div className="md:flex mt-4">
                                {/* 단기임대 */}
                                <div className="md:w-1/2">
                                    <label htmlFor="LEASE"
                                           className={`block p-4 border-2 rounded-lg cursor-pointer transition mb-4 md:m-0
                                        ${roomFormData.room_type === "LEASE" ?
                                               "bg-roomi-000 border-roomi" : "border text-gray-700 hover:bg-gray-100"}`}
                                    >
                                        <div className="flex">
                                            <div className={`flex_center bg-gray-200 p-4 rounded-lg 
                                                ${roomFormData.room_type === "LEASE" && "bg-roomi-00 text-roomi"}`}
                                            >
                                                <FontAwesomeIcon icon={faBuilding} className="w-6 h-6"/>
                                            </div>
                                            <div className="w-full ml-4">
                                                <div
                                                    className={`font-bold 
                                                    ${roomFormData.room_type === "LEASE" && "text-roomi"}`}
                                                >
                                                    주/월 단위 단기임대 공간
                                                </div>
                                                <div className="text-gray-500 md:text-sm text-xs mt-1">
                                                    주단위 또는 월단위로 운영되는 일반 임대주택 입니다.
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex text-gray-500 md:text-sm text-xs mt-2">
                                            <div className="p-4">
                                                <div className="w-6 h-6"></div>
                                            </div>
                                            <div
                                                className={`w-full ml-4 p-3 
                                                ${roomFormData.room_type === "LEASE" && "bg-gray-50 rounded-lg"}`}
                                            >
                                                <div className="my-2">
                                                    <strong> · </strong>주단위/월단위 임대 가능
                                                </div>
                                                <div className="my-2">
                                                    <strong> · </strong>일반 임대주택
                                                </div>
                                            </div>
                                            <div className="md:p-4">
                                                <div className="w-6 h-6"></div>
                                            </div>
                                        </div>
                                    </label>
                                    <input type="radio" name="roomType" id="LEASE" value="LEASE"
                                           checked={roomFormData.room_type === "LEASE"}
                                           onChange={(e) => handleChange("room_type", e.target.value)}
                                           className="hidden"
                                    />
                                </div>
                                {/* 숙박업소 */}
                                <div className="md:w-1/2">
                                    <label htmlFor="LODGE"
                                           className={`block p-4 border-2 rounded-lg cursor-pointer transition 
                                           ${roomFormData.room_type === "LODGE" ?
                                               "bg-roomi-000 border-roomi" : "border text-gray-700 hover:bg-gray-100"}`}
                                    >
                                        <div className="flex">
                                            <div className={`flex_center bg-gray-200 p-4 rounded-lg 
                                                ${roomFormData.room_type === "LODGE" && "bg-roomi-00 text-roomi"}`}
                                            >
                                                <FontAwesomeIcon icon={faCheckCircle} className="w-6 h-6"/>
                                            </div>
                                            <div className="w-full ml-4">
                                                <div
                                                    className={`font-bold 
                                                    ${roomFormData.room_type === "LODGE" && "text-roomi"}`}
                                                >
                                                    사업자 신고 완료 공간
                                                </div>
                                                <div className="text-gray-500 md:text-sm text-xs mt-1">
                                                    공식 등록된 사업자로 운영되는 공간 입니다.
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex text-gray-500 md:text-sm text-xs mt-2">
                                            <div className="p-4">
                                                <div className="w-6 h-6"></div>
                                            </div>
                                            <div
                                                className={`w-full ml-4 p-3 ${roomFormData.room_type === "LODGE" && "bg-gray-50 rounded-lg"}`}>
                                                <div className="my-2">
                                                    <strong> · </strong>단기 거주용 쉐어하우스, 게스트하루스 등
                                                </div>
                                                <div className="my-2">
                                                    <strong> · </strong>루미 인증 공간
                                                </div>
                                            </div>
                                            <div className="md:p-4">
                                                <div className="w-6 h-6"></div>
                                            </div>
                                        </div>
                                    </label>
                                    <input type="radio" name="roomType" id="LODGE" value="LODGE"
                                           checked={roomFormData.room_type === "LODGE"}
                                           onChange={(e) => handleChange("room_type", e.target.value)}
                                           className="hidden"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                    {currentStep === 2 && (
                        /*공간 이름*/
                        <div>
                            {/*안내*/}
                            <div className="p-4 rounded-lg bg-roomi-000">
                                <div className="flex items-center text-roomi m-2">
                                    <div className="w-5 h-5 flex_center border-2 border-roomi rounded-full">
                                        <FontAwesomeIcon icon={faInfo} className="w-3 h-3"/>
                                    </div>
                                    <div className="ml-4 font-bold">도움말</div>
                                </div>
                                <div className="text-gray-500 text-sm">
                                    <div className="p-1 px-2">
                                        <strong> · </strong>위치, 특징, 분위기를 잘 나타내는 이름을 추천드려요.
                                    </div>
                                    <div className="p-1 px-2">
                                        <strong> · </strong>지나치게 과장 된 표현은 피해주세요.
                                    </div>
                                    <div className="p-1 px-2">
                                        <strong> · </strong>이모지 사용 가능해요.
                                    </div>
                                </div>
                            </div>
                            {/*이름*/}
                            <div className="mt-4">
                                <input
                                    type="text"
                                    value={roomFormData.title}
                                    onChange={(e) => handleChange("title", e.target.value)}
                                    placeholder="공간 이름"
                                    className="w-full p-4 border border-gray-300 rounded focus:outline-none"
                                />
                            </div>
                        </div>
                    )}
                    {currentStep === 3 && (
                        /* 위치 정보 */
                        <div>
                            {/*안내*/}
                            <div className="p-4 rounded-lg bg-roomi-000">
                                <div className="flex items-center text-roomi m-2">
                                    <div className="w-5 h-5 flex_center border-2 border-roomi rounded-full">
                                        <FontAwesomeIcon icon={faInfo} className="w-3 h-3"/>
                                    </div>
                                    <div className="ml-4 font-bold">개인정보 보호</div>
                                </div>
                                <div className="text-gray-500 text-sm">
                                    <div className="p-1 px-2">
                                        <strong> · </strong>정확한 위치는 예약 완료 후에만 게스트에게 공개됩니다.
                                    </div>
                                </div>
                            </div>
                            {/*주소*/}
                            <div className="mt-4 relative">
                                <input
                                    type="text"
                                    value={roomFormData.address}
                                    readOnly
                                    onClick={() => setDaumAddressModal(true)}
                                    placeholder="주소"
                                    className="w-full border border-gray-300 rounded p-2 pr-10 cursor-pointer focus:outline-none"
                                />
                                <div className="absolute right-3.5 top-2 text-roomi pointer-events-none">
                                    <FontAwesomeIcon icon={faMagnifyingGlass} className="w-4 h-4"/>
                                </div>
                                <Modal
                                    isOpen={daumAddressModal}
                                    onRequestClose={() => setDaumAddressModal(false)}
                                    className="bg-white p-4 rounded shadow-lg mx-auto"
                                    overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
                                >
                                    <DaumPostcode
                                        style={{width: 400, height: 600}}
                                        onComplete={handleAddress}
                                    />
                                </Modal>
                                <input
                                    type="text"
                                    value={roomFormData.address_detail}
                                    onChange={(e) => handleChange("address_detail", e.target.value)}
                                    placeholder="상세 주소"
                                    className="w-full border border-gray-300 rounded p-2 mt-4 focus:outline-none"
                                />
                            </div>
                        </div>
                    )}
                    {currentStep === 4 && (
                        /* 건물 정보 */
                        <div>
                            {/*안내*/}
                            <div className="p-4 rounded-lg bg-roomi-000">
                                <div className="flex items-center text-roomi m-2">
                                    <div className="w-5 h-5 flex_center border-2 border-roomi rounded-full">
                                        <FontAwesomeIcon icon={faInfo} className="w-3 h-3"/>
                                    </div>
                                    <div className="ml-4 font-bold">단기 임대 공간 정보</div>
                                </div>
                                <div className="text-gray-500 text-sm">
                                    <div className="p-1 px-2">
                                        <strong> · </strong>단기 임대로 운영 되는 주거 공간에 적합한 건물 유형을 선택해주세요.
                                    </div>
                                </div>
                            </div>
                            {/*건물*/}
                            <div className="mt-4">
                                {/*건물 유형*/}
                                <div className="mb-4">
                                    <select
                                        value={roomFormData.building_type}
                                        onChange={(e) => handleChange("building_type", e.target.value)}
                                        className="w-full border border-gray-300 rounded p-2 focus:outline-none text-gray-700"
                                    >
                                        <option value="">건물 유형을 선택해주세요</option>
                                        {buildingTypes.map((type) => (
                                            <option key={type} value={type}>
                                                {type}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex gap-4 mb-4">
                                    {/* 전용 면적 */}
                                    <div className="relative w-1/3">
                                        <input
                                            value={roomFormData.floor_area === 0 ? "" : roomFormData.floor_area}
                                            type="number"
                                            min="0"
                                            placeholder="전용 면적"
                                            onChange={(e) => handleChange("floor_area", e.target.value)}
                                            className="w-full border border-gray-300 rounded p-2 pr-10 focus:outline-none appearance-none"
                                        />
                                        <span
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                                            평
                                        </span>
                                    </div>

                                    {/* 해당 층수 */}
                                    <div className="relative w-1/3">
                                        <input
                                            value={roomFormData.floor === 0 ? "" : roomFormData.floor}
                                            type="number"
                                            min="0"
                                            placeholder="해당 층수"
                                            onChange={(e) => handleChange("floor", e.target.value)}
                                            className="w-full border border-gray-300 rounded p-2 pr-10 focus:outline-none appearance-none"
                                        />
                                        <span
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                                            층
                                        </span>
                                    </div>
                                </div>
                                {/*엘베 주차*/}
                                <div className="flex gap-4">
                                    <label htmlFor="hasElevator"
                                           className={`flex_center flex-col gap-2 border-2 rounded-lg w-32 h-24 text-gray-500
                                           ${roomFormData.has_elevator && "border-roomi text-roomi"}`}
                                    >
                                        <span><FontAwesomeIcon icon={faElevator} className="text-xl"/></span>
                                        <span className="text-sm font-bold">엘리베이터</span>
                                    </label>
                                    <input
                                        id="hasElevator"
                                        type="checkbox"
                                        checked={roomFormData.has_elevator}
                                        onChange={(e) =>
                                            setRoomFormData((prev) => ({
                                                ...prev,
                                                has_elevator: e.target.checked,
                                            }))
                                        }
                                        className="hidden"
                                    />

                                    {/* 주차 가능 */}
                                    <label htmlFor="hasParking"
                                           className={`flex_center flex-col gap-2 border-2 rounded-lg w-32 h-24 text-gray-500
                                           ${roomFormData.has_parking && "border-roomi text-roomi"}`}
                                    >
                                        <span><FontAwesomeIcon icon={faP} className="text-xl"/></span>
                                        <span className="text-sm font-bold">주차 가능</span>
                                    </label>
                                    <input
                                        id="hasParking"
                                        type="checkbox"
                                        checked={roomFormData.has_parking}
                                        onChange={(e) =>
                                            setRoomFormData((prev) => ({
                                                ...prev,
                                                has_parking: e.target.checked,
                                            }))
                                        }
                                        className="hidden"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                    {currentStep === 5 && (
                        /* 공간 구조 */
                        <div>
                            {/*구조*/}
                            <div className="mb-4">
                                <select
                                    value={roomFormData.room_structure}
                                    onChange={(e) => handleChange("room_structure", e.target.value)}
                                    className="w-full border border-gray-300 rounded p-2 focus:outline-none text-gray-700"
                                >
                                    <option value="">구조를 선택해주세요</option>
                                    {roomStructures.map((structure) => (
                                        <option key={structure} value={structure}>
                                            {structure}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-4">
                                {/* 전용 면적 */}
                                <div className="relative w-1/3">
                                    <input
                                        value={roomFormData.room_count === 0 ? "" : roomFormData.room_count}
                                        type="number"
                                        min="0"
                                        placeholder="방 개수"
                                        onChange={(e) => handleChange("room_count", e.target.value)}
                                        className="w-full border border-gray-300 rounded p-2 pr-10 focus:outline-none appearance-none"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                                        개
                                </span>
                                </div>

                                {/* 화장실 개수 */}
                                <div className="relative w-1/3">
                                    <input
                                        value={roomFormData.bathroom_count === 0 ? "" : roomFormData.bathroom_count}
                                        type="number"
                                        min="0"
                                        placeholder="화장실 개수"
                                        onChange={(e) => handleChange("bathroom_count", e.target.value)}
                                        className="w-full border border-gray-300 rounded p-2 pr-10 focus:outline-none appearance-none"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                                        개
                                    </span>
                                </div>

                                {/* 최대 수용 인원 */}
                                <div className="relative w-1/3">
                                    <input
                                        value={roomFormData.max_guests === 0 ? "" : roomFormData.max_guests}
                                        type="number"
                                        min="0"
                                        placeholder="최대 수용 인원"
                                        onChange={(e) => handleChange("max_guests", e.target.value)}
                                        className="w-full border border-gray-300 rounded p-2 pr-10 focus:outline-none appearance-none"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                                        명
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                    {currentStep === 6 && (
                        /* 주요 시설 */
                        <div>
                            {/*안내*/}
                            <div className="p-4 rounded-lg bg-roomi-000">
                                <div className="flex items-center text-roomi m-2">
                                    <div className="w-5 h-5 flex_center border-2 border-roomi rounded-full">
                                        <FontAwesomeIcon icon={faInfo} className="w-3 h-3"/>
                                    </div>
                                    <div className="ml-4 font-bold">숙박업소 시설 정보</div>
                                </div>
                                <div className="text-gray-500 text-sm">
                                    <div className="p-1 px-2">
                                        <strong> · </strong>제공하는 시설을 선택해 주시기 바랍니다. 게스트가 기대하는
                                        기본 시설은 모두 포함하는 것이 좋습니다.
                                    </div>
                                </div>
                            </div>
                            {/*필수 시설*/}
                            <div>
                                {renderFacilities('basic')}
                            </div>
                            {/*추가 시설*/}
                            <div>
                                {renderFacilities('additional')}
                            </div>
                            {/*서비스 정보*/}
                            <div className="border border-gray-300 rounded p-4 mt-4">
                                <div className="font-bold">서비스 정보</div>
                                <div className="mt-2">
                                    <label htmlFor="checkin_service" className="text-sm font-bold">입실 안내</label>
                                    <textarea
                                        value={roomFormData.checkin_service}
                                        onChange={(e) => handleChange("checkin_service", e.target.value)}
                                        name="checkin_service"
                                        id="checkin_service"
                                        cols={30}
                                        rows={5}
                                        className="w-full mt-1 p-2 border border-gray-300 rounded focus:outline-none resize-none"></textarea>
                                </div>
                                <div className="mt-2">
                                    <label htmlFor="breakfast_service" className="text-sm font-bold">식사 정보</label>
                                    <textarea
                                        value={roomFormData.breakfast_service}
                                        onChange={(e) => handleChange("breakfast_service", e.target.value)}
                                        name="breakfast_service"
                                        id="breakfast_service"
                                        cols={30}
                                        rows={5}
                                        className="w-full mt-1 p-2 border border-gray-300 rounded focus:outline-none resize-none"></textarea>
                                </div>
                            </div>
                        </div>
                    )}
                    {currentStep === 7 && (
                        /* 사진 등록 */
                        <div>
                            {/*안내*/}
                            <div className="p-4 rounded-lg bg-roomi-000">
                                <div className="flex items-center text-roomi m-2">
                                    <div className="w-5 h-5 flex_center border-2 border-roomi rounded-full">
                                        <FontAwesomeIcon icon={faInfo} className="w-3 h-3"/>
                                    </div>
                                    <div className="ml-4 font-bold">사진 관리 팁</div>
                                </div>
                                <div className="text-gray-500 text-sm">
                                    <div className="p-1 px-2">
                                        <strong> · </strong>첫번째 사진이 대표 사진으로 설정됩니다.
                                    </div>
                                    <div className="p-1 px-2">
                                        <strong> · </strong>사진은 최소 5장 이상 등록해주시기 바랍니다.
                                    </div>
                                    <div className="p-1 px-2">
                                        <strong> · </strong>수정 된 사진은 저장 후 반영됩니다.
                                    </div>
                                </div>
                            </div>
                            {/*사진 등록*/}
                            <div>
                                <div className="border border-gray-300 rounded p-4 mt-4">
                                    <div className="flex justify-between font-bold">
                                        <div className="flex_center">사진 등록</div>
                                        <div>{selectedImages.length}/10</div>
                                    </div>
                                    <div className="flex_center mt-2">
                                        <button
                                            type="button"
                                            onClick={handleInputFileSet}
                                            className="w-1/3 rounded bg-roomi text-white text-sm p-4 flex_center gap-2"
                                        >
                                            <FontAwesomeIcon icon={faImages}/>
                                            사진 추가하기
                                        </button>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*" // 이미지 파일만 선택 가능
                                            multiple // 다중 선택 허용
                                            className="hidden"
                                            onChange={handleFileChange}
                                        />
                                    </div>
                                    {/* 선택한 이미지 미리보기 영역 */}
                                    <div className="flex flex-wrap gap-2 mt-4">
                                        {selectedImages.map((imageItem, index) => (
                                            <div key={index} className="relative">
                                                <img
                                                    src={imageItem.previewUrl}
                                                    alt={`preview-${index}`}
                                                    className={`w-64 h-44 object-cover rounded ${
                                                        index === 0 ? "border-2 border-roomi" : ""
                                                    }`}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveImage(index)}
                                                    className="absolute top-0 right-0 bg-gray-500 text-white text-xxs rounded-full w-5 h-5 flex_center"
                                                >
                                                    <FontAwesomeIcon icon={faX}/>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {currentStep === 8 && (
                        /* 공간 소개 */
                        <div>
                            {/*공간 소개*/}
                            <div className="border border-gray-300 rounded p-4">
                                <div>
                                    <div className="font-bold">공간 소개</div>
                                    <div className="mt-2">
                                        <textarea
                                            value={roomFormData.description}
                                            onChange={(e) => handleChange('description', e.target.value)}
                                            name="description"
                                            id="description"
                                            cols={30}
                                            rows={5}
                                            className="w-full mt-1 p-2 border border-gray-300 rounded focus:outline-none resize-none"></textarea>
                                    </div>
                                </div>
                                {/*추천 키워드*/}
                                <div className="mt-4">
                                    <div className="font-bold">추천 키워드</div>
                                    <div className="text-xs text-gray-500 mt-2">
                                        검색에 활용할 태그를 입력해 주시기 바랍니다. 아래 키워드를 참고하시기 바랍니다.
                                    </div>
                                    {/*태그 예시*/}
                                    <div className="flex items-center flex-wrap gap-2.5 mt-2 text-sm">
                                        <div className="flex items-center gap-2">
                                            <FontAwesomeIcon icon={faHashtag} className="text-gray-400"/>
                                            채광이 좋아요
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FontAwesomeIcon icon={faHashtag} className="text-gray-400"/>
                                            교통이 편리해요
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FontAwesomeIcon icon={faHashtag} className="text-gray-400"/>
                                            조용해요
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FontAwesomeIcon icon={faHashtag} className="text-gray-400"/>
                                            신축건물이에요
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FontAwesomeIcon icon={faHashtag} className="text-gray-400"/>
                                            주차가 가능해요
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FontAwesomeIcon icon={faHashtag} className="text-gray-400"/>
                                            보안이 좋아요
                                        </div>
                                    </div>
                                    {/* 태그 입력 영역 */}
                                    <div className="flex justify-between mt-4">
                                        <input
                                            type="text"
                                            value={tagInput}
                                            placeholder="태그 입력"
                                            onChange={(e) => setTagInput(e.target.value)}
                                            className="w-2/3 p-2 border rounded focus:outline-none"
                                        />
                                        <button onClick={handleAddTag} className="w-1/4 text-white bg-roomi rounded p-2">
                                            추가
                                        </button>
                                    </div>
                                    {/* 태그 목록 표시 영역 */}
                                    <div className="flex flex-wrap mt-6 gap-2">
                                        {roomFormData.tags?.map((tag, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center p-2 px-3 rounded text-sm text-roomi border border-roomi"
                                            >
                                                <span className="mr-2">{tag}</span>
                                                <button onClick={() => handleRemoveTag(index)}>
                                                    <FontAwesomeIcon icon={faX}/>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {currentStep === 9 && (
                        /* 이용 안내 */
                        <div>
                            <div className="border border-gray-300 rounded p-4">
                                {/*이용 규칙*/}
                                <div>
                                    <div className="font-bold">이용 규칙</div>
                                    <div className="mt-2">
                                        <textarea
                                            value={roomFormData.house_rules}
                                            onChange={(e) => handleChange('house_rules', e.target.value)}
                                            name="house_rules"
                                            id="house_rules"
                                            cols={30}
                                            rows={5}
                                            className="w-full mt-1 p-2 border border-gray-300 rounded focus:outline-none resize-none"></textarea>
                                    </div>
                                </div>
                                {/*금지 사항*/}
                                <div className="mt-4">
                                    <div className="font-bold">금지 사항 선택</div>
                                    <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mt-4">
                                        {prohibitionsList.map((item) => (
                                            <label
                                                key={item}
                                                className={`flex items-center gap-2 border rounded-md p-2 cursor-pointer hover:shadow transition-all 
                                                    ${roomFormData.prohibitions.includes(item)
                                                        ? "bg-roomi-000 border-roomi text-roomi font-bold"
                                                        : "border text-gray-700 hover:bg-gray-100"
                                                    }
                                                `}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={roomFormData.prohibitions.includes(item)}
                                                    onChange={(e) =>
                                                        setRoomFormData((prev) => {
                                                            // 체크 시 금지사항 배열에 추가, 아니면 배열에서 제거
                                                            if (e.target.checked) {
                                                                return {
                                                                    ...prev,
                                                                    prohibitions: [...prev.prohibitions, item],
                                                                };
                                                            } else {
                                                                return {
                                                                    ...prev,
                                                                    prohibitions: prev.prohibitions.filter(
                                                                        (prohibition) => prohibition !== item
                                                                    ),
                                                                };
                                                            }
                                                        })
                                                    }
                                                    className="hidden"
                                                />
                                                <span className="text-sm">{item}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                {/*교통 안내*/}
                                <div className="mt-4">
                                    <div className="font-bold">교통 안내</div>
                                    <div className="mt-2">
                                        <textarea
                                            value={roomFormData.transportation_info}
                                            onChange={(e) => handleChange('transportation_info', e.target.value)}
                                            name="transportation_info"
                                            id="transportation_info"
                                            cols={30}
                                            rows={5}
                                            className="w-full mt-1 p-2 border border-gray-300 rounded focus:outline-none resize-none"></textarea>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {currentStep === 10 && (
                        /* 체크인/체크아웃 */
                        <div>
                            <div className="border border-gray-300 rounded p-4">
                                {/*안내*/}
                                <div className="p-4 rounded-lg bg-roomi-000">
                                    <div className="flex items-center text-roomi m-2">
                                        <div className="w-5 h-5 flex_center border-2 border-roomi rounded-full">
                                            <FontAwesomeIcon icon={faInfo} className="w-3 h-3"/>
                                        </div>
                                        <div className="ml-4 font-bold">안내사항</div>
                                    </div>
                                    <div className="text-gray-500 text-sm">
                                        <div className="p-1 px-2">
                                            <strong> · </strong>입실/퇴실 시간은 게스트에게 중요한 정보입니다.
                                        </div>
                                        <div className="p-1 px-2">
                                            <strong> · </strong>청소 및 정리 시간을 고려하여 설정해주시기 바랍니다.
                                        </div>
                                        <div className="p-1 px-2">
                                            <strong> · </strong>시간이 변경되는 경우에는 게스트와 협의해주시기 바랍니다.
                                        </div>
                                    </div>
                                </div>
                                {/*입/퇴실 시간*/}
                                <div className="mt-4">
                                    {/*입실 시간*/}
                                    <div className="flex flex-col md:flex-row md:gap-8">
                                        <div className="font-bold flex_center">입실 시간</div>
                                        <div className="w-1/3 mt-4 md:mt-0 flex_center rounded">
                                            <select
                                                id="check_in_time"
                                                value={roomFormData.check_in_time}
                                                onChange={(e) => handleChange('check_in_time', e.target.value)}
                                                className="w-full border border-gray-300 rounded p-2 focus:outline-none"
                                            >
                                                <option value="">선택하세요</option>
                                                {timeOptions.map((time) => (
                                                    <option key={`in-${time}`} value={time}>
                                                        {time}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    {/*퇴실 시간*/}
                                    <div className="mt-4 flex flex-col md:flex-row md:gap-8">
                                        <div className="font-bold flex_center">퇴실 시간</div>
                                        <div className="w-1/3 mt-4 md:mt-0 flex_center rounded">
                                            <select
                                                id="check_out_time"
                                                value={roomFormData.check_out_time}
                                                onChange={(e) => handleChange('check_out_time', e.target.value)}
                                                className="w-full border border-gray-300 rounded p-2 focus:outline-none"
                                            >
                                                <option value="">선택하세요</option>
                                                {timeOptions.map((time) => (
                                                    <option key={`out-${time}`} value={time}>
                                                        {time}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {currentStep === 11 && (
                        /* 요금 설정 */
                        <div>
                            {/*안내*/}
                            <div className="p-4 rounded-lg bg-roomi-000">
                                <div className="flex items-center text-roomi m-2">
                                    <div className="w-5 h-5 flex_center border-2 border-roomi rounded-full">
                                        <FontAwesomeIcon icon={faInfo} className="w-3 h-3"/>
                                    </div>
                                    <div className="ml-4 font-bold">요금 설정 팁</div>
                                </div>
                                <div className="text-gray-500 text-sm">
                                    <div className="p-1 px-2">
                                        <strong> · </strong>주변 시세를 참고하여 설정하면 좋습니다.
                                    </div>
                                    <div className="p-1 px-2">
                                        <strong> · </strong>관리 비용은 주 또는 월 단위로 청구됩니다.
                                    </div>
                                </div>
                            </div>
                            {/*기본 요금 설정*/}
                            <div className="mt-4">
                                <div className="font-bold">
                                    <div className="font-bold">기본 요금 설정</div>
                                    <div className="flex gap-4 mt-2">
                                        <label htmlFor="week_enabled"
                                               className={`flex_center gap-2 border-2 rounded-lg p-2 px-4 text-gray-500
                                               ${roomFormData.week_enabled && "border-roomi text-roomi bg-roomi-light px-2"}`}
                                        >
                                            {roomFormData.week_enabled &&
                                                <FontAwesomeIcon icon={faCheck} className="text-lg"/>}
                                            <span className="text-sm">주</span>
                                        </label>
                                        <input
                                            id="week_enabled"
                                            name="week_enabled"
                                            type="checkbox"
                                            checked={roomFormData.week_enabled}
                                            onChange={(e) =>
                                                setRoomFormData((prev) => ({
                                                    ...prev,
                                                    week_enabled: e.target.checked,
                                                }))
                                            }
                                            className="hidden"
                                        />
                                        <label htmlFor="month_enabled"
                                               className={`flex_center gap-2 border-2 rounded-lg p-2 px-4 text-gray-500
                                               ${roomFormData.month_enabled && "border-roomi text-roomi bg-roomi-light px-2"}`}
                                        >
                                            {roomFormData.month_enabled &&
                                                <FontAwesomeIcon icon={faCheck} className="text-lg"/>}
                                            <span className="text-sm">월</span>
                                        </label>
                                        <input
                                            id="month_enabled"
                                            type="checkbox"
                                            checked={roomFormData.month_enabled}
                                            onChange={(e) =>
                                                setRoomFormData((prev) => ({
                                                    ...prev,
                                                    month_enabled: e.target.checked,
                                                }))
                                            }
                                            className="hidden"
                                        />
                                    </div>
                                </div>
                                {roomFormData.week_enabled && (
                                    <div className="mt-4">
                                        <div className="font-bold">주 단위 요금</div>
                                        <div className="mt-2">
                                            {renderSetPriceInput(false, 'week_price', '기본 요금')}
                                            {renderSetPriceInput(false, 'deposit_week', '보증금')}
                                            {renderSetPriceInput(false, 'maintenance_fee_week', '관리비')}
                                        </div>
                                    </div>
                                )}
                                {roomFormData.month_enabled && (
                                    <div className="mt-4">
                                        <div className="font-bold">월 단위 요금</div>
                                        <div className="mt-2">
                                            {renderSetPriceInput(true, 'month_price', '기본 요금')}
                                            {renderSetPriceInput(true, 'deposit_month', '보증금')}
                                            {renderSetPriceInput(true, 'maintenance_fee_month', '관리비')}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    {currentStep === 12 && (
                        /* 할인 설정 */
                        <div>
                            {/*안내*/}
                            <div className="p-4 rounded-lg bg-roomi-000">
                                <div className="flex items-center text-roomi m-2">
                                    <div className="w-5 h-5 flex_center border-2 border-roomi rounded-full">
                                        <FontAwesomeIcon icon={faInfo} className="w-3 h-3"/>
                                    </div>
                                    <div className="ml-4 font-bold">할인/할증 설정 팁</div>
                                </div>
                                <div className="text-gray-500 text-sm">
                                    <div className="p-1 px-2">
                                        <strong> · </strong>장기 이용 할인은 게스트의 장기 예약을 유도 할 수 있어요.
                                    </div>
                                    <div className="p-1 px-2">
                                        <strong> · </strong>성수기 할증은 수요가 많은 기간에 적용됩니다.
                                    </div>
                                    <div className="p-1 px-2">
                                        <strong> · </strong>적절한 할인률 설정으로 예약률을 높일 수 있어요.
                                    </div>
                                </div>
                            </div>
                            {/*할인*/}
                            <div className="mt-4">
                                {roomFormData.week_enabled && (
                                    <div className="mt-4">
                                        <div className="font-bold">주 단위 장기 숙박 할인</div>
                                        <div className="text-gray-500 text-sm">2주 이상 예약 시 할인률을 설정해주세요.</div>
                                        <div className="mt-2 flex gap-8">
                                            {renderDiscountsSet("weekly", 2)}
                                            {renderDiscountsSet("weekly", 4)}
                                            {renderDiscountsSet("weekly", 12)}
                                        </div>
                                    </div>
                                )}
                                {roomFormData.month_enabled && (
                                    <div className="mt-4">
                                        <div className="font-bold">월 단위 장기 이용 할인</div>
                                        <div className="text-gray-500 text-sm">월 단위 예약 시 할인률을 설정해주세요.</div>
                                        <div className="mt-2 flex gap-8">
                                            {renderDiscountsSet("monthly", 1)}
                                            {renderDiscountsSet("monthly", 3)}
                                            {renderDiscountsSet("monthly", 6)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    {currentStep === 13 && (
                        /* 예약 규정 */
                        <div>
                            <div className="">
                                <div className="font-bold">예약 방식</div>
                                <div className="md:flex mt-4">
                                    {/* 즉시 예약 */}
                                    <div className="md:w-1/2">
                                        <label htmlFor="auto_true"
                                               className={`block p-4 border-2 rounded-lg cursor-pointer transition mb-4 md:m-0 
                                               ${roomFormData.is_auto_accepted ? 
                                                   "bg-roomi-000 border-roomi" : "border text-gray-700 hover:bg-gray-100"}`}
                                        >
                                            <div className="flex">
                                                <div
                                                    className={`flex_center p-2 text-gray-300
                                                    ${roomFormData.is_auto_accepted && "text-roomi"}`}
                                                >
                                                    {roomFormData.is_auto_accepted ? (
                                                        <FontAwesomeIcon icon={faCheckCircle} className="w-6 h-6"/>
                                                    ) : (
                                                        <FontAwesomeIcon icon={faCircle} className="w-6 h-6"/>
                                                    )}
                                                </div>
                                                <div className="w-full ml-4">
                                                    <div
                                                        className={`font-bold 
                                                    ${roomFormData.is_auto_accepted && "text-roomi"}`}
                                                    >
                                                        즉시 예약
                                                    </div>
                                                    <div className="text-gray-500 md:text-sm text-xs mt-1">
                                                        게스트가 바로 예약 할 수 있습니다.
                                                    </div>
                                                </div>
                                            </div>
                                            <input type="radio" name="is_auto_accepted" id="auto_true"
                                                   checked={roomFormData.is_auto_accepted}
                                                   onChange={() => handleChange("is_auto_accepted", true)}
                                                   className="hidden"
                                            />
                                        </label>
                                    </div>
                                    {/* 승인 필요 */}
                                    <div className="md:w-1/2">
                                        <label htmlFor="auto_false"
                                               className={`block p-4 border-2 rounded-lg cursor-pointer transition 
                                               ${!roomFormData.is_auto_accepted ? 
                                                   "bg-roomi-000 border-roomi" : "border text-gray-700 hover:bg-gray-100"}`}
                                        >
                                            <div className="flex">
                                                <div
                                                    className={`flex_center p-2 text-gray-300
                                                    ${!roomFormData.is_auto_accepted && "text-roomi"}`}
                                                >
                                                    {!roomFormData.is_auto_accepted ? (
                                                        <FontAwesomeIcon icon={faCheckCircle} className="w-6 h-6"/>
                                                    ) : (
                                                        <FontAwesomeIcon icon={faCircle} className="w-6 h-6"/>
                                                    )}
                                                </div>
                                                <div className="w-full ml-4">
                                                    <div
                                                        className={`font-bold 
                                                    ${!roomFormData.is_auto_accepted && "text-roomi"}`}
                                                    >
                                                        승인 필요
                                                    </div>
                                                    <div className="text-gray-500 md:text-sm text-xs mt-1">
                                                        호스트가 예약을 승인 해야 합니다.
                                                    </div>
                                                </div>
                                            </div>
                                            <input type="radio" name="is_auto_accepted" id="auto_false"
                                                   checked={!roomFormData.is_auto_accepted}
                                                   onChange={() => handleChange("is_auto_accepted", false)}
                                                   className="hidden"
                                            />
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4">
                                <div className="font-bold">환불 규정</div>
                                <div className="mt-4">
                                    {/* 유연한 */}
                                    <div className="mb-2">
                                        <label htmlFor="policy_easy"
                                               className={`block p-4 border-2 rounded-lg cursor-pointer transition mb-4 md:m-0 
                                               ${roomFormData.refund_policy === '3' ?
                                                   "bg-roomi-000 border-roomi" : "border text-gray-700 hover:bg-gray-100"}`}
                                        >
                                            <div className="flex">
                                                <div
                                                    className={`flex_center p-2 text-gray-300
                                                    ${roomFormData.refund_policy === '3' && "text-roomi"}`}
                                                >
                                                    {roomFormData.refund_policy === '3' ? (
                                                        <FontAwesomeIcon icon={faCheckCircle} className="w-6 h-6"/>
                                                    ) : (
                                                        <FontAwesomeIcon icon={faCircle} className="w-6 h-6"/>
                                                    )}
                                                </div>
                                                <div className="w-full ml-4">
                                                    <div
                                                        className={`font-bold 
                                                    ${roomFormData.refund_policy === '3' && "text-roomi"}`}
                                                    >
                                                        유연한 환불 정책
                                                    </div>
                                                    <div className="text-gray-500 md:text-sm text-xs mt-1">
                                                        체크인 24시간 전까지 무료 취소
                                                    </div>
                                                </div>
                                            </div>
                                            <input type="radio" name="refund_policy" id="policy_easy"
                                                   checked={roomFormData.refund_policy === '3'}
                                                   onChange={() => handleChange("refund_policy", '3')}
                                                   className="hidden"
                                            />
                                            <div className="flex text-gray-500 md:text-sm text-xs mt-2">
                                                <div
                                                    className={`w-full ml-4 p-3 
                                                    ${roomFormData.refund_policy === '3' && "bg-gray-50 rounded-lg"}`}
                                                >
                                                    <div className="my-2">
                                                        • 체크인 24시간 전까지: 100% 환불
                                                    </div>
                                                    <div className="my-2">
                                                        • 체크인 24시간 전 ~ 당일: 50% 환불
                                                    </div>
                                                    <div className="my-2">
                                                        • 체크인 이후: 환불 불가
                                                    </div>
                                                </div>
                                            </div>
                                        </label>
                                    </div>
                                    {/* 일반 */}
                                    <div className="mb-2">
                                        <label htmlFor="policy_basic"
                                               className={`block p-4 border-2 rounded-lg cursor-pointer transition mb-4 md:m-0 
                                               ${roomFormData.refund_policy === '4' ?
                                                   "bg-roomi-000 border-roomi" : "border text-gray-700 hover:bg-gray-100"}`}
                                        >
                                            <div className="flex">
                                                <div
                                                    className={`flex_center p-2 text-gray-300
                                                    ${roomFormData.refund_policy === '4' && "text-roomi"}`}
                                                >
                                                    {roomFormData.refund_policy === '4' ? (
                                                        <FontAwesomeIcon icon={faCheckCircle} className="w-6 h-6"/>
                                                    ) : (
                                                        <FontAwesomeIcon icon={faCircle} className="w-6 h-6"/>
                                                    )}
                                                </div>
                                                <div className="w-full ml-4">
                                                    <div
                                                        className={`font-bold 
                                                    ${roomFormData.refund_policy === '4' && "text-roomi"}`}
                                                    >
                                                        일반 환불 정책
                                                    </div>
                                                    <div className="text-gray-500 md:text-sm text-xs mt-1">
                                                        체크인 3일 전까지 무료 취소
                                                    </div>
                                                </div>
                                            </div>
                                            <input type="radio" name="refund_policy" id="policy_basic"
                                                   checked={roomFormData.refund_policy === '4'}
                                                   onChange={() => handleChange("refund_policy", '4')}
                                                   className="hidden"
                                            />
                                            <div className="flex text-gray-500 md:text-sm text-xs mt-2">
                                                <div
                                                    className={`w-full ml-4 p-3 
                                                    ${roomFormData.refund_policy === '4' && "bg-gray-50 rounded-lg"}`}
                                                >
                                                    <div className="my-2">
                                                        • 체크인 3일 전까지: 100% 환불
                                                    </div>
                                                    <div className="my-2">
                                                        • 체크인 3일 전 ~ 당일: 50% 환불
                                                    </div>
                                                    <div className="my-2">
                                                        • 체크인 이후: 환불 불가
                                                    </div>
                                                </div>
                                            </div>
                                        </label>
                                    </div>
                                    {/* 엄격한 */}
                                    <div className="">
                                        <label htmlFor="policy_strict"
                                               className={`block p-4 border-2 rounded-lg cursor-pointer transition mb-4 md:m-0 
                                               ${roomFormData.refund_policy === '5' ?
                                                   "bg-roomi-000 border-roomi" : "border text-gray-700 hover:bg-gray-100"}`}
                                        >
                                            <div className="flex">
                                                <div
                                                    className={`flex_center p-2 text-gray-300
                                                    ${roomFormData.refund_policy === '5' && "text-roomi"}`}
                                                >
                                                    {roomFormData.refund_policy === '5' ? (
                                                        <FontAwesomeIcon icon={faCheckCircle} className="w-6 h-6"/>
                                                    ) : (
                                                        <FontAwesomeIcon icon={faCircle} className="w-6 h-6"/>
                                                    )}
                                                </div>
                                                <div className="w-full ml-4">
                                                    <div
                                                        className={`font-bold 
                                                    ${roomFormData.refund_policy === '5' && "text-roomi"}`}
                                                    >
                                                        엄격한 환불 정책
                                                    </div>
                                                    <div className="text-gray-500 md:text-sm text-xs mt-1">
                                                        체크인 7일 전까지 50% 환불
                                                    </div>
                                                </div>
                                            </div>
                                            <input type="radio" name="refund_policy" id="policy_strict"
                                                   checked={roomFormData.refund_policy === '5'}
                                                   onChange={() => handleChange("refund_policy", '5')}
                                                   className="hidden"
                                            />
                                            <div className="flex text-gray-500 md:text-sm text-xs mt-2">
                                                <div
                                                    className={`w-full ml-4 p-3 
                                                    ${roomFormData.refund_policy === '5' && "bg-gray-50 rounded-lg"}`}
                                                >
                                                    <div className="my-2">
                                                        • 체크인 7일 전까지: 50% 환불
                                                    </div>
                                                    <div className="my-2">
                                                        • 체크인 7일 전 ~ 당일: 환불 불가
                                                    </div>
                                                    <div className="my-2">
                                                        • 체크인 이후: 환불 불가
                                                    </div>
                                                </div>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {/*{currentStep === 14 && ()}*/}
                    {/*{currentStep === 15 && ()}*/}
                </div>

                {/* 이전/다음 버튼 */}
                <div className="flex justify-between">
                    {currentStep > 1 ? (
                        <button className="px-4 py-2 rounded-md text-roomi" onClick={handlePrev}>이전</button>
                    ) : (
                        <div></div>
                    )}
                    {currentStep === totalSteps ? (
                        <button className={`px-4 py-2 bg-roomi text-white rounded-md`} type="submit">등록</button>
                    ) : (
                        <button className={`px-4 py-2 bg-roomi text-white rounded-md`} onClick={handleNext}>다음</button>
                    )}
                </div>
            </form>

            {/* 모달 */}
            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50">
                    <div className="bg-white p-6 rounded-md shadow-md">
                        <div className="mb-4">
                            방 등록을 종료하시겠습니까?
                        </div>
                        <div className="flex justify-end">
                            <button className="px-4 py-2 bg-gray-300 rounded-md" onClick={() => setShowModal(false)}>
                                취소
                            </button>
                            <button className="px-4 py-2 mr-2 bg-red-500 text-white rounded-md" onClick={confirmBack}>
                                나가기
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyRoomInsert;
