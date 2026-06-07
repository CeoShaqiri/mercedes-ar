"use client";
import { Suspense, useEffect, useState } from "react";

function ARLauncher() {
  const [state, setState] = useState<
    "detecting" | "desktop" | "launching" | "unsupported"
  >("detecting");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const modelParam = params.get("model") || "/models/eqs.glb";
    const origin = window.location.origin;
    const glbUrl = modelParam.startsWith("http")
      ? modelParam
      : origin + modelParam;
    const usdzUrl = glbUrl.replace(/\.glb$/i, ".usdz");

    const ua = navigator.userAgent || "";
    const isIOS =
      /iPad|iPhone|iPod/.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const isAndroid = /Android/.test(ua);

    if (isAndroid) {
      setState("launching");
      const sceneViewerUrl = `intent://arvr.google.com/scene-viewer/1.0?file=${encodeURIComponent(glbUrl)}&mode=ar_only#Intent;scheme=https;package=com.google.ar.core;action=android.intent.action.VIEW;S.browser_fallback_url=${encodeURIComponent(origin + "/ar?model=" + modelParam)};end;`;
      window.location.href = sceneViewerUrl;
      return;
    }

    if (isIOS) {
      setState("launching");
      const anchor = document.createElement("a");
      anchor.setAttribute("rel", "ar");
      anchor.setAttribute("href", usdzUrl);
      const img = document.createElement("img");
      img.style.display = "none";
      anchor.appendChild(img);
      document.body.appendChild(anchor);
      anchor.click();
      setTimeout(() => {
        if (anchor.parentNode) document.body.removeChild(anchor);
      }, 1500);
      return;
    }

    setState("desktop");
  }, []);

  const wrap: React.CSSProperties = {
    minHeight: "100vh",
    background: "#000",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "Inter, system-ui, sans-serif",
    textAlign: "center",
    padding: 24,
  };

  if (state === "detecting" || state === "launching") {
    return (
      <div style={wrap}>
        <p
          style={{
            fontSize: 12,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "#0a84ff",
            marginBottom: 16,
          }}
        >
          The Aura Standard
        </p>
        <p style={{ fontSize: 18, color: "rgba(255,255,255,0.7)" }}>
          {state === "launching" ? "Launching AR…" : "Preparing…"}
        </p>
        <p
          style={{
            fontSize: 13,
            color: "rgba(255,255,255,0.4)",
            marginTop: 12,
          }}
        >
          Allow camera access when prompted.
        </p>
      </div>
    );
  }

  if (state === "desktop") {
    return (
      <div style={wrap}>
        <p
          style={{
            fontSize: 12,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "#0a84ff",
            marginBottom: 16,
          }}
        >
          AR Experience
        </p>
        <h1 style={{ fontSize: 36, marginBottom: 16, fontWeight: 400 }}>
          Open on your phone
        </h1>
        <p
          style={{
            color: "rgba(255,255,255,0.5)",
            maxWidth: 360,
            lineHeight: 1.7,
          }}
        >
          Augmented reality runs on your phone. Scan the QR code from the
          product page to park the EQS in your space.
        </p>
      </div>
    );
  }

  return (
    <div style={wrap}>
      <h1 style={{ fontSize: 28, marginBottom: 12 }}>AR not supported here</h1>
      <p
        style={{
          color: "rgba(255,255,255,0.5)",
          maxWidth: 360,
          lineHeight: 1.7,
        }}
      >
        Try a recent iPhone (Safari) or Android (Chrome).
      </p>
    </div>
  );
}

export default function ARPage() {
  return (
    <Suspense
      fallback={<div style={{ background: "#000", minHeight: "100vh" }} />}
    >
      <ARLauncher />
    </Suspense>
  );
}
