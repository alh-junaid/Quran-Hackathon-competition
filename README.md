<div align="center">
  <img src="https://raw.githubusercontent.com/Quran-Foundation/brand-assets/main/logo.png" width="120" alt="Quran Foundation Logo">
  <h1>Quran Companion: The Habit Builder</h1>
  <p>Submission for the <b>Provision Launch Quran Hackathon ($10,000 Prize Pool)</b></p>
  
  <p>
    <a href="https://launch.provisioncapital.com/quran-hackathon">Hackathon Link</a> •
    <a href="https://api-docs.quran.foundation">Quran APIs</a>
  </p>
</div>

<br/>

## 🌟 Elevator Pitch
Millions reconnect with the Quran during Ramadan, only to lose momentum afterwards. **Quran Companion** is a highly interactive, beautifully designed web experience built to make that relationship lasting. By introducing **Daily Micro-Habits**, **Interactive Memorization (Hifz) with AI Error Correction**, and **Thematic Tadabbur Collections**, users are given practical tools to engage with the Quran every single day.

---

## 🏆 Hackathon API Integrations

This project satisfies all hackathon requirements by integrating a robust mixture of Content and User APIs from the Quran Foundation ecosystem.

### **Content APIs Used:**
- **Quran API (`/quran/surahs`, `/quran/verses`)**: Powering the immersive reading experience and thematic explorations.
- **Translation API (`/quran/translations`)**: Seamless toggling between multiple globally recognized translations.
- **Audio API (`/audio/reciters`)**: Multi-reciter audio playback (Mishary Alafasy, as-Sudais, Abdul Baset) synced with verses.

### **User APIs Used:**
- **Streak Tracking (`/goals/streak`)**: **(High Impact)** Built a "Daily Micro-Habit" challenge on the dashboard. Upon completing a daily verse reflection, the user's streak flame increments, directly addressing the "building habits" hackathon prompt.
- **Collections (`/collections`)**: Empowers users to curate personal lists of verses (e.g., "Duas of Prophets") for deeper *Tadabbur*.
- **Bookmarks (`/bookmarks`)**: Standardized tracking to resume reading precisely where left off.

---

## ✨ Key Features highlighting Innovation
1. **Interactive Hifz (Memorization) Mode**: Utilizes Web Speech API directly in the browser to listen to your recitation. Turn it on, speak a verse, and watch correctly recited words unblur gracefully. Click "Stop Auto-Check" and the system will instantly paint skipped or incorrect words in **red**.
2. **Dynamic UI/UX**: Crafted with beautiful Tailwind CSS gradients, framer-motion micro-animations, and responsive glassmorphism designed to feel premium and engaging.

---

## 🛠️ Run it locally (Cross-Platform)

This is a monorepo setup using `pnpm`. It has been thoroughly tested on macOS, Linux, and Windows.

```bash
# 1. Install dependencies
pnpm install

# 2. Run the development server (Client + API)
npm run dev
```

*Note: The API server runs on port `4000` and the React frontend on `5173`. We use `cross-env` to ensure `NODE_ENV=development` is properly injected across all Operating Systems.*
