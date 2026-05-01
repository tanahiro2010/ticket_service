import { SignJWT, jwtVerify, decodeJwt, JWTPayload as JoseJWTPayload } from 'jose';

export type TokenPayload = Record<string, any> & { sub?: string; email?: string };

const DEFAULT_ALG = 'HS256';

function getSecretKey(secret?: string) {
	const key = secret ?? process.env.JWT_SECRET_KEY;
	if (!key) throw new Error('JWT secret not set in environment (JWT_SECRET_KEY)');
	return new TextEncoder().encode(key);
}

export async function signJwt(
	payload: TokenPayload,
	opts?: { expiresIn?: string | number; secret?: string; alg?: string; subject?: string }
) {
	const { expiresIn, secret, alg = DEFAULT_ALG, subject } = opts ?? {};

	const signer = new SignJWT({ ...payload });
	signer.setProtectedHeader({ alg });
	if (subject) signer.setSubject(subject);
	signer.setIssuedAt();
	if (expiresIn) signer.setExpirationTime(expiresIn);

	const key = getSecretKey(secret);
	return await signer.sign(key);
}

export async function verifyJwt(
	token: string,
	opts?: { secret?: string; algorithms?: string[] }
) {
	const key = getSecretKey(opts?.secret);
	const { payload } = await jwtVerify(token, key, { algorithms: opts?.algorithms ?? [DEFAULT_ALG] });
	return payload as TokenPayload & JoseJWTPayload;
}

export function decodeToken(token: string) {
	try {
		return decodeJwt(token) as TokenPayload & JoseJWTPayload;
	} catch {
		return null;
	}
}

