# 🚦 Intelligent Traffic Congestion Prediction & Route Optimization

## 📌 Overview

This project is a **full-stack intelligent traffic prediction platform** that leverages Machine Learning and Deep Learning techniques to predict congestion and optimize routes in real-time.

It integrates live traffic data and advanced algorithms to improve Estimated Time of Arrival (ETA) and support smart transportation systems.

---

## 🚀 Key Highlights

* 🌐 Developed a **full-stack application** using React.js, Node.js, and Python
* 📡 Integrated **real-time traffic data using TomTom API**
* 🤖 Built ensemble ML models (**Random Forest, XGBoost**) achieving **R² = 0.97**
* ⏱️ Improved ETA prediction accuracy by **15–20% over baseline models**
* 🧠 Implemented **LSTM (Long Short-Term Memory)** for time-series forecasting
* 🛣️ Applied **Dijkstra’s Algorithm & A* Algorithm** for multi-objective route optimization
* 📊 Processed and analyzed **800,000+ traffic records**

---

## 🛠️ Technologies Used

### 💻 Frontend

* React.js
* Leaflet.js (for interactive maps)

### ⚙️ Backend

* Node.js
* Express.js

### 🧠 Machine Learning / Data Science

* Python
* Pandas, NumPy
* Scikit-learn
* XGBoost
* TensorFlow / Keras (for LSTM)

### 🌐 APIs

* TomTom Traffic API

---

## 📂 Project Structure

```id="a1b2c3"
traffic-congestion-prediction/
│── frontend/            # React application
│── backend/             # Node.js APIs
│── ml-models/           # ML & DL models
│── data/                # Dataset files
│── notebooks/           # Jupyter notebooks
│── README.md
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone Repository

```bash id="c1"
git clone https://github.com/SUMITSINGH25135/traffic-congestion-prediction.git
cd traffic-congestion-prediction
```

### 2️⃣ Backend Setup

```bash id="c2"
cd backend
npm install
npm start
```

### 3️⃣ Frontend Setup

```bash id="c3"
cd frontend
npm install
npm start
```

### 4️⃣ ML Model Setup

```bash id="c4"
pip install -r requirements.txt
python train_model.py
```

---

## 📊 How It Works

1. Collect real-time traffic data via TomTom API
2. Preprocess and clean large-scale traffic dataset
3. Train ML models for congestion prediction
4. Use LSTM for temporal pattern forecasting
5. Apply graph algorithms for optimal route selection
6. Display results on interactive maps using Leaflet

---

## 📈 Model Performance

* **R² Score:** 0.97
* **ETA Accuracy Improvement:** 15–20%
* **Dataset Size:** 800,000+ records

---

## 🧠 Algorithms Used

* Random Forest
* XGBoost
* LSTM (Deep Learning)
* Dijkstra’s Algorithm
* A* (A-Star) Algorithm

---

## 🎯 Future Enhancements

* Real-time deployment on cloud (AWS/GCP)
* Mobile application integration
* Reinforcement learning for adaptive routing
* Weather + event-based traffic prediction

---

## 🤝 Contributing

Contributions are welcome! Feel free to fork the repository and submit a pull request.

---

## 📜 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Sumit Singh**

---

## ⭐ Support

If you found this project useful, please give it a ⭐ on GitHub!
