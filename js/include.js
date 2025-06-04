// HTMLパーシャル読み込み機能
document.addEventListener('DOMContentLoaded', function() {
    // パーシャルファイルを読み込む
    const includeElements = document.querySelectorAll('[data-include]');
    
    includeElements.forEach(async (element) => {
        const filePath = element.getAttribute('data-include');
        try {
            const response = await fetch(filePath);
            if (response.ok) {
                const html = await response.text();
                element.innerHTML = html;
                
                // ナビゲーション要素が読み込まれた後、イベントリスナーを初期化
                if (filePath.includes('navigation.html')) {
                    initializeNavigation();
                }
            } else {
                console.error(`Failed to load ${filePath}:`, response.status);
            }
        } catch (error) {
            console.error(`Error loading ${filePath}:`, error);
        }
    });
});

// ナビゲーション機能の初期化
function initializeNavigation() {
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    if (hamburgerMenu && sidebar && sidebarOverlay) {
        // ハンバーガーメニューのクリックイベント
        hamburgerMenu.addEventListener('click', () => {
            hamburgerMenu.classList.toggle('active');
            sidebar.classList.toggle('active');
            sidebarOverlay.classList.toggle('active');
        });

        // オーバーレイクリックでサイドバーを閉じる
        sidebarOverlay.addEventListener('click', () => {
            hamburgerMenu.classList.remove('active');
            sidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
        });

        // サイドバーアイテムのクリックイベント
        const sidebarItems = document.querySelectorAll('.sidebar-item');
        sidebarItems.forEach(item => {
            item.addEventListener('click', function(e) {
                // アクティブクラスの切り替え
                sidebarItems.forEach(i => i.classList.remove('active'));
                this.classList.add('active');

                // モバイル表示時にサイドバーを自動で閉じる
                if (window.innerWidth <= 768) {
                    hamburgerMenu.classList.remove('active');
                    sidebar.classList.remove('active');
                    sidebarOverlay.classList.remove('active');
                }
            });
        });
    }
} 