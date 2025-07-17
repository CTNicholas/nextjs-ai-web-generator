"use client";

import { useState } from "react";
import {
  RegisterAiKnowledge,
  RegisterAiTool,
  useMutation,
  useStorage,
} from "@liveblocks/react";
import { defineAiTool } from "@liveblocks/client";
import MonacoEditor, { type OnMount } from "@monaco-editor/react";

import estree from "prettier/plugins/estree";
import html from "prettier/plugins/html";
import typescript from "prettier/plugins/typescript";
import prettier from "prettier/standalone";

export function formatWithPrettier(code: string) {
  return prettier.format(code, {
    parser: "typescript",
    plugins: [estree, typescript, html],
  });
}

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
            onMount={handleMonacoMount}
          />
        )}
      </div>
    </>
  );
}

const handleMonacoMount: OnMount = (editor, monaco) => {
  // `cmd/ctrl + s` runs prettier
  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, async () => {
    const model = editor.getModel();
    if (!model) {
      return;
    }

    const selection = editor.getSelection();
    const formatted = await formatWithPrettier(model.getValue());

    // Apply edits
    editor.executeEdits("format", [
      {
        range: model.getFullModelRange(),
        text: formatted,
        forceMoveMarkers: true,
      },
    ]);

    // Restore cursor location
    if (selection) {
      editor.setSelection(selection);
    }
  });
};
