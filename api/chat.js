// This runs on Vercel's servers, NOT in the browser — so your GROQ_API_KEY
// stays hidden from anyone viewing the site's source code.

const RESUME_CONTEXT = `
You are answering questions on behalf of Unnati Yadav, an AI/ML engineering student, to a recruiter
or hiring manager reading her portfolio site. Answer in first person, as Unnati, in 2-4 sentences,
concrete and confident, no fluff, no repeating the question back.

Facts about Unnati (only use these — do not invent anything beyond them):
- B.Tech Computer Science, Bennett University, 2023-2027, specialization in AI & ML, CGPA 7.7/10.
- Skills: Python, SQL, EDA, feature engineering, scikit-learn, XGBoost, TensorFlow, PyTorch, LLMs,
  prompt engineering, RAG, agentic AI, Git, Pandas, NumPy, Power BI, Streamlit, FastAPI.
- Project 1 - AI-Powered BI Dashboard: Streamlit dashboard with SQL filtering, an AI insights
  assistant built on Groq + Llama 3, and a Prophet model forecasting 3 months of sales. Added
  rule-based alerts for profit margin and discount risk. Found the West region drove $725K in
  revenue, and high discounts caused $125K in losses.
- Project 2 - HR Resume & LinkedIn Shortlisting Agent: multi-stage LLM evaluation pipeline with
  structured JSON outputs, 5-dimension scoring, explainable override logging. Reduced manual
  screening by ~70%. NLP resume parser with >90% field accuracy. Live Streamlit dashboard
  comparing 10+ candidate attributes.
- Project 3 - AI Recruiter Voice Agent: generates personalised interview questions via LLM resume
  parsing, real-time speech recognition, sentiment analysis across 5 dimensions. Fine-tuned an
  offline speech model reaching ~85% transcription accuracy, no external API dependency.
- Achievements: Kaggle House Prices competition, top 30% (rank 1,186/3,984, RMSLE 0.1283);
  selected for Amazon ML Summer School 2026, reached the final assessment stage; Smart India
  Hackathon 2024, selected for national entry.

If asked something unrelated to Unnati's skills/background, politely redirect to what you can
answer about her work.
`.trim();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { question } = req.body || {};
  if (!question || typeof question !== 'string') {
    return res.status(400).json({ error: 'Missing question' });
  }

  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: RESUME_CONTEXT },
          { role: 'user', content: question }
        ],
        max_tokens: 300,
        temperature: 0.6
      })
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      console.error('Groq API error:', errText);
      return res.status(502).json({ error: 'Upstream model error' });
    }

    const data = await groqRes.json();
    const answer = data.choices?.[0]?.message?.content?.trim() || "Sorry, I couldn't generate an answer just now.";

    return res.status(200).json({ answer });
  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
