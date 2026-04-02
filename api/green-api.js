module.exports = async (request, response) => {
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (request.method === 'OPTIONS') {
        return response.status(200).end();
    }

    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { method, idInstance, apiTokenInstance, ...params } = request.body;

        if (!idInstance || !apiTokenInstance) {
            return response.status(400).json({
                error: 'idInstance и apiTokenInstance обязательны'
            });
        }

        if (!method) {
            return response.status(400).json({ error: 'Метод не указан' });
        }

        const allowedMethods = ['getSettings', 'getStateInstance', 'sendMessage', 'sendFileByUrl'];

        if (!allowedMethods.includes(method)) {
            return response.status(400).json({
                error: `Метод "${method}" не разрешён`
            });
        }

        const greenApiUrl = `https://api.green-api.com/waInstance${idInstance}/${method}/${apiTokenInstance}`;

        console.log(`[GREEN-API] Вызов метода: ${method}, instance: ${idInstance}`);
        console.log(`[GREEN-API] Параметры:`, JSON.stringify(params, null, 2));

        const fetchOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        };

        if (Object.keys(params).length > 0) {
            fetchOptions.body = JSON.stringify(params);
        }

        const greenApiRes = await fetch(greenApiUrl, fetchOptions);
        const greenApiData = await greenApiRes.json();

        console.log(`[GREEN-API] Статус ответа: ${greenApiRes.status}`);
        console.log(`[GREEN-API] Ответ:`, JSON.stringify(greenApiData, null, 2));

        if (greenApiRes.ok) {
            return response.status(200).json({
                success: true,
                data: greenApiData
            });
        } else {
            return response.status(greenApiRes.status).json({
                success: false,
                error: greenApiData.message || 'Ошибка GREEN-API',
                data: greenApiData
            });
        }

    } catch (error) {
        console.error('[GREEN-API] Критическая ошибка:', error);

        return response.status(500).json({
            success: false,
            error: 'Внутренняя ошибка сервера',
            message: error.message
        });
    }
};
