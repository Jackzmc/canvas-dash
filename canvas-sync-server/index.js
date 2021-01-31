require('dotenv').config()
const fastify = require('fastify')({ 
    logger: process.env.NODE_ENV != "production",
    trustProxy: !!process.env.TRUST_PROXY 
})
const crypto = require("crypto");
async function main() {
    const db = await require('./db.js')()

    const PREFIX = process.env.ROOT_PATH || '/'
    const PORT = process.env.WEB_PORT || 8081

    // Declare a route

    //POST PREFIX/:token Push sync
    //POST PREFIX/ Push sync to new token
    //GET  PREFIX/:token with token: Get sync
    fastify.register(function (instance, opts, done) {
        instance.post('/', async (request, reply) => {
            if(!request.body) return reply.status(400).send({
                error: 'No body was provided',
                code: 'ERR_NO_BODY',
            })
            const token = crypto.randomBytes(16).toString("hex");
            await db.query(
                "INSERT INTO sync (token, data) VALUES (?, ?)",
                [token, JSON.stringify(request.body)]
            )
            reply.send({
                token
            })
        })
        instance.post('/:token', async (request, reply) => {
            await db.query(
                "UPDATE sync SET data = ? WHERE token = ?",
                [JSON.stringify(request.body), request.params.token]
            )
            reply.status(204).send()
        })
        instance.get('/:token', async (request, reply) => {
            const [rows] = await db.query(
                "SELECT data FROM sync WHERE token = ?",
                [request.params.token]
            )
            if(rows.length > 0) {
                reply.send({
                    raw: rows[0].data,
                    json: JSON.parse(rows[0].data)
                })
            }else{
                reply.callNotFound()
            }
        })
        instance.setErrorHandler((error, request, reply) => {
            fastify.log.error(error)
            reply.status(500).send({
                error: 'INTERNAL SERVER ERROR',
                code: 'INTERNAL_SERVER_ERROR',
                requestID: request.id
            })
        })
        done()
    }, { prefix: PREFIX  })

    // Run the server!
    fastify.listen(PORT, (err) => {
        if (err) {
            if(process.env.NODE_ENV != "production")
                fastify.log.error(err)
            else
                console.error('[Error]', err.message)
            process.exit(1)
        }
        fastify.log.info(`Running on prefix: ${PREFIX}`)
    })

}
main();