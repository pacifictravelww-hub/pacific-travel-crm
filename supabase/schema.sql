-- Pacific Travel CRM Schema
-- Run this in your Supabase SQL editor at:
-- https://supabase.com/dashboard/project/cysctiandcmolrltrlzx/sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  departure_date DATE,
  return_date DATE,
  hotel_level TEXT CHECK (hotel_level IN ('3', '4', '5', 'boutique')),
  board_basis TEXT CHECK (board_basis IN ('ai', 'hb', 'bb', 'ro', 'fb')),
  adults INTEGER DEFAULT 2,
  children INTEGER DEFAULT 0,
  infants INTEGER DEFAULT 0,
  budget INTEGER DEFAULT 0,
  vacation_type TEXT CHECK (vacation_type IN ('beach', 'tours', 'city', 'adventure')),
  destination TEXT,
  status TEXT DEFAULT 'lead' CHECK (status IN ('lead', 'proposal_sent', 'paid', 'flying', 'returned')),
  source TEXT CHECK (source IN ('facebook', 'whatsapp', 'referral', 'website')),
  notes TEXT DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  agent_id TEXT DEFAULT 'agent1',
  -- Payment fields
  total_price INTEGER,
  commission INTEGER,
  deposit_amount INTEGER,
  deposit_paid BOOLEAN DEFAULT FALSE,
  balance_amount INTEGER,
  balance_due_date DATE,
  -- Preferences
  seat_preference TEXT CHECK (seat_preference IN ('window', 'aisle', 'middle')),
  kosher_meal BOOLEAN DEFAULT FALSE,
  hotel_preference TEXT
);

-- Payments table (normalized version)
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  deposit_amount INTEGER,
  deposit_paid BOOLEAN DEFAULT FALSE,
  balance_amount INTEGER,
  balance_due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  expiry_date DATE,
  url TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) - allows public read/write with anon key
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies (open for now - restrict later with auth)
CREATE POLICY "Allow all operations on leads" ON leads FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on payments" ON payments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on documents" ON documents FOR ALL USING (true) WITH CHECK (true);
