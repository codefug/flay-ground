"use client";

import { RECHARTS_DEVTOOLS_PORTAL_ID } from "@recharts/devtools";

export function DevTool() {
  return (
    <>
      {process.env.NODE_ENV === "development" && (
        <div id={RECHARTS_DEVTOOLS_PORTAL_ID} />
      )}
    </>
  );
}
