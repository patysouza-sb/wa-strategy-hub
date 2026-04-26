import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare } from "lucide-react";

export const CHANNEL_OPTIONS = [
  { value: "all", label: "Todos os canais" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "whatsapp_official", label: "WhatsApp Oficial" },
  { value: "instagram", label: "Instagram" },
  { value: "messenger", label: "Messenger" },
  { value: "email", label: "E-mail" },
  { value: "widget", label: "Widget Web" },
];

export const CHANNEL_LABELS: Record<string, string> = Object.fromEntries(
  CHANNEL_OPTIONS.filter(c => c.value !== "all").map(c => [c.value, c.label]),
);

interface ChannelFilterProps {
  value: string;
  onChange: (v: string) => void;
  className?: string;
}

export function ChannelFilter({ value, onChange, className }: ChannelFilterProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={`h-9 w-[180px] text-xs ${className || ""}`}>
        <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {CHANNEL_OPTIONS.map(c => (
          <SelectItem key={c.value} value={c.value} className="text-xs">{c.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
