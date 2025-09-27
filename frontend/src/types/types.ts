export interface User {
	id: string;
	username: string;
	email: string;
	isAdmin: boolean;
	createdAt: string;
}

export interface VerifyTokenResponse {
	message: string;
	data: User;
}

export interface LoginResponse {
	message: string;
	data: User & { accessToken: string };
}

export type SessionJoinResponse = {
	user_id: string;
	rev: number;
	text: string;
};

export type Delta = {
	from: number;
	to: number;
	text: string;
};

export type CodeUpdateResponse = {
	rev: number;
	delta: Delta;
	by: string;
};
