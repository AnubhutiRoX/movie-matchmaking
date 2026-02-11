const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const HOST_EMAIL = 'test_host@example.com';
const FRIEND_EMAIL = 'test_friend@example.com';
const PASSWORD = 'password123';
const PIN = '9999';

async function setup() {
    console.log('Setting up test environment...');

    // 1. SignUp/SignIn Host
    console.log(`Signing up/in Host: ${HOST_EMAIL}`);
    const { data: hostAuth, error: hostError } = await supabase.auth.signUp({
        email: HOST_EMAIL,
        password: PASSWORD,
    });
    if (hostError) console.error('Host Auth Error:', hostError.message);
    const hostUser = hostAuth.user;

    // 2. SignUp/SignIn Friend
    console.log(`Signing up/in Friend: ${FRIEND_EMAIL}`);
    const { data: friendAuth, error: friendError } = await supabase.auth.signUp({
        email: FRIEND_EMAIL,
        password: PASSWORD,
    });
    if (friendError) console.error('Friend Auth Error:', friendError.message);
    const friendUser = friendAuth.user;

    if (!hostUser || !friendUser) {
        console.error('Failed to get users. Exiting.');
        return;
    }

    // 3. Create Room (as Host)
    // We need to fetch movies first to populate the list.
    // For simplicity, we'll use a hardcoded list of IDs or fetch if possible.
    // We can just use dummy movies for the test? No, UI needs valid poster URLs.
    // Let's use the actual fetch if we can import it, or just use IDs we saw earlier.
    const mockMovies = [
        { id: "840464", title: "Greenland 2", posterUrl: "https://image.tmdb.org/t/p/w500/z2tqCJLsw6uEJ8nJV8BsQXGa3dr.jpg", rating: 6.5, year: 2026, description: "Test Movie 1" },
        { id: "1368166", title: "The Housemaid", posterUrl: "https://image.tmdb.org/t/p/w500/cWsBscZzwu5brg9YjNkGewRUvJX.jpg", rating: 7.2, year: 2025, description: "Test Movie 2" }
    ];

    console.log(`Creating Room PIN: ${PIN}`);
    // Check if room exists first and delete? Or just use a unique PIN everytime?
    // Let's try to delete old room with this PIN first if RLS allows (unlikely).
    // Actually, RLS allows delete for host. We need to be signed in as host.
    // Supabase JS client handles auth state if we sign in.

    // Sign in as Host to create room
    await supabase.auth.signInWithPassword({ email: HOST_EMAIL, password: PASSWORD });

    // Check existing
    const { data: existing } = await supabase.from('rooms').select('id').eq('pin', PIN).single();
    if (existing) {
        console.log('Room exists, attempting to reuse or reset...');
        // Reset player2 and swipes?
        await supabase.from('rooms').update({ player2_user_id: null, status: 'waiting' }).eq('id', existing.id);
        await supabase.from('swipes').delete().eq('room_id', existing.id);
        await supabase.from('matches').delete().eq('room_id', existing.id);
        console.log('Room reset.');
        return;
    }

    const { data: room, error: roomError } = await supabase
        .from('rooms')
        .insert({
            pin: PIN,
            host_user_id: hostUser.id,
            movie_list: mockMovies,
            status: 'waiting'
        })
        .select()
        .single();

    if (roomError) {
        console.error('Error creating room:', roomError);
    } else {
        console.log('Room created:', room.id);
    }
}

async function simulateFriend() {
    console.log('Simulating Friend...');

    // Delay to let the recording start
    await new Promise(r => setTimeout(r, 5000));

    // Sign in as Friend
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: FRIEND_EMAIL, password: PASSWORD });
    if (signInError) {
        console.error('Friend Sign In Error:', signInError);
        return;
    }

    // Join Room
    console.log(`Friend joining room PIN: ${PIN}`);
    const { data: room, error: joinError } = await supabase
        .from('rooms')
        .select('*')
        .eq('pin', PIN)
        .single();

    if (!room) {
        console.error('Room not found for friend.');
        return;
    }

    const { error: updateError } = await supabase
        .from('rooms')
        .update({ player2_user_id: (await supabase.auth.getUser()).data.user?.id, status: 'ready' })
        .eq('id', room.id);

    if (updateError) console.error('Friend Join Error:', updateError);
    else console.log('Friend joined!');

    // Wait for Host to see "Swiping"
    await new Promise(r => setTimeout(r, 3000));

    // Swipe Right on all movies
    console.log('Friend swiping...');
    const movies = room.movie_list;
    for (const movie of movies) {
        await supabase.from('swipes').insert({
            room_id: room.id,
            user_id: (await supabase.auth.getUser()).data.user?.id,
            movie_id: movie.id,
            liked: true
        });
        console.log(`Friend liked: ${movie.title}`);
        await new Promise(r => setTimeout(r, 500)); // Simulate think time
    }
    console.log('Friend finished swiping.');
}

const args = process.argv.slice(2);
if (args.includes('setup')) {
    setup();
} else if (args.includes('play')) {
    simulateFriend();
} else {
    console.log('Usage: node setup_automation.js [setup|play]');
}
