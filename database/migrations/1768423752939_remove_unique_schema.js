'use strict'

const Schema = use('Schema')

class RemoveUniqueFromDeviceTokensTokenSchema extends Schema {
  up () {
    this.table('device_tokens', (table) => {
      table.dropUnique(['token'])
    })
  }

  down () {
    this.table('device_tokens', (table) => {
      table.unique('token')
    })
  }
}

module.exports = RemoveUniqueFromDeviceTokensTokenSchema
