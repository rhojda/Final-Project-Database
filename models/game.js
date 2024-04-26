const db = require('../database')

exports.all = async () => {
    const { rows } = await db.getPool().query("select * from games order by id");
    return db.camelize(rows);
}

exports.allForConsole = async (console) => {
    const { rows } = await db.getPool().query(`
    select games.* from games
    JOIN games_consoles on games_consoles.game_id = games.id
    where games_consoles.console_id = $1;`, [console.id]);
    return db.camelize(rows);
}

exports.add = async (game) => {
    return await db.getPool()
        .query("INSERT INTO games(title) VALUES($1) RETURNING *",
            [game.title]);
}

exports.get = async (id) => {
    const { rows } = await db.getPool().query("select * from games where id = $1", [id]);
    return db.camelize(rows)[0];
}

exports.update = async (game) => {
    return await db.getPool()
        .query("update games set title = $1 where id = $2 RETURNING *",
            [game.title, game.id]);
}

exports.upsert = async (game) => {
    if (game.id) {
        return exports.update(game);
    } else {
        return exports.add(game);
    }
}