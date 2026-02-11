'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SwipeContainer from "@/components/SwipeContainer";
import { startNewGame, joinGame } from './actions';
import { Play, Users, LogIn, Loader2 } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [joinPin, setJoinPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'menu' | 'single'>('menu');

  const handleCreateGame = async () => {
    setLoading(true);
    setError('');
    try {
      const room = await startNewGame();
      router.push(`/room/${room.pin}`);
    } catch (err) {
      console.error(err);
      setError('Failed to create game. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (joinPin.length !== 4) {
      setError('PIN must be 4 digits.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const room = await joinGame(joinPin);
      router.push(`/room/${room.pin}`);
    } catch (err) {
      console.error(err);
      setError('Failed to join game. Check the PIN.');
    } finally {
      setLoading(false);
    }
  };

  if (mode === 'single') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-8">
        <button
          onClick={() => setMode('menu')}
          className="absolute top-4 left-4 text-gray-400 hover:text-white"
        >
          &larr; Back to Menu
        </button>
        <SwipeContainer />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-8">
      <div className="text-center mb-12 animate-in slide-in-from-bottom-5 duration-500">
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-purple-500 to-pink-500 mb-4 drop-shadow-lg">
          Movie Matchmaker
        </h1>
        <p className="text-gray-400 text-lg max-w-md mx-auto">
          Find the perfect movie to watch together. Swipe, match, and enjoy!
        </p>
      </div>

      <div className="w-full max-w-md space-y-6 animate-in slide-in-from-bottom-10 duration-700 delay-100">
        <div className="bg-gray-800/50 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-gray-700">
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm text-center">
              {error}
            </div>
          )}

          <button
            onClick={handleCreateGame}
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-xl font-bold text-white shadow-lg transform hover:scale-[1.02] transition-all flex items-center justify-center space-x-3 mb-6"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Users size={24} />}
            <span>Start Multiplayer Game</span>
          </button>

          <div className="relative flex py-2 items-center mb-6">
            <div className="flex-grow border-t border-gray-600"></div>
            <span className="flex-shrink mx-4 text-gray-500 text-sm">Or join a friend</span>
            <div className="flex-grow border-t border-gray-600"></div>
          </div>

          <form onSubmit={handleJoinGame} className="flex space-x-2 mb-8">
            <input
              type="text"
              maxLength={4}
              placeholder="Enter PIN"
              value={joinPin}
              onChange={(e) => setJoinPin(e.target.value.replace(/\D/g, ''))}
              className="flex-1 bg-gray-900 border border-gray-600 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-center tracking-widest text-lg placeholder-gray-600"
            />
            <button
              type="submit"
              disabled={loading || joinPin.length !== 4}
              className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-semibold transition-colors flex items-center"
            >
              {loading ? <Loader2 className="animate-spin" /> : <LogIn size={20} />}
            </button>
          </form>

          <button
            onClick={() => setMode('single')}
            className="w-full py-3 bg-transparent border border-gray-600 hover:bg-gray-700/50 text-gray-300 rounded-xl font-medium transition-all flex items-center justify-center space-x-2"
          >
            <Play size={18} />
            <span>Practice (Single Player)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
