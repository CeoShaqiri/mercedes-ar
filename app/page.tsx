"use client";
import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

export default function ARPage() {
  const [state, setState] = useState<"detecting" | "launching" | "desktop">(
    "detecting",
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const modelParam = params.get("model") || "/models/eqs.glb";
    const origin = window.location.origin;
    const glbUrl = modelParam.startsWith("http")
      ? modelParam
      : origin + modelParam;
    const usdzUrl = glbUrl.replace(/\.glb$/i, ".usdz");

    const ua = navigator.userAgent || "";
    const ios =
      /iPad|iPhone|iPod/.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const android = /Android/.test(ua);

    if (ios) {
      setState("launching");
      const anchor = document.createElement("a");
      anchor.setAttribute("rel", "ar");
      anchor.setAttribute("href", usdzUrl);
      anchor.click();
    } else if (android) {
      setState("launching");
      const sceneViewerUrl = `intent://arvr.google.com/scene-viewer/1.0?file=${encodeURIComponent(glbUrl)}&mode=ar_only#Intent;scheme=https;package=com.google.ar.core;action=android.intent.action.VIEW;S.browser_fallback_url=${encodeURIComponent(origin + "/ar?model=" + modelParam)};end;`;
      window.location.href = sceneViewerUrl;
    } else {
      setState("desktop");
    }
  }, []);

  const wrap: React.CSSProperties = {
    position: "fixed",
    inset: 0,
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

  const desktopWrap: React.CSSProperties = {
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

  const buttonStyle: React.CSSProperties = {
    fontFamily: "Inter, system-ui, sans-serif",
    background: "#fff",
    color: "#000",
    border: "none",
    borderRadius: "9999px",
    padding: "16px 48px",
    fontSize: "12px",
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    cursor: "pointer",
  };

  if (state === "launching") {
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
        <p
          style={{
            fontSize: 18,
            color: "rgba(255,255,255,0.7)",
            marginBottom: 32,
          }}
        >
          Launching AR…
        </p>
        <p
          style={{
            fontSize: 13,
            color: "rgba(255,255,255,0.4)",
            maxWidth: 360,
            lineHeight: 1.6,
            marginBottom: 48,
          }}
        >
          Allow camera access when prompted.
        </p>
        <button
          onClick={() => (window.location.href = "/")}
          style={buttonStyle}
        >
          Back to experience
        </button>
      </div>
    );
  }

  if (state === "desktop") {
    const arUrl =
      "https://mercedes-ar.netlify.app/ar?model=%2Fmodels%2Feqs.glb";
    return (
      <div style={desktopWrap}>
        <p
          style={{
            fontSize: 12,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "#0a84ff",
            marginBottom: 32,
          }}
        >
          AR Experience
        </p>
        <h1 style={{ fontSize: 36, marginBottom: 32, fontWeight: 400 }}>
          You're on desktop
        </h1>

        <p
          style={{
            fontSize: 14,
            color: "rgba(255,255,255,0.6)",
            marginBottom: 32,
          }}
        >
          Scan this QR code with your phone:
        </p>
        <QRCodeSVG
          value={arUrl}
          size={200}
          bgColor="#000"
          fgColor="#fff"
          level="H"
          style={{ marginBottom: 32 }}
        />

        <p
          style={{
            fontSize: 13,
            color: "rgba(255,255,255,0.4)",
            marginBottom: 16,
          }}
        >
          — or —
        </p>

        <p
          style={{
            fontSize: 14,
            color: "rgba(255,255,255,0.6)",
            marginBottom: 16,
          }}
        >
          Open this link on your mobile phone:
        </p>
        <a
          href={arUrl}
          style={{
            fontSize: 14,
            color: "#0a84ff",
            textDecoration: "none",
            wordBreak: "break-all",
            maxWidth: 360,
          }}
        >
          {arUrl}
        </a>

        <p
          style={{
            fontSize: 12,
            color: "rgba(255,255,255,0.3)",
            marginTop: 48,
          }}
        >
          <button
            onClick={() => (window.location.href = "/")}
            style={{ ...buttonStyle, marginTop: 24 }}
          >
            Back to website
          </button>
        </p>
      </div>
    );
  }

  return (
    <div style={wrap}>
      <h1 style={{ fontSize: 28, marginBottom: 12 }}>AR not supported</h1>
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
