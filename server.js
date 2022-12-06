const
  express = require('express'),
  app = express(),
  apiify = require('./index.js'),
  Sequelize = require('sequelize'),
  configuration = require('./configuration.js'),
  sequelize = new Sequelize(configuration.database, configuration.user, configuration.password, {
    host: configuration.host,
    port: configuration.port,
    dialect: 'postgres',
    pool: {
      max: 2,
      min: 0,
      idle: 10000,
      acquire: 120 * 1000
    },
    logging: false,
    define: {
      timestamps: false
    }
  }),
  tables = {
    messages: sequelize.define('messages', {
      id: { type: Sequelize.STRING, primaryKey: true },
      subject: Sequelize.STRING,
      contacts_from: Sequelize.STRING,
      contacts_to: Sequelize.STRING,
      contacts_cc: Sequelize.STRING,
      contacts_bcc: Sequelize.STRING,
      body: Sequelize.STRING,
      processed: Sequelize.BOOLEAN,
      data: Sequelize.JSONB
    }),
    attachments: sequelize.define('attachments', {
      id: { type: Sequelize.STRING, primaryKey: true },
      message_id: Sequelize.STRING,
      content_type: Sequelize.STRING,
      content: Sequelize.STRING,
      name: Sequelize.STRING
    })
  }

sequelize.authenticate()

app.use('/apiify', apiify({
  tables,
  authentication: async request => {
    return true
  }
}))

app.listen(8888)