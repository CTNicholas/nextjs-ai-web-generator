"use client";

import { ClientSideSuspense } from "@liveblocks/react/suspense";
import { ErrorBoundary } from "react-error-boundary";
import { Room } from "./room";
import { Editor } from "./editor";
import { Header } from "./header";
import { Chat } from "./chat";

export default function Page({ params }: { params: { chatId: string } }) {
  return (
    <Room chatId={params.chatId}>
      <div className="flex flex-col h-full w-full p-2.5 gap-2.5 overflow-hidden">
        <header>
          <Header chatId={params.chatId} />
        </header>

        <main className="grow flex gap-2.5 min-h-0">
          <div className="grow-0 w-[380px] shadow rounded-lg overflow-hidden ring-1 ring-neutral-950/5 bg-white">
            <Chat chatId={params.chatId} />
          </div>
          <div className="relative grow shadow rounded-lg overflow-hidden ring-1 ring-neutral-950/5 bg-white">
            <Editor />
          </div>
        </main>
      </div>
    </Room>
  );
}
