// src/types/room.ts
export interface ApiResponse {
    success: boolean;
    message?: string;
    data: {
        items: RoomData[];
        total?: number;
        page?: number;
        size?: number;
    };
}

export interface RoomOperationHour {
    day_of_week: number;
    is_open: boolean;
    open_time?: string;
    close_time?: string;
}

export interface BlockedDate {
    start_date: string;
    end_date: string;
    block_type: string;
    reason?: string;
}

export interface Reservation {
    check_in_date: string;
    check_out_date: string;
    status: string;
}

export interface UnavailableDates {
    blocked_dates: BlockedDate[];
    reservations: Reservation[];
    operation_hours: RoomOperationHour[];
}

export interface Host {
    name?: string;
    profile_image?: string;
}

export interface RoomData {
    id: number;
    title: string;
    address?: string;
    address_detail?: string;
    coordinate_long: number;
    coordinate_lat: number;
    thumbnail_url?: string;
    detail_urls?: string[];
    created_at?: Date;
    updated_at?: Date;

    // 숙소 기본 정보 추가
    accommodation_type?: string;
    short_description?: string;

    // 건물 정보 추가
    building_type?: string;
    floor_area?: number;
    floor?: number;
    has_elevator: boolean;
    has_parking: boolean;

    // 예약 관련 추가
    is_auto_accepted: boolean;
    refund_policy?: string;

    // 기존 가격 정보
    hour_enabled: boolean;
    hour_price?: number;
    min_hours?: number;
    day_enabled: boolean;
    day_price?: number;
    min_days?: number;
    week_enabled: boolean;
    week_price?: number;
    min_weeks?: number;
    maintenance_fee?: number;
    maintenance_fee_week?: number;
    cleaning_fee?: number;
    cleaning_fee_week?: number;
    deposit?: number;
    deposit_week?: number;
    cleaning_time: number;
    breakfast_service: string;
    checkin_service: string;

    // 상세 정보
    description?: string;
    transportation_info?: string;
    room_structure?: string;
    room_count?: number;
    bathroom_count?: number;
    max_guests?: number;
    check_in_time?: string;
    check_out_time?: string;
    facilities?: Record<string, any>;
    room_size?: number;
    bed_configs?: Record<string, any>;
    amenities?: Record<string, any>;
    features?: Record<string, any>;
    tags?: string[];
    prohibitions?: string[];
    house_rules?: string;
    additional_facilities?: Record<string, any>;

    // 인증 관련 추가
    business_license_url?: string;
    is_verified: boolean;
    verified_at?: Date;

    is_confirmed?: boolean;
    is_active?: boolean;
    is_rejected?: boolean;
    is_deleted: boolean;
    host_id?: number;
    unavailable_dates: UnavailableDates;
    discounts?: any[];
    reviews?: any[];
    host: Host;

    is_favorite: boolean;
    currency: string;
}

export interface Schedules {
    date: Date;
    dayPrice: number | null;
    isAvailable: boolean;
    description: string;
    reason: string;
    isBlocked: string;
}
