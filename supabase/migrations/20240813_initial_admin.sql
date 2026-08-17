-- Initial Admin Setup
-- This script creates the initial admin user
-- Run this manually after setting up your database to create the first admin account

-- Note: You need to replace the user_id below with your actual Supabase auth user ID
-- You can get this by signing up through your app and then checking the auth.users table

-- Replace 'YOUR_USER_ID_HERE' with the actual UUID from auth.users
DO $$
DECLARE
    admin_user_id UUID := '68b0549f-6c00-449e-b906-42ce5a6c58c7'; -- REPLACE THIS WITH YOUR ACTUAL USER ID
BEGIN
    -- Insert into admin_roles table
    INSERT INTO admin_roles (user_id, role, created_by)
    VALUES (admin_user_id, 'super_admin', NULL)
    ON CONFLICT (user_id) DO UPDATE SET role = 'super_admin';
    
    RAISE NOTICE 'Admin role created for user ID: %', admin_user_id;
END $$;

-- Alternative: Create a function to make a user an admin
CREATE OR REPLACE FUNCTION make_admin(user_id UUID)
RETURNS void AS $$
BEGIN
    INSERT INTO admin_roles (user_id, role, created_by)
    VALUES (user_id, 'admin', NULL)
    ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to make a user a super admin
CREATE OR REPLACE FUNCTION make_super_admin(user_id UUID)
RETURNS void AS $$
BEGIN
    INSERT INTO admin_roles (user_id, role, created_by)
    VALUES (user_id, 'super_admin', NULL)
    ON CONFLICT (user_id) DO UPDATE SET role = 'super_admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to remove admin role
CREATE OR REPLACE FUNCTION remove_admin(user_id UUID)
RETURNS void AS $$
BEGIN
    DELETE FROM admin_roles WHERE user_id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions on these functions
GRANT EXECUTE ON FUNCTION make_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION make_super_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION remove_admin(UUID) TO authenticated;
