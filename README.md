# 🌞 SolScan

A **React Native (Expo)** mobile app to explore **Solana wallets**.  
View SOL balance, token holdings, and recent transactions for any wallet address — powered directly by **Solana JSON-RPC** (no SDK required).

---

## ✨ Features

- 💰 View SOL balance
- 🪙 List SPL token holdings
- 📜 View recent transaction history
- 🔗 Direct links to Solscan Explorer
- 📱 Cross-platform (iOS & Android)

---

## 🛠 Tech Stack

- React Native
- Expo
- Solana JSON-RPC
- No external Solana SDK required

---

## 📦 Installation

Clone the repository:

```bash
git clone https://github.com/your-username/solscan.git
cd solscan
```

Install dependencies:

```bash
npm install
```

---

## 🚀 Running the App

### ▶ iOS

```bash
npx expo run:ios
```

### ▶ Android

```bash
npx expo run:android
```

### ▶ Development Server

```bash
npx expo start
```

---

## 📂 Project Structure

```
/components
/screens
/services
/utils
App.js
```

---

## 🔌 How It Works

The app interacts directly with Solana’s JSON-RPC endpoint to:

- Fetch wallet balance (`getBalance`)
- Fetch token accounts (`getTokenAccountsByOwner`)
- Fetch transaction signatures (`getSignaturesForAddress`)

No third-party SDK is used — all requests are handled via standard RPC calls.

---

## 🔗 Explorer Integration

Each transaction includes a direct link to:

```
https://solscan.io/account/<wallet_address>
```

---

## 📱 Screenshots

_Add screenshots here_

---

## 🧑‍💻 Author

Ayushmaan Singh  

---

## 📜 License

MIT License
