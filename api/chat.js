export const config = { runtime: 'edge' };

import agentContext from '../agent-context.json';

export default async function handler(request) {
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers });
    }

    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Método no permitido' }), {
            status: 405,
            headers: { ...headers, 'Content-Type': 'application/json' },
        });
    }

    try {
        const body = await request.json();
        const userMessages = body.messages || [];

        if (!userMessages.length) {
            return new Response(JSON.stringify({ error: 'No se recibieron mensajes' }), {
                status: 400,
                headers: { ...headers, 'Content-Type': 'application/json' },
            });
        }

        const systemPrompt = {
            role: 'system',
            content: `"Te llamás Elizabeth y eres la asistente de IA que responde preguntas sobre Braulio Bonilla Cadena..."

INFORMACIÓN DE BRAULIO BONILLA CADENA:
${JSON.stringify(agentContext, null, 2)}`
        };

        const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'openai/gpt-oss-20b',
                messages: [systemPrompt, ...userMessages.slice(-10)], // últimos 10 mensajes para contexto
                temperature: 0.4,
                max_tokens: 500,
            }),
        });

        if (!groqResponse.ok) {
            const errText = await groqResponse.text();
            console.error('Groq API error:', groqResponse.status, errText);
            return new Response(JSON.stringify({ error: 'Error al procesar la consulta' }), {
                status: 500,
                headers: { ...headers, 'Content-Type': 'application/json' },
            });
        }

        const data = await groqResponse.json();
        const reply = data.choices?.[0]?.message?.content || 'No pude generar una respuesta.';

        return new Response(JSON.stringify({ reply }), {
            status: 200,
            headers: { ...headers, 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Error en api/chat:', error);
        return new Response(JSON.stringify({ error: 'Error interno del servidor' }), {
            status: 500,
            headers: { ...headers, 'Content-Type': 'application/json' },
        });
    }
}