#!/bin/bash
# RC-300 NFC Bridge Server 起動スクリプト
export HOME=/home/ibuki
export PATH=/home/ibuki/.nvm/versions/node/v24.11.0/bin:$PATH
cd /home/ibuki/try_solo_ibuki/tools/nfc-bridge
npm start
