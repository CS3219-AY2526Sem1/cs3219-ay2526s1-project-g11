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
