"use client";

import {
  RegisterAiKnowledge,
  RegisterAiTool,
  useMutation,
  useStorage,
} from "@liveblocks/react";
import { defineAiTool } from "@liveblocks/client";
import MonacoEditor, { type OnMount } from "@monaco-editor/react";
import { useRef, useCallback } from "react";

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
  const editorRef = useRef<any>(null);
  const currentGeneratedLineRef = useRef(0);
  const highlightDecorationsRef = useRef<any>(null);

  const setCode = useMutation(({ storage }, newCode) => {
    storage.set("code", newCode);
  }, []);

  // Highlight each line as its generated in
  const highlightGeneratedLine = useCallback(
    (lineNumber: number, characterPosition?: number) => {
      if (!editorRef.current || lineNumber <= 0) return;

      // Clear previous highlight
      if (highlightDecorationsRef.current) {
        highlightDecorationsRef.current.clear();
      }

      const model = editorRef.current.getModel();
      if (!model) {
        return;
      }

      const totalLines = model.getLineCount();
      if (lineNumber > totalLines) {
        return;
      }

      const lineContent = model.getLineContent(lineNumber);
      const endColumn = lineContent.length + 1;

      const decorations = [
        {
          range: {
            startLineNumber: lineNumber,
            startColumn: 1,
            endLineNumber: lineNumber,
            endColumn: endColumn,
          },
          options: {
            isWholeLine: true,
            className: "generated-line-highlight",
          },
        },
      ];

      // Add character-level highlight if characterPosition is provided
      if (characterPosition !== undefined && characterPosition > 0) {
        const charColumn = Math.min(characterPosition + 1, endColumn);
        decorations.push({
          range: {
            startLineNumber: lineNumber,
            startColumn: charColumn,
            endLineNumber: lineNumber,
            endColumn: charColumn + 1,
          },
          options: {
            className: "generated-character-highlight",
            isWholeLine: false,
          },
        });
      }

      highlightDecorationsRef.current =
        editorRef.current.createDecorationsCollection(decorations);
    },
    []
  );

  const clearHighlight = useCallback(() => {
    if (highlightDecorationsRef.current) {
      highlightDecorationsRef.current.clear();
      highlightDecorationsRef.current = null;
    }
    currentGeneratedLineRef.current = 0;
  }, []);

  const handleMonacoMount = useCallback((editor: any, monaco: any) => {
    editorRef.current = editor;
    onMonacoMount(editor, monaco);
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
          execute: () => {},
          render: ({ stage, partialArgs, args, respond }) => {
            if (stage === "receiving") {
              if (typeof partialArgs.code === "string" && code) {
                // Merge this string with the current code as it streams in
                const lines = partialArgs.code.split("\n");
                const lineCount = lines.length;
                const characterCount = lines[lines.length - 1].length;

                const [currentExtraLine, ...extraLines] = code
                  .split("\n")
                  .slice(lineCount - 1);

                let additionOnLastLine = "";

                // On the last line, fill in characters from previous code
                if (currentExtraLine?.length > lines[lines.length - 1].length) {
                  additionOnLastLine = currentExtraLine.slice(
                    lines[lines.length - 1].length
                  );
                }

                const mergedLines =
                  partialArgs.code +
                  additionOnLastLine +
                  (extraLines.length ? "\n" + extraLines.join("\n") : "");

                setCode(mergedLines);

                // Highlight the current generated line and character
                currentGeneratedLineRef.current = lineCount;
                highlightGeneratedLine(lineCount, characterCount);

                // prettify(mergedLines).then((formattedCode) => {
                //   setCode(formattedCode);
                // });
              }
              return <AiTool title="Generating code…" />;
            }

            if (stage === "executing") {
              setCode(args.code);

              // Clear highlight when generation is complete
              clearHighlight();

              // prettify(args.code).then((formattedCode) => {
              //   setCode(formattedCode);
              // });
              return <AiTool title="Generating code…" />;
            }

            respond({
              data: {},
              description:
                "You've generated code. Write a very short description.",
            });

            // Clear highlight when fully done
            clearHighlight();

            return <AiTool title={"Code generated"} />;
          },
        })}
      />

      <div
        className="h-full absolute inset-0 data-[generating]:opacity-70"
        data-generating={generating || undefined}
      >
        {code == null ? (
          <Spinner />
        ) : (
          <MonacoEditor
            value={code || ""}
            language={generating ? "plaintext" : "javascript"}
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

const onMonacoMount = (editor: any, monaco: any) => {
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
  return await prettier
    .format(code, {
      parser: "typescript",
      plugins: [estree, typescript, html],
    })
    .catch((error) => {
      console.error(error);
      return code;
    });
}
