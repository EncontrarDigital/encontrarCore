'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Notification extends Model {
  static boot() {
    super.boot();
    this.addTrait("@provider:Auditable");
  }

  static get createdAtColumn() {
    return 'created'
  }

  static get updatedAtColumn() {
    return 'updated'
  }


  static get table () {
    return 'notifications'
  }
}

module.exports = Notification
