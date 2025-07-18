"use client";

import {
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
} from "@codesandbox/sandpack-react";
import { useStorage } from "@liveblocks/react";
import { Spinner } from "./spinner";

export function Preview() {
  const code = useStorage((root) => root.code);

  if (code === null) {
    return <Spinner />;
  }

  return (
    <SandpackProvider
      template="react-ts"
      files={{ "/App.js": code }}
      options={{
        externalResources: ["https://cdn.tailwindcss.com"],
      }}
      style={{
        position: "absolute",
        inset: 0,
      }}
    >
      <SandpackLayout
        style={{ height: "100%", width: "100%", borderRadius: 0, border: 0 }}
      >
        <SandpackPreview
          style={{ height: "100%", width: "100%", borderRadius: 0 }}
          showNavigator={true}
          showOpenNewtab={false}
          showOpenInCodeSandbox={false}
        />
      </SandpackLayout>
    </SandpackProvider>
  );
}
