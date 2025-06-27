// Supabase client configuration
// CDN版のSupabaseライブラリ用設定

// Supabaseの設定（本番環境では環境変数から取得することを推奨）
const supabaseUrl = 'https://laqvpxecqvlufboquffe.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhcXZweGVjcXZsdWZib3F1ZmZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0MzYwNjgsImV4cCI6MjA2NDAxMjA2OH0.IRkg1miEpOGIFQMnno_P0hsMe1IgwCi2kl_kNcrmZTw'

// CDN版のSupabaseライブラリから読み込み
// window.supabase はCDNスクリプトによって提供される
let supabase = null;

// Supabaseクライアントを初期化する関数
function initSupabase() {
    if (window.supabase && window.supabase.createClient) {
        supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
        console.log('✅ Supabase client initialized successfully');
        return supabase;
    } else {
        console.error('❌ Supabase library not loaded');
        return null;
    }
}

// グローバルに公開
window.initSupabase = initSupabase;
window.supabaseConfig = { url: supabaseUrl, key: supabaseAnonKey }; 