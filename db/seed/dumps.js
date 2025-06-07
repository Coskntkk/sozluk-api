const db = require("../postgres");
const axios = require("axios");
const {
    Title,
    Entry,
    Vote,
} = require("../models");

const generateBaconIpsum = async () => {
    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: 'https://baconipsum.com/api/?type=all-meat&sentences=1&start-with-lorem=1&format=text',
        headers: {}
    };

    let resp = await axios.get(config.url)
    console.log("Quote: '", resp.data, "'");
    return resp.data
};

const getRandom = (max) => {
    return Math.ceil(Math.random() * max);
}
const fillDb = async () => {
    try {
        await db.didSync.then(() => db.sync({ force: false }))
        // TITLES
        for (let i = 0; i < 20; i++) {
            let text = await generateBaconIpsum()
            console.log(text);
            await Title.create({ name: text })
        }
        // ENTRIES
        for (let i = 0; i < 200; i++) {
            let text = await generateBaconIpsum()
            let entry = {
                message: text,
                user_id: getRandom(4),
                title_id: getRandom(20),
                point: 0
            }
            await Entry.create(entry)
        }
        // VOTES
        for (let i = 0; i < 500; i++) {
            let vote = {
                value: getRandom(2) === 1 ? 1 : -1,
                user_id: getRandom(4),
                entry_id: getRandom(200),
            }
            await Vote.create(vote)
        }
    } catch (error) {
        console.log(error)
    } finally {
        await db.close()
    }
}
module.exports = { fillDb }
// fillDb()