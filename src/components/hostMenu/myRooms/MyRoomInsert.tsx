import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import {RoomFormData} from "../../../types/rooms";
import {createRoom} from "../../../api/api";
import MyRoomForm from "./MyRoomForm";

const EMPTY_FORM: RoomFormData = {
    room_type: "",
    title: "",
    address: "",
    address_detail: "",
    detail_urls: [],
    has_elevator: false,
    has_parking: false,
    building_type: "",
    is_auto_accepted: false,
    week_enabled: true,
    month_enabled: false,
    detail: {
        room_structure: "",
        facilities : {},
        additional_facilities: {},
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
    },
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
    business_number: "",
    business_name: "",
    business_representative: "",
    business_address: "",
    business_additionalAddress: "",
    business_licenseFile: null,
    business_licenseNumber: "",
    business_identificationFile: null,
    business_licenseType: "",
};

const MyRoomInsert = () => {
    const navigate = useNavigate();

    const handleCreate = async (data: RoomFormData, files: File[]) => {
        try {
            await createRoom(data, files);
            navigate("/host");
        } catch (e) {
            console.error("방 등록 실패", e);
        }
    };

    return <MyRoomForm mode="insert" initialData={EMPTY_FORM} onSubmit={handleCreate} />;
};

export default MyRoomInsert;
