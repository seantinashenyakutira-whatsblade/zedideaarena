-- Fix FK relationships for arena_chat_messages
-- The current FK goes to auth.users, but we need it to reference public.users
-- so Supabase schema cache can resolve the join for arena_chat_messages->users

ALTER TABLE arena_chat_messages
  DROP CONSTRAINT IF EXISTS arena_chat_messages_user_id_fkey,
  DROP CONSTRAINT IF EXISTS arena_chat_messages_admin_id_fkey;

ALTER TABLE arena_chat_messages
  ADD CONSTRAINT arena_chat_messages_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
  ADD CONSTRAINT arena_chat_messages_admin_id_fkey
    FOREIGN KEY (admin_id) REFERENCES public.users(id) ON DELETE SET NULL;
