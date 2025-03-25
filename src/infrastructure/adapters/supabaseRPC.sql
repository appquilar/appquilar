
-- Función para incrementar el contador de mensajes no leídos
CREATE OR REPLACE FUNCTION increment_unread(conversation_id UUID)
RETURNS INTEGER
LANGUAGE SQL
AS $$
  UPDATE conversations
  SET unread_count = unread_count + 1
  WHERE id = conversation_id
  RETURNING unread_count;
$$;
