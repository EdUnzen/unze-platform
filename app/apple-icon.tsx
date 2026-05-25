import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(145deg, #2DD484 0%, #1DB872 50%, #159660 100%)",
          borderRadius: 36,
          color: "white",
          fontSize: 96,
          fontWeight: 700,
        }}
      >
        U
      </div>
    ),
    { ...size },
  );
}
