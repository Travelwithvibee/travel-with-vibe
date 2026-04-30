exports.handler = async function(event) {
  try {
    const { types, dests, pax, budget, special } = JSON.parse(event.body || "{}");

    const prompt = `Si expert na cestovný ruch. Nájdi 3–4 reálne cestovné kancelárie ktoré zodpovedajú požiadavkám:
Typ: ${types && types.length ? types.join(", ") : "neupresňuje"}
Destinácia: ${dests && dests.length ? dests.join(", ") : "neupresňuje"}
Osoby: ${pax || "neupresňuje"}
Rozpočet: ${budget || "neupresňuje"}
Iné: ${special || "žiadne"}
Odpovedaj IBA ako JSON pole bez iného textu:
[{"name":"...","url":"https://...","desc":"prečo sa hodí","tags":["tag1","tag2"],"top":true}]`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }]
      })
    });

    const data = await response.json();

    if (!data.content || !data.content[0]) {
      return { statusCode: 500, body: JSON.stringify({ error: JSON.stringify(data) }) };
    }

    const text = data.content[0].text;
    const start = text.indexOf("[");
    const end = text.lastIndexOf("]");
    const results = JSON.parse(text.slice(start, end + 1));

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ results })
    };
  } catch(e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
