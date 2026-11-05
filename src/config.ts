// Shared Supabase project cultura-GH. This app reads merhav_* (מרחב פנימי) and
// reads/writes only its own ishy_* objects (writes go through the ishy-compose function).
export const SUPABASE_URL = 'https://ktqmwpbzcnzkhjskqisy.supabase.co';
export const SUPABASE_ANON =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0cW13cGJ6Y256a2hqc2txaXN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxODM4OTgsImV4cCI6MjEwNTc1OTg5OH0.uPKn4hrLk16jhDoajMjPl4OmV5j1b3bMIECVmOdhWGI';

export const DEV_CHAT_URL = 'https://claude.ai/code/session_01UBnSCK1mDqYN1gDjxcaHKm';

// The two parent apps. Every article links back to the case it came from.
export const MERHAV_URL = 'https://merhav-pnimi.vercel.app';
export const MAHUT_URL = 'https://magazin-gh.vercel.app';
export const merhavCaseUrl = (id: string) => `${MERHAV_URL}/case/${id}`;
