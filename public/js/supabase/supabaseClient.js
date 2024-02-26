import { createClient } from "https://cdn.skypack.dev/@supabase/supabase-js";

const SUPABASE_URL = 'https://ktdzlqemmdtfntfajkwo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0ZHpscWVtbWR0Zm50ZmFqa3dvIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTQ0MDYyOTEsImV4cCI6MjAwOTk4MjI5MX0.2x_1Lp_9J6pJxOPAFk3P6bAWrpVqFyrUdxekzPAWHvw';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default supabase;
