'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')
/** @type {import('@adonisjs/framework/src/Hash')} */
const Hash = use('Hash')

class Users extends Model {
  static boot() {
    super.boot();
    /**
     * A hook to hash the user password before saving
     * it to the database.
     */
    this.addHook("beforeSave", async (userInstance) => {
      if (userInstance.dirty.password) {
        userInstance.password = await Hash.make(userInstance.password);
      }
    });
    this.addTrait("@provider:Auditable");
  }

  static get createdAtColumn() {
    return 'registered'
  }

  static get updatedAtColumn() {
    return 'registered'
  }

  static get hidden () {
    return ['password']
  }

  static get table () {
    return 'users'
  }
}

module.exports = Users
