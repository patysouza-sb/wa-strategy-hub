ALTER TABLE public.conversations 
ADD COLUMN IF NOT EXISTS channel_type text NOT NULL DEFAULT 'whatsapp';

CREATE INDEX IF NOT EXISTS idx_conversations_channel_type ON public.conversations(channel_type);
CREATE INDEX IF NOT EXISTS idx_automations_channel_type ON public.automations(channel_type);
CREATE INDEX IF NOT EXISTS idx_broadcasts_channel_type ON public.broadcasts(channel_type);