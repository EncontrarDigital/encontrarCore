"use strict";
const Env = use('Env')
const _ = require("lodash");
const LoggerRepository = use('App/Repositories/LoggerRepository')

class Auditable {
  register(Model) {


    // create methods
    const self = this;
    Model.audit = function () {
      return {
        create: createWithAudit(self.ctx).bind(this),
      };
    };

    // update/delete methods
    Model.prototype.audit = function (forceDelete = 'update') {
      const forceModel = (forceDelete === 'delete')
        ? () => deleteWithAudit(self.ctx).bind(this)
        : () => updateWithAudit(self.ctx).bind(this)

      return {
        save: forceModel(),
        update: updateWithAudit(self.ctx).bind(this),
        delete: deleteWithAudit(self.ctx).bind(this),
      };
    };
  }
}



/**
 * Update with audit
 *
 * @param auth
 * @param request
 * @returns {*}
 */
function updateWithAudit(req) {
  return async function (data, trx, ignoreDiff = ["updated_at"]) {
    const auditable = this.constructor.name;
    const auditableId = this.id;
    const oldData = _.omit(this.$originalAttributes, this.$hidden);
    this.merge(data);

    let result
    if (!trx) {
      result = await this.save();
    } else {
      result = await this.save(trx);
    }

    if (Env.get("NODE_ENV") !== "testing") {

      const newModel = (await this.constructor.find(this.primaryKeyValue));
      const newData = _.omit(newModel.$attributes, this.$hidden);

      // if new and old are equal then don't bother updating
      const isEqual = _.isEqual(
        _.omit(newData, ignoreDiff),
        _.omit(oldData, ignoreDiff),
      );
      if (isEqual) {
        return result;
      }

      // update / patch are shared
      const event = 'UPDATE';

      // save audit
      await createAudit(event, { request: req.request, auth: req.auth }, auditable, auditableId, oldData,
        newData);
    }

    return result;
  };
}

/**
 * Delete with audit
 *
 * @param auth
 * @param request
 * @returns {*}
 */
function deleteWithAudit(req) {
  return async function (trx) {
    const auditable = this.constructor.name;
    const auditableId = this.id;
    const oldData = _.omit(this.$originalAttributes, this.$hidden);
    let result
    if (!trx) {
      result = await this.save();
    } else {
      result = await this.save(trx);
    }

    if (Env.get("NODE_ENV") !== "testing") {
      // save audit
      await createAudit('DELETE', { request: req.request, auth: req.auth }, auditable,
        auditableId, oldData);
    }
    return result;
  };
}

/**
 * Run the audit
 *
 * @param event
 * @param oldData
 * @param auditable
 * @param auditableId
 * @param newData
 * @param auth
 * @param request
 * @returns {Promise<void>}
 */
async function createAudit(
  event, { request, auth }, auditable, auditableId, oldData, newData) {
  // check request was passed
  if (!request) {
    throw new Error("Request param is empty");
  }

  const url = request.originalUrl();
  const ip = request.ip();
  let userData = null;
  let userId = null;

  try {
    // Try to get user if authenticated
    if (auth && auth.getUser) {
      const user = await auth.getUser();
      if (user) {
        userData = typeof user.toJSON === 'function' ? await user.toJSON() : user;
        if (userData) {
          delete userData.password;
          userId = userData.id || null;
        }
      }
    }
  } catch (error) {
    // If there's an error getting user (e.g., no JWT), continue with null user
    console.log('No authenticated user, creating audit log as guest');
  }

  const log = await LoggerRepository.register({
    user: userId,
    user_data: userData,
    auditable_id: auditableId,
    auditable,
    event,
    url,
    ip,
    message: `${auditable} ${event.toLowerCase()}d successfully!`,
    success: true,
    old_data: oldData,
    new_data: newData,
    created_at: new Date()
  });
}

/**
 * Create with audit
 *
 * @param auth
 * @param request
 * @returns {*}
 */
function createWithAudit(req) {
  return async function (data, trx = null) {

    let model
    if (!trx) {
      model = await this.create(data);
    } else {
      model = await this.create(data, trx);
    }
    if (Env.get("NODE_ENV") !== "testing") {
      const auditable = model.constructor.name;
      const auditableId = model.id
      const newData = _.omit(model.$attributes, this.$hidden);
      const event = 'CREATE';

      // save audit
      await createAudit(event, { request: req.request, auth: req.auth }, auditable, auditableId, null,
        newData);
    }
    return model;
  };
}

module.exports = Auditable;
