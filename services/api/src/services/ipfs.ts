type PinataPinResponse = {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
  isDuplicate?: boolean;
};

const getPinataJwt = () => {
  const jwt = process.env.PINATA_JWT;
  if (!jwt) {
    throw new Error("PINATA_JWT not configured");
  }
  return jwt;
};

export const pinJsonToIpfs = async (
  content: Record<string, any>,
  name?: string
) => {
  const jwt = getPinataJwt();
  const body = {
    pinataMetadata: name ? { name } : undefined,
    pinataContent: content,
  };

  const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Pinata error: ${res.status} ${text}`);
  }

  const data = (await res.json()) as PinataPinResponse;
  return data;
};
