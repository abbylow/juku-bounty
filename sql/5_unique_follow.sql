ALTER TABLE Follow
ADD CONSTRAINT unique_follower_followee UNIQUE (follower_id, followee_id);
