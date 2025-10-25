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

export interface UserSessionQuestion {
  title: string;
  difficulty: string;
  topic: string;
}

export interface UserSession {
  peerUserId: string;
  startTimestamp: Date;
  endTimestamp: Date;
  questionId: string;
  _id: string;
  peerName?: string;
  peerUsername?: string;
  question: UserSessionQuestion;
}

export interface UserStatisticsResponse {
  message: string;
  data: {
    totalSessions: number;
    hoursPracticed: number;
    peersMet: number;
    sessions: UserSession[];
  };
}
