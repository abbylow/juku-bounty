ALTER TABLE VerifiedPlatform
ADD CONSTRAINT verified_platform_unique_type_profile_id UNIQUE (type, profile_id);