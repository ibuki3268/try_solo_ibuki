import { WebSocketServer } from 'ws';
import readline from 'readline';
import pcsclite from 'pcsclite';
import http from 'http';

const PORT = 8787;
const HTTP_PORT = 8788;

const wss = new WebSocketServer({ port: PORT });

// HTTP サーバー（テスト用 NFC シミュレーション）
const httpServer = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  if (req.url.startsWith('/nfc/send')) {
    const url = new URL(req.url, `http://localhost:${HTTP_PORT}`);
    const uid = url.searchParams.get('uid') || '04A2243F9C';
    
    console.log(`📨 HTTP リクエストから NFC 送信: ${uid}`);
    broadcastNFCEvent(uid);
    
    res.writeHead(200);
    res.end(JSON.stringify({ success: true, uid }));
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

httpServer.listen(HTTP_PORT, () => {
  console.log(`🌐 HTTP Test Server listening on http://localhost:${HTTP_PORT}`);
  console.log(`   Test: curl "http://localhost:${HTTP_PORT}/nfc/send?uid=04A2243F9C"`);
});

console.log(`NFC Bridge WebSocket Server listening on ws://localhost:${PORT}`);
console.log('Connected clients: 0');

let clientCount = 0;
let cardSimulationMode = false;

wss.on('connection', (ws) => {
  clientCount++;
  console.log(`✅ Client connected. Total clients: ${clientCount}`);
  
  ws.send(JSON.stringify({
    type: 'server',
    message: 'Connected to NFC Bridge',
    cardSimulationMode,
  }));

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log('📨 Received:', message);

      // テスト用：クライアントからカードシミュレーション開始コマンドを受け取る
      if (message.type === 'simulate-card') {
        const uid = message.uid || generateRandomUID();
        console.log(`🔖 Simulating NFC card with UID: ${uid}`);
        
        // 全クライアントにNFCイベントを送信
        broadcastNFCEvent(uid);
      }
    } catch (err) {
      console.error('❌ Failed to parse message:', err.message);
    }
  });

  ws.on('close', () => {
    clientCount--;
    console.log(`❌ Client disconnected. Total clients: ${clientCount}`);
  });

  ws.on('error', (error) => {
    console.error('⚠️ WebSocket error:', error.message);
  });
});

/**
 * 全接続中のクライアントにNFCイベントをブロードキャスト
 */
function broadcastNFCEvent(uid) {
  const nfcEvent = {
    type: 'nfc',
    uid: uid,
    timestamp: Date.now(),
  };

  wss.clients.forEach((client) => {
    if (client.readyState === 1) { // OPEN
      client.send(JSON.stringify(nfcEvent));
    }
  });

  console.log(`📢 Broadcasted NFC event to ${wss.clients.size} clients`);
}

/**
 * ランダムなUID生成（テスト用）
 */
function generateRandomUID() {
  const hex = '0123456789ABCDEF';
  let uid = '';
  for (let i = 0; i < 10; i++) {
    uid += hex[Math.floor(Math.random() * 16)];
  }
  return uid;
}

/**
 * テスト用：キーボード入力でカードをシミュレート
 */
if (process.argv.includes('--dev')) {
  console.log('\n🎮 Development mode: Press keys to simulate:');
  console.log('  [c] - Simulate NFC card');
  console.log('  [r] - Simulate NFC card with random UID');
  console.log('  [q] - Quit\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.on('line', (input) => {
    const cmd = input.toLowerCase().trim();
    
    if (cmd === 'c') {
      broadcastNFCEvent('04A2243F9C'); // デフォルトUID
    } else if (cmd === 'r') {
      broadcastNFCEvent(generateRandomUID());
    } else if (cmd === 'q') {
      console.log('Shutting down...');
      rl.close();
      process.exit(0);
    }
  });
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down NFC Bridge...');
  wss.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

/**
 * RC-300 リーダー初期化（pcsclite）
 */
function initializeRC300Reader() {
  try {
    console.log('🔍 pcsclite v1.0.1 を初期化中...');
    const pcsc = pcsclite();
    console.log('✅ pcsclite インスタンス作成完了');

    let readerDetected = false;

    pcsc.on('reader', (reader) => {
      readerDetected = true;
      console.log('🔖 RC-300 Reader detected:', reader.name);

      reader.on('error', (err) => {
        console.error('❌ Reader error:', err.message);
      });

      reader.on('status', (status) => {
        console.log(`📊 Reader status:`, {
          state: status.state.toString(16),
          hasCard: !!(status.state & reader.SCARD_STATE_PRESENT),
        });
        
        const hasCard = status.state & reader.SCARD_STATE_PRESENT;

        if (hasCard && !reader._previousCard) {
          console.log('📱 Card inserted into', reader.name);
          reader._previousCard = true;
          readNFCCard(reader);
        } else if (!hasCard && reader._previousCard) {
          console.log('📱 Card removed from', reader.name);
          reader._previousCard = false;
        }
      });

      reader.on('end', () => {
        console.log('🔌 Reader removed:', reader.name);
      });
    });

    pcsc.on('error', (err) => {
      console.error('❌ PCSC error:', err.message);
    });

    // 5秒後に リーダーが見つからなかったかログ
    setTimeout(() => {
      if (!readerDetected) {
        console.warn('⚠️ RC-300 リーダーが見つかりません');
        console.log('   → pcsc_scan で確認: sudo pcsc_scan');
      }
    }, 5000);

    console.log('✅ pcsclite リーダー監視開始');
  } catch (err) {
    console.error('❌ pcsclite 初期化エラー:', err.message);
    console.log('   Cause:', err.cause);
    console.log('   Stack:', err.stack);
  }
}

/**
 * NFC カードから UID を読み込む
 */
function readNFCCard(reader) {
  reader.transmit(Buffer.from([0xFF, 0xCA, 0x00, 0x00, 0x00]), 256, (err, data) => {
    if (err) {
      console.error('❌ Failed to read card:', err.message);
      return;
    }

    // ISO 14443 Type A UID 抽出
    const uid = data.toString('hex').slice(0, -4).toUpperCase();
    console.log(`✅ NFC UID detected: ${uid}`);
    broadcastNFCEvent(uid);
  });
}

// RC-300 リーダー初期化
initializeRC300Reader();
