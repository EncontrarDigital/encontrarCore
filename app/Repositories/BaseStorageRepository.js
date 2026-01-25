"use strict";
const NotFoundException = use("App/Exceptions/NotFoundException");
const NotCreatedException = use("App/Exceptions/NotCreatedException");
const NotUpdateException = use("App/Exceptions/NotUpdateException");
const DeleteException = use("App/Exceptions/DeleteException");
const Database = use("Database")

const dayjs = require("dayjs");


class BaseStorageRepository {
  #model;
  #ModelDynamic;
  constructor(model, namespace = "App/Models/", connection = 'postgres') {
    this.#model = model;
    this.#ModelDynamic = use(`${namespace}${this.#model}`);
    this.#ModelDynamic.useConnection = connection;
  }


  get model() {
    return this.#ModelDynamic
  }

  /**
   * Create a row to model
   * @param {Object} [modelPayload]
   *
   * @throws {NotCreatedException}
   * @returns {Object} createdField
   */
  async create(modelPayload, trx = null, registrLog = true) {
    if (registrLog) {
      if (trx) {
        return await this.#ModelDynamic.audit().create(modelPayload, trx);
      } else {
        return await this.#ModelDynamic.audit().create(modelPayload);
      }
    } else {
      if (trx) {
        return await this.#ModelDynamic.create(modelPayload, trx);
      }
      return await this.#ModelDynamic.create(modelPayload);
    }
  }

  /**
   * Create a row to model
   * @param {Object} [modelPayload]
   *
   * @throws {NotCreatedException}
   * @returns {Object} createdField
   */
  async createMany(modelPayload, trx = null) {
    if (trx) {
      return await this.#ModelDynamic.createMany(modelPayload, trx);
    } else {
      return await this.#ModelDynamic.createMany(modelPayload);
    }
  }
  async findOrCreate(modelPayload, condition = Object) {
    try {
      const created = await this.#ModelDynamic
        .findOrCreate(condition, modelPayload);
      return created;
    } catch {
      throw new NotCreatedException();
    }
  }

  /**
   * Return an element
   *
   * @param { number } id
   * @param { DatabaseTransaction | null } trx
   * @param { Function } callback
   *
   * @throws { NotFoundException }
   * @returns { Object } modelResponse
   */
  findById(id, selectColumn = "*", withRalationships=[]) {
    let query = this.#ModelDynamic
      .query().select(Database.raw(selectColumn))
      .where("id", id) 
      if (withRalationships instanceof Array) {
        withRalationships.forEach((relation) => query.with(relation));
      } 
    return query.clone();
  }

  /**
   * Returns a list of elements
   * @param { number } page
   *
   * @returns { object[] } findAll
   */

  findAll(
    search,
    options = {
      page: null,
      searchBy: null,
      perPage: null,
      orderBy: "id",
      typeOrderBy: "ASC",
      typeFilter: null,
      withRalationships: [],
      filterTable: 'INTERNA',
    },
    selectColumn = "*",
    isDeleted = false
  ) {
    options.typeOrderBy = options.typeOrderBy || "ASC";
    options.orderBy = options.orderBy || `${this.model.table}.id`;

    const query = this.#ModelDynamic
      .query().select(selectColumn == '*' ? '*' : Database.raw(selectColumn))
      .where(function () {
        if (search) {
          if ((options.typeFilter || options.typeFilter == undefined) && (options.filterTable == 'INTERNA' || options.filterTable == undefined)) {
            if (options.searchBy instanceof Array) {
              options.searchBy.forEach((key, index) => {
                if (index === 0) {
                  this.whereRaw(`LOWER(${key}) LIKE LOWER(?)`, [`%${search}%`]);
                  return;
                }
                this.orWhereRaw(`LOWER(${key}) LIKE LOWER(?)`, [`%${search}%`]);
              });
            } else {
              this.whereRaw(`LOWER(${options.searchBy}) LIKE LOWER(?)`, [`%${search}%`]);
            }
          }
        }
      })
      //.andWhere("is_deleted", isDeleted)
      //.orderBy(options.orderBy, options.typeOrderBy);
      .orderByRaw(`${options.orderBy} ${options.typeOrderBy}`)
    if (options.withRalationships instanceof Array) {
      options.withRalationships.forEach(
        (relation) => query.with(relation)
        /*.orWhereHas(relation.table, (builder) => {
            if (search) {
              if (relation?.fields instanceof Array) {
                relation?.fields.forEach((key, index) => {
                  if (index === 0) {
                    builder.where(key, "like", `%${search}%`);

                    return;
                  }
                  builder.orWhere(key, "like", `%${search}%`);
                });
              }
            }
          })*/
      );
    }
    return query.clone();
  }

  /**
   *
   * @param {*} Payload
   * @returns
   */
  findAllOptions(Payload) {
    const options = this.setOptions(Payload);
    let query = this.findAll(options.search, options);
    return (options.isPaginate ? query.paginate(options.page, (options.perPage || 10)) : query.fetch());
  }

  /**
   * update an model line
   *
   * @param {Number} id
   * @param {Object} updatePayload
   * @param {Boolean} withIsDeleted
   *
   * @throws { NotUpdateException } when cannot update model
   * @returns { Object } modelResult
   */
  async update(id, updatePayload = {}, trx = null, withIsDeleted = true, registrLog = true) {
    //try {
    let modelResult;
    modelResult = await this.#ModelDynamic
      .query()
      .where(function () { this.where("id", id) })
      .firstOrFail();

    delete updatePayload.id;
    const updated = await Object.keys(updatePayload);

    for (let key of updated) {
      modelResult[key] = updatePayload[key];
    }


    if (registrLog) {
      if (trx) {
        await modelResult.audit().save(trx);
      } else {
        await modelResult.audit().save();
      }
    } else {
      if (trx) {
        await modelResult.save(trx);
      } else {
        await modelResult.save();
      }
    }
    return modelResult;
    /*} catch (e){
      throw new NotUpdateException('Não foi possível atualizar!');
    }*/
  }

  /**
   * Delete an model
   *
   * @param {Number} id
   * @param { DatabaseTransaction | null } trx
   * @param { Function } callback
   *
   * @throws { DeleteException } - delete a model
   * @returns { null }
   */
  async delete(id, trx = null, callback) {
    try {
      const modelResult = await this.findById(id).first();

      modelResult.is_deleted = true;

      if (trx) {
        await modelResult.audit("delete").save(trx);
      } else {
        await modelResult.audit("delete").save();
      }

      if (callback) await callback();

      return;
    } catch (err) {
      throw new DeleteException("Não foi possível apagar! " + err);
    }
  }

   /**
   * Delete an model
   *
   * @param {Number} id
   * @param { DatabaseTransaction | null } trx
   * @param { Function } callback
   *
   * @throws { DeleteException } - delete a model
   * @returns { null }
   */
async deleteDefinitive(id){
    const modelResult = await this.findById(id).first();
    if (!modelResult) {
      throw new DeleteException("Não foi possível apagar!" );
    }
    await modelResult.audit("delete").save();
    await this.#ModelDynamic.query().where('id',id).delete();
    return modelResult; 
}
  async updateForData(dadosVerificar, dadosActualizar) {
    try {

      return await this.#ModelDynamic.query()
        .where(function () {
          for (var [key, value] of Object.entries(dadosVerificar)) {
            this.where(key, value)
          }
        })
        .update(dadosActualizar);
    } catch (error) {
      console.log(error)
    }
  }

  /**
  * Returns a list of elements
  * @param { number } page
  *
  * @returns { object[] } count
  */

  count() {
    const query = this.#ModelDynamic
      .query().getCount();
    return query;
  }

  maxId() {
    const query = this.#ModelDynamic
      .query().select("id").orderBy("id", "Desc").first();

    return query;
  }

  async date() {
    const date = await Database.raw('SELECT NOW() as date');
    return date[0][0].date;
  }

  async currentDate() {
    const date = await this.date();
    return dayjs(date).format("YYYY-MM-DD");
  }

  async currentTime() {
    const date = await this.date();
    return dayjs(date).format("H:mm:ss");
  }

  async currentDateTime() {
    const date = await this.date();
    return dayjs(date).format("YYYY-MM-DD H:mm:ss");
  }

  async verifyExistsOnUpdate(field, value, id) {
    return await this.#ModelDynamic.query().where(field, value).whereNot("id", id).first();
  }

  async verifyExistsOnInsert(field, value, id) {
    return await this.#ModelDynamic.query().where(field, value).first();
  }
  /**
 * Delete an model
 *
 * @param {Number} id
 * @param { DatabaseTransaction | null } trx
 * @param { Function } callback
 *
 * @throws { DeleteException } - delete on table
 * @returns { null }
 */
  async deleteOnTable(id, trx = null, callback) {
    try {
      const modelResult = await this.findById(id).first();

      if (trx) {
        await modelResult.delete(trx);
      } else {
        await modelResult.delete();
      }

      if (callback) await callback();

      return;
    } catch (err) {
      throw new DeleteException("Não foi possível apagar! " + err);
    }
  }

  /**
   *
   * @param {*} request
   * @returns
   */
  setOptions(request, withRalationships = []) {
    return {
      page: request.input("page") || 1,
      perPage: request.input("perPage") || 5,
      orderBy: request.input("orderBy") || "id",
      typeOrderBy: request.input("typeOrderBy") || "DESC",
      searchBy: ["id"],
      withRalationships: withRalationships,
      isPaginate: request.input("isPaginate") || true
    };
  }

  async updateInForData(dadosVerificar, dadosActualizar) {
    try {

      return await this.#ModelDynamic.query()
        .where(function () {
          for (var [key, value] of Object.entries(dadosVerificar)) {
            this.whereIn(key, value)
          }
        })
        .update(dadosActualizar);
    } catch (error) {
      console.log(error)
    }
  }

  async updateBulkWithAudit(dadosVerificar, dadosActualizar, trx = null) {
    delete dadosActualizar.id;
    let updated = await Object.keys(dadosActualizar);

    if (trx) {
      for (let id of dadosVerificar) {
        let modelResult = await this.#ModelDynamic.find(id)
        for (let key of updated) {
          modelResult[key] = dadosActualizar[key]
        }
        modelResult.save(trx)
      }
    }
    else {
      for (let id of dadosVerificar) {
        let objectoCamposAlterar = new Object()
        let modelResult = await this.#ModelDynamic.find(id)
        for (let key of updated) {
          objectoCamposAlterar[key] = dadosActualizar[key]
        }
        modelResult.audit().update(objectoCamposAlterar)
      }
    }
  }
  /**
   * @author "caniggiamoreira@gmail.com"
   * @deprecated "Listar Lixeira -  registos eliminados temporariamente."
   * @param {*} Payload 
   * @returns 
   */
  async findTrash(Payload){
    const options = this.setOptions(Payload);
    let query = this.findAll(options.search, options).where('is_deleted', true);
    return query
  }

}

module.exports = BaseStorageRepository;
