// client/src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xvgskglnhunwodoobkgc.supabase.co'; // Replace with actual URL
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2Z3NrZ2xuaHVud29kb29ia2djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2MjIwMjUsImV4cCI6MjA2MDE5ODAyNX0.PtymI5RjKDA7-3ITZseUAmnWVHdaWDkt5YBc-NeUwm8'; // Replace with actual anon key

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
