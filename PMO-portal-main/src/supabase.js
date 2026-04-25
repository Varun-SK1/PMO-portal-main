import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://viyezigvvplrxbijwnxu.supabase.co'
const supabaseKey = 'sb_publishable_1BkRWfQIPRq5DQNDgywIJw_501YT29M'

export const supabase = createClient(supabaseUrl, supabaseKey)