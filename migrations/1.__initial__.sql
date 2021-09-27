CREATE TABLE IF NOT EXISTS users (
    id varchar(30) NOT NULL CONSTRAINT users_pkey PRIMARY KEY,
    username varchar(50) NOT NULL,
    password text NOT NULL,
    email varchar(100),
    "createdAt" timestamp DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "users.username_unique" ON users (username);

CREATE TABLE IF NOT EXISTS accounts (
    id varchar(30) NOT NULL CONSTRAINT accounts_pkey PRIMARY KEY,
    "userID" varchar(30) NOT NULL CONSTRAINT accounts_user_id_fkey REFERENCES users,
    balance integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp DEFAULT now() NOT NULL,
    "updatedAt" timestamp DEFAULT now() NOT NULL,
    label varchar(10) DEFAULT 'main' ::character varying NOT NULL,
    CONSTRAINT "accounts_userID_label_key" UNIQUE ("userID", label)
);

CREATE TABLE IF NOT EXISTS "journalEntries" (
    id varchar(30) NOT NULL CONSTRAINT journal_entries_pkey PRIMARY KEY,
    amount integer NOT NULL,
    description text,
    "createdAt" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS debits (
    id varchar(30) NOT NULL CONSTRAINT debits_pkey PRIMARY KEY,
    "accountID" varchar(30) NOT NULL CONSTRAINT debits_account_id_fkey REFERENCES accounts,
    "journalEntryID" varchar(30) NOT NULL CONSTRAINT debits_journal_entries_id_fk REFERENCES "journalEntries",
    amount integer NOT NULL,
    "createdAt" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS credits (
    id varchar(30) NOT NULL CONSTRAINT credits_pkey PRIMARY KEY,
    "accountID" varchar(30) NOT NULL CONSTRAINT credits_account_id_fkey REFERENCES accounts,
    "journalEntryId" varchar(30) NOT NULL CONSTRAINT credits_journal_entries_id_fk REFERENCES "journalEntries",
    amount integer NOT NULL,
    "createdAt" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS schools (
    id varchar(30) NOT NULL CONSTRAINT schools_pkey PRIMARY KEY,
    name text NOT NULL,
    code varchar(7) NOT NULL,
    "createdAt" timestamp DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "schools.code_unique" ON schools (code);

CREATE TABLE IF NOT EXISTS students (
    id varchar(30) NOT NULL CONSTRAINT students_pkey PRIMARY KEY,
    "firstName" varchar(50) NOT NULL,
    "lastName" varchar(50) NOT NULL,
    "schoolID" varchar(30) NOT NULL CONSTRAINT students_schoolid_fkey REFERENCES schools,
    "admissionNumber" varchar(10) NOT NULL,
    "createdAt" timestamp DEFAULT now() NOT NULL,
    "userID" varchar(30) NOT NULL CONSTRAINT students_user_id_fkey REFERENCES users,
    CONSTRAINT students_schoolid_admissionnumber_key UNIQUE ("schoolID", "admissionNumber")
);

CREATE UNIQUE INDEX IF NOT EXISTS "students.userID_unique" ON students ("userID");

CREATE TABLE IF NOT EXISTS admins (
    id varchar(30) NOT NULL CONSTRAINT admins_pkey PRIMARY KEY,
    "firstName" varchar(50) NOT NULL,
    "lastName" varchar(50) NOT NULL,
    "createdAt" timestamp DEFAULT now() NOT NULL,
    "userID" varchar(30) NOT NULL CONSTRAINT admins_userid_fkey REFERENCES users
);

CREATE UNIQUE INDEX IF NOT EXISTS "admins.userID_unique" ON admins ("userID");

CREATE TABLE IF NOT EXISTS "schoolStaff" (
    id varchar(30) NOT NULL CONSTRAINT "schoolStaff_pkey" PRIMARY KEY,
    "firstName" varchar(50) NOT NULL,
    "lastName" varchar(50) NOT NULL,
    "userID" varchar(30) NOT NULL CONSTRAINT "schoolStaff_userID_fkey" REFERENCES users,
    "createdAt" timestamp DEFAULT now() NOT NULL,
    "schoolID" varchar(30) NOT NULL CONSTRAINT "schoolStaff_schoolID_fkey" REFERENCES schools
);

CREATE UNIQUE INDEX IF NOT EXISTS "schoolStaff.userID_unique" ON "schoolStaff" ("userID");

CREATE TABLE IF NOT EXISTS "posUsers" (
    id varchar(30) NOT NULL CONSTRAINT "posUsers_pkey" PRIMARY KEY,
    "userID" varchar(30) NOT NULL CONSTRAINT "posUsers_userID_fkey" REFERENCES users,
    "schoolID" varchar(30) NOT NULL CONSTRAINT "posUsers_schoolID_fkey" REFERENCES schools,
    "createdAt" timestamp DEFAULT now() NOT NULL,
    "lastSeenAt" timestamp DEFAULT now() NOT NULL,
    description text NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "posUsers.userID_unique" ON "posUsers" ("userID");

CREATE TABLE IF NOT EXISTS "posTransactions" (
    id varchar(30) NOT NULL CONSTRAINT "posTransactions_pkey" PRIMARY KEY,
    description text NOT NULL,
    "createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    receipt jsonb NOT NULL,
    "buyerID" varchar(30) NOT NULL CONSTRAINT postransactions_users_id_fk REFERENCES users,
    "journalEntryID" varchar(30) NOT NULL CONSTRAINT "posTransactions_journalEntryID_fkey" REFERENCES "journalEntries" ON UPDATE CASCADE ON DELETE CASCADE,
    "posID" varchar(30) NOT NULL CONSTRAINT "posTransactions_posID_fkey" REFERENCES "posUsers"
);
