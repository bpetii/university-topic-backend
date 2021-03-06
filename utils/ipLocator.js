const fetch = require('node-fetch');

module.exports = async (ip) => {
    try {
        if (ip.length === 0)
            return null;
        const res = await fetch(`http://api.ipstack.com/${ip}?access_key=72d51868792996ad2614219b8eb9f997&fields=latitude,longitude,country_name,city`);
        if (res.status !== 200)
            throw new Error('API unexpected response');
        return res.json();
    } catch (error) {
        console.log('IP Locator ERROR', error);
        return null;
    }
}
