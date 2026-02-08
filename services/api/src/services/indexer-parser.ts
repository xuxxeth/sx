import {
  Idl,
  Program,
  AnchorProvider,
  EventParser,
  BN,
  BorshCoder,
} from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import fs from "fs";
import path from "path";
import bs58 from "bs58";

const idlPath = path.resolve(
  __dirname,
  "../../../../contracts/solana/target/idl/solana.json"
);
const isDebug = () => process.env.INDEXER_DEBUG === "true";

const loadIdl = (): Idl | null => {
  if (!fs.existsSync(idlPath)) {
    return null;
  }
  const raw = fs.readFileSync(idlPath, "utf8");
  return JSON.parse(raw) as Idl;
};

export type ParsedEvent =
  | { type: "profile"; data: { authority: string; username: string; displayName: string; bioCid: string; avatarCid: string } }
  | { type: "follow"; data: { follower: string; following: string } }
  | { type: "unfollow"; data: { follower: string; following: string } }
  | { type: "post"; data: { author: string; postId: number; contentCid: string; visibility: number } }
  | { type: "tip"; data: { from: string; to: string; tipId: number; amountLamports: number } }
  | { type: "like"; data: { liker: string; postAuthor: string; postId: number } }
  | { type: "comment"; data: { author: string; postAuthor: string; postId: number; commentId: number; contentCid: string } }
  | { type: "topic"; data: { topic: string; author: string; postId: number } };

const toNumber = (value: unknown) => {
  if (value instanceof BN) {
    return value.toNumber();
  }
  if (typeof value === "number") {
    return value;
  }
  return Number(value);
};

export const parseEventsFromLogs = (
  connection: Connection,
  programId: PublicKey,
  logs: string[]
): ParsedEvent[] => {
  const idl = loadIdl();
  if (!idl) {
    return [];
  }

  const provider = new AnchorProvider(connection, {} as any, { commitment: "confirmed" });
  const idlWithAddress = { ...idl, address: programId.toBase58() } as Idl;
  const program = new Program(idlWithAddress, provider);
  const parser = new EventParser(programId, program.coder);

  const parsed: ParsedEvent[] = [];
  const handleEvent = (name: string, data: Record<string, any>) => {
    if (name === "ProfileCreated" || name === "ProfileUpdated") {
      parsed.push({
        type: "profile",
        data: {
          authority: data.authority.toString(),
          username: data.username,
          displayName: data.displayName ?? data.display_name,
          bioCid: data.bioCid ?? data.bio_cid,
          avatarCid: data.avatarCid ?? data.avatar_cid,
        },
      });
    }
    if (name === "Followed") {
      const follower = data.follower.toString();
      const following = data.following.toString();
      if (follower !== following) {
        parsed.push({
          type: "follow",
          data: { follower, following },
        });
      }
    }
    if (name === "Unfollowed") {
      parsed.push({
        type: "unfollow",
        data: {
          follower: data.follower.toString(),
          following: data.following.toString(),
        },
      });
    }
    if (name === "PostIndexed") {
      parsed.push({
        type: "post",
        data: {
          author: data.author.toString(),
          postId: toNumber(data.postId ?? data.post_id),
          contentCid: data.contentCid ?? data.content_cid,
          visibility: data.visibility,
        },
      });
    }
    if (name === "Tipped") {
      parsed.push({
        type: "tip",
        data: {
          from: data.from.toString(),
          to: data.to.toString(),
          tipId: toNumber(data.tipId ?? data.tip_id),
          amountLamports: toNumber(data.amountLamports ?? data.amount_lamports),
        },
      });
    }
    if (name === "PostLiked") {
      parsed.push({
        type: "like",
        data: {
          liker: data.liker.toString(),
          postAuthor: data.postAuthor?.toString() ?? data.post_author.toString(),
          postId: toNumber(data.postId ?? data.post_id),
        },
      });
    }
    if (name === "PostUnliked") {
      parsed.push({
        type: "unlike",
        data: {
          liker: data.liker.toString(),
          postAuthor: data.postAuthor?.toString() ?? data.post_author.toString(),
          postId: toNumber(data.postId ?? data.post_id),
        },
      });
    }
    if (name === "CommentCreated") {
      parsed.push({
        type: "comment",
        data: {
          author: data.author.toString(),
          postAuthor: data.postAuthor?.toString() ?? data.post_author.toString(),
          postId: toNumber(data.postId ?? data.post_id),
          commentId: toNumber(data.commentId ?? data.comment_id),
          contentCid: data.contentCid ?? data.content_cid,
        },
      });
    }
    if (name === "TopicIndexed") {
      parsed.push({
        type: "topic",
        data: {
          topic: data.topic,
          author: data.author.toString(),
          postId: toNumber(data.postId ?? data.post_id),
        },
      });
    }
  };

  parser.parseLogs(logs, (event) => {
    const name = event.name;
    const data = event.data as Record<string, any>;
    handleEvent(name, data);
  });

  if (isDebug()) {
    // eslint-disable-next-line no-console
    console.log("Indexer: parsed events", parsed.length, parsed);
  }

  if (parsed.length === 0) {
    const eventCoder = new BorshCoder(idlWithAddress);
    logs.forEach((line) => {
      const match = line.match(/Program data: (.*)/);
      if (!match) return;
      try {
        const raw = match[1].trim();
        if (isDebug()) {
          // eslint-disable-next-line no-console
          console.log("Indexer: program data raw", raw.slice(0, 32), raw.length);
        }
        const decoded = eventCoder.events.decode(Buffer.from(raw, "base64"));
        if (isDebug()) {
          // eslint-disable-next-line no-console
          console.log(
            "Indexer: program data decoded",
            decoded ? decoded.name : null,
            decoded ? decoded.data : null
          );
        }
        if (decoded) {
          handleEvent(decoded.name, decoded.data as Record<string, any>);
        }
      } catch (err) {
        if (isDebug()) {
          // eslint-disable-next-line no-console
          console.log("Indexer: program data decode error", err);
        }
      }
    });
  }

  return parsed;
};

const decodeInstructionData = (coder: BorshCoder, data: unknown) => {
  if (!data) return null;
  if (data instanceof Buffer || data instanceof Uint8Array) {
    return coder.instruction.decode(Buffer.from(data as Uint8Array));
  }
  if (typeof data === "string") {
    try {
      const base64 = Buffer.from(data, "base64");
      const decoded = coder.instruction.decode(base64);
      if (decoded) return decoded;
    } catch (_) {
      // ignore
    }
    try {
      return coder.instruction.decode(bs58.decode(data));
    } catch (_) {
      return null;
    }
  }
  return null;
};

export const parseInstructionsFromTransaction = (
  programId: PublicKey,
  transaction: any
): ParsedEvent[] => {
  const idl = loadIdl();
  if (!idl) {
    return [];
  }

  const idlWithAddress = { ...idl, address: programId.toBase58() } as Idl;
  const coder = new BorshCoder(idlWithAddress);

  const message = transaction?.transaction?.message;
  if (!message) return [];

  const staticKeys = message.staticAccountKeys ?? message.accountKeys ?? [];
  const loaded = transaction?.meta?.loadedAddresses;
  const allKeys = [
    ...staticKeys,
    ...(loaded?.writable ?? []),
    ...(loaded?.readonly ?? []),
  ];

  const instructions = message.compiledInstructions ?? message.instructions ?? [];
  const parsed: ParsedEvent[] = [];

  for (const ix of instructions) {
    const programKey = ix.programId
      ? new PublicKey(ix.programId)
      : allKeys[ix.programIdIndex];
    if (!programKey || !programKey.equals(programId)) continue;

    const decoded = decodeInstructionData(coder, ix.data);
    if (!decoded) continue;

    const name = decoded.name;
    const data: Record<string, any> = decoded.data || {};

    if (name === "create_post_index" || name === "createPostIndex") {
      const authorKey = allKeys[ix.accounts?.[0] ?? 0];
      parsed.push({
        type: "post",
        data: {
          author: authorKey?.toString() || "",
          postId: toNumber(data.postId ?? data.post_id),
          contentCid: data.contentCid ?? data.content_cid,
          visibility: data.visibility ?? 0,
        },
      });
    }
    if (name === "follow") {
      const followerKey = allKeys[ix.accounts?.[0] ?? 0];
      const followingKey = allKeys[ix.accounts?.[1] ?? 0];
      if (followerKey && followingKey && !followerKey.equals(followingKey)) {
        parsed.push({
          type: "follow",
          data: {
            follower: followerKey.toString(),
            following: followingKey.toString(),
          },
        });
      }
    }
    if (name === "unfollow") {
      const followerKey = allKeys[ix.accounts?.[0] ?? 0];
      const followingKey = allKeys[ix.accounts?.[1] ?? 0];
      if (followerKey && followingKey && !followerKey.equals(followingKey)) {
        parsed.push({
          type: "unfollow",
          data: {
            follower: followerKey.toString(),
            following: followingKey.toString(),
          },
        });
      }
    }
    if (name === "tip") {
      const fromKey = allKeys[ix.accounts?.[0] ?? 0];
      const toKey = allKeys[ix.accounts?.[1] ?? 0];
      if (fromKey && toKey) {
        parsed.push({
          type: "tip",
          data: {
            from: fromKey.toString(),
            to: toKey.toString(),
            tipId: toNumber(data.tipId ?? data.tip_id),
            amountLamports: toNumber(data.amountLamports ?? data.amount_lamports),
          },
        });
      }
    }
    if (name === "like_post" || name === "likePost") {
      const likerKey = allKeys[ix.accounts?.[0] ?? 0];
      const postAuthorKey = allKeys[ix.accounts?.[1] ?? 0];
      if (likerKey && postAuthorKey) {
        parsed.push({
          type: "like",
          data: {
            liker: likerKey.toString(),
            postAuthor: postAuthorKey.toString(),
            postId: toNumber(data.postId ?? data.post_id),
          },
        });
      }
    }
    if (name === "create_comment" || name === "createComment") {
      const authorKey = allKeys[ix.accounts?.[0] ?? 0];
      const postAuthorKey = allKeys[ix.accounts?.[1] ?? 0];
      if (authorKey && postAuthorKey) {
        parsed.push({
          type: "comment",
          data: {
            author: authorKey.toString(),
            postAuthor: postAuthorKey.toString(),
            postId: toNumber(data.postId ?? data.post_id),
            commentId: toNumber(data.commentId ?? data.comment_id),
            contentCid: data.contentCid ?? data.content_cid,
          },
        });
      }
    }
    if (name === "index_topic" || name === "indexTopic") {
      const authorKey = allKeys[ix.accounts?.[0] ?? 0];
      if (authorKey) {
        parsed.push({
          type: "topic",
          data: {
            topic: data.topic,
            author: authorKey.toString(),
            postId: toNumber(data.postId ?? data.post_id),
          },
        });
      }
    }
  }

  return parsed;
};
