ALTER TABLE PrivacySettings
ADD CONSTRAINT unique_profile_id UNIQUE (profile_id);


ALTER TABLE NotificationSettings
ADD CONSTRAINT unique_profile_id_notification_settings UNIQUE (profile_id);
