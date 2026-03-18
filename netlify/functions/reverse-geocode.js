export default async (req) => {
    const url = new URL(req.url);
    const lat = url.searchParams.get('latitude');
    const lon = url.searchParams.get('longitude');

    if (!lat || !lon) {
        return new Response(JSON.stringify({ error: 'Missing coordinates' }), { 
            status: 400,
            headers: {
                'Content-Type': 'application/json'
            },
        });
    }

    const apiURL = `https://api-bdc.net/data/reverse-geocode?latitude=${lat}&longitude=${lon}&localityLanguage=en&key=${process.env.BDC_API_KEY}`;

    const response = await fetch(apiURL);
    const data = await response.json();

    return new Response(JSON.stringify(data), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    });
}

export const config = { path: "/api/reverse-geocode" };