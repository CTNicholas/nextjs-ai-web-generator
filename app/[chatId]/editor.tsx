"use client";

import { useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { RegisterAiKnowledge, RegisterAiTool } from "@liveblocks/react";
import { defineAiTool } from "@liveblocks/client";
import { EditorView } from "@codemirror/view";

export function Editor() {
  const [value, setValue] = useState("console.log('Hello world!')");
  const [state, setState] = useState<"editable" | "generating">("editable");

  return (
    <>
      <RegisterAiKnowledge
        description="The code editor content"
        value={value}
      />

      <RegisterAiTool
        name="edit-code"
        tool={defineAiTool()({
          description:
            "Edit the code editor content. You can use React and Tailwind.",
          parameters: {
            type: "object",
            properties: {
              code: { type: "string" },
            },
            required: ["code"],
            additionalProperties: false,
          },
          execute: async ({ code }) => {
            setValue(code);
          },
        })}
      />

      <CodeMirror
        className="h-full absolute inset-0"
        value={value}
        extensions={[
          javascript({ jsx: true }),
          EditorView.editable.of(state === "editable"),
        ]}
        onChange={setValue}
        theme="light"
        basicSetup={true}
      />
    </>
  );
}
