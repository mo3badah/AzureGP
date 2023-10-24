"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
var _express = _interopRequireWildcard(require("express"));
var path = _interopRequireWildcard(require("path"));
var fs = _interopRequireWildcard(require("fs"));
var _importMetaResolve = require("@babel/core/lib/vendor/import-meta-resolve");
var _cookieParser = _interopRequireDefault(require("cookie-parser"));
var _helmet = _interopRequireDefault(require("helmet"));
var _cors = _interopRequireDefault(require("cors"));
var _Innovations = _interopRequireDefault(require("../routes/Innovations"));
var _Users = _interopRequireDefault(require("../routes/Users"));
var _Auth = _interopRequireDefault(require("../routes/Auth"));
var _Airport = _interopRequireDefault(require("../routes/Airport"));
var _Airline = _interopRequireDefault(require("../routes/Airline"));
var _Flight = _interopRequireDefault(require("../routes/Flight"));
var _Payment = _interopRequireDefault(require("../routes/Payment"));
var _Employee = _interopRequireDefault(require("../routes/Employee"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return exports; }; var exports = {}, Op = Object.prototype, hasOwn = Op.hasOwnProperty, defineProperty = Object.defineProperty || function (obj, key, desc) { obj[key] = desc.value; }, $Symbol = "function" == typeof Symbol ? Symbol : {}, iteratorSymbol = $Symbol.iterator || "@@iterator", asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator", toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag"; function define(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: !0, configurable: !0, writable: !0 }), obj[key]; } try { define({}, ""); } catch (err) { define = function define(obj, key, value) { return obj[key] = value; }; } function wrap(innerFn, outerFn, self, tryLocsList) { var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator, generator = Object.create(protoGenerator.prototype), context = new Context(tryLocsList || []); return defineProperty(generator, "_invoke", { value: makeInvokeMethod(innerFn, self, context) }), generator; } function tryCatch(fn, obj, arg) { try { return { type: "normal", arg: fn.call(obj, arg) }; } catch (err) { return { type: "throw", arg: err }; } } exports.wrap = wrap; var ContinueSentinel = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var IteratorPrototype = {}; define(IteratorPrototype, iteratorSymbol, function () { return this; }); var getProto = Object.getPrototypeOf, NativeIteratorPrototype = getProto && getProto(getProto(values([]))); NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype); var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype); function defineIteratorMethods(prototype) { ["next", "throw", "return"].forEach(function (method) { define(prototype, method, function (arg) { return this._invoke(method, arg); }); }); } function AsyncIterator(generator, PromiseImpl) { function invoke(method, arg, resolve, reject) { var record = tryCatch(generator[method], generator, arg); if ("throw" !== record.type) { var result = record.arg, value = result.value; return value && "object" == _typeof(value) && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) { invoke("next", value, resolve, reject); }, function (err) { invoke("throw", err, resolve, reject); }) : PromiseImpl.resolve(value).then(function (unwrapped) { result.value = unwrapped, resolve(result); }, function (error) { return invoke("throw", error, resolve, reject); }); } reject(record.arg); } var previousPromise; defineProperty(this, "_invoke", { value: function value(method, arg) { function callInvokeWithMethodAndArg() { return new PromiseImpl(function (resolve, reject) { invoke(method, arg, resolve, reject); }); } return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(innerFn, self, context) { var state = "suspendedStart"; return function (method, arg) { if ("executing" === state) throw new Error("Generator is already running"); if ("completed" === state) { if ("throw" === method) throw arg; return doneResult(); } for (context.method = method, context.arg = arg;;) { var delegate = context.delegate; if (delegate) { var delegateResult = maybeInvokeDelegate(delegate, context); if (delegateResult) { if (delegateResult === ContinueSentinel) continue; return delegateResult; } } if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) { if ("suspendedStart" === state) throw state = "completed", context.arg; context.dispatchException(context.arg); } else "return" === context.method && context.abrupt("return", context.arg); state = "executing"; var record = tryCatch(innerFn, self, context); if ("normal" === record.type) { if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue; return { value: record.arg, done: context.done }; } "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg); } }; } function maybeInvokeDelegate(delegate, context) { var methodName = context.method, method = delegate.iterator[methodName]; if (undefined === method) return context.delegate = null, "throw" === methodName && delegate.iterator["return"] && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method) || "return" !== methodName && (context.method = "throw", context.arg = new TypeError("The iterator does not provide a '" + methodName + "' method")), ContinueSentinel; var record = tryCatch(method, delegate.iterator, context.arg); if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel; var info = record.arg; return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel); } function pushTryEntry(locs) { var entry = { tryLoc: locs[0] }; 1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry); } function resetTryEntry(entry) { var record = entry.completion || {}; record.type = "normal", delete record.arg, entry.completion = record; } function Context(tryLocsList) { this.tryEntries = [{ tryLoc: "root" }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0); } function values(iterable) { if (iterable) { var iteratorMethod = iterable[iteratorSymbol]; if (iteratorMethod) return iteratorMethod.call(iterable); if ("function" == typeof iterable.next) return iterable; if (!isNaN(iterable.length)) { var i = -1, next = function next() { for (; ++i < iterable.length;) if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next; return next.value = undefined, next.done = !0, next; }; return next.next = next; } } return { next: doneResult }; } function doneResult() { return { value: undefined, done: !0 }; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, defineProperty(Gp, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), defineProperty(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) { var ctor = "function" == typeof genFun && genFun.constructor; return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name)); }, exports.mark = function (genFun) { return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun; }, exports.awrap = function (arg) { return { __await: arg }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () { return this; }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) { void 0 === PromiseImpl && (PromiseImpl = Promise); var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl); return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) { return result.done ? result.value : iter.next(); }); }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () { return this; }), define(Gp, "toString", function () { return "[object Generator]"; }), exports.keys = function (val) { var object = Object(val), keys = []; for (var key in object) keys.push(key); return keys.reverse(), function next() { for (; keys.length;) { var key = keys.pop(); if (key in object) return next.value = key, next.done = !1, next; } return next.done = !0, next; }; }, exports.values = values, Context.prototype = { constructor: Context, reset: function reset(skipTempReset) { if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined); }, stop: function stop() { this.done = !0; var rootRecord = this.tryEntries[0].completion; if ("throw" === rootRecord.type) throw rootRecord.arg; return this.rval; }, dispatchException: function dispatchException(exception) { if (this.done) throw exception; var context = this; function handle(loc, caught) { return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught; } for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i], record = entry.completion; if ("root" === entry.tryLoc) return handle("end"); if (entry.tryLoc <= this.prev) { var hasCatch = hasOwn.call(entry, "catchLoc"), hasFinally = hasOwn.call(entry, "finallyLoc"); if (hasCatch && hasFinally) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } else if (hasCatch) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); } else { if (!hasFinally) throw new Error("try statement without catch or finally"); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } } } }, abrupt: function abrupt(type, arg) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) { var finallyEntry = entry; break; } } finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null); var record = finallyEntry ? finallyEntry.completion : {}; return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record); }, complete: function complete(record, afterLoc) { if ("throw" === record.type) throw record.arg; return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel; }, finish: function finish(finallyLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel; } }, "catch": function _catch(tryLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc === tryLoc) { var record = entry.completion; if ("throw" === record.type) { var thrown = record.arg; resetTryEntry(entry); } return thrown; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(iterable, resultName, nextLoc) { return this.delegate = { iterator: values(iterable), resultName: resultName, nextLoc: nextLoc }, "next" === this.method && (this.arg = undefined), ContinueSentinel; } }, exports; }
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; } // importing express and other frameworks which needed for this application to be executed.
// mongoose is the package that we need it to deal with mongodb database through nodejs
// const mongoose = require("mongoose")
// these routes are needed so we can forward our routing to separe files ( mainly for the arrangement of the code)
// all the routed innovations add, update, delete, and fetching all the data of it
// files needed to make new profile ( registration methods )
// firstly we start using our libraries which we needed and add them to our app
var app = (0, _express["default"])(),
  // main application which will need for all the routing and database
  port = process.env.PORT || 3000; // the port our application will run on it

// some helpful middleware
// these middlewares are helpful for sending data from the forms to the backend and so on...
app.use(_express["default"].urlencoded({
  extended: "true"
}));
app.use(_express["default"].json());
app.use((0, _cookieParser["default"])());
app.use((0, _helmet["default"])());
// set the view engine to ejs
// app.set('view engine', 'ejs');
// we need to make our main routes here so if the auth is accepted we will go to these pages
app.get("/", function (req, res) {
  // res.sendFile(path.join(__dirname,"../front/sign.js"))
  // res.sendFile(path.join(__dirname,"../front/signin.html"))
});
app.get("/dashboard", /*#__PURE__*/function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(req, res) {
    return _regeneratorRuntime().wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
        case "end":
          return _context.stop();
      }
    }, _callee);
  }));
  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}());
function fetchData() {
  return fetch("http://localhost:3000/api/innovations/").then(function (res) {
    return res.json();
  });
}
app.get("/signup", function (req, res) {
  res.sendFile(path.join(__dirname, "../front/signup.html"));
});
app.post("/addnew", function (req, res) {
  res.render("add.ejs");
});
// edit cycle
// first fetch data and put inside front end
app.post("/editInnov", /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(req, res) {
    var innov;
    return _regeneratorRuntime().wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return fetchSpecificInnov(req.body.name);
        case 2:
          innov = _context2.sent;
          res.render("edit.ejs", {
            innov: innov
          });
        case 4:
        case "end":
          return _context2.stop();
      }
    }, _callee2);
  }));
  return function (_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}());
function fetchSpecificInnov(name) {
  return fetch("http://localhost:3000/api/innovations/" + name).then(function (res) {
    return res.json();
  });
}
// second update to database and forward to main dashboard to see the updated data live
app.post("/editInnovData", /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3(req, res) {
    var innov;
    return _regeneratorRuntime().wrap(function _callee3$(_context3) {
      while (1) switch (_context3.prev = _context3.next) {
        case 0:
          innov = req.body; // Awaiting fetch which contains method,
          // headers and content-type and body
          put("http://localhost:3000/api/innovations/" + req.body.name, innov)
          // Resolving promise for response data
          .then(res.redirect("/dashboard"))
          // Resolving promise for error
          ["catch"](function (err) {
            return console.log(err);
          });
        case 2:
        case "end":
          return _context3.stop();
      }
    }, _callee3);
  }));
  return function (_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
}());
function put(_x7, _x8) {
  return _put.apply(this, arguments);
} // first delete from database and forward to main dashboard to see the updated data live
function _put() {
  _put = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee11(url, data) {
    var response, resData;
    return _regeneratorRuntime().wrap(function _callee11$(_context11) {
      while (1) switch (_context11.prev = _context11.next) {
        case 0:
          _context11.next = 2;
          return fetch(url, {
            method: "PUT",
            headers: {
              "Content-type": "application/json"
            },
            body: JSON.stringify(data)
          });
        case 2:
          response = _context11.sent;
          _context11.next = 5;
          return response.json();
        case 5:
          resData = _context11.sent;
          return _context11.abrupt("return", resData);
        case 7:
        case "end":
          return _context11.stop();
      }
    }, _callee11);
  }));
  return _put.apply(this, arguments);
}
app.post("/deleteInnovData", /*#__PURE__*/function () {
  var _ref4 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee4(req, res) {
    return _regeneratorRuntime().wrap(function _callee4$(_context4) {
      while (1) switch (_context4.prev = _context4.next) {
        case 0:
          // Awaiting fetch which contains method,
          // headers and content-type and body
          deleting("http://localhost:3000/api/innovations/" + req.body.name)
          // Resolving promise for response data
          .then(res.redirect("/dashboard"))
          // Resolving promise for error
          ["catch"](function (err) {
            return console.log(err);
          });
        case 1:
        case "end":
          return _context4.stop();
      }
    }, _callee4);
  }));
  return function (_x9, _x10) {
    return _ref4.apply(this, arguments);
  };
}());
function deleting(_x11, _x12) {
  return _deleting.apply(this, arguments);
} // add all users to front end
function _deleting() {
  _deleting = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee12(url, data) {
    var response, resData;
    return _regeneratorRuntime().wrap(function _callee12$(_context12) {
      while (1) switch (_context12.prev = _context12.next) {
        case 0:
          _context12.next = 2;
          return fetch(url, {
            method: "DELETE",
            headers: {
              "Content-type": "application/json"
            }
          });
        case 2:
          response = _context12.sent;
          // Awaiting for the resource to be deleted
          resData = "resource deleted..."; // Return response data
          return _context12.abrupt("return", resData);
        case 5:
        case "end":
          return _context12.stop();
      }
    }, _callee12);
  }));
  return _deleting.apply(this, arguments);
}
app.post("/users", /*#__PURE__*/function () {
  var _ref5 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee5(req, res) {
    var users;
    return _regeneratorRuntime().wrap(function _callee5$(_context5) {
      while (1) switch (_context5.prev = _context5.next) {
        case 0:
          _context5.next = 2;
          return fetchUsersData();
        case 2:
          users = _context5.sent;
          res.render("users.ejs", {
            users: users
          });
        case 4:
        case "end":
          return _context5.stop();
      }
    }, _callee5);
  }));
  return function (_x13, _x14) {
    return _ref5.apply(this, arguments);
  };
}());
function fetchUsersData() {
  return fetch("http://localhost:3000/api/user/").then(function (res) {
    return res.json();
  });
}
// adding new user from admin
app.post("/addNewUser", /*#__PURE__*/function () {
  var _ref6 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee6(req, res) {
    return _regeneratorRuntime().wrap(function _callee6$(_context6) {
      while (1) switch (_context6.prev = _context6.next) {
        case 0:
          _context6.t0 = addNewUser("http://localhost:3000/api/user/addNewUserFromAdmin", req.body)
          // Resolving promise for response data
          ;
          _context6.t1 = res;
          _context6.next = 4;
          return fetchUsersData();
        case 4:
          _context6.t2 = _context6.sent;
          _context6.t3 = {
            users: _context6.t2
          };
          _context6.t4 = _context6.t1.render.call(_context6.t1, "users.ejs", _context6.t3);
          _context6.next = 9;
          return _context6.t0.then.call(_context6.t0, _context6.t4)["catch"](function (err) {
            return console.log(err);
          });
        case 9:
        case "end":
          return _context6.stop();
      }
    }, _callee6);
  }));
  return function (_x15, _x16) {
    return _ref6.apply(this, arguments);
  };
}());
function addNewUser(_x17, _x18) {
  return _addNewUser.apply(this, arguments);
} // change user admin or not
function _addNewUser() {
  _addNewUser = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee13(url, data) {
    var response, resData;
    return _regeneratorRuntime().wrap(function _callee13$(_context13) {
      while (1) switch (_context13.prev = _context13.next) {
        case 0:
          _context13.next = 2;
          return fetch(url, {
            method: "POST",
            headers: {
              "Content-type": "application/json"
            },
            body: JSON.stringify(data)
          });
        case 2:
          response = _context13.sent;
          // Awaiting response.json()
          resData = "User Added successfully...."; // Return response data
          return _context13.abrupt("return", resData);
        case 5:
        case "end":
          return _context13.stop();
      }
    }, _callee13);
  }));
  return _addNewUser.apply(this, arguments);
}
app.post("/makeAdmin", /*#__PURE__*/function () {
  var _ref7 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee7(req, res) {
    return _regeneratorRuntime().wrap(function _callee7$(_context7) {
      while (1) switch (_context7.prev = _context7.next) {
        case 0:
          _context7.t0 = post("http://localhost:3000/api/user/updateToAdminUser", req.body)
          // Resolving promise for response data
          ;
          _context7.t1 = res;
          _context7.next = 4;
          return fetchUsersData();
        case 4:
          _context7.t2 = _context7.sent;
          _context7.t3 = {
            users: _context7.t2
          };
          _context7.t4 = _context7.t1.render.call(_context7.t1, "users.ejs", _context7.t3);
          _context7.next = 9;
          return _context7.t0.then.call(_context7.t0, _context7.t4)["catch"](function (err) {
            return console.log(err);
          });
        case 9:
        case "end":
          return _context7.stop();
      }
    }, _callee7);
  }));
  return function (_x19, _x20) {
    return _ref7.apply(this, arguments);
  };
}());
app.post("/removeAdmin", /*#__PURE__*/function () {
  var _ref8 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee8(req, res) {
    return _regeneratorRuntime().wrap(function _callee8$(_context8) {
      while (1) switch (_context8.prev = _context8.next) {
        case 0:
          _context8.t0 = post("http://localhost:3000/api/user/updateToUser", req.body)
          // Resolving promise for response data
          ;
          _context8.t1 = res;
          _context8.next = 4;
          return fetchUsersData();
        case 4:
          _context8.t2 = _context8.sent;
          _context8.t3 = {
            users: _context8.t2
          };
          _context8.t4 = _context8.t1.render.call(_context8.t1, "users.ejs", _context8.t3);
          _context8.next = 9;
          return _context8.t0.then.call(_context8.t0, _context8.t4)["catch"](function (err) {
            return console.log(err);
          });
        case 9:
        case "end":
          return _context8.stop();
      }
    }, _callee8);
  }));
  return function (_x21, _x22) {
    return _ref8.apply(this, arguments);
  };
}());
function post(_x23, _x24) {
  return _post.apply(this, arguments);
} // delete user data
function _post() {
  _post = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee14(url, data) {
    var response, resData;
    return _regeneratorRuntime().wrap(function _callee14$(_context14) {
      while (1) switch (_context14.prev = _context14.next) {
        case 0:
          _context14.next = 2;
          return fetch(url, {
            method: "POST",
            headers: {
              "Content-type": "application/json"
            },
            body: JSON.stringify(data)
          });
        case 2:
          response = _context14.sent;
          _context14.next = 5;
          return response.json();
        case 5:
          resData = _context14.sent;
          return _context14.abrupt("return", resData);
        case 7:
        case "end":
          return _context14.stop();
      }
    }, _callee14);
  }));
  return _post.apply(this, arguments);
}
app.post("/deleteUserData", /*#__PURE__*/function () {
  var _ref9 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee9(req, res) {
    return _regeneratorRuntime().wrap(function _callee9$(_context9) {
      while (1) switch (_context9.prev = _context9.next) {
        case 0:
          _context9.t0 = deleting("http://localhost:3000/api/user/deleteUser/" + req.body.email)
          // Resolving promise for response data
          ;
          _context9.t1 = res;
          _context9.next = 4;
          return fetchUsersData();
        case 4:
          _context9.t2 = _context9.sent;
          _context9.t3 = {
            users: _context9.t2
          };
          _context9.t4 = _context9.t1.render.call(_context9.t1, "users.ejs", _context9.t3);
          _context9.t0.then.call(_context9.t0, _context9.t4)["catch"](function (err) {
            return console.log(err);
          });
        case 8:
        case "end":
          return _context9.stop();
      }
    }, _callee9);
  }));
  return function (_x25, _x26) {
    return _ref9.apply(this, arguments);
  };
}());
app.post("/item", /*#__PURE__*/function () {
  var _ref10 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee10(req, res) {
    var data;
    return _regeneratorRuntime().wrap(function _callee10$(_context10) {
      while (1) switch (_context10.prev = _context10.next) {
        case 0:
          _context10.next = 2;
          return fetchItem(req.body.name);
        case 2:
          data = _context10.sent;
          res.render("Item", {
            data: data
          });
        case 4:
        case "end":
          return _context10.stop();
      }
    }, _callee10);
  }));
  return function (_x27, _x28) {
    return _ref10.apply(this, arguments);
  };
}());
function fetchItem(name) {
  return fetch("http://localhost:3000/api/innovations/" + name).then(function (res) {
    return res.json();
  });
}
app.use(_express["default"]["static"]("front"));
app.use((0, _cors["default"])({
  credentials: true
}));
// // set mongoose connection
// mongoose.connect("mongodb://localhost:27017/innovation")
//     .then(()=> console.log("connected to DB"))
//     .catch((err)=>{
//       console.log(err)
//     })
//

// use routers and tie all of these together
app.use("/api/innovations", _Innovations["default"]);
app.use("/api/user", _Users["default"]);
app.use("/api/login", _Auth["default"]);
// use routers for airlines and airports
app.use("/api/airport", _Airport["default"]);
app.use("/api/airline", _Airline["default"]);
// use routers for flights and bookings
app.use("/api/flight", _Flight["default"]);
// use routes for Payments
app.use("/api/payment", _Payment["default"]);
// user routes for Admins and Employees
app.use("/api/employee", _Employee["default"]);

// this is the first step of initializing the server while we make the application is listening to specific port
app.listen(port, function () {
  return console.log("Server is listening to port: ".concat(port));
});