import { NextResponse } from 'next/server';

type ChatMessage = { role: 'user' | 'assistant'; content: string };

export async function POST(req: Request) {
  try {
    const { documentText, messages } = (await req.json()) as {
      documentText: string;
      messages: ChatMessage[];
    };

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Aucun message reçu.' }, { status: 400 });
    }

    // On n'injecte le contexte du document que dans le tout premier message.
    // Les tours suivants n'ont pas besoin de le répéter : Claude voit déjà
    // tout l'historique via le tableau `messages`.
    const apiMessages = messages.map((m, i) =>
      i === 0
        ? { role: 'user', content: `Contexte du document :\n${documentText}\n\nQuestion : ${m.content}` }
        : { role: m.role, content: m.content }
    );

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 8192,
        messages: apiMessages
      })
    });

    const data = await response.json();

    if (data.error) {
      return NextResponse.json({ error: data.error.message }, { status: 400 });
    }

    let text = data.content[0].text;

    if (data.stop_reason === 'max_tokens') {
      text += "\n\n---\n*Réponse tronquée : le document ou la demande est trop volumineux pour tenir dans une seule réponse. Essayez de poser une question plus ciblée (ex. section par section).*";
    }

    return NextResponse.json({ text });

  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}