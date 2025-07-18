"use client";

import { ClientSideSuspense, useAiChat } from "@liveblocks/react";
import Link from "next/link";
import { ErrorBoundary } from "react-error-boundary";
import { nanoid } from "nanoid";

export function Header({ chatId }: { chatId: string }) {
  return (
    <div className="flex items-center justify-between">
      <ErrorBoundary fallback={<div>Problem loading chat title</div>}>
        <ClientSideSuspense
          fallback={
            // Loading placeholder around title
            <div className="shrink-0 h-8 p-4 relative flex items-center">
              <div className="h-6 rounded-lg w-16 bg-neutral-100 animate-pulse"></div>
            </div>
          }
        >
          <Title chatId={chatId} />
        </ClientSideSuspense>
      </ErrorBoundary>
      <Link
        href={`/${nanoid()}`}
        className="bg-white ring-1 ring-neutral-200 text-sm font-medium px-1.5 py-1 rounded-md shadow-sm hover:bg-neutral-50"
      >
        + New
      </Link>
    </div>
  );
}

// Title is automatically generated from the first message and reply
function Title({ chatId }: { chatId: string }) {
  const { chat } = useAiChat(chatId);

  return (
    <div className="h-8 flex items-center text-sm font-medium">
      {chat?.title || "Untitled"}
    </div>
  );
}
