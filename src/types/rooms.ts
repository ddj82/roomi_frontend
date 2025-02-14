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
export interface Season {
    name: string;
    description?: string;
}

export interface SeasonalPrice {
    start_date: string;
    end_date: string;
    hour_price?: number;
    day_price?: number;
    week_price?: number;
    season: Season;
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
    seasonal_prices: SeasonalPrice[];
}

export interface RoomData {
    id: number;
    title: string;
    address?: string;
    coordinate_long: number;
    coordinate_lat: number;
    thumbnail_url?: string;
    detail_urls?: string[];
    created_at?: string;
    updated_at?: string;

    // Booking unit prices
    hour_enabled: boolean;
    hour_price?: number;
    min_hours?: number;

    day_enabled: boolean;
    day_price?: number;
    min_days?: number;

    week_enabled: boolean;
    week_price?: number;
    min_weeks?: number;

    // Additional fees
    maintenance_fee?: number;
    cleaning_fee?: number;
    deposit?: number;

    maintenance_fee_week?: number;
    cleaning_fee_week?: number;
    deposit_week?: number;

    cleaning_time: number;
    is_active?: boolean;
    host_id?: number;

    // Room details
    description?: string;
    max_guests?: number;
    check_in_time?: string;
    check_out_time?: string;
    facilities?: Record<string, any>;
    room_size?: number;
    bed_configs?: Record<string, any>;
    amenities?: Record<string, any>;
    house_rules?: string;

    // Availability
    unavailable_dates?: UnavailableDates;
}

export interface schedules {
    date: Date;
    dayPrice: number | null;
    isAvailable: boolean;
    description: string;
    reason: string;
    isBlocked: string;
}