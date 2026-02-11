'use server';

import { createClient } from '@/utils/supabase/server';
import { getPopularMovies } from '@/lib/tmdb';
import { redirect } from 'next/navigation';

export async function startNewGame() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        console.error('startNewGame: User not authenticated');
        throw new Error('User not authenticated');
    }

    console.log('startNewGame: User authenticated', user.id);

    const movies = await getPopularMovies();
    let pin = '';
    let isUnique = false;

    // Generate unique 4-digit PIN
    while (!isUnique) {
        pin = Math.floor(1000 + Math.random() * 9000).toString();
        const { data } = await supabase
            .from('rooms')
            .select('id')
            .eq('pin', pin)
            .single();

        if (!data) {
            isUnique = true;
        }
    }

    console.log('startNewGame: Generated PIN', pin);

    const { data: room, error } = await supabase
        .from('rooms')
        .insert({
            pin,
            host_user_id: user.id,
            movie_list: movies,
            status: 'waiting'
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating room:', error);
        throw new Error('Failed to create room');
    }

    console.log('startNewGame: Room created', room.id, 'with PIN', room.pin);
    return room;
}

export async function joinGame(pin: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        console.error('joinGame: User not authenticated');
        throw new Error('User not authenticated');
    }

    console.log('joinGame: Attempting to join with PIN', pin, 'User:', user.id);

    // Check if room exists and is waiting
    const { data: room, error: fetchError } = await supabase
        .from('rooms')
        .select('*')
        .eq('pin', pin)
        .eq('status', 'waiting')
        .single();

    if (fetchError || !room) {
        console.error('joinGame: Room not found or NOT waiting. Fetch error:', fetchError);
        throw new Error('Room not found or game already started');
    }

    console.log('joinGame: Room found', room.id, 'Host:', room.host_user_id);

    if (room.host_user_id === user.id) {
        console.log('joinGame: User is host, returning room');
        // Host re-joining or testing
        return room;
    }

    console.log('joinGame: Updating room with player2');

    // Update player2
    const { data: updatedRoom, error: updateError } = await supabase
        .from('rooms')
        .update({
            player2_user_id: user.id,
            status: 'ready' // Optional: change status to ready when p2 joins
        })
        .eq('id', room.id)
        .select()
        .single();

    if (updateError) {
        console.error('Error joining room:', updateError);
        throw new Error('Failed to join room');
    }

    console.log('joinGame: Room joined successfully');
    return updatedRoom;
}
