This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


database:
{
  "startup": "{{$trigger.payload.form_response.answers[?(@.field.ref=='8e3e55d3-eead-4b45-a8a7-f0796c29eda1')].text}}",
  "name": "{{$trigger.payload.form_response.answers[?(@.field.ref=='fa14b4e2-a817-485d-b5ae-f65753468cb9')].text}}",
  "date_gegruendet": "{{$trigger.payload.form_response.answers[?(@.field.ref=='22b01df8-6fb1-4096-b4d2-4d9573cc6be5')].date}}",
  "anzahl_mitarbeiter": "{{$trigger.payload.form_response.answers[?(@.field.ref=='9546b93b-0512-4595-8705-90ecd2060491')].number}}",
  "weiblich": "{{$trigger.payload.form_response.answers[?(@.field.ref=='70bef2a9-5446-409a-a5ab-c9472e40c236')].number}}",
  "maennlich": "{{$trigger.payload.form_response.answers[?(@.field.ref=='dc1dc25d-9444-4715-92d3-f1aca10e1eaf')].number}}",
  "divers": "{{$trigger.payload.form_response.answers[?(@.field.ref=='3be6f13c-b6b9-4e4d-8e21-eac2f836af54')].number}}",
  "standort": "{{$trigger.payload.form_response.answers[?(@.field.ref=='23f08b31-1851-41e0-a865-64646f9c96aa')].text}}",
  "anzahl_produkte": "{{$trigger.payload.form_response.answers[?(@.field.ref=='05cf7b76-92f5-4132-917a-a3a83f6ffa3e')].number}}",
  "umsatz_letztes_jahr": "{{$trigger.payload.form_response.answers[?(@.field.ref=='93585c9a-3656-4e29-a237-c32cda3c4a2a')].number}}",
  "umsatz_seit_beginn": "{{$trigger.payload.form_response.answers[?(@.field.ref=='9e76759c-b014-45e7-a287-28e73360fa8b')].number}}",
  "aktuelle_kunden_bool": "{{$trigger.payload.form_response.answers[?(@.field.ref=='baaf42bf-21f7-4556-a56d-d887301b1a9c')].boolean}}",
  "aktuelle_kunden_int": "{{$trigger.payload.form_response.answers[?(@.field.ref=='10ef9245-71f7-4f67-941a-90f9f5324821')].number}}",
  "branche": "{{$trigger.payload.form_response.answers[?(@.field.ref=='a539085b-a60c-468a-9741-8f7f37ffee37')].choice.label}}",
  "mind_3_fte": "{{$trigger.payload.form_response.answers[?(@.field.ref=='7be6dc5b-2c68-473c-a954-b6fa3f715350')].boolean}}",
  "runway_monate": "{{$trigger.payload.form_response.answers[?(@.field.ref=='8562e808-55a9-4a38-9d91-7be0b0e68481')].number}}"
}