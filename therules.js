'use strict';

function theRules(rules=[],body={},kit={}) {
  return new Promise((resolve,reject)=>{
    const TestPath = (rulePath,testPath) => {
      let rule = (rulePath||"").toString().replace(/^\/|\/$/g,'').split('/');
      let test = (testPath||"").toString().replace(/^\/|\/$/g,'').split('/');
      if (rule.length !== test.length) {
        return null;
      }
      let params = {};
      for(let x = 0; x < rule.length; x++) {
        if (rule[x] !== test[x]) {
          if (rule[x].substring(0,1) === ':') {
            params[rule[x].substring(1,rule[x].length)] = test[x];
          } else {
            params = null;
            break;
          }
        }
      }
      return params;
    };
    let method = body.method || null;
    let path = (body.path || '/').toString();
    let tests = [];

    if (rules && typeof rules === 'object' && !rules.forEach) {
      rules = [rules];
    }

    rules.forEach(rule=>{
      if (rule.path) {
        let match = TestPath(rule.path,path);
        if (match && rule.rules && rule.rules[method]) {
          let cb;
          if (rule.methods && rule.methods[method] && typeof rule.methods[method] === 'function') {
            cb = rule.methods[method];
          }
          tests.push({"test":rule.rules[method],"params":match,"method":cb});
        }
      }
    });
    if (tests.length > 0) {
      let promises = [];
      tests.forEach(test=>{
        promises.push(test.test(body,kit,test.params));
      });
      Promise.all(promises).then(results=>{
        let ok = false;
        for(let x = 0; x < results.length; x++){
          if (results[x]) {
            ok = tests[x];
            break;
          }
        }
        if (ok && ok.method) {
          resolve(ok.method(body,kit,ok.params));
        } else {
          if (ok && !ok.method) {
            return reject({"code":400,"message":"Missing Methods."});
          }
          if (!ok) {
            return reject({"code":400,"message":"Permission Denied"});
          }

        }
      }).catch(err=>{
        if (err && err.message) {
          return reject(err);
        }
        reject({"code":400,"message":"Permission Denied - " + err.toString()});
      });
    } else {
      reject({"code":400,"message":"Missing Permissions"});
    }
  });
}

if (typeof module !== 'undefined' && module && module.exports) {
  module.exports = theRules;
}
