import { NextResponse } from 'next/server';
import mammoth from 'mammoth';
// pdf-parse déclenche un mode "debug" bogué (lecture d'un fichier de test)
// quand il est importé via le bundler de Next.js. On importe directement
// son sous-module interne pour contourner le problème.
const pdfParse = require('pdf-parse/lib/pdf-parse.js');

export const runtime = 'nodejs';

const MAX_SIZE = 15 * 1024 * 1024; // 15 Mo

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier reçu." }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Ce fichier dépasse 15 Mo. Choisissez un fichier plus léger." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const name = file.name.toLowerCase();
    let text = '';

    if (name.endsWith('.pdf')) {
      const parsed = await pdfParse(buffer);
      text = parsed.text;
    } else if (name.endsWith('.docx')) {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else if (name.endsWith('.txt') || name.endsWith('.md')) {
      text = buffer.toString('utf-8');
    } else if (name.endsWith('.doc')) {
      return NextResponse.json(
        {
          error:
            "Le format .doc (Word 97-2003) n'est pas pris en charge. Enregistrez le fichier en .docx depuis Word, puis réessayez.",
        },
        { status: 400 }
      );
    } else {
      return NextResponse.json(
        { error: "Format non reconnu. Utilisez un PDF, un Word (.docx) ou un fichier texte (.txt, .md)." },
        { status: 400 }
      );
    }

    text = text.trim();

    if (!text) {
      return NextResponse.json(
        { error: "Aucun texte n'a pu être extrait de ce fichier. Il est peut-être scanné en image ou vide." },
        { status: 400 }
      );
    }

    return NextResponse.json({ text, filename: file.name });
  } catch (error) {
    console.error('Erreur extraction fichier :', error);
    return NextResponse.json({ error: "Impossible de lire ce fichier. Réessayez avec un autre." }, { status: 500 });
  }
}