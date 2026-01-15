'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')
const Env = use('Env')

class Categories extends Model {
  static boot() {
    super.boot();
    this.addTrait("@provider:Auditable");
  }

    static get createdAtColumn() {
    return null
  }

  static get updatedAtColumn() {
    return null
  }

  static get table () {
    return 'categories'
  }

  /**
   * Get public URL for category icon from Supabase
   * @returns {string|null} Public URL or null if no icon
   */
  get iconUrl() {
    if (!this.icon_path) {
      return null
    }

    const supabaseUrl = Env.get('SUPABASE_URL')
    const bucket = Env.get('SUPABASE_BUCKET', 'uploads')
    return `${supabaseUrl}/storage/v1/object/public/${bucket}/${this.icon_path}`
  }
}

module.exports = Categories
