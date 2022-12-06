'use strict'

module.exports = ({ tables: tablesObject, authentication }) => {
  const
    bodyParser = require('body-parser'),
    bodyParserJSON = bodyParser.json(),
    tables = new Map(
      Object
        .entries(tablesObject)
        .map(([table, definition]) => ([ table.toLowerCase(), definition ]))
    ),
    methods = new Set(['insert', 'update', 'delete', 'get'])

  const
    parseBody = (request, response) => new Promise(result => {
      bodyParserJSON(request, response, result)
    })

  return async (req, res, next) => {
    if(!await authentication({ req }))
      return res.status(403).send({ error: `not authorized` })

    if(req.method !== 'POST')
      return res.status(404).send({ error: `method must be post` })


    await parseBody(req, res)
    const
      [ tableParameter, methodParameter ] = req.url.substring(1).split('/')

    if(!tableParameter)
      return res.status(404).send({ error: `table must be supplied in url /:table/:method` })

    if(!methodParameter)
      return res.status(404).send({ error: `method must be supplied in url /:table/:method` })

    const
      table = tableParameter.toLowerCase(),
      method = methodParameter.toLowerCase()

    if(!tables.has(table))
      return res.status(404).send({ error: `table ${table} is not valid, options are [${[ ...tables.keys()].join(', ')}]` })

    if(!methods.has(method))
      return res.status(404).send({ error: `method ${method} is not vaid, options are [${[ ...methods ].join(', ')}]` })


    if(method === 'get') {
      const
        definition = tables.get(table),
        { rawAttributes } = definition,
        { where={} } = req.body

      try {
        const
          results = await definition.findAll({ where, logging: console.log })

        return res.status(200).send({ results })
      } catch (err) {
        return res.status(500).send({ error: 'internal error has occured while running report' })
      }
    }

    return res.status(500).send({ error: 'internal error has occured'})
  }
}