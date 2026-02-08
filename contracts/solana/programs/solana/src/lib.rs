use anchor_lang::prelude::*;
use anchor_lang::system_program;

declare_id!("8TysGbj7Xgj9zzctWCuSV8wPot3Jh6Q6uzrVhRj4nxwp");

const MAX_USERNAME_LEN: usize = 32;
const MAX_DISPLAY_NAME_LEN: usize = 48;
const MAX_CID_LEN: usize = 128;
const MAX_TOPIC_LEN: usize = 32;

#[program]
pub mod solana {
    use super::*;

pub fn create_profile(
        ctx: Context<CreateProfile>,
        username: String,
        display_name: String,
        bio_cid: String,
        avatar_cid: String,
    ) -> Result<()> {
        validate_username(&username)?;
        validate_display_name(&display_name)?;
        validate_cid(&bio_cid)?;
        validate_cid(&avatar_cid)?;

        let profile = &mut ctx.accounts.profile;
        profile.authority = ctx.accounts.authority.key();
        profile.username = username;
        profile.display_name = display_name;
        profile.bio_cid = bio_cid;
        profile.avatar_cid = avatar_cid;
        profile.created_at = Clock::get()?.unix_timestamp;
        profile.updated_at = profile.created_at;

        let username_record = &mut ctx.accounts.username_record;
        username_record.authority = profile.authority;
        username_record.username = profile.username.clone();

        emit!(ProfileCreated {
            authority: profile.authority,
            username: profile.username.clone(),
            display_name: profile.display_name.clone(),
            bio_cid: profile.bio_cid.clone(),
            avatar_cid: profile.avatar_cid.clone(),
        });

        Ok(())
    }

    pub fn update_profile(
        ctx: Context<UpdateProfile>,
        display_name: String,
        bio_cid: String,
        avatar_cid: String,
    ) -> Result<()> {
        validate_display_name(&display_name)?;
        validate_cid(&bio_cid)?;
        validate_cid(&avatar_cid)?;

        let profile = &mut ctx.accounts.profile;
        profile.display_name = display_name;
        profile.bio_cid = bio_cid;
        profile.avatar_cid = avatar_cid;
        profile.updated_at = Clock::get()?.unix_timestamp;

        emit!(ProfileUpdated {
            authority: profile.authority,
            username: profile.username.clone(),
            display_name: profile.display_name.clone(),
            bio_cid: profile.bio_cid.clone(),
            avatar_cid: profile.avatar_cid.clone(),
        });
        Ok(())
    }

    pub fn update_username(
        ctx: Context<UpdateUsername>,
        new_username: String,
    ) -> Result<()> {
        validate_username(&new_username)?;

        let profile = &mut ctx.accounts.profile;
        profile.username = new_username.clone();
        profile.updated_at = Clock::get()?.unix_timestamp;

        let new_record = &mut ctx.accounts.new_username_record;
        new_record.authority = profile.authority;
        new_record.username = new_username;

        emit!(ProfileUpdated {
            authority: profile.authority,
            username: profile.username.clone(),
            display_name: profile.display_name.clone(),
            bio_cid: profile.bio_cid.clone(),
            avatar_cid: profile.avatar_cid.clone(),
        });

        Ok(())
    }

    pub fn follow(ctx: Context<Follow>) -> Result<()> {
        let follow = &mut ctx.accounts.follow;
        follow.follower = ctx.accounts.follower.key();
        follow.following = ctx.accounts.following.key();
        follow.created_at = Clock::get()?.unix_timestamp;

        emit!(Followed {
            follower: follow.follower,
            following: follow.following,
        });
        Ok(())
    }

    pub fn unfollow(ctx: Context<Unfollow>) -> Result<()> {
        emit!(Unfollowed {
            follower: ctx.accounts.follower.key(),
            following: ctx.accounts.following.key(),
        });
        Ok(())
    }

    pub fn create_post_index(
        ctx: Context<CreatePostIndex>,
        post_id: u64,
        content_cid: String,
        visibility: u8,
    ) -> Result<()> {
        validate_cid(&content_cid)?;
        let post = &mut ctx.accounts.post;
        post.author = ctx.accounts.authority.key();
        post.post_id = post_id;
        post.content_cid = content_cid;
        post.visibility = visibility;
        post.created_at = Clock::get()?.unix_timestamp;

        emit!(PostIndexed {
            author: post.author,
            post_id: post.post_id,
            content_cid: post.content_cid.clone(),
            visibility: post.visibility,
        });
        Ok(())
    }

    pub fn tip(
        ctx: Context<Tip>,
        tip_id: u64,
        amount_lamports: u64,
    ) -> Result<()> {
        let ix = system_program::Transfer {
            from: ctx.accounts.from.to_account_info(),
            to: ctx.accounts.to.to_account_info(),
        };
        let cpi_ctx = CpiContext::new(ctx.accounts.system_program.to_account_info(), ix);
        system_program::transfer(cpi_ctx, amount_lamports)?;

        let record = &mut ctx.accounts.tip_record;
        record.from = ctx.accounts.from.key();
        record.to = ctx.accounts.to.key();
        record.tip_id = tip_id;
        record.amount_lamports = amount_lamports;
        record.created_at = Clock::get()?.unix_timestamp;

        emit!(Tipped {
            from: record.from,
            to: record.to,
            tip_id: record.tip_id,
            amount_lamports: record.amount_lamports,
        });
        Ok(())
    }

    pub fn like_post(ctx: Context<LikePost>, post_id: u64) -> Result<()> {
        let like = &mut ctx.accounts.like;
        like.liker = ctx.accounts.liker.key();
        like.post_author = ctx.accounts.post_author.key();
        like.post_id = post_id;
        like.created_at = Clock::get()?.unix_timestamp;

        emit!(PostLiked {
            liker: like.liker,
            post_author: like.post_author,
            post_id: like.post_id,
        });
        Ok(())
    }

    pub fn unlike_post(ctx: Context<UnlikePost>) -> Result<()> {
        emit!(PostUnliked {
            liker: ctx.accounts.liker.key(),
            post_author: ctx.accounts.post_author.key(),
            post_id: ctx.accounts.like.post_id,
        });
        Ok(())
    }

    pub fn create_comment(
        ctx: Context<CreateComment>,
        post_id: u64,
        comment_id: u64,
        content_cid: String,
    ) -> Result<()> {
        validate_cid(&content_cid)?;
        let comment = &mut ctx.accounts.comment;
        comment.author = ctx.accounts.author.key();
        comment.post_author = ctx.accounts.post_author.key();
        comment.post_id = post_id;
        comment.comment_id = comment_id;
        comment.content_cid = content_cid;
        comment.created_at = Clock::get()?.unix_timestamp;

        emit!(CommentCreated {
            author: comment.author,
            post_author: comment.post_author,
            post_id: comment.post_id,
            comment_id: comment.comment_id,
            content_cid: comment.content_cid.clone(),
        });
        Ok(())
    }

    pub fn index_topic(
        ctx: Context<IndexTopic>,
        post_id: u64,
        topic: String,
    ) -> Result<()> {
        validate_topic(&topic)?;
        let topic_index = &mut ctx.accounts.topic_account;
        topic_index.topic = topic.clone();
        topic_index.author = ctx.accounts.author.key();
        topic_index.post_id = post_id;
        topic_index.created_at = Clock::get()?.unix_timestamp;

        emit!(TopicIndexed {
            topic,
            author: topic_index.author,
            post_id: topic_index.post_id,
        });
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(username: String, display_name: String, bio_cid: String, avatar_cid: String)]
pub struct CreateProfile<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        init,
        payer = authority,
        space = 8 + UserProfile::SIZE,
        seeds = [b"profile", authority.key().as_ref()],
        bump
    )]
    pub profile: Account<'info, UserProfile>,
    #[account(
        init,
        payer = authority,
        space = 8 + UsernameRecord::SIZE,
        seeds = [b"username", username.as_bytes()],
        bump
    )]
    pub username_record: Account<'info, UsernameRecord>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateProfile<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        mut,
        seeds = [b"profile", authority.key().as_ref()],
        bump,
        has_one = authority
    )]
    pub profile: Account<'info, UserProfile>,
}

#[derive(Accounts)]
#[instruction(new_username: String)]
pub struct UpdateUsername<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        mut,
        seeds = [b"profile", authority.key().as_ref()],
        bump,
        has_one = authority
    )]
    pub profile: Account<'info, UserProfile>,
    #[account(
        mut,
        seeds = [b"username", profile.username.as_bytes()],
        bump,
        close = authority
    )]
    pub old_username_record: Account<'info, UsernameRecord>,
    #[account(
        init,
        payer = authority,
        space = 8 + UsernameRecord::SIZE,
        seeds = [b"username", new_username.as_bytes()],
        bump
    )]
    pub new_username_record: Account<'info, UsernameRecord>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Follow<'info> {
    #[account(mut)]
    pub follower: Signer<'info>,
    /// CHECK: following user can be any public key
    pub following: UncheckedAccount<'info>,
    #[account(
        init,
        payer = follower,
        space = 8 + FollowEdge::SIZE,
        seeds = [b"follow", follower.key().as_ref(), following.key().as_ref()],
        bump
    )]
    pub follow: Account<'info, FollowEdge>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Unfollow<'info> {
    #[account(mut)]
    pub follower: Signer<'info>,
    /// CHECK: following user can be any public key
    pub following: UncheckedAccount<'info>,
    #[account(
        mut,
        seeds = [b"follow", follower.key().as_ref(), following.key().as_ref()],
        bump,
        close = follower
    )]
    pub follow: Account<'info, FollowEdge>,
}

#[derive(Accounts)]
#[instruction(post_id: u64, content_cid: String, visibility: u8)]
pub struct CreatePostIndex<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        init,
        payer = authority,
        space = 8 + PostIndex::SIZE,
        seeds = [b"post", authority.key().as_ref(), &post_id.to_le_bytes()],
        bump
    )]
    pub post: Account<'info, PostIndex>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(tip_id: u64, amount_lamports: u64)]
pub struct Tip<'info> {
    #[account(mut)]
    pub from: Signer<'info>,
    /// CHECK: recipient can be any public key
    #[account(mut)]
    pub to: UncheckedAccount<'info>,
    #[account(
        init,
        payer = from,
        space = 8 + TipRecord::SIZE,
        seeds = [b"tip", from.key().as_ref(), &tip_id.to_le_bytes()],
        bump
    )]
    pub tip_record: Account<'info, TipRecord>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(post_id: u64)]
pub struct LikePost<'info> {
    #[account(mut)]
    pub liker: Signer<'info>,
    /// CHECK: post author can be any public key
    pub post_author: UncheckedAccount<'info>,
    #[account(
        init,
        payer = liker,
        space = 8 + LikeRecord::SIZE,
        seeds = [b"like", liker.key().as_ref(), post_author.key().as_ref(), &post_id.to_le_bytes()],
        bump
    )]
    pub like: Account<'info, LikeRecord>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UnlikePost<'info> {
    #[account(mut)]
    pub liker: Signer<'info>,
    /// CHECK: post author can be any public key
    pub post_author: UncheckedAccount<'info>,
    #[account(
        mut,
        seeds = [b"like", liker.key().as_ref(), post_author.key().as_ref(), &like.post_id.to_le_bytes()],
        bump,
        close = liker
    )]
    pub like: Account<'info, LikeRecord>,
}

#[derive(Accounts)]
#[instruction(post_id: u64, comment_id: u64, content_cid: String)]
pub struct CreateComment<'info> {
    #[account(mut)]
    pub author: Signer<'info>,
    /// CHECK: post author can be any public key
    pub post_author: UncheckedAccount<'info>,
    #[account(
        init,
        payer = author,
        space = 8 + CommentRecord::SIZE,
        seeds = [b"comment", author.key().as_ref(), &post_id.to_le_bytes(), &comment_id.to_le_bytes()],
        bump
    )]
    pub comment: Account<'info, CommentRecord>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(post_id: u64, topic: String)]
pub struct IndexTopic<'info> {
    #[account(mut)]
    pub author: Signer<'info>,
    #[account(
        init,
        payer = author,
        space = 8 + TopicIndex::SIZE,
        seeds = [b"topic", topic.as_bytes(), author.key().as_ref(), &post_id.to_le_bytes()],
        bump
    )]
    pub topic_account: Account<'info, TopicIndex>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct UserProfile {
    pub authority: Pubkey,
    pub username: String,
    pub display_name: String,
    pub bio_cid: String,
    pub avatar_cid: String,
    pub created_at: i64,
    pub updated_at: i64,
}

impl UserProfile {
    pub const SIZE: usize = 32
        + 4 + MAX_USERNAME_LEN
        + 4 + MAX_DISPLAY_NAME_LEN
        + 4 + MAX_CID_LEN
        + 4 + MAX_CID_LEN
        + 8
        + 8;
}

#[account]
pub struct UsernameRecord {
    pub authority: Pubkey,
    pub username: String,
}

impl UsernameRecord {
    pub const SIZE: usize = 32 + 4 + MAX_USERNAME_LEN;
}

#[account]
pub struct FollowEdge {
    pub follower: Pubkey,
    pub following: Pubkey,
    pub created_at: i64,
}

impl FollowEdge {
    pub const SIZE: usize = 32 + 32 + 8;
}

#[account]
pub struct PostIndex {
    pub author: Pubkey,
    pub post_id: u64,
    pub content_cid: String,
    pub visibility: u8,
    pub created_at: i64,
}

impl PostIndex {
    pub const SIZE: usize = 32 + 8 + 4 + MAX_CID_LEN + 1 + 8;
}

#[account]
pub struct TipRecord {
    pub from: Pubkey,
    pub to: Pubkey,
    pub tip_id: u64,
    pub amount_lamports: u64,
    pub created_at: i64,
}

#[account]
pub struct LikeRecord {
    pub liker: Pubkey,
    pub post_author: Pubkey,
    pub post_id: u64,
    pub created_at: i64,
}

impl LikeRecord {
    pub const SIZE: usize = 32 + 32 + 8 + 8;
}

#[account]
pub struct CommentRecord {
    pub author: Pubkey,
    pub post_author: Pubkey,
    pub post_id: u64,
    pub comment_id: u64,
    pub content_cid: String,
    pub created_at: i64,
}

impl CommentRecord {
    pub const SIZE: usize = 32 + 32 + 8 + 8 + 4 + MAX_CID_LEN + 8;
}

#[account]
pub struct TopicIndex {
    pub topic: String,
    pub author: Pubkey,
    pub post_id: u64,
    pub created_at: i64,
}

impl TopicIndex {
    pub const SIZE: usize = 4 + MAX_TOPIC_LEN + 32 + 8 + 8;
}

impl TipRecord {
    pub const SIZE: usize = 32 + 32 + 8 + 8 + 8;
}

#[event]
pub struct ProfileCreated {
    pub authority: Pubkey,
    pub username: String,
    pub display_name: String,
    pub bio_cid: String,
    pub avatar_cid: String,
}

#[event]
pub struct ProfileUpdated {
    pub authority: Pubkey,
    pub username: String,
    pub display_name: String,
    pub bio_cid: String,
    pub avatar_cid: String,
}

#[event]
pub struct Followed {
    pub follower: Pubkey,
    pub following: Pubkey,
}

#[event]
pub struct Unfollowed {
    pub follower: Pubkey,
    pub following: Pubkey,
}

#[event]
pub struct PostIndexed {
    pub author: Pubkey,
    pub post_id: u64,
    pub content_cid: String,
    pub visibility: u8,
}

#[event]
pub struct Tipped {
    pub from: Pubkey,
    pub to: Pubkey,
    pub tip_id: u64,
    pub amount_lamports: u64,
}

#[event]
pub struct PostLiked {
    pub liker: Pubkey,
    pub post_author: Pubkey,
    pub post_id: u64,
}

#[event]
pub struct PostUnliked {
    pub liker: Pubkey,
    pub post_author: Pubkey,
    pub post_id: u64,
}

#[event]
pub struct CommentCreated {
    pub author: Pubkey,
    pub post_author: Pubkey,
    pub post_id: u64,
    pub comment_id: u64,
    pub content_cid: String,
}

#[event]
pub struct TopicIndexed {
    pub topic: String,
    pub author: Pubkey,
    pub post_id: u64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Username length is invalid.")]
    InvalidUsername,
    #[msg("Display name length is invalid.")]
    InvalidDisplayName,
    #[msg("CID length is invalid.")]
    InvalidCid,
    #[msg("Topic length is invalid.")]
    InvalidTopic,
}

fn validate_username(username: &str) -> Result<()> {
    if username.is_empty() || username.len() > MAX_USERNAME_LEN {
        return Err(ErrorCode::InvalidUsername.into());
    }
    Ok(())
}

fn validate_display_name(name: &str) -> Result<()> {
    if name.is_empty() || name.len() > MAX_DISPLAY_NAME_LEN {
        return Err(ErrorCode::InvalidDisplayName.into());
    }
    Ok(())
}

fn validate_cid(cid: &str) -> Result<()> {
    if cid.is_empty() || cid.len() > MAX_CID_LEN {
        return Err(ErrorCode::InvalidCid.into());
    }
    Ok(())
}

fn validate_topic(topic: &str) -> Result<()> {
    if topic.is_empty() || topic.len() > MAX_TOPIC_LEN {
        return Err(ErrorCode::InvalidTopic.into());
    }
    Ok(())
}
