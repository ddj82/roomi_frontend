declare module "src/components/toss/Checkout.jsx" {
    import React from "react";
    import {Reservation} from "./reservation";
    import {RoomData} from "./rooms";

    interface BookData {
        reservation: Reservation;
        room: RoomData;
    }

    interface FormDataState {
        name: string,
        phone: string,
        email: string,
        currency: string,
    }

    interface PaymentData {
        bookData: BookData,
        formDataState: FormDataState,
        price: number,
    }

    interface CheckoutPageProps {
        paymentData: PaymentData
    }

    export const CheckoutPage: React.FC<CheckoutPageProps>;
}