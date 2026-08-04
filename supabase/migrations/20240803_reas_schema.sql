-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Schools table (Nigerian universities and institutions)
CREATE TABLE IF NOT EXISTS public.schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('university', 'polytechnic', 'college', 'secondary')),
  state TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Departments table (linked to schools)
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  code TEXT NOT NULL, -- e.g., 'PET', 'CHEM', 'MECH'
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(school_id, code)
);

-- Profiles (extends auth.users) - Updated to include school and department
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add columns that may be missing from existing profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS school_id UUID,
ADD COLUMN IF NOT EXISTS department_id UUID,
ADD COLUMN IF NOT EXISTS department_code TEXT,
ADD COLUMN IF NOT EXISTS is_hod BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Add foreign key constraints after columns exist (only if referenced tables exist)
DO $$
BEGIN
  -- Check if schools table exists before adding foreign key
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'schools' AND table_schema = 'public'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'school_id'
  ) THEN
    ALTER TABLE public.profiles 
    DROP CONSTRAINT IF EXISTS profiles_school_id_fkey,
    ADD CONSTRAINT profiles_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id);
  END IF;

  -- Check if departments table exists before adding foreign key
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'departments' AND table_schema = 'public'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'department_id'
  ) THEN
    ALTER TABLE public.profiles 
    DROP CONSTRAINT IF EXISTS profiles_department_id_fkey,
    ADD CONSTRAINT profiles_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id);
  END IF;
END $$;

-- Add custom school and department columns for international users
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS custom_school_name TEXT,
ADD COLUMN IF NOT EXISTS custom_department_name TEXT;

-- Add CHECK constraints for mutual exclusivity (only if columns exist)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'school_id'
  ) THEN
    ALTER TABLE public.profiles 
    DROP CONSTRAINT IF EXISTS profiles_school_check;
    
    ALTER TABLE public.profiles 
    ADD CONSTRAINT profiles_school_check CHECK (
      (school_id IS NOT NULL AND custom_school_name IS NULL) OR
      (school_id IS NULL AND custom_school_name IS NOT NULL) OR
      (school_id IS NULL AND custom_school_name IS NULL)
    );
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'department_id'
  ) THEN
    ALTER TABLE public.profiles 
    DROP CONSTRAINT IF EXISTS profiles_department_check;
    
    ALTER TABLE public.profiles 
    ADD CONSTRAINT profiles_department_check CHECK (
      (department_id IS NOT NULL AND custom_department_name IS NULL) OR
      (department_id IS NULL AND custom_department_name IS NOT NULL) OR
      (department_id IS NULL AND custom_department_name IS NULL)
    );
  END IF;
END $$;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Result sheets (Excel data stored as JSONB – files never persist)
CREATE TABLE IF NOT EXISTS public.result_sheets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  uploaded_by UUID REFERENCES public.profiles(id) NOT NULL,
  level INTEGER NOT NULL CHECK (level BETWEEN 100 AND 600),
  department_code TEXT, -- Legacy field
  session TEXT NOT NULL,          -- e.g. '2024/2025'
  semester TEXT NOT NULL,         -- 'Harmattan' | 'Rain'
  year TEXT NOT NULL,             -- e.g. '2024'
  filename TEXT,
  columns TEXT[] NOT NULL,        -- header row
  data JSONB NOT NULL,            -- array of row objects
  comment TEXT,
  signature TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add department_id to result_sheets if it doesn't exist
ALTER TABLE public.result_sheets 
ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES public.departments(id);

-- Email logs
CREATE TABLE IF NOT EXISTS public.email_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  result_sheet_id UUID REFERENCES public.result_sheets(id) ON DELETE CASCADE,
  recipient_email TEXT NOT NULL,
  student_name TEXT,
  document TEXT,
  note TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending','sent','failed')),
  error TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.conversation_participants (
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.profiles(id) NOT NULL,
  content TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert Nigerian Universities
INSERT INTO public.schools (name, type, state) VALUES
  ('University of Lagos', 'university', 'Lagos'),
  ('University of Ibadan', 'university', 'Oyo'),
  ('University of Nigeria, Nsukka', 'university', 'Enugu'),
  ('Obafemi Awolowo University', 'university', 'Osun'),
  ('University of Benin', 'university', 'Edo'),
  ('Ahmadu Bello University', 'university', 'Kaduna'),
  ('University of Port Harcourt', 'university', 'Rivers'),
  ('University of Ilorin', 'university', 'Kwara'),
  ('University of Calabar', 'university', 'Cross River'),
  ('University of Uyo', 'university', 'Akwa Ibom'),
  ('University of Jos', 'university', 'Plateau'),
  ('University of Maiduguri', 'university', 'Borno'),
  ('Federal University of Technology, Minna', 'university', 'Niger'),
  ('Federal University of Technology, Akure', 'university', 'Ondo'),
  ('Federal University of Technology, Owerri', 'university', 'Imo'),
  ('Nnamdi Azikiwe University', 'university', 'Anambra'),
  ('University of Abuja', 'university', 'FCT'),
  ('Lagos State University', 'university', 'Lagos'),
  ('Covenant University', 'university', 'Ogun'),
  ('Babcock University', 'university', 'Ogun'),
  ('American University of Nigeria', 'university', 'Adamawa'),
  ('Afe Babalola University', 'university', 'Ekiti'),
  ('Redeemers University', 'university', 'Osun'),
  ('Bells University of Technology', 'university', 'Ogun'),
  ('Crawford University', 'university', 'Ogun'),
  ('Federal University of Agriculture, Abeokuta', 'university', 'Ogun'),
  ('Federal University of Agriculture, Makurdi', 'university', 'Benue'),
  ('Michael Okpara University of Agriculture', 'university', 'Abia'),
  ('University of Agriculture and Environmental Sciences, Umuagwo', 'university', 'Imo'),
  ('Federal University of Petroleum Resources, Effurun', 'university', 'Delta'),
  ('Federal University, Lokoja', 'university', 'Kogi'),
  ('Federal University, Otuoke', 'university', 'Bayelsa'),
  ('Federal University, Oye-Ekiti', 'university', 'Ekiti'),
  ('Federal University, Dutse', 'university', 'Jigawa'),
  ('Federal University, Dutsin-Ma', 'university', 'Katsina'),
  ('Federal University, Kashere', 'university', 'Gombe'),
  ('Federal University, Birnin Kebbi', 'university', 'Kebbi'),
  ('Federal University, Gusau', 'university', 'Zamfara'),
  ('Federal University, Wukari', 'university', 'Taraba'),
  ('Federal University, Gashua', 'university', 'Yobe'),
  ('Federal University, Ndifu-Alike', 'university', 'Ebonyi'),
  ('Yaba College of Technology', 'polytechnic', 'Lagos'),
  ('Federal Polytechnic, Bida', 'polytechnic', 'Niger'),
  ('Federal Polytechnic, Offa', 'polytechnic', 'Kwara'),
  ('Federal Polytechnic, Ilaro', 'polytechnic', 'Ogun'),
  ('Federal Polytechnic, Ado-Ekiti', 'polytechnic', 'Ekiti'),
  ('Federal Polytechnic, Nekede', 'polytechnic', 'Imo'),
  ('Federal Polytechnic, Oko', 'polytechnic', 'Anambra'),
  ('Federal Polytechnic, Bauchi', 'polytechnic', 'Bauchi'),
  ('Federal Polytechnic, Kaura Namoda', 'polytechnic', 'Zamfara'),
  ('Federal Polytechnic, Mubi', 'polytechnic', 'Adamawa'),
  ('Federal Polytechnic, Bida', 'polytechnic', 'Niger'),
  ('Kaduna Polytechnic', 'polytechnic', 'Kaduna'),
  ('Polytechnic Ibadan', 'polytechnic', 'Oyo'),
  ('Rufus Giwa Polytechnic', 'polytechnic', 'Ondo'),
  ('Lagos State Polytechnic', 'polytechnic', 'Lagos'),
  ('Osun State Polytechnic', 'polytechnic', 'Osun'),
  ('Delta State Polytechnic, Ozoro', 'polytechnic', 'Delta'),
  ('Auchi Polytechnic', 'polytechnic', 'Edo'),
  ('Institute of Management and Technology, Enugu', 'polytechnic', 'Enugu'),
  ('Federal College of Education (Technical), Bichi', 'college', 'Kano'),
  ('Federal College of Education (Technical), Akoka', 'college', 'Lagos'),
  ('Federal College of Education (Technical), Omoku', 'college', 'Rivers'),
  ('Federal College of Education, Zaria', 'college', 'Kaduna'),
  ('Federal College of Education, Katsina', 'college', 'Katsina'),
  ('Federal College of Education, Pankshin', 'college', 'Plateau'),
  ('Federal College of Education, Obudu', 'college', 'Cross River'),
  ('College of Education, Warri', 'college', 'Delta'),
  ('College of Education, Ikere', 'college', 'Ekiti'),
  ('College of Education, Ila-Orangun', 'college', 'Osun')
ON CONFLICT (name) DO NOTHING;

-- Insert common departments for universities
INSERT INTO public.departments (school_id, code, name) 
SELECT id, 'PET', 'Petroleum Engineering' FROM public.schools WHERE type = 'university'
ON CONFLICT (school_id, code) DO NOTHING;

INSERT INTO public.departments (school_id, code, name) 
SELECT id, 'CHEM', 'Chemical Engineering' FROM public.schools WHERE type = 'university'
ON CONFLICT (school_id, code) DO NOTHING;

INSERT INTO public.departments (school_id, code, name) 
SELECT id, 'MECH', 'Mechanical Engineering' FROM public.schools WHERE type = 'university'
ON CONFLICT (school_id, code) DO NOTHING;

INSERT INTO public.departments (school_id, code, name) 
SELECT id, 'CSC', 'Computer Science' FROM public.schools WHERE type = 'university'
ON CONFLICT (school_id, code) DO NOTHING;

INSERT INTO public.departments (school_id, code, name) 
SELECT id, 'ELEC', 'Electrical Engineering' FROM public.schools WHERE type = 'university'
ON CONFLICT (school_id, code) DO NOTHING;

INSERT INTO public.departments (school_id, code, name) 
SELECT id, 'CIVIL', 'Civil Engineering' FROM public.schools WHERE type = 'university'
ON CONFLICT (school_id, code) DO NOTHING;

INSERT INTO public.departments (school_id, code, name) 
SELECT id, 'BUS', 'Business Administration' FROM public.schools WHERE type = 'university'
ON CONFLICT (school_id, code) DO NOTHING;

INSERT INTO public.departments (school_id, code, name) 
SELECT id, 'ACC', 'Accounting' FROM public.schools WHERE type = 'university'
ON CONFLICT (school_id, code) DO NOTHING;

INSERT INTO public.departments (school_id, code, name) 
SELECT id, 'ECON', 'Economics' FROM public.schools WHERE type = 'university'
ON CONFLICT (school_id, code) DO NOTHING;

INSERT INTO public.departments (school_id, code, name) 
SELECT id, 'MED', 'Medicine' FROM public.schools WHERE type = 'university'
ON CONFLICT (school_id, code) DO NOTHING;

INSERT INTO public.departments (school_id, code, name) 
SELECT id, 'NURS', 'Nursing' FROM public.schools WHERE type = 'university'
ON CONFLICT (school_id, code) DO NOTHING;

INSERT INTO public.departments (school_id, code, name) 
SELECT id, 'LAW', 'Law' FROM public.schools WHERE type = 'university'
ON CONFLICT (school_id, code) DO NOTHING;

INSERT INTO public.departments (school_id, code, name) 
SELECT id, 'ENG', 'English Language' FROM public.schools WHERE type = 'university'
ON CONFLICT (school_id, code) DO NOTHING;

-- Indexes
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'result_sheets' AND column_name = 'department_id'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_result_sheets_department ON result_sheets (department_id, level, session, semester);
  END IF;
  CREATE INDEX IF NOT EXISTS idx_result_sheets_uploader ON result_sheets (uploaded_by);
  CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages (conversation_id, created_at);
  CREATE INDEX IF NOT EXISTS idx_email_logs_sheet ON email_logs (result_sheet_id);
END $$;
CREATE INDEX IF NOT EXISTS idx_profiles_school ON profiles (school_id);
CREATE INDEX IF NOT EXISTS idx_departments_school ON departments (school_id);

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE result_sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read all staff, update only themselves
DROP POLICY IF EXISTS "Public profiles are viewable by authenticated users" ON profiles;
CREATE POLICY "Public profiles are viewable by authenticated users"
  ON profiles FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Schools: public read for all authenticated users
DROP POLICY IF EXISTS "Schools are viewable by authenticated users" ON schools;
CREATE POLICY "Schools are viewable by authenticated users"
  ON schools FOR SELECT TO authenticated USING (true);

-- Departments: public read for all authenticated users
DROP POLICY IF EXISTS "Departments are viewable by authenticated users" ON departments;
CREATE POLICY "Departments are viewable by authenticated users"
  ON departments FOR SELECT TO authenticated USING (true);

-- Result sheets: only uploader + HODs of same department
DROP POLICY IF EXISTS "Staff can insert own results" ON result_sheets;
CREATE POLICY "Staff can insert own results"
  ON result_sheets FOR INSERT WITH CHECK (auth.uid() = uploaded_by);

-- Add HOD policy only if department_id column exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'result_sheets' AND column_name = 'department_id'
  ) THEN
    DROP POLICY IF EXISTS "View own or department HOD" ON result_sheets;
    CREATE POLICY "View own or department HOD"
      ON result_sheets FOR SELECT USING (
        auth.uid() = uploaded_by
        OR EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid() AND is_hod = true AND department_id = result_sheets.department_id
        )
      );
  ELSE
    -- Fallback policy without department check
    DROP POLICY IF EXISTS "View own or department HOD" ON result_sheets;
    CREATE POLICY "View own or department HOD"
      ON result_sheets FOR SELECT USING (auth.uid() = uploaded_by);
  END IF;
END $$;

-- Email logs: viewable by sheet owner
DROP POLICY IF EXISTS "Users can view email logs for their sheets" ON email_logs;
CREATE POLICY "Users can view email logs for their sheets"
  ON email_logs FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM result_sheets
      WHERE result_sheets.id = email_logs.result_sheet_id AND result_sheets.uploaded_by = auth.uid()
    )
  );

-- Messages policies
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
CREATE POLICY "Users can view messages in their conversations"
  ON messages FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()
    )
  );
DROP POLICY IF EXISTS "Users can insert messages in their conversations" ON messages;
CREATE POLICY "Users can insert messages in their conversations"
  ON messages FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()
    )
  );

-- Storage bucket for chat images only
INSERT INTO storage.buckets (id, name, public) 
VALUES ('chat-images', 'chat-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
DROP POLICY IF EXISTS "Users can upload chat images" ON storage.objects;
CREATE POLICY "Users can upload chat images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'chat-images');

DROP POLICY IF EXISTS "Public can view chat images" ON storage.objects;
CREATE POLICY "Public can view chat images"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'chat-images');
