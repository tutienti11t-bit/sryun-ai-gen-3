// pages/_app.tsx
import type { AppProps } from "next/app";
import "../styles/globals.css"; // nếu bạn đang có file này

import Sidebar from "../components/Sidebar"; // đổi path đúng theo dự án bạn

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div className="min-h-screen w-full">
      <div className="mx-auto flex w-full max-w-[1440px]">
        {/* Sidebar cố định chiều ngang */}
        <aside className="w-[260px] shrink-0">
          <Sidebar />
        </aside>

        {/* Main content KHÔNG được overflow đè panel */}
        <main className="min-w-0 flex-1">
          <Component {...pageProps} />
        </main>
      </div>
    </div>
  );
}
