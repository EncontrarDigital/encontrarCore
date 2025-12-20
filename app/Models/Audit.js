'use strict'

const Env = use('Env')
const mongoose = require('mongoose');



/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Audit extends Model {
    static get table () {
        return 'logs'
    }
}

// module.exports = Env.get('CONFIG_TYPE_LOG') =='mongoose_db'? mongoose.model('Unig_Log', {
//   "user": Number,
//   "user_data": Object,
//   "event": String,
//   "auditable_id": Number,
//   "auditable": Object,
//   "ip": String,
//   "message": String,
//   "success": Boolean,
//   "url": String,
//   "old_data": Object,
//   "new_data": Object,
//   "created_at": Date
// }) : Audit;
module.exports = Audit