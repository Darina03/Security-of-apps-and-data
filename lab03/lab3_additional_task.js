const request = require("request");

const userId='auth0|66042a34f2e866841884008b'

const options = {
    method: 'POST',
    url: 'https://dev-cz8jl8nsb750z7ge.us.auth0.com/oauth/token',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
        grant_type: 'client_credentials',
        client_id: 'TSRIdt2J2YIXUYk73jLWM3jEoDFYBqrO',
        client_secret: 'S9u3mDpdGX8ylysEPBdzsnZgcUMFJ2g2Z4ZKkj-qhkm3et1zptO8247tfK_Y-Bzz',
        audience: 'https://dev-cz8jl8nsb750z7ge.us.auth0.com/api/v2/'
    })
};

request(options, function (error, response, body) {
    if (error) throw new Error(error);

    const responseBody = JSON.parse(body);

    let token = responseBody.access_token;

    const changePasswordOptions = {
        method: 'PATCH',
        url: 'https://dev-cz8jl8nsb750z7ge.us.auth0.com/api/v2/users/'+userId,
        headers: {
            'content-type': 'application/json',
            authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ password: 'newPasswordForLab02', connection: 'Username-Password-Authentication' })
    };

    request(changePasswordOptions, function (error, response, body) {
        if (error) throw new Error(error);

        console.log(body);
    });
});
