// Bluetooth UUIDs for micro:bit UART service
const UART_SERVICE_UUID = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
const UART_RX_CHARACTERISTIC_UUID = "6e400002-b5a3-f393-e0a9-e50e24dcca9e";
const UART_TX_CHARACTERISTIC_UUID = "6e400003-b5a3-f393-e0a9-e50e24dcca9e";

let bluetoothDevice = null;
let rxCharacteristic = null;
let isConnected = false;
let bluetoothStatus = "Disconnected";
let sentData = ""; 

function setup() {
  console.log("Setup function called"); 
  const canvas = createCanvas(30, 30);
  canvas.parent("p5-container");

  // 1. 블루투스 UI 생성
  createBluetoothUI();

  // 2. 키패드 UI 생성
  createKeypadUI();
  
  // 3. 전송 데이터 표시창 초기화
  displaySentData();
}

/**
 * 블루투스 연결 UI 생성
 */
function createBluetoothUI() {
  console.log("Creating Bluetooth UI"); 
  const statusElement = select("#bluetoothStatus");
  if (statusElement) {
    statusElement.html(`상태: ${bluetoothStatus}`);
  }

  const buttonContainer = select("#bluetooth-control-buttons");
  if (buttonContainer) {
    const connectButton = createButton("🔗 블루투스 연결").addClass("start-button");
    connectButton.mousePressed(connectBluetooth);
    buttonContainer.child(connectButton);

    const disconnectButton = createButton("❌ 연결 해제").addClass("stop-button");
    disconnectButton.mousePressed(disconnectBluetooth);
    buttonContainer.child(disconnectButton);
  }
}

/**
 * 9개 키패드 생성 함수 (1~9)
 */
function createKeypadUI() {
  console.log("Creating Keypad UI");
  const keypadContainer = select("#keypad-container");
  
  if (keypadContainer) {
    // 1부터 9까지 버튼 생성
    for (let i = 1; i <= 9; i++) {
      let btn = createButton(String(i)); // 버튼 텍스트 1~9
      btn.addClass("keypad-btn");        // CSS 스타일 적용
      
      // 버튼 클릭 시 이벤트
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
  
  // 버튼 클릭 효과 (진동 등) - 모바일에서 지원 시
  if (navigator.vibrate) {
    navigator.vibrate(50);
  }

  // 데이터 전송
  sendBluetoothData(dataToSend);
  sentData = dataToSend;
  displaySentData();
  
  console.log(`Keypad pressed: ${number}`);
}

/**
 * 전송된 데이터를 화면에 표시
 */
function displaySentData() {
  const statusContainer = select("#status-container");
  if (statusContainer) {
    let sentDataDiv = select("#sentDataDisplay");
    if (!sentDataDiv) {
      sentDataDiv = createDiv(`📨 최근 전송 데이터: ${sentData || "-"}`).id("sentDataDisplay");
      sentDataDiv.parent(statusContainer);
    } else {
      sentDataDiv.html(`📨 최근 전송 데이터: ${sentData || "-"}`);
    }
  }
}

/**
 * 블루투스 연결
 */
async function connectBluetooth() {
  try {
    bluetoothDevice = await navigator.bluetooth.requestDevice({
      filters: [{ namePrefix: "ESP" }, { namePrefix: "BBC" }],
      optionalServices: [UART_SERVICE_UUID],
    });

    const server = await bluetoothDevice.gatt.connect();
    const service = await server.getPrimaryService(UART_SERVICE_UUID);
    rxCharacteristic = await service.getCharacteristic(UART_RX_CHARACTERISTIC_UUID);

    isConnected = true;
    bluetoothStatus = `Connected to ${bluetoothDevice.name}`;
  } catch (error) {
    console.error("Bluetooth connection failed:", error);
    bluetoothStatus = "Connection Failed";
  }
  updateBluetoothStatus();
}

/**
 * 블루투스 연결 해제
 */
function disconnectBluetooth() {
  if (bluetoothDevice && bluetoothDevice.gatt.connected) {
    bluetoothDevice.gatt.disconnect();
    isConnected = false;
    bluetoothStatus = "Disconnected";
    rxCharacteristic = null;
    bluetoothDevice = null;
  } else {
    bluetoothStatus = "Already Disconnected";
  }
  updateBluetoothStatus();
}

/**
 * 블루투스 상태 업데이트
 */
function updateBluetoothStatus() {
  const statusElement = select("#bluetoothStatus");
  if (statusElement) {
    statusElement.html(`상태: ${bluetoothStatus}`);
    if (bluetoothStatus.includes("Connected")) {
      statusElement.style("background-color", "#d0f0fd");
      statusElement.style("color", "#FE818D");
    } else {
      statusElement.style("background-color", "#f9f9f9");
      statusElement.style("color", "#FE818D");
    }
  }
}

/**
 * 데이터 전송 함수 (라인 엔딩 제거됨)
 */
async function sendBluetoothData(data) {
  if (!rxCharacteristic || !isConnected) {
    console.error("Cannot send data: Device not connected.");
    alert("블루투스가 연결되지 않았습니다. 먼저 연결해주세요!");
    return;
  }

  try {
    const encoder = new TextEncoder();
    
    // [수정됨] 개행 문자(\n) 없이 순수 데이터만 인코딩하여 전송
    const encodedData = encoder.encode(data); 
    
    await rxCharacteristic.writeValue(encodedData);
    console.log("Sent:", data);
  } catch (error) {
    console.error("Error sending data:", error);
    alert("데이터 전송 실패");
  }
}

function draw() {
  // 사용하지 않지만 p5.js 구조상 남겨둠
}

console.log("Script loaded and running");