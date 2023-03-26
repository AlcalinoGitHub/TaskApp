import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL  = 'https://gswseesooblhbftumuwv.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdzd3NlZXNvb2JsaGJmdHVtdXd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2Nzk4MDIyNzgsImV4cCI6MTk5NTM3ODI3OH0.zqpa3gblMH9dOeqIiDmiooW7yb_eQm8PruXrl6arsYo'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

export {supabase}