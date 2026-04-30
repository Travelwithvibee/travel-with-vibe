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

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();
    
    if (!data.candidates) {
      return { statusCode: 500, body: JSON.stringify({ debug: data }) };
    }

    const text = data.candidates[0].content.parts[0].text;
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
