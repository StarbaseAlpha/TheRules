'usestrict';

const theRules = require('./therules');

var rules = [

  {
	  "path":"/test",
    "rules":{
      "list":(req,kit,params) => {
        return (req.data.limit <= 10);
      },
    },
    "methods":{
      "list":(req,kit,params) => {
        return "In theory, a list of results via promise.";
      }
    }
  },

  {
    "path":"/:channel/:id",
    "rules":{
      "write":(req,kit,params) => {
        console.log("Params:", params);
        console.log("Request:", req);
        return typeof req.data === 'object' &&
          Object.keys(req.data).length === 1 &&
          req.data.message &&
          typeof req.data.message === 'string' &&
          req.data.message.length > 0 &&
          req.data.message.length <= 1024;
      }
    },
    "methods":{
      "write":(req,kit,params) => {
        return "The data would be written now. This is " + kit.tool;
      }
    }
  },

];

var kit = {
  "tool":"some tool needed to verify or complete the method."
};

var requestA = {
  "path":"/test",
  "method":"list",
  "data":{"limit":10}
};

var requestB = {
  "method":"write",
  "path":"/test/hello",
  "data":{"message":"HelloWorld"}
};

// Request with single path rule. No array
theRules({
  "path":"/posts",
  "methods":{
    "get":()=>{
      return 'POSTS WORKS!';
    },
  },
  "rules":{
    "get":()=>{
      return true;
    }
  },
},
{"path":"/posts","method":"get"},{}).then(console.log).catch(console.log);

theRules(rules,requestA,kit).then(console.log).catch(console.log);
theRules(rules,requestB,kit).then(console.log).catch(console.log);
