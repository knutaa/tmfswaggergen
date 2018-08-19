'use strict';

const uuid = require('uuid');

const swaggerUtils = require('../utils/swaggerUtils');
const mongoUtils = require('../utils/mongoUtils');

const {TError, TErrorEnum} = require('../utils/errorUtils');

const {validateRequest} = require('../utils/ruleUtils');

function traverse(req,type,obj,operations,key,level) {
  level = level || 0;
  operations = operations || [];
  
  return new Promise(function(resolve, reject) {

    // type is only undefined in not found in the parent schema
    if(type==undefined) {
        const error = new TError(TErrorEnum.INVALID_BODY_FIELD, 
                            "Property: " + key + " not allowed in resource");
        return reject(error);
    }

    // nothing to do if not an object (or an array)
    if(typeof obj !== "object") {
      // console.log("traverse: no action for primitive element: type=" + JSON.stringify(type));
      var res = {key: key, val: obj};
      return resolve(res);
    }

    // need the definition of type to proceed 
    const typedef = swaggerUtils.getTypeDefinition(type);
    if(typedef==undefined) {
      return reject(new TError(TErrorEnum.UNPROCESSABLE_ENTITY, "Unknown type: " + type,req));
    } 

    var promises;

    if(Array.isArray(obj)) {
      promises = Object.keys(obj).map(idx => traverse(req,type,obj[idx],operations,idx,level+1));
    } else {
      promises = Object.keys(obj).map(prop => {

        // console.log("traverse: type:" + type + " property:" + prop);

        const schema = typedef[prop];
        var subschema; 
 
        if(schema==undefined) {
          // console.log("## set-up reject for unknown property: " + prop);
          // return propertyNotAllowed(req, type, prop);
        }
        // console.log("traverse: known property " + prop + " with schema " + JSON.stringify(schema));

        else if(schema.type!==undefined && schema.type==="array") {
          subschema = schema.items.$ref.split('/').slice(-1)[0];
        } else if(schema.$ref!==undefined) {
          subschema = schema.$ref.split('/').slice(-1)[0];
        } else if(schema.type!==undefined) {
          subschema = schema;
        }
        return traverse(req,subschema,obj[prop],operations,prop,level+1);
      });
    };

    Promise.all(promises).then( data => {
      var res = Array.isArray(obj) ? [] : {};
      data.forEach(x => res[x.key]=x.val);
      return res;
    })
    .then( obj => { 

      var todos = operations.map(func => func(obj,type,typedef));

      Promise.all(todos).then((x) => { 

        // x.map( item => { console.log("x:item = " + JSON.stringify(item))});

        const res = (key==undefined) ? obj : {key: key, val: obj};
        return resolve(res);

      })
      .catch(err => {
        console.log("traverse: error:" + JSON.stringify(err));
        const error = new TError(TErrorEnum.UNPROCESSABLE_ENTITY, err);
        return reject(error);
      })

    })
    .catch(err => {
      console.log("traverse: error:" + JSON.stringify(err));
      const error = new TError(TErrorEnum.UNPROCESSABLE_ENTITY, err);
      return reject(error);
    })
  })
};


function addHref(obj,type,typedef) {
  
  return new Promise(function(resolve, reject) {    
    // need obj to be a proper object
    // schema must specify href
    // obj must not have href already

    var result={};
    if(Array.isArray(obj) || !(typedef.href != undefined && obj.href == undefined)) {
      console.log("addHref: nothing to do for " + type);
      return resolve(obj);
    }

    // href found by looking up the relevant object instance, matching ALL properties 

    const baseType = type.replace("Ref","");

    mongoUtils.connect().then(db => {
      db.collection(baseType).find(obj).toArray()
      .then(doc => {
        var err;
        if(doc.length!=1) {
          err = new TError(TErrorEnum.RESOURCE_NOT_FOUND, 
            "Unable to locate sub-document " + type + " " + JSON.stringify(obj));
          return reject(err);
        }
        result.href = doc[0].href;
        return resolve(result);
      })
      .catch(err => {
        err = new TError(TErrorEnum.INTERNAL_ERROR, "Internal database error");
        return reject(err);
      })
    })
    .catch( err => {
      err = new TError(TErrorEnum.INTERNAL_ERROR, "Internal database error");
      return reject(err);
    })
  })
}

function processCommonAttributes(req, type, obj) {
  
  return new Promise(function(resolve, reject) {    

    const typedef = swaggerUtils.getTypeDefinition(type);

    if(Array.isArray(obj)) {
      return resolve(obj);
    }

    if(type==undefined) {
      return resolve(obj);
    }

    if(typedef.id!==undefined && obj.id==undefined) {
      obj.id = uuid.v4();
    };

    if(typedef.href!==undefined && obj.href==undefined) {
      const self = req.url.replace(/\/$/,"") + "/" + obj.id;
      obj.href = swaggerUtils.getURLScheme() + "://" + req.headers.host + self;
    }
    
    if(typedef.lastUpdate!==undefined) {
       obj.lastUpdate = (new Date()).toISOString();
    }

    if(typedef["@schemaLocation"]!==undefined && obj["@schemaLocation"]==undefined) {
      const url = swaggerUtils.getURLScheme() + "://" + swaggerUtils.getHost() + "/docs/#/" 
      obj["@schemaLocation"] = encodeURI(url);
    }

    if(typedef["@type"]!==undefined && obj["@type"]==undefined) {
      obj["@type"] = type;
    }

    if(typedef["@baseType"]!==undefined && obj["@baseType"]==undefined) {
      obj["@baseType"] = type;
    }

    return resolve(obj);

  })
}

function setBaseProperties(req,payload) {
  return new Promise(function(resolve, reject) {
    if (payload.id == undefined) {
      payload.id = uuid.v4();
    };
    var self = req.url.replace(/\/$/,"") + "/" + payload.id;
    payload.href = swaggerUtils.getURLScheme() + "://" + req.headers.host + self;
    resolve(payload)
  })
}

module.exports = { traverse, processCommonAttributes, setBaseProperties, addHref };

