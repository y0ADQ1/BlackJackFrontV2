export interface User {
    id: number;
    fullName: string | null;
    email: string;
    password: string;
    createdAt: string;
    updatedAt: string | null;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    user: User;
    token: {
        type: 'bearer',
        value: string;
    }
}