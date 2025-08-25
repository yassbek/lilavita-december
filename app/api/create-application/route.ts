// app/api/create-application/route.ts

import { NextRequest, NextResponse } from 'next/server';

// Kleine Helferfunktion, um eine Verzögerung zu erzeugen
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

interface TypeformAnswer {
  field: { ref: string };
  type: string;
  text?: string;
  date?: string;
  number?: number;
  boolean?: boolean;
  choice?: { label: string; };
  email?: string;
  phone_number?: string;
  url?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const responseId = body.responseId;

    if (!responseId) {
      return NextResponse.json({ message: 'responseId fehlt im Request' }, { status: 400 });
    }

    // FIX 1: Warten Sie 2 Sekunden, um Typeform Zeit zur Verarbeitung zu geben.
    // Dies verhindert den "404 Not Found" Fehler.
    await delay(2000);

    // 1. Hole Antworten von der Typeform-API
    const typeformToken = process.env.TYPEFORM_TOKEN;
    const formId = 'yYh3nt7W';
    const typeformApiUrl = `https://api.typeform.com/forms/${formId}/responses?included_response_ids=${responseId}`;

    const typeformApiResponse = await fetch(typeformApiUrl, {
      headers: { 'Authorization': `Bearer ${typeformToken}` }
    });

    if (!typeformApiResponse.ok) {
      const errorText = await typeformApiResponse.text();
      throw new Error(`Fehler bei der Abfrage der Typeform-API: ${errorText}`);
    }

    const responseData = await typeformApiResponse.json();
    if (!responseData.items || responseData.items.length === 0) {
      return NextResponse.json({ message: 'Typeform-Antwort nicht gefunden' }, { status: 404 });
    }
    const answers: TypeformAnswer[] = responseData.items[0].answers;
    const findAnswerByRef = (ref: string) => answers.find(a => a.field.ref === ref);

    // 2. Prüfe das Ausschlusskriterium sofort
    const hatMindestens3FTE = findAnswerByRef('7be6dc5b-2c68-473c-a954-b6fa3f715350')?.boolean;

    if (hatMindestens3FTE === false) {
      return NextResponse.json({ status: 'disqualified', message: 'Ausschlusskriterium (mind_3_fte) nicht erfüllt.' }, { status: 200 });
    }

    // 3. NUR WENN qualifiziert: Transformiere die Daten
    const typeformBrancheLabel = findAnswerByRef('a539085b-a60c-468a-9741-8f7f37ffee37')?.choice?.label;
    const brancheValueMap: { [key: string]: string } = {
      'Kreislaufwirtschaft': 'kreislaufwirtschaft',
      'Gesundheit & Pflege': 'gesundheit_pflege',
      'Ernährung & nachhaltige Landwirtschaft': 'ernaehrung_landwirtschaft',
      'Klimaschutz & erneuerbare Energien': 'klimaschutz_energien',
      'Lebenswerte Städte & Mobilität': 'staedte_mobilitaet',
      'Bildung & Inklusion': 'bildung_inklusion'
    };
    const directusBrancheValue = typeformBrancheLabel ? brancheValueMap[typeformBrancheLabel] : undefined;
    
    // Hol den Boolean-Wert von Typeform
    const hatAktuelleKunden = findAnswerByRef('baaf42bf-21f7-4556-a56d-d887301b1a9c')?.boolean;

    const directusData = {
      startup: findAnswerByRef('8e3e55d3-eead-4b45-a8a7-f0796c29eda1')?.text,
      name: findAnswerByRef('fa14b4e2-a817-485d-b5ae-f65753468cb9')?.text,
      email: findAnswerByRef('cf8dfd53-a956-472a-8f73-c6d7271216e7')?.email,
      telefonnummer: findAnswerByRef('19473af9-2aee-44dc-9dfe-ff3d81efb769')?.phone_number,
      website: findAnswerByRef('2e301ae8-0db2-42f8-9f90-9592082eabd7')?.url,
      date_gegruendet: findAnswerByRef('22b01df8-6fb1-4096-b4d2-4d9573cc6be5')?.date,
      anzahl_mitarbeiter: findAnswerByRef('9546b93b-0512-4595-8705-90ecd2060491')?.number,
      weiblich: findAnswerByRef('70bef2a9-5446-409a-a5ab-c9472e40c236')?.number,
      maennlich: findAnswerByRef('dc1dc25d-9444-4715-92d3-f1aca10e1eaf')?.number,
      divers: findAnswerByRef('3be6f13c-b6b9-4e4d-8e21-eac2f836af54')?.number,
      standort: findAnswerByRef('23f08b31-1851-41e0-a865-64646f9c96aa')?.text,
      anzahl_produkte: findAnswerByRef('05cf7b76-92f5-4132-917a-a3a83f6ffa3e')?.number,
      umsatz_letztes_jahr: findAnswerByRef('93585c9a-3656-4e29-a237-c32cda3c4a2a')?.number,
      umsatz_seit_beginn: findAnswerByRef('9e76759c-b014-45e7-a287-28e73360fa8b')?.number,
      
      // FIX 2: Konvertiere den Boolean in einen String ('1' oder '0').
      // Dies behebt den "VALUE_OUT_OF_RANGE" Fehler von Directus.
      aktuelle_kunden_bool: hatAktuelleKunden === true ? '1' : '0',

      aktuelle_kunden_int: findAnswerByRef('10ef9245-71f7-4f67-941a-90f9f5324821')?.number,
      branche: directusBrancheValue,
      mind_3_fte: hatMindestens3FTE,
      runway_monate: findAnswerByRef('8562e808-55a9-4a38-9d91-7be0b0e68481')?.number,
    };

    // 4. Sende die Daten an Directus
    const directusUrl = `${process.env.DIRECTUS_URL}/items/applications`;
    const response = await fetch(directusUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DIRECTUS_STATIC_TOKEN!}`
      },
      body: JSON.stringify(directusData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Directus Fehler: ${JSON.stringify(errorData)}`);
    }

    const result = await response.json();

    // 5. Gib den "qualified" Status und die neuen Daten zurück
    return NextResponse.json({ status: 'qualified', data: result.data }, { status: 200 });

  } catch (error: unknown) {
    console.error("Fehler in /api/create-application:", error);
    let message = 'Fehler bei der Verarbeitung';
    if (
      error &&
      typeof error === 'object' &&
      'message' in error &&
      typeof (error as { message?: unknown }).message === 'string'
    ) {
      message = (error as { message: string }).message;
    }
    return NextResponse.json({ message }, { status: 500 });
  }
}