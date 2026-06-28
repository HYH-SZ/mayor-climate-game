module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return response.status(500).json({
      ok: false,
      error: "DeepSeek environment variable is not configured"
    });
  }

  try {
    const result = request.body || {};
    const metrics = result.metrics || {};
    const layout = Array.isArray(result.layout) ? result.layout : [];
    const survey = result.survey || {};

    const userSummary = [
      `Score: ${result.score ?? "unknown"}`,
      `Budget used: ${result.budgetUsed ?? "unknown"} 万元`,
      `Average temperature: ${metrics.temp ?? "unknown"} °C`,
      `Average wind speed: ${metrics.wind ?? "unknown"} m/s`,
      `Carbon emissions: ${metrics.carbon ?? "unknown"} t`,
      `Facility count: ${layout.length}`,
      `Survey budget choice: ${survey.budgetChoice ?? "unknown"}`,
      `Survey wind understanding: ${survey.windUnderstanding ?? "unknown"}`
    ].join("\n");

    const deepseekResponse = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: "你是一个城市气候教学游戏的中文助教。请用普通高中生能理解的话，基于用户布局结果，给出简短、诚实、可解释的反馈。不要编造真实城市结论。"
          },
          {
            role: "user",
            content: `这是玩家本局结果：\n${userSummary}\n\n请用 3 条中文 bullet 总结：1) 做得好的地方；2) 主要风险；3) 下一局可以怎么改。`
          }
        ],
        temperature: 0.4,
        max_tokens: 360
      })
    });

    const data = await deepseekResponse.json();
    if (!deepseekResponse.ok) {
      return response.status(deepseekResponse.status).json({
        ok: false,
        error: data?.error?.message || "DeepSeek request failed"
      });
    }

    return response.status(200).json({
      ok: true,
      message: data.choices?.[0]?.message?.content || "没有生成反馈。"
    });
  } catch (error) {
    return response.status(500).json({
      ok: false,
      error: error.message || "Unknown server error"
    });
  }
};