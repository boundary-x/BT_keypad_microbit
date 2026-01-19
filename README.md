# 📱 Boundary X - Bluetooth Keypad

**Boundary X Bluetooth Keypad** is a web-based remote controller application. It allows users to send numeric commands (1 to 12) to external hardware, such as the **BBC Micro:bit**, using the **Web Bluetooth API (BLE)**.

This project is designed to be a simple, responsive input device for educational robots, IoT projects, or prototyping without the need for complex app development.

![Project Status](https://img.shields.io/badge/Status-Active-success)
![Platform](https://img.shields.io/badge/Platform-Web-blue)
![Tech](https://img.shields.io/badge/Stack-p5.js%20%7C%20Web%20Bluetooth-yellow)

## ✨ Key Features

### 1. 🎮 Numeric Keypad Controller
- Provides a grid of **12 buttons (1 ~ 12)**.
- **Visual Feedback:** Displays the data currently being transmitted on a "Sent Data" screen for easy debugging.
- **Responsive Layout:** The keypad grid automatically adjusts its size and spacing for mobile phones, tablets, and desktop screens.

### 2. 🔗 Wireless Connectivity (BLE)
- Connects directly to BLE-enabled devices using the **Nordic UART Service**.
- **No Installation Required:** Runs entirely in the web browser (Chrome, Edge, Bluefy, etc.).
- **Status Indication:** Visual cues for connection status (Connected = Green, Error = Red).

### 3. 🎨 Modern UI/UX
- Designed with the "Modern Mono Tech" theme (Black & White).
- Features a sticky header and optimized touch targets for mobile usage.

---

## 📡 Communication Protocol

When a button is pressed, the app sends the corresponding number as a **string**, followed by a newline character (`\n`).

**Service UUID:** `6e400001-b5a3-f393-e0a9-e50e24dcca9e`  
**TX Characteristic:** `6e400002-...`  
**RX Characteristic:** `6e400003-...`

### Data Format

| Button Pressed | Sent Data (String) |
| :---: | :--- |
| **1** | `"1\n"` |
| **2** | `"2\n"` |
| ... | ... |
| **12** | `"12\n"` |

> **Note:** The newline character (`\n`) is essential for many microcontrollers (like Micro:bit) to detect the end of a message.

---

## 🛠 Tech Stack

* **Frontend:** HTML5, CSS3 (Pretendard Font)
* **Logic:** JavaScript (ES6+)
* **Library:** [p5.js](https://p5js.org/) (DOM manipulation)
* **Connectivity:** Web Bluetooth API

---

## 🚀 How to Use

### 1. Run the Application
This is a static web application. Open `index.html` in a supported browser.
* **Requirement:** The site must be served over **HTTPS** or **localhost** to access the Bluetooth API.

### 2. Hardware Preparation (Micro:bit)
To receive data, upload code to your Micro:bit that enables the **Bluetooth UART Service**.

1.  Go to [MakeCode](https://makecode.microbit.org/).
2.  Add the `Bluetooth` extension.
3.  Add the `bluetooth uart service` block to the `on start` block.
4.  **Parsing Logic Example (JavaScript/Blocks):**

    ```javascript
    bluetooth.onUartDataReceived(serial.delimiters(Delimiters.NewLine), function () {
        // Read data until newline
        let command = bluetooth.uartReadUntil(serial.delimiters(Delimiters.NewLine));
        
        if (command == "1") {
            // Action for button 1
            basic.showNumber(1);
        } else if (command == "12") {
            // Action for button 12
            basic.showIcon(IconNames.Happy);
        }
    })
    ```
---

## 📝 License

**Copyright © 2024 Boundary X Co. All rights reserved.**

All rights to the source code and design of this project belong to **Boundary X**.

* **Web:** [boundaryx.io](https://boundaryx.io)
* **Contact:** [https://boundaryx.io/contact](https://boundaryx.io/contact)
