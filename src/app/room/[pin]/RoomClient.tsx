'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import SwipeContainer from '@/components/SwipeContainer';
import MatchesView from '@/components/MatchesView';
import { Movie } from '@/lib/tmdb';
import { Copy, Share2, Loader2, Users } from 'lucide-react';

interface RoomClientProps {
    initialRoom: any;
    currentUserId: string;
}

export default function RoomClient({ initialRoom, currentUserId }: RoomClientProps) {
    const [room, setRoom] = useState(initialRoom);
    const [isPlaying, setIsPlaying] = useState(!!(initialRoom.player2_user_id || initialRoom.status === 'ready'));
    const [matches, setMatches] = useState<string[]>([]);
    const [copied, setCopied] = useState(false);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        // If playing, we stop listening to room updates (for player 2 joining) 
        // BUT we need to start listening for MATCHES.
        if (!isPlaying) {
            console.log('RoomClient: Setting up Realtime subscription and polling for room:', room.id);

            // Realtime Subscription for ROOM updates (waiting for friend)
            const roomChannel = supabase
                .channel(`room:${room.id}`)
                .on(
                    'postgres_changes',
                    {
                        event: 'UPDATE',
                        schema: 'public',
                        table: 'rooms',
                        filter: `id=eq.${room.id}`,
                    },
                    (payload: any) => {
                        console.log('Room UPDATE received from Realtime:', payload);
                        if (payload.new.player2_user_id) {
                            console.log('Player 2 joined! Updating state.');
                            setRoom(payload.new);
                            setIsPlaying(true);
                        }
                    }
                )
                .subscribe((status) => {
                    console.log(`Realtime subscription status for room ${room.id}:`, status);
                });

            // Polling Fallback for ROOM updates
            const intervalId = setInterval(async () => {
                console.log('Polling for room updates...');
                const { data, error } = await supabase
                    .from('rooms')
                    .select('*')
                    .eq('id', room.id)
                    .single();

                if (data && data.player2_user_id) {
                    console.log('Polling detected Player 2! Updating state.');
                    setRoom(data);
                    setIsPlaying(true);
                }
            }, 3000);

            return () => {
                console.log('RoomClient: Cleaning up room subscription and polling.');
                supabase.removeChannel(roomChannel);
                clearInterval(intervalId);
            };
        } else {
            // Game is playing! Listen for MATCHES.
            console.log('Game started! Listening for matches...');

            // Check for existing matches first (in case of refresh)
            const checkExistingMatches = async () => {
                const { data } = await supabase
                    .from('matches')
                    .select('movie_id')
                    .eq('room_id', room.id);

                if (data && data.length > 0) {
                    setMatches(data.map(m => m.movie_id));
                }
            };
            checkExistingMatches();

            const matchesChannel = supabase
                .channel(`matches:${room.id}`)
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'matches',
                        filter: `room_id=eq.${room.id}`,
                    },
                    (payload: any) => {
                        console.log('Match found!', payload);
                        setMatches((prev) => [...prev, payload.new.movie_id]);
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(matchesChannel);
            }
        }
    }, [supabase, room.id, isPlaying]);

    const copyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleManualRefresh = () => {
        window.location.reload();
    };

    if (matches.length > 0) {
        return <MatchesView matchedMovieIds={matches} allMovies={room.movie_list as Movie[]} />;
    }

    if (isPlaying) {
        return (
            <div className="w-full h-full flex flex-col">
                <div className="bg-gray-900/50 backdrop-blur-sm p-2 text-center text-xs text-gray-400 border-b border-gray-800">
                    Room PIN: <span className="font-mono text-white">{room.pin}</span>
                </div>
                <SwipeContainer
                    initialMovies={room.movie_list as Movie[]}
                    roomId={room.id}
                    userId={currentUserId}
                />
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-8 text-center animate-in fade-in duration-500">
            <div className="bg-gray-800/50 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-gray-700 max-w-md w-full">
                <div className="bg-indigo-500/10 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                    <Users className="text-indigo-400 w-10 h-10" />
                </div>

                <h2 className="text-2xl font-bold mb-2 text-white">Waiting for Friend</h2>
                <p className="text-gray-400 mb-8">Share the PIN or link to start matching!</p>

                <div className="bg-gray-900 rounded-xl p-6 mb-8 border border-gray-800 relative overflow-hidden group">
                    <div className="text-sm text-gray-500 uppercase tracking-wider mb-1 font-semibold">Room PIN</div>
                    <div className="text-5xl font-mono font-bold tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-indigo-500">
                        {room.pin}
                    </div>
                </div>

                <button
                    onClick={copyLink}
                    className="w-full py-4 bg-gray-700 hover:bg-gray-600 rounded-xl font-medium transition-all flex items-center justify-center space-x-2 text-white border border-gray-600 hover:border-gray-500 group mb-4"
                >
                    {copied ? (
                        <>
                            <span className="text-green-400">Copied!</span>
                        </>
                    ) : (
                        <>
                            <Share2 size={18} className="group-hover:scale-110 transition-transform" />
                            <span>Copy Share Link</span>
                        </>
                    )}
                </button>

                <button
                    onClick={handleManualRefresh}
                    className="text-sm text-gray-500 hover:text-white underline decoration-dotted underline-offset-4"
                >
                    Stuck? Check manually
                </button>

                <div className="mt-8 flex items-center justify-center space-x-2 text-gray-500 text-sm">
                    <Loader2 className="animate-spin" size={16} />
                    <span>Listening for connections...</span>
                </div>
            </div>
        </div>
    );
}
