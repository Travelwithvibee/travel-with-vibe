exports.handler = async function(event) {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method not allowed" };

  const { types, dests, pax, budget, special } = JSON.parse(event.body);

  const prompt = `Si expert na cestovný ruch. Nájdi 3–4 reálne cestovné kancelárie ktoré zodpovedajú týmto požiadavkám:

Typ zájazdu: ${types.length ? types.join(", ") : "neupresňuje"}
Destinácia: ${dests.length ? dests.join(", ") : "neupresňuje"}
Počet osôb: ${pax || "neupresňuje"}
Rozpočet na osobu: ${budget || "neupresňuje"}
Špeciálne požiadavky: ${special || "žiadne"}

Odpovedaj VÝHRADNE ako JSON pole, žiadny iný text:
[{"name":"...","url":"https://...","desc":"1-2 vety prečo sa hodí","tags":["tag1","tag2","tag3"],"top":true/false}]

Prvý objekt má top:true (najlepšia voľba), ostatné top:false.`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }]
    })
  });

  const data = await response.json();
  const text = data.content[0].text;
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  const results = JSON.parse(text.slice(start, end + 1));

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ results })
  };
};
