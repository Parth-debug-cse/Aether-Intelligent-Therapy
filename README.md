<div align="center">
  <h1>🧠 Aether</h1>
  <p><strong>A Privacy-First, Edge AI Therapy Platform Integrating Cognitive Behavioral Therapy (CBT)</strong></p>
  <p>
    An intelligent, self-hosted web application that leverages local Large Language Models (LLMs) to provide real-time CBT analysis, secure journaling, and actionable mental health insights without compromising user privacy. Built with a modern, decoupled architecture.
  </p>
  <p>
    <a href="#core-architectural-features">Architecture</a> •
    <a href="#technical-stack--patterns">Tech Stack</a> •
    <a href="#clinical-ai-system-design">Clinical AI</a> •
    <a href="#installation--setup">Setup</a>
  </p>
</div>

---

## 🚀 Core Architectural Features

Aether is designed as a secure, local-first application, tackling the unique engineering challenges of integrating non-deterministic AI models into structured, privacy-critical health environments.

### 🔒 Zero-Trust Privacy & Edge Processing
Mental health data is highly sensitive. Aether runs entirely on your local machine using [Ollama](https://ollama.com/), ensuring that deeply personal journal entries and chat sessions **never** leave your local environment. Data exfiltration risks are eliminated by design through air-gapped LLM execution.
- No third-party LLM APIs (e.g., OpenAI, Anthropic).
- No telemetry or data harvesting.

### 🧠 Real-Time CBT Integration & Structured Data Extraction
Aether actively analyzes user input during sessions to identify common cognitive distortions (e.g., catastrophizing, all-or-nothing thinking, emotional reasoning).
- **Distortion Detection:** Demonstrates the ability to coerce LLMs into extracting structured metadata from unstructured emotional text via rigorous prompt engineering.
- **Confidence Scoring:** Algorithmic verification of AI confidence for each identified distortion pattern.
- **Reframing Generation:** Dynamic synthesis of healthier, alternative perspectives based on established Cognitive Behavioral Therapy methodologies.

### 🛡️ Automated Crisis Interception System
Implements robust safety guardrails that continuously scan user input against a comprehensive set of crisis keywords (focused on self-harm or severe distress). If a trigger is detected, the system intercepts standard LLM processing to immediately surface clinical emergency resources (e.g., 988 lifeline), demonstrating ethical AI safety patterns.

### 📊 Longitudinal Clinical Analytics
Post-session data is aggregated and modeled to provide quantifiable longitudinal insights:
- **Sentiment Arcs:** Calculates and visualizes dynamic "Mood Arcs" across a single session using aggregated sentiment scoring.
- **Pattern Analytics:** Tracks the frequency of specific cognitive distortions over time, allowing users to identify persistent negative thought patterns.
- **Actionable AI Synthesis:** The LLM synthesizes the entire session state to recommend specific, tailored psychological exercises (e.g., exposure tasks, thought records) for the week ahead.

---

## 🛠️ Technical Stack & Patterns

Aether is built using a modern decoupled client-server architecture, highlighting full-stack proficiency.

### Backend (Python / FastAPI)
- **Framework:** `FastAPI` — utilized for its asynchronous capabilities, Pydantic data validation, and high-performance routing.
- **LLM Integration Layer:** Custom Python wrappers for `Ollama` (defaulting to the `llama3` instruct model). This demonstrates advanced **prompt engineering** and structural enforcement (JSON schema adherence) to tame generative models for predictable application logic.
- **Database Architecture:** `SQLite` — local, lightweight relational data storage managing users, persistent session transcripts, and analytical metadata.
- **Security & Auth:** `PyJWT` for robust stateless token-based authentication and `bcrypt` for secure password hashing.

### Frontend (React / Vite)
- **Framework:** `React` (v18+) compiled with `Vite` for rapid Hot Module Replacement (HMR) and highly optimized production builds.
- **State Management:** Implementation of the React Context API for managing global authentication state and protected route authorization.
- **Data Visualization:** `Recharts` for rendering complex, responsive time-series mood data and pattern analytics locally.
- **Network Interface:** `Axios` configured with automated JWT interceptors for secure, stateful API communication and global error handling.

---

## ⚙️ Installation & Setup

### Prerequisites

- **Python:** `v3.10` or higher
- **Node.js:** `v24 LTS` recommended
- **Local AI Engine:** [Ollama](https://ollama.com/) must be installed and running locally. You must pull the base model before starting the backend:
  ```bash
  ollama run llama3
  ```

### 1. Repository Setup

```bash
git clone https://github.com/yourusername/aether-intelligent-therapy.git
cd aether-intelligent-therapy
```

### 2. Backend Initialization (FastAPI)

```bash
cd server

# Initialize a virtual environment
python -m venv venv

# Activate the environment
# Windows: venv\Scripts\activate
# Unix/macOS:
source venv/bin/activate

# Install strictly typed dependencies
pip install -r requirements.txt

# Boot the ASGI server using Uvicorn
uvicorn main:app --reload --port 8000
```
*The API will be available at `http://localhost:8000`. The necessary SQLite schema (`aether.db`) is automatically migrated on startup.*

### 3. Frontend Initialization (React / Vite)

In a separate terminal window:

```bash
cd client

# Install Node modules
npm install

# Start the Vite development server
npm run dev
```
*The frontend client automatically proxies `/api` requests to port `8000`. Access the application at the URL provided by Vite (typically `http://localhost:5173` or `5174`).*

---

## 🧬 Clinical AI System Design

Aether's core intelligence relies on heavily constrained system prompts designed to mitigate AI hallucination and enforce structural output. The LLM is programmatically instructed to:
1. Act exclusively as an empathetic, Socratic facilitator rather than conversational filler.
2. Intercept and categorically refuse any requests for medical diagnosis or prescription advice.
3. Output critical analysis (distortions, scores, reframes) in highly rigid JSON structures, enabling the backend to safely parse and the frontend to reliably render intelligent data-driven components.

---

## ⚖️ Clinical Disclaimer

Aether is an experimental, open-source technical proof-of-concept demonstrating the integration of edge LLMs with psychological frameworks. **It is strictly not a replacement for a licensed therapist, clinical psychologist, or psychiatric professional.** The system may occasionally produce inaccurate analyses. If you are experiencing a mental health emergency, please seek immediate professional clinical help.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
