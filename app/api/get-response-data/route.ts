import { NextRequest, NextResponse } from 'next/server';

interface TypeformAnswer {
  field: {
    id: string;
    ref: string;
    type: string;
  };
  type: string;
  text?: string;
  choice?: {
    label: string;
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const responseId = searchParams.get('responseId');
  const formId = 'yYh3nt7W'; // Deine Formular-ID

  if (!responseId) {
    return NextResponse.json({ message: 'responseId fehlt' }, { status: 400 });
  }

  const token = process.env.TYPEFORM_TOKEN;
  if (!token) {
    console.error('Typeform-Token fehlt in den Umgebungsvariablen.');
    return NextResponse.json({ message: 'Typeform-Token nicht konfiguriert' }, { status: 500 });
  }

  const url = `https://api.typeform.com/forms/${formId}/responses?included_response_ids=${responseId}`;

  try {
    const typeformApiResponse = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!typeformApiResponse.ok) {
      const errorData = await typeformApiResponse.text();
      console.error('Typeform API Fehler:', errorData);
      throw new Error(`Fehler von Typeform API: ${typeformApiResponse.status}`);
    }

    const responseData = await typeformApiResponse.json();
    
    if (!responseData.items || responseData.items.length === 0) {
      return NextResponse.json({ message: 'Antwort nicht gefunden' }, { status: 404 });
    }

    const answers: TypeformAnswer[] = responseData.items[0].answers;

    const findAnswerByRef = (ref: string) => answers.find(a => a.field.ref === ref);

    const extractedData = {
      name: findAnswerByRef('fa14b4e2-a817-485d-b5ae-f65753468cb9')?.text,
      startup: findAnswerByRef('8e3e55d3-eead-4b45-a8a7-f0796c29eda1')?.text,
      branche: findAnswerByRef('a539085b-a60c-468a-9741-8f7f37ffee37')?.choice?.label,
      // TODO: Fetch the real applicationId from Directus using the extracted data
      applicationId: '2', // <-- Replace with real lookup
    };
    
    return NextResponse.json(extractedData);

  } catch (error) {
    console.error("Fehler beim Abrufen der Typeform-Antwort:", error);
    return NextResponse.json({ message: 'Interner Serverfehler' }, { status: 500 });
  }
}