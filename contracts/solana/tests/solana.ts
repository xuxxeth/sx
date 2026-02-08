import anchorPkg from "@coral-xyz/anchor";
import type { Program } from "@coral-xyz/anchor";
import { assert } from "chai";

const anchor = anchorPkg;
const { BN } = anchorPkg;

const MAX_CID = "bafybeigdyrzt3bq3w7zjz7r2y4i4c6s4m6g3v7u6e5c3x7z2m5g4o5n6r";

describe("solana", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Solana as Program;

  const { Keypair, PublicKey, SystemProgram } = anchor.web3;

  const deriveProfilePda = (authority: anchor.web3.PublicKey) =>
    PublicKey.findProgramAddressSync(
      [Buffer.from("profile"), authority.toBuffer()],
      program.programId
    );

  const deriveUsernamePda = (username: string) =>
    PublicKey.findProgramAddressSync(
      [Buffer.from("username"), Buffer.from(username)],
      program.programId
    );

  const deriveFollowPda = (
    follower: anchor.web3.PublicKey,
    following: anchor.web3.PublicKey
  ) =>
    PublicKey.findProgramAddressSync(
      [Buffer.from("follow"), follower.toBuffer(), following.toBuffer()],
      program.programId
    );

  const derivePostPda = (author: anchor.web3.PublicKey, postId: number) =>
    PublicKey.findProgramAddressSync(
      [
        Buffer.from("post"),
        author.toBuffer(),
        Buffer.from(new BN(postId).toArray("le", 8)),
      ],
      program.programId
    );

  const deriveTipPda = (from: anchor.web3.PublicKey, tipId: number) =>
    PublicKey.findProgramAddressSync(
      [
        Buffer.from("tip"),
        from.toBuffer(),
        Buffer.from(new BN(tipId).toArray("le", 8)),
      ],
      program.programId
    );

  const deriveLikePda = (
    liker: anchor.web3.PublicKey,
    postAuthor: anchor.web3.PublicKey,
    postId: number
  ) =>
    PublicKey.findProgramAddressSync(
      [
        Buffer.from("like"),
        liker.toBuffer(),
        postAuthor.toBuffer(),
        Buffer.from(new BN(postId).toArray("le", 8)),
      ],
      program.programId
    );

  const deriveCommentPda = (
    author: anchor.web3.PublicKey,
    postId: number,
    commentId: number
  ) =>
    PublicKey.findProgramAddressSync(
      [
        Buffer.from("comment"),
        author.toBuffer(),
        Buffer.from(new BN(postId).toArray("le", 8)),
        Buffer.from(new BN(commentId).toArray("le", 8)),
      ],
      program.programId
    );

  const deriveTopicPda = (
    author: anchor.web3.PublicKey,
    postId: number,
    topic: string
  ) =>
    PublicKey.findProgramAddressSync(
      [
        Buffer.from("topic"),
        Buffer.from(topic),
        author.toBuffer(),
        Buffer.from(new BN(postId).toArray("le", 8)),
      ],
      program.programId
    );

  const airdrop = async (pubkey: anchor.web3.PublicKey, sol = 2) => {
    const sig = await provider.connection.requestAirdrop(
      pubkey,
      sol * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(sig, "confirmed");
  };

  it("creates and updates profile, and updates username", async () => {
    const authority = Keypair.generate();
    await airdrop(authority.publicKey);

    const username = "alice";
    const [profilePda] = deriveProfilePda(authority.publicKey);
    const [usernamePda] = deriveUsernamePda(username);

    await program.methods
      .createProfile(username, "Alice", MAX_CID, MAX_CID)
      .accounts({
        authority: authority.publicKey,
        profile: profilePda,
        usernameRecord: usernamePda,
        systemProgram: SystemProgram.programId,
      })
      .signers([authority])
      .rpc();

    let profile = await program.account.userProfile.fetch(profilePda);
    assert.equal(profile.username, username);

    await program.methods
      .updateProfile("Alice Updated", MAX_CID, MAX_CID)
      .accounts({
        authority: authority.publicKey,
        profile: profilePda,
      })
      .signers([authority])
      .rpc();

    profile = await program.account.userProfile.fetch(profilePda);
    assert.equal(profile.displayName, "Alice Updated");

    const newUsername = "alice2";
    const [oldUsernamePda] = deriveUsernamePda(username);
    const [newUsernamePda] = deriveUsernamePda(newUsername);

    await program.methods
      .updateUsername(newUsername)
      .accounts({
        authority: authority.publicKey,
        profile: profilePda,
        oldUsernameRecord: oldUsernamePda,
        newUsernameRecord: newUsernamePda,
        systemProgram: SystemProgram.programId,
      })
      .signers([authority])
      .rpc();

    profile = await program.account.userProfile.fetch(profilePda);
    assert.equal(profile.username, newUsername);
  });

  it("enforces unique username", async () => {
    const user1 = Keypair.generate();
    const user2 = Keypair.generate();
    await airdrop(user1.publicKey);
    await airdrop(user2.publicKey);

    const username = "unique";
    const [profile1] = deriveProfilePda(user1.publicKey);
    const [profile2] = deriveProfilePda(user2.publicKey);
    const [usernamePda] = deriveUsernamePda(username);

    await program.methods
      .createProfile(username, "User1", MAX_CID, MAX_CID)
      .accounts({
        authority: user1.publicKey,
        profile: profile1,
        usernameRecord: usernamePda,
        systemProgram: SystemProgram.programId,
      })
      .signers([user1])
      .rpc();

    let threw = false;
    try {
      await program.methods
        .createProfile(username, "User2", MAX_CID, MAX_CID)
        .accounts({
          authority: user2.publicKey,
          profile: profile2,
          usernameRecord: usernamePda,
          systemProgram: SystemProgram.programId,
        })
        .signers([user2])
        .rpc();
    } catch (_err) {
      threw = true;
    }

    assert.equal(threw, true, "username should be unique");
  });

  it("creates follow and unfollow", async () => {
    const follower = Keypair.generate();
    const following = Keypair.generate();
    await airdrop(follower.publicKey);

    const [followPda] = deriveFollowPda(
      follower.publicKey,
      following.publicKey
    );

    await program.methods
      .follow()
      .accounts({
        follower: follower.publicKey,
        following: following.publicKey,
        follow: followPda,
        systemProgram: SystemProgram.programId,
      })
      .signers([follower])
      .rpc();

    const follow = await program.account.followEdge.fetch(followPda);
    assert.equal(follow.follower.toBase58(), follower.publicKey.toBase58());
    assert.equal(follow.following.toBase58(), following.publicKey.toBase58());

    await program.methods
      .unfollow()
      .accounts({
        follower: follower.publicKey,
        following: following.publicKey,
        follow: followPda,
      })
      .signers([follower])
      .rpc();
  });

  it("creates post index", async () => {
    const author = Keypair.generate();
    await airdrop(author.publicKey);

    const postId = 1;
    const [postPda] = derivePostPda(author.publicKey, postId);

    await program.methods
      .createPostIndex(new BN(postId), MAX_CID, 0)
      .accounts({
        authority: author.publicKey,
        post: postPda,
        systemProgram: SystemProgram.programId,
      })
      .signers([author])
      .rpc();

    const post = await program.account.postIndex.fetch(postPda);
    assert.equal(post.postId.toNumber(), postId);
    assert.equal(post.contentCid, MAX_CID);
  });

  it("tips with SOL and records tip", async () => {
    const from = Keypair.generate();
    const to = Keypair.generate();
    await airdrop(from.publicKey, 3);

    const tipId = 1;
    const amount = 0.1 * anchor.web3.LAMPORTS_PER_SOL;
    const [tipPda] = deriveTipPda(from.publicKey, tipId);

    await program.methods
      .tip(new BN(tipId), new BN(amount))
      .accounts({
        from: from.publicKey,
        to: to.publicKey,
        tipRecord: tipPda,
        systemProgram: SystemProgram.programId,
      })
      .signers([from])
      .rpc();

    const record = await program.account.tipRecord.fetch(tipPda);
    assert.equal(record.amountLamports.toNumber(), amount);
    assert.equal(record.from.toBase58(), from.publicKey.toBase58());
    assert.equal(record.to.toBase58(), to.publicKey.toBase58());
  });

  it("likes, comments, and indexes topics", async () => {
    const author = Keypair.generate();
    const liker = Keypair.generate();
    await airdrop(author.publicKey);
    await airdrop(liker.publicKey);

    const postId = 7;
    const [postPda] = derivePostPda(author.publicKey, postId);

    await program.methods
      .createPostIndex(new BN(postId), MAX_CID, 0)
      .accounts({
        authority: author.publicKey,
        post: postPda,
        systemProgram: SystemProgram.programId,
      })
      .signers([author])
      .rpc();

    const [likePda] = deriveLikePda(liker.publicKey, author.publicKey, postId);
    await program.methods
      .likePost(new BN(postId))
      .accounts({
        liker: liker.publicKey,
        postAuthor: author.publicKey,
        like: likePda,
        systemProgram: SystemProgram.programId,
      })
      .signers([liker])
      .rpc();

    const like = await program.account.likeRecord.fetch(likePda);
    assert.equal(like.postId.toNumber(), postId);

    const commentId = 1;
    const [commentPda] = deriveCommentPda(
      liker.publicKey,
      postId,
      commentId
    );
    await program.methods
      .createComment(new BN(postId), new BN(commentId), MAX_CID)
      .accounts({
        author: liker.publicKey,
        postAuthor: author.publicKey,
        comment: commentPda,
        systemProgram: SystemProgram.programId,
      })
      .signers([liker])
      .rpc();

    const comment = await program.account.commentRecord.fetch(commentPda);
    assert.equal(comment.postId.toNumber(), postId);

    const topic = "solana";
    const [topicPda] = deriveTopicPda(author.publicKey, postId, topic);
    await program.methods
      .indexTopic(new BN(postId), topic)
      .accounts({
        author: author.publicKey,
        topicAccount: topicPda,
        systemProgram: SystemProgram.programId,
      })
      .signers([author])
      .rpc();

    const topicIndex = await program.account.topicIndex.fetch(topicPda);
    assert.equal(topicIndex.topic, topic);
  });
});
