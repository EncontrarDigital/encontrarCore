'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Setting extends Model {
    static boot() {
        super.boot()
        this.addTrait('@provider:Auditable')
    }

    static get table () {
        return 'settings'
    }
}

module.exports = Setting
