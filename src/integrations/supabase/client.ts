// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://hjobbzyrcolyztfukvvc.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhqb2JienlyY29seXp0ZnVrdnZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3MzgzNTgsImV4cCI6MjA2MzMxNDM1OH0.E0mECn5Pewxpe6UBrPque1-1icY3cZhWBYG8fQ0ntYw";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);