import { AnchorProvider, Program, web3, BN } from "@coral-xyz/anchor";
import type { Wallet } from "@coral-xyz/anchor";
import { loadIdl } from "./idl";

export const getProgramId = () => {
  const programId = process.env.NEXT_PUBLIC_SOLANA_PROGRAM_ID;
  if (!programId) {
    throw new Error("NEXT_PUBLIC_SOLANA_PROGRAM_ID is not set");
  }
  return new web3.PublicKey(programId);
};

export const getProvider = (wallet: Wallet, endpoint: string) => {
  const connection = new web3.Connection(endpoint, "confirmed");
  return new AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
};

export const getProgram = async (wallet: Wallet, endpoint: string) => {
  const provider = getProvider(wallet, endpoint);
  const programId = getProgramId();
  const idl = await loadIdl();
  const idlWithAddress = { ...idl, address: programId.toBase58() };
  return new Program(idlWithAddress as any, provider);
};

export const deriveProfilePda = (authority: web3.PublicKey) =>
  web3.PublicKey.findProgramAddressSync(
    [Buffer.from("profile"), authority.toBuffer()],
    getProgramId()
  );

export const deriveUsernamePda = (username: string) =>
  web3.PublicKey.findProgramAddressSync(
    [Buffer.from("username"), Buffer.from(username)],
    getProgramId()
  );

export const derivePostPda = (author: web3.PublicKey, postId: number) =>
  web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("post"),
      author.toBuffer(),
      Buffer.from(new BN(postId).toArray("le", 8)),
    ],
    getProgramId()
  );

export const deriveFollowPda = (
  follower: web3.PublicKey,
  following: web3.PublicKey
) =>
  web3.PublicKey.findProgramAddressSync(
    [Buffer.from("follow"), follower.toBuffer(), following.toBuffer()],
    getProgramId()
  );

export const deriveTipPda = (from: web3.PublicKey, tipId: number) =>
  web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("tip"),
      from.toBuffer(),
      Buffer.from(new BN(tipId).toArray("le", 8)),
    ],
    getProgramId()
  );

export const deriveLikePda = (
  liker: web3.PublicKey,
  postAuthor: web3.PublicKey,
  postId: number
) =>
  web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("like"),
      liker.toBuffer(),
      postAuthor.toBuffer(),
      Buffer.from(new BN(postId).toArray("le", 8)),
    ],
    getProgramId()
  );

export const deriveCommentPda = (
  author: web3.PublicKey,
  postId: number,
  commentId: number
) =>
  web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("comment"),
      author.toBuffer(),
      Buffer.from(new BN(postId).toArray("le", 8)),
      Buffer.from(new BN(commentId).toArray("le", 8)),
    ],
    getProgramId()
  );

export const deriveTopicPda = (
  author: web3.PublicKey,
  postId: number,
  topic: string
) =>
  web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("topic"),
      Buffer.from(topic),
      author.toBuffer(),
      Buffer.from(new BN(postId).toArray("le", 8)),
    ],
    getProgramId()
  );
