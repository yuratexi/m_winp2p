// ========================================
// 設定（ここを編集してください）
// ========================================

// ホストID（ホスト側で使用する固定ID）
const HOST_ID = 'myhost123';

// 接続先ホストID（クライアント側で使用）
const CONNECT_TO_HOST_ID = 'myhost123';


// ========================================
// 受信データ判定処理（ここをカスタマイズしてください）
// ========================================

/**
 * データを受信したときに呼ばれる関数
 * ここで受信データに応じた処理を記述します
 * @param {string} data - 受信したデータ
 */
function onDataReceived(data) {
    // 受信データを判定して処理を分岐
    switch(data) {
        case 'LED_ON':
            console.log('LED ONコマンドを受信');
            // ここにLED ONの処理を記述
            alert('LED ONコマンドを受信しました');
            break;
            
        case 'LED_OFF':
            console.log('LED OFFコマンドを受信');
            // ここにLED OFFの処理を記述
            alert('LED OFFコマンドを受信しました');
            break;
            
        case 'PING':
            console.log('PINGを受信、PONGを返信');
            p2p.sendMessage('PONG');
            break;
            
        case 'START':
            console.log('START命令を受信');
            // ここに開始処理を記述
            break;
            
        case 'STOP':
            console.log('STOP命令を受信');
            // ここに停止処理を記述
            break;
            
        default:
            // 定義されていないコマンドの場合
            console.log(`未定義のコマンド: ${data}`);
            // 必要に応じて処理を追加
            break;
    }
}


// ========================================
// 使用例とUI制御
// ========================================

// DOM要素の取得
const statusDiv = document.getElementById('status');
const messageLog = document.getElementById('log');

// WindowsP2Pクラスのインスタンスを作成
let p2p = new WindowsP2P(statusDiv, messageLog);

/**
 * ホストとして起動
 */
function startHost() {
    p2p = new WindowsP2P(statusDiv, messageLog);
    p2p.startAsHost(HOST_ID);
}

/**
 * クライアントとして接続
 */
function connectClient() {
    p2p = new WindowsP2P(statusDiv, messageLog);
    p2p.connectToHost(CONNECT_TO_HOST_ID);
}

/**
 * メッセージを送信
 */
function sendMsg() {
    const msg = document.getElementById('msg').value;
    if (msg) {
        p2p.sendMessage(msg);
        document.getElementById('msg').value = '';
    }
}

/**
 * 切断
 */
function disconnect() {
    p2p.disconnect();
}

/**
 * Enterキーで送信
 */
document.addEventListener('DOMContentLoaded', () => {
    const msgInput = document.getElementById('msg');
    if (msgInput) {
        msgInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMsg();
            }
        });
    }
});

// ========================================
// 使い方
// ========================================
/*
 * 【準備】
 * 1. このファイルの先頭にある HOST_ID と CONNECT_TO_HOST_ID を設定
 *    - 同じプロジェクトで使う場合は両方同じ値にする
 *    - 例: const HOST_ID = 'project2026';
 * 
 * 【ホスト側（PC1）】
 * 2. 「ホスト起動」ボタンをクリック
 * 3. 待機状態になる
 * 
 * 【クライアント側（PC2）】
 * 4. 「接続」ボタンをクリック
 * 5. 自動的に接続完了！
 * 
 * あとは両方のPCでメッセージ欄に入力して送信するだけ。
 * 
 * 【受信データの判定処理】
 * - onDataReceived() 関数で受信データに応じた処理を記述できます
 * - 例: 'LED_ON' を受信したら LED を点灯する処理を実行
 * - switch文で新しいコマンドを追加することができます
 * 
 * 【コマンド例】
 * - LED_ON   : LED点灯コマンド
 * - LED_OFF  : LED消灯コマンド
 * - PING     : 応答確認（自動的にPONGを返信）
 * - START    : 開始命令
 * - STOP     : 停止命令
 * 
 * 注意:
 * - ホストIDは英数字で固定のものを使うと便利（例: project123）
 * - 同じホストIDを複数で同時使用しないこと
 * - インターネット経由で接続可能（PeerJSのクラウドサーバー経由）
 */