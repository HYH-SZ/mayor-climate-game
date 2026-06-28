module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return response.status(500).json({
      ok: false,
      error: "Supabase environment variables are not configured"
    });
  }

  try {
    const result = request.body || {};
    const payload = {
      project: result.project || "市长气候模拟游戏",
      budget_used: Number(result.budgetUsed || 0),
      score: Number(result.score || 0),
      metrics: result.metrics || {},
      layout: result.layout || [],
      survey: result.survey || {},
      raw_result: result
    };

    const insertResponse = await fetch(`${supabaseUrl.replace(/\/$/, "")}/rest/v1/game_results`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": serviceRoleKey,
        "Authorization": `Bearer ${serviceRoleKey}`,
        "Prefer": "return=representation"
      },
      body: JSON.stringify(payload)
    });

    const text = await insertResponse.text();
    if (!insertResponse.ok) {
      return response.status(insertResponse.status).json({
        ok: false,
        error: text || "Failed to insert Supabase row"
      });
    }

    return response.status(200).json({
      ok: true,
      data: text ? JSON.parse(text) : null
    });
  } catch (error) {
    return response.status(500).json({
      ok: false,
      error: error.message || "Unknown server error"
    });
  }
};