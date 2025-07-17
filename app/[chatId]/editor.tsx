"use client";

import { useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import {
  RegisterAiKnowledge,
  RegisterAiTool,
  useMutation,
  useStorage,
} from "@liveblocks/react";
import { defineAiTool } from "@liveblocks/client";
import { EditorView } from "@codemirror/view";

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
          //   render: ({ args, stage }) => {
          //     if (stage === "receiving") {
          //       console.log("Receiving");
          //       return <div>Start</div>;
          //     }

          //     if (stage === "executing") {
          //       console.log("Executing");
          //       setCode(args.code);
          //       return <div>Executing</div>;
          //     }

          //     console.log("Executed");
          //     return <div>Executed</div>;
          //   },
        })}
      />

      <CodeMirror
        className="h-full absolute inset-0"
        value={code || ""}
        extensions={[
          javascript({ jsx: true }),
          EditorView.editable.of(state === "editable"),
        ]}
        onChange={setCode}
        theme="light"
        basicSetup={true}
      />
    </>
  );
}
