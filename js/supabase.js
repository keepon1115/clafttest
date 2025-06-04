// Supabase client configuration
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'

// Supabaseの設定（本番環境では環境変数から取得することを推奨）
const supabaseUrl = 'https://laqvpxecqvlufboquffe.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhcXZweGVjcXZsdWZib3F1ZmZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0MzYwNjgsImV4cCI6MjA2NDAxMjA2OH0.IRkg1miEpOGIFQMnno_P0hsMe1IgwCi2kl_kNcrmZTw'

// Supabaseクライアントを作成
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// クライアント作成関数をエクスポート
export { createClient } 