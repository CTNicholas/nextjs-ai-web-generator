"use client";

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
import { Spinner } from "./spinner";
import { useIsGenerating } from "./utils";
import { AiTool } from "@liveblocks/react-ui";

export function Editor() {
  const generating = useIsGenerating();
  const code = useStorage((root) => root.code);

  const setCode = useMutation(({ storage }, newCode) => {
    storage.set("code", newCode);
  }, []);

  return (
    <>
      <RegisterAiKnowledge
        description="The code editor content for the current app."
        value={code === null ? "Loading..." : code}
      />

      <RegisterAiTool
        name="edit-code"
        tool={defineAiTool()({
          description:
            "Edit the code editor content. Use this to build apps and components.",
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
            setCode(await prettify(code));
            return {
              data: {},
              description:
                "You've generated code. Write a very short description.",
            };
          },
          render: ({ stage }) => (
            <AiTool
              title={
                stage === "executed" ? "Code generated" : "Generating code…"
              }
            />
          ),
        })}
      />

      <div
        className="h-full absolute inset-0 data-[generating]:opacity-70"
        // data-generating={generating || undefined}
      >
        {code == null ? (
          <Spinner />
        ) : (
          <MonacoEditor
            value={code || ""}
            language="javascript"
            theme="light"
            options={{
              readOnly: generating,
              fontSize: 13,
              fontFamily: "var(--font-mono), JetBrains Mono, monospace",
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              contextmenu: false,
              bracketPairColorization: { enabled: false },
              matchBrackets: "never",
              selectionHighlight: false,
              occurrencesHighlight: "off",
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
  // Define a custom theme
  monaco.editor.defineTheme("custom-light", {
    base: "vs",
    inherit: true,
    rules: [],
    colors: {
      "editorLineNumber.foreground": "#d0d0d0", // Light gray for all line numbers
      "editorLineNumber.activeForeground": "#333333", // Darker for the active line number
    },
  });

  // Set the custom theme
  monaco.editor.setTheme("custom-light");

  // `cmd/ctrl + s` runs prettier
  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, async () => {
    const model = editor.getModel();
    if (!model) {
      return;
    }

    const selection = editor.getSelection();
    const formatted = await prettify(model.getValue());

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

async function prettify(code: string) {
  return await prettier.format(code, {
    parser: "typescript",
    plugins: [estree, typescript, html],
  });
}
