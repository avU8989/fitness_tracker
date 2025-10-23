import * as Crypto from "expo-crypto";

export const randomBytes = async (len: number): Promise<Uint8Array> => {
    return await Crypto.getRandomBytesAsync(len);
};
