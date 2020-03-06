--------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------

CREATE TABLE Scenario (
  'contentId' NVARCHAR(80) PRIMARY KEY
);

CREATE TABLE PublicBlob (
  'contentId' NVARCHAR(80) PRIMARY KEY,
  'content' TEXT NOT NULL
);

--------------------------------------------------------------------------------
-- Down
--------------------------------------------------------------------------------

DROP TABLE Scenario;
DROP TABLE PublicBlob;
