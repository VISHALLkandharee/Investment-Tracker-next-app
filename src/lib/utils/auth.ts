import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export interface tokenPayload {
  userId: string;
  email: string;
}

export const generateAccessToken = (payload: tokenPayload): string => {
  return jwt.sign(payload, process.env.ACCESSTOKEN_SECRET as string, {
    expiresIn: "1d",
  });
};

export const verifyAccessToken = (token: string): tokenPayload => {
  return jwt.verify(
    token,
    process.env.ACCESSTOKEN_SECRET as string,
  ) as tokenPayload;
};
export const generateRefreshToken = (payload: tokenPayload): string => {
  return jwt.sign(payload, process.env.REFRESHTOKEN_SECRET as string, {
    expiresIn: "30d",
  });
};

export const verifyRefreshToken = (token: string): tokenPayload => {
  return jwt.verify(
    token,
    process.env.REFRESHTOKEN_SECRET as string,
  ) as tokenPayload;
};

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

export const comparePassword = async (
  password: string,
  userPassword: string,
): Promise<boolean> => {
  return await bcrypt.compare(password, userPassword);
};
