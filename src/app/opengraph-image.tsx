import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px",
          color: "white",
          background: "linear-gradient(135deg, #0f172a 0%, #312e81 45%, #1d4ed8 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            fontSize: "28px",
            fontWeight: 700,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "52px",
              height: "52px",
              borderRadius: "14px",
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            ✦
          </div>
          FlowForge AI
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "18px",
          }}
        >
          <div style={{ fontSize: "72px", lineHeight: 1.1, fontWeight: 800 }}>
            Plan smart.
            <br />
            Ship faster.
          </div>
          <div style={{ fontSize: "28px", maxWidth: "760px", opacity: 0.9 }}>
            AI-powered project management for product teams, sprints, and delivery.
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
