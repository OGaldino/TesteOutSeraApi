// tests/api/basic.spec.ts
import { test, expect } from '@playwright/test';
import { expectStandardJsonHeaders, attachJson, attachText } from './helpers';

test.describe('Tarefa 1 - Validação básica de endpoint', () => {
    test('GET /users/2 deve retornar 200', async ({ request, baseURL }) => {

        const url = `${baseURL}/users/2`;
        const res = await request.get(url);

        expect(res.status()).toBe(200);
        await expectStandardJsonHeaders(res);

        const json = await res.json();
        await attachJson('response-body', json);

        const keys = Object.keys(json.data ?? {});

        expect(json.support).toMatchObject({
            url: expect.stringMatching(/^https?:\/\//),
            text: expect.any(String)
        });
    });

    test('GET /users/23 (inexistente) deve retornar 404 e corpo vazio', async ({ request, baseURL }) => {
        const url = `${baseURL}/users/23`;

        const res = await request.get(url);

        expect(res.status(), 'Status esperado 404').toBe(404);

        const ct = res.headers()['content-type'] || '';
        expect(ct).toContain('application/json');

        const text = await res.text();
        await attachText('response-text', text);
        expect(text.trim()).toBe('{}');
    });
});