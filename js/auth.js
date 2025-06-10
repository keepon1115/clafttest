// auth.js - CLAFT共通認証モジュール

// Supabase設定
const SUPABASE_URL = 'https://laqvpxecqvlufboquffe.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhcXZweGVjcXZsdWZib3F1ZmZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0MzYwNjgsImV4cCI6MjA2NDAxMjA2OH0.IRkg1miEpOGIFQMnno_P0hsMe1IgwCi2kl_kNcrmZTw';

let supabase;
if (window.supabase && window.supabase.createClient) {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
    console.error('Supabaseライブラリが読み込まれていません');
}

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.isAdmin = false;
        this.initializeAuth();
    }

    async initializeAuth() {
        // 認証状態の監視
        supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('認証状態変更:', event, session);
            this.currentUser = session?.user || null;
            
            if (this.currentUser) {
                // ログイン処理
                await this.handleLogin();
                // 管理者チェック
                await this.checkAdminStatus();
            }
            
            // ページ固有の認証処理を呼び出し
            if (window.onAuthStateChanged) {
                window.onAuthStateChanged(this.currentUser);
            }
        });

        // 初期認証状態の確認
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            this.currentUser = session.user;
            await this.handleLogin();
            await this.checkAdminStatus();
        }

        // UIの初期化
        this.initializeAuthUI();
    }

    async handleLogin() {
        if (!this.currentUser) return;

        try {
            // ログイン統計の更新
            const today = new Date().toISOString().split('T')[0];
            
            const { data: stats, error: statsError } = await supabase
                .from('user_stats')
                .select('*')
                .eq('user_id', this.currentUser.id)
                .single();

            if (statsError && statsError.code === 'PGRST116') {
                // 統計レコードが存在しない場合は作成
                await supabase.from('user_stats').insert({
                    user_id: this.currentUser.id,
                    login_count: 1,
                    last_login_date: today
                });
            } else if (stats && stats.last_login_date !== today) {
                // 今日初めてのログイン
                await supabase
                    .from('user_stats')
                    .update({
                        login_count: stats.login_count + 1,
                        last_login_date: today,
                        updated_at: new Date().toISOString()
                    })
                    .eq('user_id', this.currentUser.id);
            }

            // プロフィールの確認/作成
            const { data: profile, error: profileError } = await supabase
                .from('users_profile')
                .select('*')
                .eq('id', this.currentUser.id)
                .single();

            if (profileError && profileError.code === 'PGRST116') {
                // プロフィールが存在しない場合は作成
                await supabase.from('users_profile').insert({
                    id: this.currentUser.id,
                    email: this.currentUser.email,
                    nickname: this.currentUser.user_metadata?.display_name || '冒険者'
                });
            }
        } catch (error) {
            console.error('ログイン処理エラー:', error);
        }
    }

    async checkAdminStatus() {
        if (!this.currentUser) {
            this.isAdmin = false;
            return;
        }

        try {
            const { data, error } = await supabase
                .from('admin_users')
                .select('is_active')
                .eq('id', this.currentUser.id)
                .eq('is_active', true)
                .single();

            this.isAdmin = !error && data?.is_active === true;
        } catch (error) {
            console.error('管理者チェックエラー:', error);
            this.isAdmin = false;
        }
    }

    initializeAuthUI() {
        // 共通認証UIのセットアップ
        this.createAuthModal();
        this.updateAuthButtons();
    }

    createAuthModal() {
        // 認証モーダルが既に存在する場合はスキップ
        if (document.getElementById('authModal')) return;

        const modalHTML = `
            <div class="auth-modal" id="authModal" style="display: none;">
                <div class="auth-modal-content">
                    <button class="auth-modal-close" onclick="authManager.hideAuthModal()">×</button>
                    <h2 class="auth-modal-title">🔐 冒険者登録・ログイン</h2>
                    
                    <div class="auth-tabs">
                        <button class="auth-tab active" data-tab="login" onclick="authManager.switchTab('login')">ログイン</button>
                        <button class="auth-tab" data-tab="signup" onclick="authManager.switchTab('signup')">新規登録</button>
                    </div>
                    
                    <div class="auth-form" id="loginForm">
                        <h3>冒険を続ける</h3>
                        <div class="form-group">
                            <label for="loginEmail">メールアドレス</label>
                            <input type="email" id="loginEmail" placeholder="your-email@example.com" required>
                        </div>
                        <div class="form-group">
                            <label for="loginPassword">パスワード</label>
                            <input type="password" id="loginPassword" placeholder="パスワードを入力" required>
                        </div>
                        <button class="auth-submit-btn" onclick="authManager.handleLoginSubmit()">🚪 ログイン</button>
                        <div class="auth-message" id="loginMessage"></div>
                    </div>
                    
                    <div class="auth-form" id="signupForm" style="display: none;">
                        <h3>新しい冒険を始める</h3>
                        <div class="form-group">
                            <label for="signupEmail">メールアドレス</label>
                            <input type="email" id="signupEmail" placeholder="your-email@example.com" required>
                        </div>
                        <div class="form-group">
                            <label for="signupPassword">パスワード</label>
                            <input type="password" id="signupPassword" placeholder="6文字以上のパスワード" required>
                        </div>
                        <div class="form-group">
                            <label for="signupNickname">冒険者名</label>
                            <input type="text" id="signupNickname" placeholder="あなたの冒険者名">
                        </div>
                        <button class="auth-submit-btn" onclick="authManager.handleSignup()">⚔️ 冒険者登録</button>
                        <div class="auth-message" id="signupMessage"></div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    updateAuthButtons() {
        // 既存の認証ボタンを更新
        const authButtons = document.querySelectorAll('[data-auth-action]');
        authButtons.forEach(button => {
            if (this.currentUser) {
                if (button.dataset.authAction === 'logout') {
                    button.style.display = 'block';
                    button.onclick = () => this.logout();
                } else {
                    button.style.display = 'none';
                }
            } else {
                if (button.dataset.authAction === 'login') {
                    button.style.display = 'block';
                    button.onclick = () => this.showAuthModal();
                } else {
                    button.style.display = 'none';
                }
            }
        });
    }

    showAuthModal() {
        const modal = document.getElementById('authModal');
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    hideAuthModal() {
        const modal = document.getElementById('authModal');
        if (modal) {
            modal.style.display = 'none';
            this.clearAuthForms();
        }
    }

    switchTab(tabName) {
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        document.getElementById('loginForm').style.display = tabName === 'login' ? 'block' : 'none';
        document.getElementById('signupForm').style.display = tabName === 'signup' ? 'block' : 'none';
    }

    async handleLoginSubmit() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const messageDiv = document.getElementById('loginMessage');

        if (!email || !password) {
            this.showMessage(messageDiv, 'メールアドレスとパスワードを入力してください', 'error');
            return;
        }

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) throw error;

            this.showMessage(messageDiv, '✅ ログイン成功！', 'success');
            setTimeout(() => {
                this.hideAuthModal();
                location.reload(); // ページをリロードして状態を更新
            }, 1000);

        } catch (error) {
            this.showMessage(messageDiv, `❌ ログインエラー: ${error.message}`, 'error');
        }
    }

    async handleSignup() {
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const nickname = document.getElementById('signupNickname').value;
        const messageDiv = document.getElementById('signupMessage');

        if (!email || !password) {
            this.showMessage(messageDiv, 'メールアドレスとパスワードを入力してください', 'error');
            return;
        }

        if (password.length < 6) {
            this.showMessage(messageDiv, 'パスワードは6文字以上で入力してください', 'error');
            return;
        }

        try {
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        display_name: nickname || '冒険者'
                    }
                }
            });

            if (error) throw error;

            this.showMessage(messageDiv, '✅ 登録完了！メールを確認してアカウントを有効化してください', 'success');

        } catch (error) {
            this.showMessage(messageDiv, `❌ 登録エラー: ${error.message}`, 'error');
        }
    }

    async logout() {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            
            location.reload();
        } catch (error) {
            console.error('ログアウトエラー:', error);
            alert('ログアウトに失敗しました');
        }
    }

    showMessage(element, message, type) {
        element.textContent = message;
        element.className = `auth-message ${type}`;
        element.style.display = 'block';
    }

    clearAuthForms() {
        document.getElementById('loginEmail').value = '';
        document.getElementById('loginPassword').value = '';
        document.getElementById('signupEmail').value = '';
        document.getElementById('signupPassword').value = '';
        document.getElementById('signupNickname').value = '';
        
        document.querySelectorAll('.auth-message').forEach(msg => {
            msg.style.display = 'none';
        });
    }

    // ユーザー情報取得メソッド
    getCurrentUser() {
        return this.currentUser;
    }

    isLoggedIn() {
        return !!this.currentUser;
    }

    isAdminUser() {
        return this.isAdmin;
    }

    // ページ保護メソッド
    requireAuth(redirectUrl = '/') {
        if (!this.isLoggedIn()) {
            this.showAuthModal();
            return false;
        }
        return true;
    }

    requireAdmin(redirectUrl = '/') {
        if (!this.isAdminUser()) {
            alert('管理者権限が必要です');
            window.location.href = redirectUrl;
            return false;
        }
        return true;
    }
}

// グローバルインスタンスの作成
window.authManager = new AuthManager(); 