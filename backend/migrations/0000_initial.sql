-- Migration number: 0000
-- Initial schema for Point Poker tables

DROP TABLE IF EXISTS tt_members;
CREATE TABLE tt_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pass TEXT,
    email TEXT,
    phone TEXT,
    first_name TEXT,
    last_name TEXT
);

DROP TABLE IF EXISTS tt_sessions;
CREATE TABLE tt_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pass TEXT NOT NULL,
    data TEXT
);

DROP TABLE IF EXISTS tt_link;
CREATE TABLE tt_link (
    id INTEGER NOT NULL,
    pass TEXT NOT NULL,
    memberid INTEGER NOT NULL,
    linkid INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    score INTEGER,
    FOREIGN KEY (id) REFERENCES tt_sessions(id),
    FOREIGN KEY (memberid) REFERENCES tt_members(id)
);

CREATE INDEX idx_link_id ON tt_link(id);
CREATE INDEX idx_link_memberid ON tt_link(memberid);
CREATE INDEX idx_link_pass ON tt_link(pass);