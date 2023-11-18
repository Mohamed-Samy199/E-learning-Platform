import bcrypt from "bcryptjs";

export const hash = ({plaintext , salt = process.env.SALT_ROUND }={})=>{
    const hashResult = bcrypt.hashSync(plaintext , +salt);
    return hashResult;
}

export const compary = ({plaintext , hashValue}={})=>{
    const match = bcrypt.compareSync(plaintext , hashValue);
    return match;
}