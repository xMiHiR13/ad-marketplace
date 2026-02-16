"use client";

export default function Loading() {
  return (
    <div className="h-screen flex flex-col items-center justify-center px-6 text-center bg-gradient-to-br from-slate-900 to-slate-800">
      <i
        className="ri-store-2-line text-7xl text-white mb-3"
        style={{
          animation: "fastPulse 1s ease-in-out infinite",
        }}
      ></i>
      <style jsx>{`
        @keyframes fastPulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.3;
          }
        }
      `}</style>
    </div>
  );
}
