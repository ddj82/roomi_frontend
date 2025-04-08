export interface Reservation {
    checkIn: string;
    checkOut: string;
    selectionMode: string;
    roomId: number;
    unit: number;
    guestName: string;
    guestPhone: string;
    guestEmail: string;
    totalGuests: number;
    currency: string;
}