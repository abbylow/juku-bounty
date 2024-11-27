-- Rename the column in the Contribution table
ALTER TABLE Contribution RENAME COLUMN referree_id TO referee_id;

-- Rename the column in the index if necessary
DROP INDEX IF EXISTS idx_contribution_referree_id;
CREATE INDEX idx_contribution_referee_id ON Contribution(referee_id);
