import { test, expect } from '@playwright/test';
import { expectStandardJsonHeaders, attachJson } from './helpers';


test.describe('Tarefa 2 - CRUD e validações completas', () => {
    test('Sanity: GET /users/2 com x-api-key deve parecer user', async ({ request, baseURL }) => {
        const url = `${baseURL}/users/2`;
        const res = await request.get(url);

        await test.info().attach('effective-url', {
            body: Buffer.from(res.url()),
            contentType: 'text/plain'
        });
        await test.info().attach('response-headers', {
            body: Buffer.from(JSON.stringify(Object.fromEntries(res.headersArray().map(h => [h.name, h.value])), null, 2)),
            contentType: 'application/json'
        });

        expect(res.status(), `Status inesperado em ${res.url()}`).toBe(200);

        const json = await res.json();
        await attachJson('GET-user-2-response', json);

        expect(json).toEqual(expect.objectContaining({
            data: expect.objectContaining({
                id: 2,
                email: expect.stringMatching(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
                first_name: expect.any(String),
                last_name: expect.any(String),
                avatar: expect.stringMatching(/^https?:\/\//),
            }),
            support: expect.any(Object),
        }));

        if ('_meta' in json) {
            expect(json._meta).toEqual(expect.any(Object));
        }
    });

    test('POST /users deve criar e retornar 201 com id e createdAt', async ({ request, baseURL }) => {
        const payload = { name: 'morpheus', job: 'leader' };
        const res = await request.post(`${baseURL}/users`, { data: payload });

        expect(res.status()).toBe(201);
        await expectStandardJsonHeaders(res);

        const json = await res.json();
        await attachJson('POST-users-payload', payload);
        await attachJson('POST-users-response', json);

        expect(json).toMatchObject({
            name: 'morpheus',
            job: 'leader',
            id: expect.any(String),
            createdAt: expect.stringMatching(/Z$/) 
        });
    });

    test('PUT /users/2 deve atualizar e retornar 200 com updatedAt', async ({ request, baseURL }) => {
        const payload = { name: 'neo', job: 'chosen one' };
        const res = await request.put(`${baseURL}/users/2`, { data: payload });

        expect(res.status()).toBe(200);
        await expectStandardJsonHeaders(res);

        const json = await res.json();
        await attachJson('PUT-users-2-payload', payload);
        await attachJson('PUT-users-2-response', json);

        expect(json).toMatchObject({
            name: 'neo',
            job: 'chosen one',
            updatedAt: expect.stringMatching(/Z$/)
        });
    });

    test('DELETE /users/2 deve retornar 204 sem corpo', async ({ request, baseURL }) => {
        const res = await request.delete(`${baseURL}/users/2`);
        expect(res.status()).toBe(204);

        // Opcionalmente verificar que não há body
        const text = await res.text();
        expect(text).toBe('');
    });

    test('Negativo: POST /register sem password deve retornar 400', async ({ request, baseURL }) => {
        const payload = { email: 'sydney@fife' }; // faltando "password"
        const res = await request.post(`${baseURL}/register`, { data: payload });

        expect(res.status()).toBe(400);
        await expectStandardJsonHeaders(res);

        const json = await res.json();
        await attachJson('POST-register-missing-password-payload', payload);
        await attachJson('POST-register-missing-password-response', json);

        // Mensagem padrão do reqres.in
        expect(json).toMatchObject({
            error: 'Missing password'
        });
    });
});