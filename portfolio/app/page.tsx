import { SplineSceneBasic } from "@/components/demo";

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-black">
      <div className="w-full max-w-6xl p-4">
        <SplineSceneBasic />
      </div>
    </main>
  );
}
