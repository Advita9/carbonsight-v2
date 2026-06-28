export const mockUserStats = {
  efficiency_score: 78,
  carbon_trend: [0.13, 0.11, 0.10, 0.08, 0.07, 0.06, 0.05],
  model_usage: {
    "amazon.nova-micro-v1:0": 32,
    "amazon.nova-lite-v1:0": 15,
    "amazon.nova-pro-v1:0": 4
  },
  badges: ["Efficient Prompting Lv1", "Carbon Saver Lv2"],
  history: [
    {
      prompt: "Explain quantum computers",
      used: 0.0041,
      saved: 0.0013,
      model: "nova-micro"
    },
    {
      prompt: "Generate SQL for analytics",
      used: 0.0029,
      saved: 0.0009,
      model: "nova-micro"
    }
  ]
};
