export interface User {
    name: string;
    email: string;
    password: string;
    channel?: string;
    nationality?: string;
    sex?: string;
    birth: string;
    channel_uid?: string;
    profile_image?: string;
    accept_SMS? : boolean;
    accept_alert? : boolean;
    accept_email? : boolean;
}