const user = require('./routes/user');
const sports = require('./routes/sports');
const event = require('./routes/event');

const pool = require('./utils/sqlConnectionPool');
const emailClient = require('./utils/emailClient');

const notifyUserTask = require('./scheduled-tasks/notifyUsers');

const Sentry = require('@sentry/node');
const morgan = require('morgan')
const config = require('config');
const cron = require('node-cron');
const express = require('express');
const cors = require('cors');

const app = express();

Sentry.init({ dsn: 'https://2a77f90cdc22481c8031832cf7796259@sentry.io/1330652' });

app.enable('trust proxy');

app.use(Sentry.Handlers.requestHandler());
app.use(morgan('tiny'));
app.use(express.static('public'));
app.use(express.json());

const corsOptions = {
    allowedHeaders: ['x-auth-token', 'Content-Type'],
    exposedHeaders: ['x-auth-token']
}

app.use(cors(corsOptions));

app.use('/api/user', user);
app.use('/api/sports', sports);
app.use('/api/event', event);

app.use(Sentry.Handlers.errorHandler());

app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).send('Server Error');
});

const port = config.get('port');

pool.init().then(async () => {
    await emailClient.init();
    app.listen(port, () => {
        console.log(`Server listening on port ${port}...`);
        cron.schedule('0 0 10 * * *', notifyUserTask);
        console.log('Task scheduled');
    })
});