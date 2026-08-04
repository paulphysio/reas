-- Add missing columns to result_sheets if they don't exist
ALTER TABLE public.result_sheets 
ADD COLUMN IF NOT EXISTS comment TEXT;

ALTER TABLE public.result_sheets 
ADD COLUMN IF NOT EXISTS signature TEXT;

ALTER TABLE public.result_sheets 
ADD COLUMN IF NOT EXISTS sent_count INTEGER DEFAULT 0;

ALTER TABLE public.result_sheets 
ADD COLUMN IF NOT EXISTS failed_count INTEGER DEFAULT 0;

-- Ensure year column exists (it should be there but just in case)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'result_sheets' AND column_name = 'year'
  ) THEN
    ALTER TABLE public.result_sheets ADD COLUMN year TEXT NOT NULL DEFAULT '2024';
  END IF;
END $$;

-- Make department column nullable if it exists and has NOT NULL constraint
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'result_sheets' AND column_name = 'department' AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.result_sheets ALTER COLUMN department DROP NOT NULL;
  END IF;
END $$;

-- Make department_id nullable if it exists and has NOT NULL constraint
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'result_sheets' AND column_name = 'department_id' AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.result_sheets ALTER COLUMN department_id DROP NOT NULL;
  END IF;
END $$;
