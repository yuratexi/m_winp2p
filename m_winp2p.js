/**
 * PeerJSを使用したWindows同士のP2P通信を管理するクラス（自動接続）
 */
class WindowsP2P {
    /**
     * @param {HTMLElement} statusDiv - ステータス表示用要素
     * @param {HTMLElement} logDiv - ログ表示用要素
     */
    constructor(statusDiv, logDiv) {
        this.statusDiv = statusDiv;
        this.logDiv = logDiv;
        
        this.peer = null;
        this.conn = null;
        this.myId = null;
    }

    /**
     * ホスト側として待機（固定IDで待機）
     * @param {string} hostId - ホストとして使用するID
     */
    async startAsHost(hostId) {
        try {
            this.statusDiv.textContent = `ホストとして起動中... (ID: ${hostId})`;
            
            // Peerの作成（固定IDを指定）
            this.peer = new Peer(hostId, {
                debug: 2 // デバッグログを有効化
            });
            
            // Peerが開いたとき
            this.peer.on('open', (id) => {
                this.myId = id;
                console.log('My peer ID is: ' + id);
                this.statusDiv.textContent = `ホスト起動完了 (ID: ${id})\nクライアントからの接続を待機中...`;
            });
            
            // 接続を受信したとき
            this.peer.on('connection', (conn) => {
                console.log('Connection received from:', conn.peer);
                this.conn = conn;
                this._setupConnection();
            });
            
            // エラー処理
            this.peer.on('error', (err) => {
                console.error('Peer error:', err);
                this.statusDiv.textContent = `エラー: ${err.type} - ${err.message}`;
            });
            
        } catch (error) {
            console.error('Error starting as host:', error);
            this.statusDiv.textContent = 'ホスト起動エラー: ' + error.message;
        }
    }

    /**
     * クライアント側として接続
     * @param {string} hostId - 接続先のホストID
     */
    async connectToHost(hostId) {
        try {
            this.statusDiv.textContent = `クライアントとして起動中...`;
            
            // Peerの作成（IDは自動生成）
            this.peer = new Peer({
                debug: 2
            });
            
            // Peerが開いたとき
            this.peer.on('open', (id) => {
                this.myId = id;
                console.log('My peer ID is: ' + id);
                this.statusDiv.textContent = `クライアント起動完了 (ID: ${id})\nホスト (${hostId}) に接続中...`;
                
                // ホストに接続
                this.conn = this.peer.connect(hostId, {
                    reliable: true // 信頼性の高い接続
                });
                
                this._setupConnection();
            });
            
            // エラー処理
            this.peer.on('error', (err) => {
                console.error('Peer error:', err);
                if (err.type === 'peer-unavailable') {
                    this.statusDiv.textContent = `エラー: ホスト "${hostId}" が見つかりません。ホスト側が起動しているか確認してください。`;
                } else {
                    this.statusDiv.textContent = `エラー: ${err.type} - ${err.message}`;
                }
            });
            
        } catch (error) {
            console.error('Error connecting to host:', error);
            this.statusDiv.textContent = '接続エラー: ' + error.message;
        }
    }

    /**
     * 接続のセットアップ
     */
    _setupConnection() {
        if (!this.conn) return;
        
        this.conn.on('open', () => {
            console.log('Connection opened');
            this.statusDiv.textContent = '接続完了！通信可能です。';
        });
        
        this.conn.on('data', (data) => {
            this._onReceiveData(data);
        });
        
        this.conn.on('close', () => {
            console.log('Connection closed');
            this.statusDiv.textContent = '切断されました';
        });
        
        this.conn.on('error', (err) => {
            console.error('Connection error:', err);
            this.statusDiv.textContent = '接続エラー: ' + err;
        });
    }

    /**
     * データ受信時の処理
     * @param {string} data - 受信したデータ
     */
    _onReceiveData(data) {
        const timestamp = new Date().toLocaleTimeString();
        console.log(`[${timestamp}] Received:`, data);
        this.logDiv.innerText += `[${timestamp}] RX: ${data}\n`;
        this.logDiv.scrollTop = this.logDiv.scrollHeight;
        
        // 受信データに応じた処理を実行（main.jsで定義された関数を呼び出し）
        if (typeof onDataReceived === 'function') {
            onDataReceived(data);
        }
    }

    /**
     * 相手にメッセージを送信
     * @param {string} message - 送信する文字列
     */
    async sendMessage(message) {
        try {
            if (!this.conn || !this.conn.open) {
                throw new Error('接続されていません');
            }
            
            this.conn.send(message);
            const timestamp = new Date().toLocaleTimeString();
            console.log(`[${timestamp}] Sent:`, message);
            this.logDiv.innerText += `[${timestamp}] TX: ${message}\n`;
            this.logDiv.scrollTop = this.logDiv.scrollHeight;
        } catch (error) {
            console.error('Send error:', error);
            this.statusDiv.textContent = `送信エラー: ${error.message}`;
        }
    }

    /**
     * 接続されているか確認
     * @returns {boolean} 接続状態
     */
    isConnected() {
        return this.conn && this.conn.open;
    }

    /**
     * 接続を切断
     */
    disconnect() {
        if (this.conn) {
            this.conn.close();
        }
        if (this.peer) {
            this.peer.destroy();
        }
        console.log('Disconnected and destroyed peer.');
        this.statusDiv.textContent = '切断しました';
    }
}