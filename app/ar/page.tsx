"use client";
import { useEffect } from "react";

export default function ARPage() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const modelParam = params.get("model") || "/models/eqs.glb";
    const origin = window.location.origin;
    const glbUrl = modelParam.startsWith("http")
      ? modelParam
      : origin + modelParam;
    const usdzUrl = glbUrl.replace(/\.glb$/i, ".usdz");

    const ua = navigator.userAgent || "";
    const isIOS = /iPad|iPhone|iPod/.test(ua);
    const isAndroid = /Android/.test(ua);

    if (isAndroid) {
      const sceneViewerUrl = `intent://arvr.google.com/scene-viewer/1.0?file=${encodeURIComponent(glbUrl)}#Intent;scheme=https;package=com.google.ar.core;action=android.intent.action.VIEW;end;`;
      window.location.href = sceneViewerUrl;
      return;
    }

    if (isIOS) {
      const anchor = document.createElement("a");
      anchor.setAttribute("rel", "ar");
      anchor.setAttribute("href", usdzUrl);
      anchor.click();
      return;
    }
  }, []);

  return <div style={{ background: "#000", minHeight: "100vh" }} />;
}
