-- Access Codes Migration
-- This migration creates the access_codes table for managing user registration access codes
-- This migration is idempotent - it can be run multiple times safely

-- ============================================
-- ACCESS_CODES TABLE
-- ============================================

-- Create access_codes table
CREATE TABLE IF NOT EXISTS access_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT true,
    is_used BOOLEAN DEFAULT false,
    used_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_access_codes_code ON access_codes(code);
CREATE INDEX IF NOT EXISTS idx_access_codes_is_active ON access_codes(is_active);
CREATE INDEX IF NOT EXISTS idx_access_codes_is_used ON access_codes(is_used);
CREATE INDEX IF NOT EXISTS idx_access_codes_used_by ON access_codes(used_by);
CREATE INDEX IF NOT EXISTS idx_access_codes_created_by ON access_codes(created_by);
CREATE INDEX IF NOT EXISTS idx_access_codes_expires_at ON access_codes(expires_at);

-- Add trigger to automatically update updated_at (if we add it later)
-- Note: This table doesn't have updated_at currently, but we might add it later

-- ============================================
-- ADMIN_ROLES TABLE
-- ============================================

-- Create admin_roles table for managing admin users
CREATE TABLE IF NOT EXISTS admin_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_admin_roles_user_id ON admin_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_roles_role ON admin_roles(role);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to validate an access code
CREATE OR REPLACE FUNCTION validate_access_code(p_code TEXT)
RETURNS TABLE(is_valid BOOLEAN, code_id UUID) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ac.is_active AND NOT ac.is_used AND (ac.expires_at IS NULL OR ac.expires_at > NOW()) AS is_valid,
        ac.id
    FROM access_codes ac
    WHERE ac.code = p_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark an access code as used
CREATE OR REPLACE FUNCTION use_access_code(p_code TEXT, p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_code_id UUID;
BEGIN
    -- Get the code ID
    SELECT id INTO v_code_id
    FROM access_codes
    WHERE code = p_code AND is_active = true AND is_used = false
    AND (expires_at IS NULL OR expires_at > NOW())
    LIMIT 1;
    
    IF v_code_id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Mark as used
    UPDATE access_codes
    SET is_used = true,
        used_by = p_user_id,
        used_at = NOW()
    WHERE id = v_code_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate a random access code
CREATE OR REPLACE FUNCTION generate_access_code()
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- No ambiguous characters
    code TEXT := '';
    i INTEGER;
BEGIN
    FOR i IN 1..12 LOOP
        code := code || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
        -- Add hyphen every 4 characters for readability
        IF i % 4 = 0 AND i < 12 THEN
            code := code || '-';
        END IF;
    END LOOP;
    RETURN code;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ADDITIONAL USEFUL FUNCTIONS
-- ============================================

-- Function to check if user is admin (bypasses RLS)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_roles 
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is super admin (bypasses RLS)
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_roles 
    WHERE user_id = auth.uid()
    AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on access_codes
ALTER TABLE access_codes ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can view all access codes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Admins can view all access codes'
    AND schemaname = 'public'
    AND tablename = 'access_codes'
  ) THEN
    CREATE POLICY "Admins can view all access codes"
    ON access_codes FOR SELECT
    USING (is_admin());
  END IF;
END $$;

-- Policy: Admins can insert access codes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Admins can insert access codes'
    AND schemaname = 'public'
    AND tablename = 'access_codes'
  ) THEN
    CREATE POLICY "Admins can insert access codes"
    ON access_codes FOR INSERT
    WITH CHECK (is_admin());
  END IF;
END $$;

-- Policy: Admins can update access codes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Admins can update access codes'
    AND schemaname = 'public'
    AND tablename = 'access_codes'
  ) THEN
    CREATE POLICY "Admins can update access codes"
    ON access_codes FOR UPDATE
    USING (is_admin());
  END IF;
END $$;

-- Policy: Admins can delete access codes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Admins can delete access codes'
    AND schemaname = 'public'
    AND tablename = 'access_codes'
  ) THEN
    CREATE POLICY "Admins can delete access codes"
    ON access_codes FOR DELETE
    USING (is_admin());
  END IF;
END $$;

-- Enable RLS on admin_roles
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;

-- Policy: Only super_admins can manage admin roles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Super admins can manage admin roles'
    AND schemaname = 'public'
    AND tablename = 'admin_roles'
  ) THEN
    CREATE POLICY "Super admins can manage admin roles"
    ON admin_roles FOR ALL
    USING (is_super_admin());
  END IF;
END $$;

-- Policy: Admins can view admin roles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Admins can view admin roles'
    AND schemaname = 'public'
    AND tablename = 'admin_roles'
  ) THEN
    CREATE POLICY "Admins can view admin roles"
    ON admin_roles FOR SELECT
    USING (is_admin());
  END IF;
END $$;

-- ============================================
-- PUBLIC ACCESS FOR SCHOOLS AND DEPARTMENTS
-- ============================================

-- Enable RLS on schools if not already enabled
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access to schools
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Public can view schools'
    AND schemaname = 'public'
    AND tablename = 'schools'
  ) THEN
    CREATE POLICY "Public can view schools"
    ON schools FOR SELECT
    USING (true);
  END IF;
END $$;

-- Enable RLS on departments if not already enabled
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access to departments
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Public can view departments'
    AND schemaname = 'public'
    AND tablename = 'departments'
  ) THEN
    CREATE POLICY "Public can view departments"
    ON departments FOR SELECT
    USING (true);
  END IF;
END $$;
