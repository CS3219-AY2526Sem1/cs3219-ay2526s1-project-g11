export interface User {
  id: string;
  name: string;
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

export interface SignupResponse {
  message: string;
  data: User;
}

export interface GetAllUsersResponse {
  message: string;
  data: User[];
}
export type SessionJoinResponse = {
  user_id: string;
  rev: number;
  text: string;
};

export interface RequestMatchResponse {
  matchId: string;
  partnerId: string;
  status: string;
}

export interface CancelMatchResponse {
  status: string;
}

export interface RequestMatchPayload {
  userId: string;
  topics: string[];
  difficulty: "easy" | "medium" | "difficult";
}

export type GetMatchStatusResponse =
  | { status: 0 }
  | { status: 1; queue: string; position: number }
  | { status: 2; matchId: string };

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
