# Crossroads — AI Life Decision Simulator

A decision-analysis tool that helps users think through major life choices by simulating each option's trajectory, surfacing cognitive biases, and revealing hidden trade-offs.

## How it works

1. You describe your decision — options, timeline, fears, values, finances
2. Crossroads analyzes each option independently, detecting what kind of move it is (starting, staying, quitting, exploring, balancing, relocating)
3. For each option, you get a 30/60/90-day narrative, biggest risk, hidden costs, what you'd give up, and a confidence score
4. A 7-day action plan helps you move from thinking to doing

## Architecture

- **Next.js 16** app with React 19
- **Google Gemini API** (3 models: 3.1 Flash Lite, 2.5 Flash, 3.5 Flash) — primary AI engine
- **NVIDIA Nemotron API** — fallback model
- **Self-contained mock engine** — runs fully on-device when APIs are unavailable, using action-type detection to generate unique narratives for any decision

The mock engine has zero pre-defined categories. It reads the verb of each option to determine action type and generates all content from the option text itself.

## Getting started

```bash
npm install
npm run dev
```

Optional: add API keys to `.env.local` for real AI analysis:
```
GEMINI_API_KEY=your_key
NVIDIA_API_KEY=your_key
```

Without keys, the mock engine runs automatically.

## Tests

```bash
npm test
```

## Built for

Crossroads Hackathon — helping people make better decisions by showing them what they can't see.
