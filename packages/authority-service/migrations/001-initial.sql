--------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------

CREATE TABLE Process (
  'contentId' NVARCHAR(80) PRIMARY KEY
);

CREATE TABLE PublicBlob (
  'contentId' NVARCHAR(80) PRIMARY KEY,
  'content' TEXT NOT NULL
);

CREATE TABLE PrivateBlob (
  'contentId' NVARCHAR(80) PRIMARY KEY,
  'content' TEXT NOT NULL
);

CREATE TABLE Request (
  'capabilityLink' NVARCHAR(80) PRIMARY KEY,
  'requestId' NVARCHAR(80),
  'addedAt' INTEGER NOT NULL,
  'status' INTEGER NOT NULL,
  'processId' NVARCHAR(80) NOT NULL,
  'notes' TEXT NULL,
  'statementId' NVARCHAR(80) NULL,
  'rejectionReason' TEXT NULL
);

CREATE UNIQUE INDEX Request_RequestId ON Request ( requestId );

--------------------------------------------------------------------------------
-- Down
--------------------------------------------------------------------------------

DROP TABLE Request;
DROP TABLE PrivateBlob;
DROP TABLE PublicBlob;
DROP TABLE Process;
