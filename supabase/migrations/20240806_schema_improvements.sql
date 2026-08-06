-- Schema Improvements Migration
-- This migration adds foreign key constraints, indexes, triggers, and other improvements
-- This migration is idempotent - it can be run multiple times safely

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- SCHOOLS TABLE
-- ============================================

-- Add unique constraint on school name
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'schools_name_unique'
  ) THEN
    ALTER TABLE schools ADD CONSTRAINT schools_name_unique UNIQUE (name);
  END IF;
END $$;

-- Add index for state filtering
CREATE INDEX IF NOT EXISTS idx_schools_state ON schools(state);

-- ============================================
-- DEPARTMENTS TABLE
-- ============================================

-- Add foreign key constraint to schools
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'fk_departments_school'
  ) THEN
    ALTER TABLE departments 
    ADD CONSTRAINT fk_departments_school 
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add unique constraint on department code within a school
CREATE UNIQUE INDEX IF NOT EXISTS idx_departments_school_code 
ON departments(school_id, code) 
WHERE school_id IS NOT NULL;

-- Add index for school filtering
CREATE INDEX IF NOT EXISTS idx_departments_school_id ON departments(school_id);

-- ============================================
-- PROFILES TABLE
-- ============================================

-- Add user_type column if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS user_type text DEFAULT 'tertiary' CHECK (user_type IN ('tertiary', 'secondary'));

-- Add foreign key constraint to schools
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'fk_profiles_school'
  ) THEN
    ALTER TABLE profiles 
    ADD CONSTRAINT fk_profiles_school 
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add foreign key constraint to departments
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'fk_profiles_department'
  ) THEN
    ALTER TABLE profiles 
    ADD CONSTRAINT fk_profiles_department 
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add unique constraint on email
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'profiles_email_unique'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_email_unique UNIQUE (email);
  END IF;
END $$;

-- Add index for department filtering
CREATE INDEX IF NOT EXISTS idx_profiles_department_id ON profiles(department_id);
CREATE INDEX IF NOT EXISTS idx_profiles_school_id ON profiles(school_id);
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON profiles(user_type);

-- Create trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- CONVERSATIONS TABLE
-- ============================================

-- Add index for created_at sorting
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at DESC);

-- ============================================
-- CONVERSATION_PARTICIPANTS TABLE
-- ============================================

-- Add foreign key constraint to conversations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'fk_conversation_participants_conversation'
  ) THEN
    ALTER TABLE conversation_participants 
    ADD CONSTRAINT fk_conversation_participants_conversation 
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add foreign key constraint to profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'fk_conversation_participants_user'
  ) THEN
    ALTER TABLE conversation_participants 
    ADD CONSTRAINT fk_conversation_participants_user 
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add unique constraint to prevent duplicate participants
CREATE UNIQUE INDEX IF NOT EXISTS idx_conversation_participants_unique 
ON conversation_participants(conversation_id, user_id);

-- Add index for user's conversations
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user_id ON conversation_participants(user_id);

-- Add created_at column for tracking when user joined
ALTER TABLE conversation_participants ADD COLUMN IF NOT EXISTS created_at 
timestamp with time zone DEFAULT NOW();

-- Add index for created_at
CREATE INDEX IF NOT EXISTS idx_conversation_participants_created_at ON conversation_participants(created_at);

-- ============================================
-- MESSAGES TABLE
-- ============================================

-- Add foreign key constraint to conversations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'fk_messages_conversation'
  ) THEN
    ALTER TABLE messages 
    ADD CONSTRAINT fk_messages_conversation 
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add foreign key constraint to profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'fk_messages_sender'
  ) THEN
    ALTER TABLE messages 
    ADD CONSTRAINT fk_messages_sender 
    FOREIGN KEY (sender_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add index for conversation messages
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);

-- Add index for sender's messages
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);

-- Add index for created_at sorting
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- Add read status column
ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_read boolean DEFAULT false;

-- Add index for unread messages
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(conversation_id, is_read) WHERE is_read = false;

-- ============================================
-- RESULT_SHEETS TABLE
-- ============================================

-- Add foreign key constraint to profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'fk_result_sheets_uploader'
  ) THEN
    ALTER TABLE result_sheets 
    ADD CONSTRAINT fk_result_sheets_uploader 
    FOREIGN KEY (uploaded_by) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add foreign key constraint to departments
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'fk_result_sheets_department'
  ) THEN
    ALTER TABLE result_sheets 
    ADD CONSTRAINT fk_result_sheets_department 
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add index for uploader filtering
CREATE INDEX IF NOT EXISTS idx_result_sheets_uploaded_by ON result_sheets(uploaded_by);

-- Add index for department filtering
CREATE INDEX IF NOT EXISTS idx_result_sheets_department_id ON result_sheets(department_id);

-- Add index for created_at sorting
CREATE INDEX IF NOT EXISTS idx_result_sheets_created_at ON result_sheets(created_at DESC);

-- Add status column for tracking sheet processing
ALTER TABLE result_sheets ADD COLUMN IF NOT EXISTS status 
text DEFAULT 'draft' CHECK (status IN ('draft', 'processing', 'completed', 'failed'));

-- Add index for status filtering
CREATE INDEX IF NOT EXISTS idx_result_sheets_status ON result_sheets(status);

-- Remove hardcoded year default, make it dynamic
DO $$
BEGIN
  ALTER TABLE result_sheets ALTER COLUMN year DROP DEFAULT;
EXCEPTION WHEN undefined_column THEN
  -- Column or default doesn't exist, continue
END $$;
ALTER TABLE result_sheets ALTER COLUMN year SET DEFAULT EXTRACT(YEAR FROM NOW())::text;

-- ============================================
-- EMAIL_LOGS TABLE
-- ============================================

-- Add foreign key constraint to result_sheets
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'fk_email_logs_result_sheet'
  ) THEN
    ALTER TABLE email_logs 
    ADD CONSTRAINT fk_email_logs_result_sheet 
    FOREIGN KEY (result_sheet_id) REFERENCES result_sheets(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add index for result_sheet filtering
CREATE INDEX IF NOT EXISTS idx_email_logs_result_sheet_id ON email_logs(result_sheet_id);

-- Add index for status filtering
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);

-- Add index for recipient_email (for searching)
CREATE INDEX IF NOT EXISTS idx_email_logs_recipient_email ON email_logs(recipient_email);

-- Add index for sent_at sorting
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON email_logs(sent_at DESC);

-- Add retry_count column for tracking failed email retries
ALTER TABLE email_logs ADD COLUMN IF NOT EXISTS retry_count integer DEFAULT 0;

-- ============================================
-- ADDITIONAL USEFUL FUNCTIONS
-- ============================================

-- Function to get user's unread message count
CREATE OR REPLACE FUNCTION get_unread_message_count(user_id uuid)
RETURNS integer AS $$
    SELECT COUNT(DISTINCT m.conversation_id)
    FROM messages m
    INNER JOIN conversation_participants cp ON m.conversation_id = cp.conversation_id
    WHERE cp.user_id = get_unread_message_count.user_id
    AND m.sender_id != get_unread_message_count.user_id
    AND m.is_read = false;
$$ LANGUAGE sql SECURITY DEFINER;

-- Function to mark conversation messages as read
CREATE OR REPLACE FUNCTION mark_conversation_read(user_id uuid, conversation_id uuid)
RETURNS void AS $$
    UPDATE messages
    SET is_read = true
    WHERE conversation_id = mark_conversation_read.conversation_id
    AND sender_id != mark_conversation_read.user_id
    AND is_read = false;
$$ LANGUAGE sql SECURITY DEFINER;

-- Function to update result_sheet counts
CREATE OR REPLACE FUNCTION update_sheet_counts()
RETURNS trigger AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.status = 'sent' THEN
            UPDATE result_sheets 
            SET sent_count = sent_count + 1 
            WHERE id = NEW.result_sheet_id;
        ELSIF NEW.status = 'failed' THEN
            UPDATE result_sheets 
            SET failed_count = failed_count + 1 
            WHERE id = NEW.result_sheet_id;
        END IF;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.status != NEW.status THEN
            IF NEW.status = 'sent' AND OLD.status != 'sent' THEN
                UPDATE result_sheets 
                SET sent_count = sent_count + 1,
                    failed_count = CASE WHEN OLD.status = 'failed' THEN failed_count - 1 ELSE failed_count END
                WHERE id = NEW.result_sheet_id;
            ELSIF NEW.status = 'failed' AND OLD.status != 'failed' THEN
                UPDATE result_sheets 
                SET failed_count = failed_count + 1,
                    sent_count = CASE WHEN OLD.status = 'sent' THEN sent_count - 1 ELSE sent_count END
                WHERE id = NEW.result_sheet_id;
            ELSIF OLD.status = 'sent' AND NEW.status != 'sent' THEN
                UPDATE result_sheets 
                SET sent_count = sent_count - 1 
                WHERE id = NEW.result_sheet_id;
            ELSIF OLD.status = 'failed' AND NEW.status != 'failed' THEN
                UPDATE result_sheets 
                SET failed_count = failed_count - 1 
                WHERE id = NEW.result_sheet_id;
            END IF;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS trigger_update_sheet_counts ON email_logs;
CREATE TRIGGER trigger_update_sheet_counts
    AFTER INSERT OR UPDATE ON email_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_sheet_counts();
