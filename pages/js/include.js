document.addEventListener('DOMContentLoaded', function() {
    const includeElements = document.querySelectorAll('[data-include]');
    let loadedCount = 0;
    
    includeElements.forEach(function(element) {
        const file = element.getAttribute('data-include');
        
        fetch(file)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text();
            })
            .then(data => {
                element.innerHTML = data;
                loadedCount++;
                
                // すべてのincludeが完了したら、ナビゲーション機能を初期化
                if (loadedCount === includeElements.length) {
                    initializeNavigation();
                }
            })
            .catch(error => {
                console.error('Error loading include file:', error);
                element.innerHTML = '<p>コンテンツの読み込みに失敗しました。</p>';
                loadedCount++;
                
                // エラーが発生してもカウントは進める
                if (loadedCount === includeElements.length) {
                    initializeNavigation();
                }
            });
    });
    
    // includeElements が空の場合（すでに読み込み済みの場合）
    if (includeElements.length === 0) {
        initializeNavigation();
    }
});

function initializeNavigation() {
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    if (hamburgerMenu && sidebar && sidebarOverlay) {
        hamburgerMenu.addEventListener('click', () => {
            hamburgerMenu.classList.toggle('active');
            sidebar.classList.toggle('active');
            sidebarOverlay.classList.toggle('active');
        });

        sidebarOverlay.addEventListener('click', () => {
            hamburgerMenu.classList.remove('active');
            sidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
        });
    }

    const sidebarItems = document.querySelectorAll('.sidebar-item');
    sidebarItems.forEach(item => {
        item.addEventListener('click', function(e) {
            sidebarItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');

            // モバイル表示でサイドバーアイテムクリック時にサイドバーを閉じる
            if (window.innerWidth <= 768 && hamburgerMenu && sidebar && sidebarOverlay) {
                hamburgerMenu.classList.remove('active');
                sidebar.classList.remove('active');
                sidebarOverlay.classList.remove('active');
            }
            
            // スムーズスクロール (オプション)
            const targetId = this.getAttribute('href');
            if (targetId && targetId.startsWith('#') && targetId.length > 1) {
                const targetElement = document.getElementById(targetId.substring(1));
                if (targetElement) {
                     e.preventDefault(); // スムーズスクロールのためにデフォルト動作をキャンセル
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
} 