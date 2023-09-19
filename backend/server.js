const express = require("express");
const {PORT} = require("./config/index");
const dbConnect = require("./database/index");
const router = require('./routes/index');
const errorHandler = require("./middlewares/errorHandler");
const cookieParser = require('cookie-parser');
const cors = require('cors');

const corsOptions = {
    credentials: true,
    origin: [`http://localhost:3000`],
}

const app = express();

app.use(cors(corsOptions));

app.use(cookieParser());

app.use(express.json());

app.use(router);

dbConnect();

app.use('/storage', express.static('storage'));

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`App is running on PORT: ${PORT}`)
});
