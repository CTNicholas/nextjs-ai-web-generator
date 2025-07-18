"use client";

import { Room } from "./room";
import { Editor } from "./editor";
import { Header } from "./header";
import { Chat } from "./chat";
import { Preview } from "./preview";
import { useState } from "react";
import { useIsGenerating } from "./utils";
import { SpinnerIcon } from "./spinner";

export default function Page({ params }: { params: { chatId: string } }) {
  const [panel, setPanel] = useState<"preview" | "editor">("preview");
  const generating = useIsGenerating();

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
            <div className="flex items-center justify-between pr-4 border-b border-neutral-950/5">
              <div className="flex items-center p-2.5 gap-1.5">
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
              {/* {generating ? (
                <div className="float-right text-neutral-600 text-sm animate-pulse">
                  Generating…
                </div>
              ) : (
                <div className="float-right text-neutral-300 text-sm">
                  Updated
                </div>
              )} */}
            </div>

            <div className="grow relative">
              <div
                style={{
                  display: panel === "preview" ? "block" : "none",
                  opacity: generating ? 0.7 : 1,
                }}
              >
                <Preview />
              </div>
              <div
                style={{
                  display: panel === "editor" ? "block" : "none",
                  opacity: generating ? 0.7 : 1,
                }}
              >
                <Editor />
              </div>
              {generating && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 backdrop-blur">
                  <div className="text-lg font-bold flex items-center">
                    <SpinnerIcon className="size-10 opacity-60 -mr-0.5" />{" "}
                    Generating…
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </Room>
  );
}
