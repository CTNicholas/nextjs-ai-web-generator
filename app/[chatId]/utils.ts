import { useParams } from "next/navigation";
import { useAiChatMessages } from "@liveblocks/react";

// If the last message is a tool call that is currently generated (e.,g. writing code)
export function useIsGenerating() {
  const params = useParams<{ chatId: string }>();
  const { messages } = useAiChatMessages(params.chatId);

  const lastMessage = messages?.length ? messages[messages.length - 1] : null;
  const generatingToolResponse =
    lastMessage?.role === "assistant" &&
    lastMessage?.contentSoFar?.length &&
    lastMessage.contentSoFar.length > 1 &&
    lastMessage.contentSoFar[lastMessage.contentSoFar.length - 1].type ===
      "tool-invocation";

  return !!generatingToolResponse;
}
