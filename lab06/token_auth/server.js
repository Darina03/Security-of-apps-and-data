const uuid = require('uuid');
const express = require('express');
const onFinished = require('on-finished');
const bodyParser = require('body-parser');
const path = require('path');
const port = 3001;
const fs = require('fs');
const axios = require('axios');
const jwt = require("jsonwebtoken");
const querystring = require('querystring');
const cookieParser = require('cookie-parser');


const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

const SESSION_KEY = 'Authorization';
// auth0 account info(lab02)
const AUTH0_DOMAIN = 'dev-cz8jl8nsb750z7ge.us.auth0.com';
const CLIENT_ID = 'TSRIdt2J2YIXUYk73jLWM3jEoDFYBqrO';
const CLIENT_SECRET = 'S9u3mDpdGX8ylysEPBdzsnZgcUMFJ2g2Z4ZKkj-qhkm3et1zptO8247tfK_Y-Bzz';


class Session {
    #sessions = {}

    constructor() {
        this.loadSessions();
    }

    loadSessions() {
        try {
            const data = fs.readFileSync('./sessions.json', 'utf8');
            this.#sessions = JSON.parse(data.trim() || '{}');
        } catch(e) {
            this.#sessions = {};
        }
    }

    saveSessions() {
        fs.writeFileSync('./sessions.json', JSON.stringify(this.#sessions), 'utf8');
    }

    set(key, value) {
        this.#sessions[key] = value;
        this.saveSessions();
    }

    get(key) {
        return this.#sessions[key];
    }

    init() {
        const sessionId = uuid.v4();
        this.set(sessionId, {});
        return sessionId;
    }

    destroy(sessionId) {
        delete this.#sessions[sessionId];
        this.saveSessions();
    }
}

const sessions = new Session();

app.use((req, res, next) => {
    let sessionId = req.cookies[SESSION_KEY];

    if (!sessionId || !sessions.get(sessionId)) {
        sessionId = sessions.init();
        res.cookie(SESSION_KEY, sessionId, { httpOnly: true });
    }

    req.sessionId = sessionId;
    req.session = sessions.get(sessionId);

    onFinished(res, () => {
        sessions.set(sessionId, req.session);
    });

    next();
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/login', (req, res) => {
    const authUrl = `https://${AUTH0_DOMAIN}/authorize?` + querystring.stringify({
        client_id: CLIENT_ID,
        redirect_uri: 'http://localhost:3001/callback',
        response_type: 'code',
        response_mode: 'query',
        scope: 'openid profile email'
    });
    res.redirect(authUrl);
});

app.get('/callback', async (req, res) => {
    const { code } = req.query;

    try {
        const tokenResponse = await axios.post(`https://${AUTH0_DOMAIN}/oauth/token`, {
            grant_type: 'authorization_code',
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            code,
            redirect_uri: 'http://localhost:3001/callback'
        });

        const { access_token, id_token } = tokenResponse.data;
        const decodedToken = jwt.decode(id_token);
        console.log('Decoded token:', decodedToken);

        req.session.accessToken = access_token;
        req.session.username = decodedToken.nickname;
        sessions.set(req.sessionId, req.session);

        res.redirect('/');
    } catch (error) {
        console.error('Error in callback:', error);
        res.status(500).send('Auth0 authentication failed');
    }
});

app.get('/logout', (req, res) => {
    sessions.destroy(req.sessionId);
    res.clearCookie(SESSION_KEY);
    res.redirect('/');
});

app.get('/user', (req, res) => {
    if (req.session.username) {
        res.json({ username: req.session.username });
    } else {
        res.status(401).json({ error: 'User isn`t authenticated' });
    }
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});