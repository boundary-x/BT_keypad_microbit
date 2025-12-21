/**
 * sketch.js
 * Boundary X Bluetooth Keypad Logic (Micro:bit Compatible)
 */

// Bluetooth UUIDs for micro:bit UART service
const UART_SERVICE_UUID = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
const UART_RX_CHARACTERISTIC_UUID = "6e400002-b5a3-f393-e0a9-e50e24dcca9e"; // Data to Micro:bit
const UART_TX_CHARACTERISTIC_UUID = "6e400003-b5a3-f393-e0a9-e50e24dcca9e"; // Data from Micro:bit

let bluetoothDevice = null;
let rxCharacteristic = null;
let isConnected = false;
let bluetoothStatus = "연결 대기 중";
let sentData = ""; 

function setup() {
  noCanvas();

  // 1. UI 생성 (Black & White Theme)
  createBluetoothUI();
  createKeypadUI();
  displaySentData();
}

/**
 * 블루투스 연결 UI 생성
 */
function createBluetoothUI() {
  const statusElement = select("#bluetoothStatus");
  if (statusElement) {
    statusElement.html(`상태: ${bluetoothStatus}`);
  }

  const buttonContainer = select("#bluetooth-control-buttons");
  if (buttonContainer) {
    // 디자인 시스템 클래스 적용 (.start-button -> Black Pill)
    const connectButton = createButton("기기 연결").addClass("start-button");
    connectButton.mousePressed(connectBluetooth);
    buttonContainer.child(connectButton);

    const disconnectButton = createButton("연결 해제").addClass("stop-button");
    disconnectButton.mousePressed(disconnectBluetooth);
    buttonContainer.child(disconnectButton);
  }
}

/**
 * 9개 키패드 생성 함수 (1~9)
 */
function createKeypadUI() {
  const keypadContainer = select("#keypad-container");
  
  if (keypadContainer) {
    for (let i = 1; i <= 9; i++) {
      let btn = createButton(String(i)); 
      btn.addClass("keypad-btn"); // style.css의 새 스타일 적용
      
      btn.mousePressed(() => {
        handleKeypadPress(i);
      });
      
      keypadContainer.child(btn);
    }
  }
}

/**
 * 키패드 클릭 처리
 */
function handleKeypadPress(number) {
  const dataToSend = String(number);
  
  if (navigator.vibrate) {
    navigator.vibrate(30); // 햅틱 피드백
  }

  sendBluetoothData(dataToSend);
  sentData = dataToSend;
  displaySentData();
}

/**
 * 전송된 데이터를 화면에 표시
 */
function displaySentData() {
  const statusContainer = select("#status-container");
  if (statusContainer) {
    let sentDataDiv = select("#sentDataDisplay");
    if (!sentDataDiv) {
      sentDataDiv = createDiv(`최근 전송 데이터: ${sentData || "-"}`).id("sentDataDisplay");
      sentDataDiv.parent(statusContainer);
    } else {
      sentDataDiv.html(`최근 전송 데이터: ${sentData || "-"}`);
    }
  }
}

/**
 * UI 상태 업데이트 (색상 변경)
 */
function updateBluetoothStatusUI(type) {
  const el = select("#bluetoothStatus");
  if (el) {
    // 기존 클래스 제거
    el.removeClass("status-connected");
    el.removeClass("status-error");
    
    el.html(`상태: ${bluetoothStatus}`);

    // 상태별 색상 적용
    if (type === 'connected') {
      el.addClass("status-connected");
    } else if (type === 'error') {
      el.addClass("status-error");
    }
  }
}

/**
 * 블루투스 연결
 */
async function connectBluetooth() {
  try {
    bluetoothDevice = await navigator.bluetooth.requestDevice({
      filters: [{ namePrefix: "BBC micro:bit" }],
      optionalServices: [UART_SERVICE_UUID],
    });

    const server = await bluetoothDevice.gatt.connect();
    const service = await server.getPrimaryService(UART_SERVICE_UUID);
    rxCharacteristic = await service.getCharacteristic(UART_RX_CHARACTERISTIC_UUID);

    isConnected = true;
    bluetoothStatus = `${bluetoothDevice.name} 연결됨`;
    updateBluetoothStatusUI('connected'); // 녹색
  } catch (error) {
    console.error("Bluetooth connection failed:", error);
    bluetoothStatus = "연결 실패 (다시 시도해주세요)";
    updateBluetoothStatusUI('error'); // 빨강
  }
}

/**
 * 블루투스 연결 해제
 */
function disconnectBluetooth() {
  if (bluetoothDevice && bluetoothDevice.gatt.connected) {
    bluetoothDevice.gatt.disconnect();
  }
  isConnected = false;
  bluetoothDevice = null;
  rxCharacteristic = null;
  
  bluetoothStatus = "연결 해제됨";
  updateBluetoothStatusUI('default'); // 회색
}

/**
 * 데이터 전송 함수 (마이크로비트 호환성 수정)
 */
async function sendBluetoothData(data) {
  if (!rxCharacteristic || !isConnected) {
    alert("블루투스가 연결되지 않았습니다.");
    return;
  }

  try {
    const encoder = new TextEncoder();
    
    // [중요 수정] 마이크로비트는 줄바꿈문자(\n)를 받아야 명령 종료로 인식하는 경우가 많음
    const dataWithDelimiter = `${data}\n`;
    
    const encodedData = encoder.encode(dataWithDelimiter); 
    await rxCharacteristic.writeValue(encodedData);
    console.log("Sent:", dataWithDelimiter);
  } catch (error) {
    console.error("Error sending data:", error);
    // alert("전송 실패"); // 사용자 경험을 위해 alert는 생략 가능
  }
}
