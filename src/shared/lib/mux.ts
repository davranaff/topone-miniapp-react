import { KJUR } from "jsrsasign";

const viteEnv = import.meta.env as Record<string, string | undefined>;

const HARDCODED_SIGNING_KEY_ID = "kZZ8Mo01KLFOolYw1GEscTxjxb27AOt68dcb9TWasYV00";
const HARDCODED_SIGNING_KEY_PEM = [
  "-----BEGIN RSA PRIVATE KEY-----",
  "MIIEowIBAAKCAQEAuiHdqxfK0LOe/NWYqaZppaTWyYCwlRnunmKIctbAGDD9GEwy",
  "07xn/G8KFB1mIu5TpxdXgwyOOyw0Ogbwfo82MD1Bf/7D+wZLIdD1ADwpXB5wfcZE",
  "dIxMBCXQjl1G3zU2hbxoNM/0qMuYb8kSznBOJ3hu+F/JlDwvAixE2vh1qFcLDgYr",
  "MSmtsHbDRwwV4u6ywB5FDvbidvPCGqbMvAJ/5vS3aCNTO02yCeDnArCHIygGdg9D",
  "TJwjCNP2Nh2wYh79coMIbhoFBnbXXE15HgHNxzXBSPmb/k4MwbrEyufan6yeLvOA",
  "GpE/MNMobtMHR9JzmJQt2Zg9mJWdy5V/JTP8zwIDAQABAoIBADPjK/W9oLLUV95Y",
  "twGYG/xqutuabd9qxrvNcQc+eXdk9LE40LR44a4b0D3yQh47vQMn/SPRtLanKHoC",
  "pDlLuAnzkZZaUYzhYMFxDFN/8fG1pJtTUZMB51ECr6R4OUERBv16G7yZOjVx6DFF",
  "ZuI4qXjUWG8R2NJjgqFC8QDv4XDHNNtRpCflJSHPt5T6T6AJbcuZhhNTImHL48Ot",
  "xj5/Zxd0/SrIJbzW2C579M0wpXRybhg/SNbmMRmBWbVk2u8EeKIU41qbehyj+onO",
  "4puJGZqx49gnwQkoWStckjDDHDDstwhklHQRiEiAqcru/Hg8oHY5AEFuhuskB76Q",
  "1/LeCv0CgYEAxxCfOAM8zDDg0sE/84psB8TJb4E9ryLlgic6mtn9Eqle3xOjhItz",
  "RgRymCjIplgCeM0Y7fue0ryznpTRWwJ49cEcCabivKpAClz1j6WetGVEz+Imxn3B",
  "qq9wLy7RTSp/bxF/QG0Y9MNkeV8VnnaMpGP9zh1x2qe4m48kNGakFlMCgYEA715T",
  "fK0BvOtoCxgvy8zVdKXvaOkPfHI2rosAYmPdgtXvLfTKO+2QEl14EhddcLiKMKSe",
  "vYnIC6I7v2N+1/w3vHPYbwgjTEEHWF41ZovY8t2ET6Q+41yWTJ9bqjJBSobh7IT9",
  "hgvCe0nOd/hkKmj2fUGAGDIKHlc3wTsqiwQ0OBUCgYBs5HDUaSD26b3yS/g5tvzF",
  "eyZdsqsVhNdbTS5HyvsfHDtjeBC4zreuE3zEM3sfU4F2p2r9s+j7inIPS4UCbeXR",
  "OWOm+/2ICvGhOZyyiXy5XbQ4q5NefShVwEZz6P5hYd/31/BuQ7+lFMV/hz4CQwNI",
  "YdJSz9SaMalQnwrFB2i3NQKBgQCDBe3LA+Q8pdqYoA+hjaiVpjKrCU95vgbieaGn",
  "OaTJdhLq4+BC92FyPAl6VaHHDqxNvf5KH34JqC7uLycCUMOtevfQpvKzTbEYlNDE",
  "Je6F2e0Prwbhaw+2N1B0k/ebNMO7tHwVgKBe3eKPVr51XGj33P+hvto9C16wfZNm",
  "7tEqlQKBgD/g3dCi1EN8/cJEbvIe52QVsJl5p+Ll4oaAS8QpZGuoGdhDeUmUJMS0",
  "mPJ+Els145pr9lAPrzd47MhnNBYRQ0CNYBXmqbnxxz7uJ4DDOerrk4GR6KqKtYfG",
  "Ei5gtI1YrgB1+SPGWrJ/abGKig7JkG7/clfEM7yf8STeTZk2Tg0l",
  "-----END RSA PRIVATE KEY-----",
].join("\n");

const firstNonEmpty = (...values: Array<string | undefined>) => {
  for (const value of values) {
    const normalized = value?.trim();
    if (normalized) {
      return normalized;
    }
  }

  return undefined;
};

const normalizeMultilineKey = (value: string) => {
  return value
    .replaceAll("\\n", "\n")
    .replaceAll("\r\n", "\n")
    .replaceAll("\r", "\n")
    .trim();
};

const getSigningKeyId = () => {
  return firstNonEmpty(
    viteEnv.VITE_MUX_SIGNING_KEY_ID,
    viteEnv.VITE_MUX_KEY_ID,
    viteEnv.VITE_MUX_PLAYBACK_SIGNING_KEY_ID,
    HARDCODED_SIGNING_KEY_ID,
  );
};

const getSigningKey = () => {
  const fromEnv = firstNonEmpty(
    viteEnv.VITE_MUX_SIGNING_KEY,
    viteEnv.VITE_MUX_PRIVATE_KEY,
    viteEnv.VITE_MUX_SIGNING_PRIVATE_KEY,
    viteEnv.VITE_MUX_PLAYBACK_PRIVATE_KEY,
  );

  return normalizeMultilineKey(fromEnv ?? HARDCODED_SIGNING_KEY_PEM);
};

const getStreamDomain = () => {
  return firstNonEmpty(viteEnv.VITE_MUX_STREAM_DOMAIN, viteEnv.VITE_MUX_PLAYBACK_DOMAIN) ?? "stream.mux.com";
};

export type MuxPlaybackUrlResult = {
  url: string;
  kind: "signed" | "public";
  playbackToken?: string;
};

export const getPublicMuxPlaybackUrl = (playbackId: string) => {
  return `https://${getStreamDomain()}/${playbackId}.m3u8`;
};

export const getSignedMuxPlaybackUrl = (playbackId: string, ttlSeconds = 3600): MuxPlaybackUrlResult => {
  const keyId = getSigningKeyId();
  const privateKey = getSigningKey();

  if (!keyId || !privateKey) {
    throw new Error("Mux signed playback is not configured");
  }

  const now = Math.floor(Date.now() / 1000);
  const header = JSON.stringify({ alg: "RS256", typ: "JWT", kid: keyId });
  const payload = JSON.stringify({
    sub: playbackId,
    aud: "v",
    exp: now + ttlSeconds,
    iat: now,
  });
  const playbackToken = KJUR.jws.JWS.sign("RS256", header, payload, privateKey);

  return {
    url: `${getPublicMuxPlaybackUrl(playbackId)}?token=${encodeURIComponent(playbackToken)}`,
    kind: "signed",
    playbackToken,
  };
};

export const getMuxPlaybackUrl = (playbackId: string, ttlSeconds = 3600): MuxPlaybackUrlResult => {
  const normalizedPlaybackId = playbackId.trim();

  if (!normalizedPlaybackId) {
    throw new Error("Mux playback ID is empty");
  }

  try {
    return getSignedMuxPlaybackUrl(normalizedPlaybackId, ttlSeconds);
  } catch {
    return {
      url: getPublicMuxPlaybackUrl(normalizedPlaybackId),
      kind: "public",
    };
  }
};
