-- Fix: profiles were world-readable by any authenticated user (USING (true)),
-- leaking every user's email + full_name to anyone who signs up.
-- Replace with: read your own profile, plus profiles of people you share a
-- conversation with (needed so chat can show the other participant's name).

-- Helper runs as owner (SECURITY DEFINER) so the conversation lookup is not
-- itself blocked by RLS on conversation_participants, and cannot recurse.
CREATE OR REPLACE FUNCTION public.shares_conversation_with(target_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM conversation_participants me
    JOIN conversation_participants them
      ON me.conversation_id = them.conversation_id
    WHERE me.user_id = auth.uid()
      AND them.user_id = target_id
  );
$$;

REVOKE ALL ON FUNCTION public.shares_conversation_with(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.shares_conversation_with(uuid) TO authenticated;

-- Replace the over-permissive SELECT policy.
DROP POLICY IF EXISTS "Public profiles are viewable by authenticated users" ON public.profiles;

CREATE POLICY "Users can read own and conversation profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (
    auth.uid() = id
    OR public.shares_conversation_with(id)
  );
