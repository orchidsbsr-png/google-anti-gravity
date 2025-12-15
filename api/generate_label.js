export default async function handler(req, res) {
    // API to generate shipping label / packing slip
    // URL: https://track.delhivery.com/api/p/packing_slip?wbns=...&pdf=true&pdf_size=...

    const { waybill, pdf_size = '4R' } = req.query;

    if (!waybill) {
        return res.status(400).json({ error: 'Waybill is required' });
    }

    const baseUrl = 'https://track.delhivery.com/api/p/packing_slip';
    const params = new URLSearchParams();

    params.append('wbns', waybill);
    params.append('pdf', 'true');
    params.append('pdf_size', pdf_size); // 4R or A4

    const url = `${baseUrl}?${params.toString()}`;

    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Token ${process.env.DELHIVERY_API_TOKEN}`,
            'Content-Type': 'application/json'
        }
    };

    try {
        const response = await fetch(url, options);
        const json = await response.json();

        if (!response.ok) {
            throw new Error(json.error || response.statusText);
        }

        // The response typically contains { "packages": [ { "waybill": "...", "pdf_download_link": "..." } ] } 
        // or similar structure depending on version. We pass the full JSON back.
        res.status(200).json(json);

    } catch (err) {
        console.error("Label Generation Error:", err);
        res.status(500).json({ error: err.message });
    }
}
