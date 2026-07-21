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
    const sessionId = result.sessionId || null;
    const studyPhase = result.studyPhase || "complete";
    const payload = {
      project: result.project || "市长气候模拟游戏",
      session_id: sessionId,
      study_phase: studyPhase,
      budget_used: result.budgetUsed == null ? null : Number(result.budgetUsed),
      score: result.score == null ? null : Number(result.score),
      metrics: result.metrics || {},
      layout: result.layout || [],
      survey: result.survey || {},
      pre_survey: result.preSurvey || {},
      post_survey: result.postSurvey || {},
      raw_result: result
    };

    const baseUrl = supabaseUrl.replace(/\/$/, "");
    const headers = {
      "Content-Type": "application/json",
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      Prefer: "return=representation"
    };

    if (sessionId && studyPhase === "complete") {
      const patchResponse = await fetch(
        `${baseUrl}/rest/v1/game_results?session_id=eq.${encodeURIComponent(sessionId)}`,
        {
          method: "PATCH",
          headers,
          body: JSON.stringify(payload)
        }
      );
      const patchText = await patchResponse.text();
      if (patchResponse.ok) {
        const rows = patchText ? JSON.parse(patchText) : [];
        if (rows.length > 0) {
          return response.status(200).json({ ok: true, data: rows, mode: "updated" });
        }
      }
    }

    const insertResponse = await fetch(`${baseUrl}/rest/v1/game_results`, {
      method: "POST",
      headers,
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
      data: text ? JSON.parse(text) : null,
      mode: "inserted"
    });
  } catch (error) {
    return response.status(500).json({
      ok: false,
      error: error.message || "Unknown server error"
    });
  }
};
