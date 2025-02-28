import {create} from "zustand";

interface SignUpChannelState {
    signUpChannel: string;
    setSignUpChannel: (value: string) => void;
}

export const useSignUpChannelStore = create<SignUpChannelState> ((set) => ({
    signUpChannel: 'email',
    setSignUpChannel: ((value) => set({signUpChannel: value})),
}));