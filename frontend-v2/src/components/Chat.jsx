import { useState } from "react";
import axios from "axios";

export default function Chat() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const sendPrompt = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setResponse(null);

    try {
      const backendURL = import.meta.env.VITE_API_URL;

      const res = await axios.post(backendURL, { prompt });

      const parsed = JSON.parse(res.data.body);

      setResponse(parsed);
    } catch (err) {
      console.error(err);
      setResponse({ error: "Something went wrong." });
    }

    setLoading(false);
  };

  return (
    <div className="chat-box">
      <textarea
        className="input-box"
        placeholder="Ask Carbonsight anything..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />

      <button className="send-btn" onClick={sendPrompt} disabled={loading}>
        {loading ? "Thinking..." : "Send"}
      </button>

      {response && (
        <div className="response-box">
          <h3>Model Response</h3>
          <p>{response.response}</p>

          <h4>Model Used: {response.modelUsed}</h4>

          {response.cached && <p className="cached-text">🟢 Served from Cache</p>}
        </div>
      )}
    </div>
  );
}

