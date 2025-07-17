"use client";

import { Room } from "./room";
import { Editor } from "./editor";
import { Header } from "./header";
import { Chat } from "./chat";
import { Preview } from "./preview";
import { useState } from "react";

export default function Page({ params }: { params: { chatId: string } }) {
  const [panel, setPanel] = useState<"preview" | "editor">("preview");

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

          <div className="relative grow shadow rounded-lg overflow-hidden ring-1 ring-neutral-950/5 bg-white flex flex-col">
            <div className="flex items-center p-2.5 gap-1.5 border-b border-neutral-950/5">
              <button
                className="text-sm font-medium py-1 px-2 rounded hover:bg-neutral-100 text-neutral-600 data-[selected]:text-neutral-900 data-[selected]:bg-neutral-100 transition-colors"
                data-selected={panel === "preview" || undefined}
                onClick={() => setPanel("preview")}
              >
                Preview
              </button>
              <button
                className="text-sm font-medium py-1 px-2 rounded hover:bg-neutral-100 text-neutral-600 data-[selected]:text-neutral-900 data-[selected]:bg-neutral-100 transition-colors"
                data-selected={panel === "editor" || undefined}
                onClick={() => setPanel("editor")}
              >
                Editor
              </button>
            </div>

            <div className="grow relative">
              <div style={{ display: panel === "preview" ? "block" : "none" }}>
                <Preview />
              </div>
              <div style={{ display: panel === "editor" ? "block" : "none" }}>
                <Editor chatId={params.chatId} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </Room>
  );
}
