// Initialize Supabase Client
const supabaseUrl = 'https://cazcqxysmbtyseilckbg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhemNxeHlzbWJ0eXNlaWxja2JnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyMDAwMDgsImV4cCI6MjA4OTc3NjAwOH0.-OOo_-KgiJU4GDWNDmY3F7iVq2tBxnxvSNwNwuJ9RzI';

if (typeof supabase !== 'undefined') {
    window.supabase = supabase.createClient(supabaseUrl, supabaseKey);
    // Also expose as global for script.js compatibility
    window._supabaseClient = window.supabase;
    console.log('Supabase initialized successfully.');
} else {
    console.error('Supabase library not loaded. Check your internet connection or CDN link.');
}
