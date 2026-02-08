import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send } from "lucide-react";
import { negotiate } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import type { ChatMessage, NegotiationTerm, DiscoveryPath, Port } from "@/types/simulation";

interface NegotiationChatProps {
  traceId: string;
  suppliers: DiscoveryPath[];
  ports: Port[];
  onTermsUpdate: (terms: NegotiationTerm[]) => void;
}

const NegotiationChat = ({ traceId, suppliers, ports, onTermsUpdate }: NegotiationChatProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [supplierId, setSupplierId] = useState<string>("");
  const [port, setPort] = useState<string>("");
  const [isSending, setIsSending] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || isSending) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setIsSending(true);

    try {
      const res = await negotiate(traceId, {
        message: userMsg,
        supplier_id: supplierId || null,
        port: port || null,
      });
      setMessages(res.negotiation_history);
      if (res.updated_terms) {
        onTermsUpdate(res.updated_terms);
      }
    } catch (err: any) {
      toast({ title: "Negotiation Error", description: err.message, variant: "destructive" });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="rounded-lg border bg-card">
      <div className="p-3 border-b">
        <h3 className="text-sm font-semibold text-foreground">Negotiate with AI Agent</h3>
      </div>

      {/* Chat messages */}
      <div className="h-48 overflow-y-auto p-3 space-y-2">
        {messages.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-8">
            Start a negotiation to adjust terms, pricing, or lead times.
          </p>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-3 py-2 text-xs ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="border-t p-3 space-y-2">
        <div className="flex gap-2">
          <Select value={supplierId} onValueChange={setSupplierId}>
            <SelectTrigger className="w-[140px] h-8 text-xs bg-secondary/50">
              <SelectValue placeholder="Supplier (opt)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any supplier</SelectItem>
              {suppliers.map((s) => (
                <SelectItem key={s.identity} value={s.identity}>
                  {s.identity}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={port} onValueChange={setPort}>
            <SelectTrigger className="w-[140px] h-8 text-xs bg-secondary/50">
              <SelectValue placeholder="Port (opt)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any port</SelectItem>
              {ports.map((p) => (
                <SelectItem key={p.name} value={p.name}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type your negotiation message..."
            maxLength={1000}
            className="h-9 text-xs bg-secondary/50"
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || isSending}
            size="icon"
            className="h-9 w-9 shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NegotiationChat;
