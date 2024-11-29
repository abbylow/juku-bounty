-- Set timezone to UTC
SET TIME ZONE 'UTC';

-- Profile Table
CREATE TABLE Profile (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    display_name VARCHAR(100) NOT NULL,
    username VARCHAR(100) NOT NULL UNIQUE,
    bio VARCHAR(200),
    pfp VARCHAR(100),
    wallet_address VARCHAR(100) NOT NULL UNIQUE,
    login_method VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    edited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- PrivacySettings Table
CREATE TABLE PrivacySettings (
    id SERIAL PRIMARY KEY,
    profile_id UUID REFERENCES Profile(id) UNIQUE,
    allow_refer_group VARCHAR(100),
    allow_refer_knowledge_bounty BOOLEAN DEFAULT TRUE,
    allow_refer_consultation BOOLEAN DEFAULT TRUE,
    allow_view_portfolio_group VARCHAR(100),
    allow_view_work_experience BOOLEAN DEFAULT TRUE,
    allow_view_skill_attestation BOOLEAN DEFAULT TRUE,
    allow_view_peer_recommendation BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    edited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- NotificationSettings Table
CREATE TABLE NotificationSettings (
    id SERIAL PRIMARY KEY,
    profile_id UUID REFERENCES Profile(id) UNIQUE,
    platform_new_feature BOOLEAN DEFAULT TRUE,
    platform_new_quest BOOLEAN DEFAULT TRUE,
    new_contribution_to_involved_quest BOOLEAN DEFAULT TRUE,
    new_likes_to_involved_quest BOOLEAN DEFAULT TRUE,
    new_replies_to_involved_quest BOOLEAN DEFAULT TRUE,
    status_change_to_involved_quest BOOLEAN DEFAULT TRUE,
    be_mentioned BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    edited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Bounty Table
CREATE TABLE Bounty (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description VARCHAR(1000),
    expiry TIMESTAMPTZ NOT NULL,
    is_result_decided BOOLEAN DEFAULT FALSE,
    escrow_contract_address VARCHAR(100) NOT NULL,
    escrow_contract_chain_id VARCHAR(100) NOT NULL,
    bounty_id_on_escrow INT NOT NULL,
    creator_profile_id UUID REFERENCES Profile(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    edited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_bounty_title ON Bounty(title);
CREATE INDEX idx_bounty_description ON Bounty(description);
CREATE INDEX idx_bounty_expiry ON Bounty(expiry);

-- Category Table
CREATE TABLE Category (
    id SERIAL PRIMARY KEY,
    name VARCHAR(300) NOT NULL,
    slug VARCHAR(300) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    edited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Tag Table
CREATE TABLE Tag (
    id SERIAL PRIMARY KEY,
    name VARCHAR(300) NOT NULL,
    slug VARCHAR(300) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    edited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- VerifiedPlatform Table
CREATE TABLE VerifiedPlatform (
    id SERIAL PRIMARY KEY,
    type VARCHAR(100) NOT NULL,
    verified BOOLEAN NOT NULL,
    additional_data JSONB,
    profile_id UUID REFERENCES Profile(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    edited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT verified_platform_unique_type_profile_id UNIQUE (type, profile_id)
);
CREATE INDEX idx_verified_platform_verified ON VerifiedPlatform(verified);

-- Notification Table
CREATE TABLE Notification (
    id SERIAL PRIMARY KEY,
    title VARCHAR(80),
    description TEXT,
    type VARCHAR(100),
    viewed BOOLEAN DEFAULT FALSE,
    profile_id UUID REFERENCES Profile(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    edited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_notification_viewed ON Notification(viewed);
CREATE INDEX idx_notification_type ON Notification(type);

-- BountyLike Table
CREATE TABLE BountyLike (
    bounty_id UUID REFERENCES Bounty(id),
    profile_id UUID REFERENCES Profile(id),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    edited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    PRIMARY KEY (bounty_id, profile_id)
);
CREATE INDEX idx_like_active ON BountyLike(active);

-- Contribution Table
CREATE TABLE Contribution (
    id SERIAL PRIMARY KEY,
    bounty_id UUID REFERENCES Bounty(id),
    creator_profile_id UUID REFERENCES Profile(id),
    referee_id UUID REFERENCES Profile(id),
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    edited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_contribution_bounty_id ON Contribution(bounty_id);
CREATE INDEX idx_contribution_creator_profile_id ON Contribution(creator_profile_id);
CREATE INDEX idx_contribution_referee_id ON Contribution(referee_id);

-- Comment Table
CREATE TABLE Comment (
    id SERIAL PRIMARY KEY,
    contribution_id INT REFERENCES Contribution(id),
    creator_profile_id UUID REFERENCES Profile(id),
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    edited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_comment_contribution_id ON Comment(contribution_id);
CREATE INDEX idx_comment_creator_profile_id ON Comment(creator_profile_id);

-- Mention Table
CREATE TABLE Mention (
    id SERIAL PRIMARY KEY,
    comment_id INT REFERENCES Comment(id),
    mentioned_profile_id UUID REFERENCES Profile(id),
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    edited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_mention_comment_id ON Mention(comment_id);
CREATE INDEX idx_mention_mentioned_profile_id ON Mention(mentioned_profile_id);

-- Follow Table
CREATE TABLE Follow (
    id SERIAL PRIMARY KEY,
    follower_id UUID REFERENCES Profile(id),
    followee_id UUID REFERENCES Profile(id),
    active BOOLEAN NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    edited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT unique_follower_followee UNIQUE (follower_id, followee_id)
);
CREATE INDEX idx_follow_active ON Follow(active);

-- BountyWinningContribution Table
CREATE TABLE BountyWinningContribution (
    id SERIAL PRIMARY KEY,
    bounty_id UUID REFERENCES Bounty(id),
    contribution_id INT REFERENCES Contribution(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    edited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_winning_contribution_bounty_id ON BountyWinningContribution(bounty_id);
CREATE INDEX idx_winning_contribution_contribution_id ON BountyWinningContribution(contribution_id);

-- ProfileCategory Table
CREATE TABLE ProfileCategory (
    profile_id UUID REFERENCES Profile(id),
    category_id INT REFERENCES Category(id),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    edited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    PRIMARY KEY (profile_id, category_id)
);
CREATE INDEX idx_profile_category_active ON ProfileCategory(active);

-- BountyCategory Table
CREATE TABLE BountyCategory (
    bounty_id UUID REFERENCES Bounty(id),
    category_id INT REFERENCES Category(id),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    edited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    PRIMARY KEY (bounty_id, category_id)
);
CREATE INDEX idx_bounty_category_active ON BountyCategory(active);

-- BountyTag Table
CREATE TABLE BountyTag (
    bounty_id UUID REFERENCES Bounty(id),
    tag_id INT REFERENCES Tag(id),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    edited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    PRIMARY KEY (bounty_id, tag_id)
);
CREATE INDEX idx_bounty_tag_active ON BountyTag(active);
