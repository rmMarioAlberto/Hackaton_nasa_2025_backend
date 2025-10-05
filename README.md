# 🌌 ExoAI: Intelligent Exoplanet Detection Platform

> Democratizing space discovery through machine learning, education, and open data.

---

## 📖 Table of Contents
- [About](#about)
- [How It Works](#how-it-works)
- [Features & Benefits](#features--benefits)
- [Intended Impact](#intended-impact)
- [Technology Stack](#technology-stack)
- [Creative Highlights](#creative-highlights)
- [Scientific & Ethical Considerations](#scientific--ethical-considerations)
- [Contributors](#contributors)
- [License](#license)

---

## 🧠 About

**ExoAI** is an intelligent exoplanet detection platform that merges **machine learning** with **accessible education**, making space discovery open to everyone.  
It empowers users—from researchers to students—to analyze astronomical data, predict exoplanet candidates, and learn about space science through an integrated AI chatbot.

Our model is trained using **NASA’s official exoplanet archive**, which contains **~4,000 confirmed exoplanets** and over **230 parameters per object**, stored efficiently in **MongoDB**.

> “Exoplanet discovery shouldn’t be limited to those with supercomputers.”

---

## 🚀 How It Works

ExoAI operates as a **three-tier system** combining prediction, validation, and education:

### 🧩 1. Algorithm (Python)
- Uses NASA’s dataset of confirmed exoplanets and candidates.  
- Calculates two average sets across 9 key parameters for confirmed and candidate objects.  
- Applies a **Gaussian bell curve** to classify new data uploads as:
  - **Confirmed Exoplanet**
  - **Candidate**
  - **None**

### 💻 2. Web Interface (React + Node.js)
- Users upload **CSV files** with astronomical data.  
- Built-in **field validation** ensures required columns are present and correctly formatted.  
- Node.js backend handles communication between the frontend, MongoDB, and the Python model.  
- The system returns a **prediction** indicating exoplanet likelihood.

### 🤖 3. Educational Chatbot (LLM Integration)
- An AI chatbot specialized in **exoplanets and astronomy concepts**.  
- Explains prediction results, detection methods, and planetary science in plain language.  
- Acts as an educational companion for learners, educators, and enthusiasts.

---

## ✨ Features & Benefits

### 🔭 Core Features
- CSV upload and validation system  
- Machine learning model trained on NASA’s real data  
- Exoplanet classification (candidate, confirmed, none)  
- Conversational AI chatbot for educational engagement  
- MongoDB-backed data management  

### 🌍 Benefits
- **Democratized Discovery**: Enables anyone to contribute to exoplanet research  
- **Accelerated Analysis**: Automates initial screening of new exoplanet candidates  
- **Educational Impact**: Explains complex astronomy concepts accessibly  
- **Data Validation**: Ensures data integrity and teaches correct formatting  
- **Scalability**: Efficiently handles NASA’s growing datasets  

---

## 🌠 Intended Impact

ExoAI expands the exoplanet research community **beyond academia** by making tools for discovery accessible to everyone.

| Audience | How They Benefit |
|-----------|------------------|
| **Amateur Astronomers** | Validate their observations |
| **Students & Educators** | Engage directly with real space data |
| **Researchers** | Crowdsource preliminary screening |
| **Public** | Build scientific literacy and curiosity |

With missions like **TESS** observing over **200,000 stars**, ExoAI accelerates the path toward discovering new Earth-like worlds.

---

## 🧰 Technology Stack

| Layer | Technologies |
|-------|---------------|
| **Backend** | Node.js + Express |
| **Frontend** | React.js |
| **Database** | MongoDB |
| **AI/ML** | Python (data preprocessing, Gaussian analysis, CSV parsing) |
| **Chatbot** | LLM API integration |
| **Data Source** | NASA Exoplanet Archive (~4,000 confirmed planets, 230+ parameters) |

---

## 🎨 Creative Highlights

1. **Dual Audience Design** — Serves both researchers and learners.  
2. **Conversational Science** — AI explains complex astronomical results in human language.  
3. **Real NASA Data** — Trained with authentic exoplanet discoveries.  
4. **Validation-First Interface** — Upload flow doubles as a teaching tool.  
5. **Python ↔ JavaScript Bridge** — Seamless integration between ML and web ecosystems.  

---

## 🧮 Scientific & Ethical Considerations

- **Scientific Accuracy**: Uses authentic NASA datasets and parameters.  
- **User Experience**: Balances research-grade precision with public accessibility.  
- **Scalability**: Designed to expand as new data arrives from missions like TESS and Kepler.  
- **Educational Value**: Every interaction teaches users about real exoplanet science.  
- **Ethical AI**: Chatbot restricted to exoplanet topics to ensure factual accuracy.  
- **Performance**: Optimized for fast predictions without compromising reliability.  
- **Open Science**: Aligns with NASA’s open-data mission by making discovery participatory.

---

## 👥 Contributors

Developed during the **NASA Space Apps Challenge** by Team **[EXO-BREN]**  
- [Beto]  
- [Angel]  
- [Irving]  
- [Moises]  
- [Felipe]


<p align="center">
  <img src="assets/banner.png" width="500" alt="ExoAI Banner">
</p>

<p align="center">
  <b>“Exploring worlds beyond — one dataset at a time.”</b>
</p>
