"use client";

import { useState } from "react";
import {
  RegisterAiKnowledge,
  RegisterAiTool,
  useMutation,
  useStorage,
} from "@liveblocks/react";
import { defineAiTool } from "@liveblocks/client";
import MonacoEditor from "@monaco-editor/react";

export function Editor() {
  const code = useStorage((root) => root.code);
  const [state, setState] = useState<"editable" | "generating">("editable");

  const setCode = useMutation(({ storage }, newCode) => {
    storage.set("code", newCode);
  }, []);

  return (
    <>
      <RegisterAiKnowledge
        description="The code editor content"
        value={code === null ? "Loading..." : code}
      />

      <RegisterAiTool
        name="edit-code"
        tool={defineAiTool()({
          description:
            "Edit the code editor content. You can use React and Tailwind.",
          parameters: {
            type: "object",
            properties: {
              code: {
                type: "string",
                description: "The full code in the editor",
              },
            },
            required: ["code"],
            additionalProperties: false,
          },
          execute: async ({ code }) => {
            console.log("code", code);
            setCode(code);
          },
        })}
      />

      <div className="h-full absolute inset-0">
        {code == null ? (
          <div>Loading...</div>
        ) : (
          <MonacoEditor
            value={code || ""}
            language="javascript"
            theme="light"
            options={{
              readOnly: state !== "editable",
              fontSize: 13,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              contextmenu: false,
            }}
            onChange={(value) => setCode(value ?? "")}
          />
        )}
      </div>
    </>
  );
}
 