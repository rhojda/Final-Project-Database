const express = require('express')
const app = express()
const port = 3000

var handlebars = require('express-handlebars').create({
    helpers: {
        eq: (v1, v2) => v1 == v2,
        ne: (v1, v2) => v1 != v2,
        lt: (v1, v2) => v1 < v2,
        gt: (v1, v2) => v1 > v2,
        lte: (v1, v2) => v1 <= v2,
        gte: (v1, v2) => v1 >= v2,
        and() {
            return Array.prototype.every.call(arguments, Boolean);
        },
        or() {
            return Array.prototype.slice.call(arguments, 0, -1).some(Boolean);
        },
        someId: (arr, id) => arr && arr.some(obj => obj.id == id),
        in: (arr, obj) => arr && arr.some(val => val == obj),
        dateStr: (v) => v && v.toLocaleDateString("en-US")
    }
});

const bodyParser = require('body-parser');
const { credentials } = require('./config');
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');
const csrf = require('csurf')


const indexRouter = require('./routes/index');
const gamesRouter = require('./routes/games');
const usersRouter = require('./routes/users');


app.use('/', indexRouter);
app.use('/games', gamesRouter);
app.use('/users', usersRouter);


app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser(credentials.cookieSecret));

app.use(expressSession({
    secret: credentials.cookieSecret,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 } // 30 days
}));

app.use((req, res, next) => {
    res.locals.flash = req.session.flash
    delete req.session.flash
    next()
})

app.use((req, res, next) => {
    res.locals.currentUser = req.session.currentUser
    next()
})

app.use(csrf({ cookie: true }))
app.use((req, res, next) => {
    res.locals._csrfToken = req.csrfToken()
    next()
})


/* GET home page. */
app.use('/', function (req, res, next) {
    res.send("<h1>Hello</h1>");
});

// custom 404 page
app.use((req, res) => {
    res.status(404)
    res.send('<h1>404 - Not Found</h1>')
})

// custom 500 page
app.use((err, req, res, next) => {
    console.error(err.message)
    res.type('text/plain')
    res.status(500)
    res.send('500 - Server Error')
})

app.listen(port, () => console.log(
    `Express started on http://localhost:${port}; ` +
    `press Ctrl-C to terminate.`))
