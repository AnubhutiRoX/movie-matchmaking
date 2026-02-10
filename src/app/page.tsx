import SwipeContainer from "@/components/SwipeContainer";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-pink-500 mb-2">
          Movie Matchmaker
        </h1>
        <p className="text-gray-400">Swipe right to save, left to pass</p>
      </div>
      <SwipeContainer />
    </div>
  );
}
