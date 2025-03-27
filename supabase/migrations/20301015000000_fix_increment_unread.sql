
-- Función para incrementar el contador de mensajes no leídos (versión corregida)
CREATE OR REPLACE FUNCTION public.increment_unread(conversation_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  new_count INTEGER;
BEGIN
  UPDATE conversations
  SET unread_count = unread_count + 1
  WHERE id = conversation_id
  RETURNING unread_count INTO new_count;
  
  RETURN new_count;
END;
$$;
