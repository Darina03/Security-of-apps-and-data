const request = require("request");

const options = {
    method: 'POST',
    url: 'https://dev-cz8jl8nsb750z7ge.us.auth0.com/oauth/token',
    headers: {'content-type': 'application/x-www-form-urlencoded'},
    form:
        {
            grant_type: 'password',
            username: 'spuskan.daryna@lll.kpi.ua',
            password: 'lab02_ds',
            audience: 'https://dev-cz8jl8nsb750z7ge.us.auth0.com/api/v2/',
            client_id: 'TSRIdt2J2YIXUYk73jLWM3jEoDFYBqrO',
            scope:'offline_access',
            client_secret: 'S9u3mDpdGX8ylysEPBdzsnZgcUMFJ2g2Z4ZKkj-qhkm3et1zptO8247tfK_Y-Bzz'
        }
};

request(options, function (error, response, body) {
    if (error) throw new Error(error);

    const responseBody = JSON.parse(body);

    let refreshToken = responseBody.refresh_token;
    console.log(body);

    const options2 = { method: 'POST',
        url: 'https://dev-cz8jl8nsb750z7ge.us.auth0.com/oauth/token',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        form:
            { grant_type: 'refresh_token',
                client_id: 'TSRIdt2J2YIXUYk73jLWM3jEoDFYBqrO',
                client_secret: 'S9u3mDpdGX8ylysEPBdzsnZgcUMFJ2g2Z4ZKkj-qhkm3et1zptO8247tfK_Y-Bzz',
                refresh_token: refreshToken}
    };

    request(options2, function (error, response, body) {
        if (error) throw new Error(error);

        console.log(body);
    });


});


