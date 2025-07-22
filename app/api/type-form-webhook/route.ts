// app/api/typeform-webhook/route.ts

import { NextRequest, NextResponse } from 'next/server';

// Definiere die Schnittstelle für die Typeform-Antworten
interface TypeformAnswer {
  field: {
    id: string;
    ref: string;
    type: string;
  };
  type: string;
  text?: string;
  date?: string;
  number?: number;
  boolean?: boolean;
  choice?: {
    label: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    // 1. Eingehende Daten von Typeform parsen
    const payload = await request.json();
    const answers: TypeformAnswer[] = payload.form_response.answers;

    const findAnswerByRef = (ref: string) => answers.find(a => a.field.ref === ref);

    // 2. Daten für Directus transformieren
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

    const directusData = {
      startup: findAnswerByRef('8e3e55d3-eead-4b45-a8a7-f0796c29eda1')?.text,
      name: findAnswerByRef('fa14b4e2-a817-485d-b5ae-f65753468cb9')?.text,
      date_gegruendet: findAnswerByRef('22b01df8-6fb1-4096-b4d2-4d9573cc6be5')?.date,
      anzahl_mitarbeiter: findAnswerByRef('9546b93b-0512-4595-8705-90ecd2060491')?.number,
      weiblich: findAnswerByRef('70bef2a9-5446-409a-a5ab-c9472e40c236')?.number,
      maennlich: findAnswerByRef('dc1dc25d-9444-4715-92d3-f1aca10e1eaf')?.number,
      divers: findAnswerByRef('3be6f13c-b6b9-4e4d-8e21-eac2f836af54')?.number,
      standort: findAnswerByRef('23f08b31-1851-41e0-a865-64646f9c96aa')?.text,
      anzahl_produkte: findAnswerByRef('05cf7b76-92f5-4132-917a-a3a83f6ffa3e')?.number,
      umsatz_letztes_jahr: findAnswerByRef('93585c9a-3656-4e29-a237-c32cda3c4a2a')?.number,
      umsatz_seit_beginn: findAnswerByRef('9e76759c-b014-45e7-a287-28e73360fa8b')?.number,
      aktuelle_kunden_bool: findAnswerByRef('baaf42bf-21f7-4556-a56d-d887301b1a9c')?.boolean,
      aktuell_kunden_int: findAnswerByRef('10ef9245-71f7-4f67-941a-90f9f5324821')?.number,
      branche: directusBrancheValue,
      mind_3_fte: findAnswerByRef('7be6dc5b-2c68-473c-a954-b6fa3f715350')?.boolean,
      runway_monate: findAnswerByRef('8562e808-55a9-4a38-9d91-7be0b0e68481')?.number,
    };
    
    console.log("Sende finale Daten an Directus:", directusData);

    // 3. Direkter fetch-Aufruf an die Directus API
    const url = `${process.env.DIRECTUS_URL}/items/applications`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DIRECTUS_STATIC_TOKEN!}`
      },
      body: JSON.stringify(directusData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Directus hat einen Fehler zurückgegeben:', errorData);
      throw new Error(`Directus Fehler: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();

    console.log("✅ Erfolgreich! Daten in Directus erstellt:", result);
    return NextResponse.json({ message: 'Erfolgreich verarbeitet', result }, { status: 200 });

  } catch (error) {
    console.error("Fehler im Webhook:", error);
    return NextResponse.json({ message: 'Fehler bei der Verarbeitung' }, { status: 500 });
  }
}