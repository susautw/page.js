var pass;
var animation;
var MissRequiredParamException;
var NeedPolyfillException;
var checkFills;

document.createElement('fragment');
document.createElement('template');
document.createElement('warpper');

function library(polyfill_on) {
    //[init]
    if (polyfill_on == undefined)
        polyfill_on = true;

    //private
    var polyfilled = false;
    this.polyfilled = 87;

    //exceptions
    NeedPolyfillException = function () { }
    MissRequiredParamException = function (need) {
        if (typeof need == 'string')
            this.message = need;
        else
            this.message = null;
    }
    function BreakException() { }

    //private methods
    checkFills = function (needs) {
        //[init]
        if (needs == undefined)
            needs = [];

        var result = true;
        try {
            needs.forEach(function (need) {
                if (need == undefined) {
                    result = false;
                    throw new BreakException;
                }
            });
        } catch (e) { }
        return result;
    }



    //polyfills
    this.polyfill = function () {
        if (polyfilled)
            return;

        //EventListener
        (function () {
            if (!Event.prototype.preventDefault) {
                Event.prototype.preventDefault = function () {
                    this.returnValue = false;
                };
            }
            if (!Event.prototype.stopPropagation) {
                Event.prototype.stopPropagation = function () {
                    this.cancelBubble = true;
                };
            }
            if (!Element.prototype.addEventListener) {
                var eventListeners = [];

                var addEventListener = function (type, listener /*, useCapture (will be ignored) */) {
                    var self = this;
                    var wrapper = function (e) {
                        e.target = e.srcElement;
                        e.currentTarget = self;
                        if (typeof listener.handleEvent != 'undefined') {
                            listener.handleEvent(e);
                        } else {
                            listener.call(self, e);
                        }
                    };
                    if (type == "DOMContentLoaded") {
                        var wrapper2 = function (e) {
                            if (document.readyState == "complete") {
                                wrapper(e);
                            }
                        };
                        document.attachEvent("onreadystatechange", wrapper2);
                        eventListeners.push({ object: this, type: type, listener: listener, wrapper: wrapper2 });

                        if (document.readyState == "complete") {
                            var e = new Event();
                            e.srcElement = window;
                            wrapper2(e);
                        }
                    } else {
                        this.attachEvent("on" + type, wrapper);
                        eventListeners.push({ object: this, type: type, listener: listener, wrapper: wrapper });
                    }
                };
                var removeEventListener = function (type, listener /*, useCapture (will be ignored) */) {
                    var counter = 0;
                    while (counter < eventListeners.length) {
                        var eventListener = eventListeners[counter];
                        if (eventListener.object == this && eventListener.type == type && eventListener.listener == listener) {
                            if (type == "DOMContentLoaded") {
                                this.detachEvent("onreadystatechange", eventListener.wrapper);
                            } else {
                                this.detachEvent("on" + type, eventListener.wrapper);
                            }
                            eventListeners.splice(counter, 1);
                            break;
                        }
                        ++counter;
                    }
                };
                Element.prototype.addEventListener = addEventListener;
                Element.prototype.removeEventListener = removeEventListener;
                if (HTMLDocument) {
                    HTMLDocument.prototype.addEventListener = addEventListener;
                    HTMLDocument.prototype.removeEventListener = removeEventListener;
                }
                if (Window) {
                    Window.prototype.addEventListener = addEventListener;
                    Window.prototype.removeEventListener = removeEventListener;
                }
            }
        })();

        //Element.matches
        this.Element && function (ElementPrototype) {
            ElementPrototype.matches = ElementPrototype.matches ||
                ElementPrototype.matchesSelector ||
                ElementPrototype.webkitMatchesSelector ||
                ElementPrototype.msMatchesSelector ||
                function (selector) {
                    var node = this, nodes = (node.parentNode || node.document).querySelectorAll(selector), i = -1;
                    while (nodes[++i] && nodes[i] != node);
                    return !!nodes[i];
                }
        }(Element.prototype);


        //Object.assign
        if (typeof Object.assign != 'function') {
            Object.assign = function (target, varArgs) { // .length of function is 2
                'use strict';
                if (target == null) { // TypeError if undefined or null
                    throw new TypeError('Cannot convert undefined or null to object');
                }

                var to = Object(target);

                for (var index = 1; index < arguments.length; index++) {
                    var nextSource = arguments[index];

                    if (nextSource != null) { // Skip over if undefined or null
                        for (var nextKey in nextSource) {
                            // Avoid bugs when hasOwnProperty is shadowed
                            if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                                to[nextKey] = nextSource[nextKey];
                            }
                        }
                    }
                }
                return to;
            };
        }

        //Array.isArray
        if (!Array.isArray) {
            Array.isArray = function (arg) {
                return Object.prototype.toString.call(arg) === '[object Array]';
            };
        }

        //Object.defineProperty
        (function () {
            if (!Object.defineProperty || !(function () { try { Object.defineProperty({}, 'x', {}); return true; } catch (e) { return false; } }())) {
                var orig = Object.defineProperty;
                Object.defineProperty = function (o, prop, desc) {
                    // In IE8 try built-in implementation for defining properties on DOM prototypes.
                    if (orig) { try { return orig(o, prop, desc); } catch (e) { } }
                    if (o !== Object(o)) { throw TypeError("Object.defineProperty called on non-object"); }
                    if (Object.prototype.__defineGetter__ && ('get' in desc)) {
                        Object.prototype.__defineGetter__.call(o, prop, desc.get);
                    }
                    if (Object.prototype.__defineSetter__ && ('set' in desc)) {
                        Object.prototype.__defineSetter__.call(o, prop, desc.set);
                    }
                    if ('value' in desc) {
                        o[prop] = desc.value;
                    }
                    return o;
                };
            }
        }());

        //forEach
        !Array.prototype.forEach && (function () {
            Array.prototype.forEach = function (callback/*, thisArg*/) {

                var T, k;

                if (this == null) {
                    throw new TypeError('this is null or not defined');
                }
                var O = Object(this);
                var len = O.length >>> 0;

                if (typeof callback !== 'function') {
                    throw new TypeError(callback + ' is not a function');
                }

                if (arguments.length > 1) {
                    T = arguments[1];
                }

                k = 0;

                while (k < len) {
                    var kValue;
                    if (k in O) {
                        kValue = O[k];
                        callback.call(T, kValue, k, O);
                    }
                    k++;
                }
            };
        })();

        if (!NodeList.prototype.forEach) {
            NodeList.prototype.forEach = Array.prototype.forEach;
        }
        

        //addEventListener for NodeList
        !NodeList.prototype.addEventListener && (function () {
            NodeList.prototype.addEventListener = function (event, func) {
                this.forEach(function (content) {
                    content.addEventListener(event, func);
                });
            }
        })();

        //css support
        !HTMLElement.prototype.css && (function () {
            HTMLElement.prototype.css = function (map/*attr,value*/) {
                var css;
                if (typeof map != 'string') {
                    css = Object(map);
                } else {
                    if (arguments.length > 1) {
                        if (typeof arguments[1] != 'string')
                            throw new TypeError('argument value not string');
                        css = {};
                        css[map] = arguments[1];
                    } else
                        throw new MissRequiredParamException('value');
                    var target = this;
                    for (var attr in css) {
                        target.style[attr] = css[attr];
                    }
                }
            }
        })();

        !NodeList.prototype.css && (function () {
            NodeList.prototype.css = function (map, value) {
                this.forEach(function (content) {
                    content.css(map, value);
                });
            }
        })();

        //NodeList toArray
        !NodeList.prototype.toArray && (function () {
            NodeList.prototype.toArray = function () {
                return Array.prototype.slice.call(this);
            }
        })();

        //classlist
        if ("document" in self) {

            // Full polyfill for browsers with no classList support
            if (!("classList" in document.createElement("_"))) {

                (function (view) {

                    "use strict";

                    if (!('Element' in view)) return;

                    var
                        classListProp = "classList"
                        , protoProp = "prototype"
                        , elemCtrProto = view.Element[protoProp]
                        , objCtr = Object
                        , strTrim = String[protoProp].trim || function () {
                            return this.replace(/^\s+|\s+$/g, "");
                        }
                        , arrIndexOf = Array[protoProp].indexOf || function (item) {
                            var
                                i = 0
                                , len = this.length
                                ;
                            for (; i < len; i++) {
                                if (i in this && this[i] === item) {
                                    return i;
                                }
                            }
                            return -1;
                        }
                        // Vendors: please allow content code to instantiate DOMExceptions
                        , DOMEx = function (type, message) {
                            this.name = type;
                            this.code = DOMException[type];
                            this.message = message;
                        }
                        , checkTokenAndGetIndex = function (classList, token) {
                            if (token === "") {
                                throw new DOMEx(
                                    "SYNTAX_ERR"
                                    , "An invalid or illegal string was specified"
                                );
                            }
                            if (/\s/.test(token)) {
                                throw new DOMEx(
                                    "INVALID_CHARACTER_ERR"
                                    , "String contains an invalid character"
                                );
                            }
                            return arrIndexOf.call(classList, token);
                        }
                        , ClassList = function (elem) {
                            var
                                trimmedClasses = strTrim.call(elem.getAttribute("class") || "")
                                , classes = trimmedClasses ? trimmedClasses.split(/\s+/) : []
                                , i = 0
                                , len = classes.length
                                ;
                            for (; i < len; i++) {
                                this.push(classes[i]);
                            }
                            this._updateClassName = function () {
                                elem.setAttribute("class", this.toString());
                            };
                        }
                        , classListProto = ClassList[protoProp] = []
                        , classListGetter = function () {
                            return new ClassList(this);
                        }
                        ;
                    // Most DOMException implementations don't allow calling DOMException's toString()
                    // on non-DOMExceptions. Error's toString() is sufficient here.
                    DOMEx[protoProp] = Error[protoProp];
                    classListProto.item = function (i) {
                        return this[i] || null;
                    };
                    classListProto.contains = function (token) {
                        token += "";
                        return checkTokenAndGetIndex(this, token) !== -1;
                    };
                    classListProto.add = function () {
                        var
                            tokens = arguments
                            , i = 0
                            , l = tokens.length
                            , token
                            , updated = false
                            ;
                        do {
                            token = tokens[i] + "";
                            if (checkTokenAndGetIndex(this, token) === -1) {
                                this.push(token);
                                updated = true;
                            }
                        }
                        while (++i < l);

                        if (updated) {
                            this._updateClassName();
                        }
                    };
                    classListProto.remove = function () {
                        var
                            tokens = arguments
                            , i = 0
                            , l = tokens.length
                            , token
                            , updated = false
                            , index
                            ;
                        do {
                            token = tokens[i] + "";
                            index = checkTokenAndGetIndex(this, token);
                            while (index !== -1) {
                                this.splice(index, 1);
                                updated = true;
                                index = checkTokenAndGetIndex(this, token);
                            }
                        }
                        while (++i < l);

                        if (updated) {
                            this._updateClassName();
                        }
                    };
                    classListProto.toggle = function (token, force) {
                        token += "";

                        var
                            result = this.contains(token)
                            , method = result ?
                                force !== true && "remove"
                                :
                                force !== false && "add"
                            ;

                        if (method) {
                            this[method](token);
                        }

                        if (force === true || force === false) {
                            return force;
                        } else {
                            return !result;
                        }
                    };
                    classListProto.toString = function () {
                        return this.join(" ");
                    };

                    if (objCtr.defineProperty) {
                        var classListPropDesc = {
                            get: classListGetter
                            , enumerable: true
                            , configurable: true
                        };
                        try {
                            objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
                        } catch (ex) { // IE 8 doesn't support enumerable:true
                            if (ex.number === -0x7FF5EC54) {
                                classListPropDesc.enumerable = false;
                                objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
                            }
                        }
                    } else if (objCtr[protoProp].__defineGetter__) {
                        elemCtrProto.__defineGetter__(classListProp, classListGetter);
                    }

                }(self));

            } else {
                // There is full or partial native classList support, so just check if we need
                // to normalize the add/remove and toggle APIs.

                (function () {
                    "use strict";

                    var testElement = document.createElement("_");

                    testElement.classList.add("c1", "c2");

                    // Polyfill for IE 10/11 and Firefox <26, where classList.add and
                    // classList.remove exist but support only one argument at a time.
                    if (!testElement.classList.contains("c2")) {
                        var createMethod = function (method) {
                            var original = DOMTokenList.prototype[method];

                            DOMTokenList.prototype[method] = function (token) {
                                var i, len = arguments.length;

                                for (i = 0; i < len; i++) {
                                    token = arguments[i];
                                    original.call(this, token);
                                }
                            };
                        };
                        createMethod('add');
                        createMethod('remove');
                    }

                    testElement.classList.toggle("c3", false);

                    // Polyfill for IE 10 and Firefox <24, where classList.toggle does not
                    // support the second argument.
                    if (testElement.classList.contains("c3")) {
                        var _toggle = DOMTokenList.prototype.toggle;

                        DOMTokenList.prototype.toggle = function (token, force) {
                            if (1 in arguments && !this.contains(token) === !force) {
                                return force;
                            } else {
                                return _toggle.call(this, token);
                            }
                        };

                    }

                    testElement = null;
                }());

            }

        }

        (function(w) {
            if (w.FormData)
                return;
            function FormData() {
                this.fake = true;
                this.boundary = "--------FormData" + Math.random();
                this._fields = [];
            }
            FormData.prototype.append = function(key, value) {
                this._fields.push([key, value]);
            }
            FormData.prototype.toString = function() {
                var boundary = this.boundary;
                var body = "";
                this._fields.forEach(function(field) {
                    body += "--" + boundary + "\r\n";
                    // file upload
                    if (field[1].name) {
                        var file = field[1];
                        body += "Content-Disposition: form-data; name=\""+ field[0] +"\"; filename=\""+ file.name +"\"\r\n";
                        body += "Content-Type: "+ file.type +"\r\n\r\n";
                        body += file.getAsBinary() + "\r\n";
                    } else {
                        body += "Content-Disposition: form-data; name=\""+ field[0] +"\";\r\n\r\n";
                        body += field[1] + "\r\n";
                    }
                });
                body += "--" + boundary +"--";
                return body;
            }
            w.FormData = FormData;
        })(window);


        polyfilled = true;
    }

    if (polyfill_on)
        this.polyfill();

    //private functions
    function addEvent(el, type, handler) {
        if (el.attachEvent) el.attachEvent('on'+type, handler); else el.addEventListener(type, handler);
    }

    //globle functions
    this.$ = function (_selector, _element) {
        //[init]
        if (_element == undefined)
            _element = document;

        return _element.querySelectorAll(_selector);
    }

    pass = function () { };

    animation = function (element, name, duration, delay, direction) {
        if (!(element instanceof Node))
            return;
        element.style.animationName = name;
        element.style.animationDuration = duration;
        element.style.animationDelay = delay;
        element.style.animationDirection = direction;
    }

    //public functions

    this.XHRequest = function (dataset) {
        if (!checkFills([Object.assign]))
            throw new NeedPolyfillException;

        var param = Object.assign({ url: "/", method: "GET", data: null, dataType: "json", success: pass, error: pass }, dataset);
        /*about _error(_code)
          error code that represent what happened on Request Executing
    
          -1 : fail to create XHR object
          -2 : fail to parse Json data
          -3 : unknown respones dataType
    
          and HTTP status codes!
        
        */

        function createXMLHTTPObject() {

            var XMLHttpFactories = [
                function () { return new XMLHttpRequest() },
                function () { return new ActiveXObject("Msxml3.XMLHTTP") },
                function () { return new ActiveXObject("Msxml2.XMLHTTP.6.0") },
                function () { return new ActiveXObject("Msxml2.XMLHTTP.3.0") },
                function () { return new ActiveXObject("Msxml2.XMLHTTP") },
                function () { return new ActiveXObject("Microsoft.XMLHTTP") }
            ];
            var xmlhttp = false;
            for (var i = 0; i < XMLHttpFactories.length; i++) {
                try {
                    xmlhttp = XMLHttpFactories[i]();
                }
                catch (e) {
                    continue;
                }
                break;
            }
            return xmlhttp;
        }

        var xhr = createXMLHTTPObject();
        if (!xhr)
            _error(-1);

        var form_data = new FormData();
        if (param.data instanceof Object) {
            for (var key in param.data) {
                form_data.append(key, param.data[key]);
            }
        }
        //bind events
        var readyStateChange = function (res) {
            if (res.readyState == 4) {
                if (res.status == 200) {
                    var data = null;
                    switch (param.dataType.toLowerCase()) {
                        case "json": try {
                            data = JSON.parse(res.responseText);
                        } catch (e) { param.error(-2) }
                            break;
                        case "text": data = res.responseText; break;
                        case "xml": data = res.responseXML; break;
                        default: param.error(-3); return false;
                    }
                    param.success(data);
                } else {
                    param.error(res.status);
                }
            }
        }

        xhr.onreadystatechange = function () { readyStateChange(this) };
        //start connect & send data
        xhr.open(param.method, param.url + ((/\?/).test(param.url) ? "&" : "?") + (new Date()).getTime());
        xhr.send(form_data);
    }

    this.live = function (selector, event, callback, context) {
        addEvent(context || document, event, function(e) {
            var found, el = e.target || e.srcElement;
            while (el && el.matches && el !== context && !(found = el.matches(selector))) el = el.parentElement;
            if (found) callback.call(el, e);
        });
    }
    //public inner prototypes

    //swicher
    this.switcher = function (options) {
        if (!checkFills([Object.assign, Array.isArray, Object.defineProperty, Array.prototype.remove, NodeList.prototype.forEach, NodeList.prototype.toArray, HTMLElement.prototype.css]))
            throw new NeedPolyfillException;

        var setting = Object.assign({ elements: null, position: 0, default_animation: {}, before: pass, after: pass }, options);
        if (!(setting.elements instanceof NodeList || Array.isArray(setting.elements)))
            throw new MissRequiredParamException('elements');

        if (setting.elements.toArray)
            setting.elements = setting.elements.toArray();

        //exceptions
        function ElementsEmptyException() { }
        function PositionOutOfRangeException(pos) { if (pos) { this.message = "Positiom " + pos + " is not in range" } }
        //private var
        var elements = setting.elements;
        var length = (elements.length != 0) ? elements.length : (function () { throw new ElementsEmptyException })();
        var position = (setting.position >= length) ? 0 : setting.position;

        //private vars getter
        this.length = function () { return length };
        this.position = function () { return position };

        //public var
        this.before = setting.before;
        this.after = setting.after;


        //private functions

        //public prototypes
        this.add = function (element) {
            try {
                return (element instanceof HTMLElement) && ((length = elements.push(element)) > 0);
            } catch (e) {
                return false;
            }
        }

        this.remove = function (pos) {
            try {
                return !isNaN(pos) && (elements[pos] != undefined) && (function () { if ((length > 1)) { return Boolean(length = elements.remove(pos)) } else { throw new ElementsEmptyException; } })();
            } catch (e) {
                return false;
            }
        }

        this.switchTo = function (pos) {
            if (isNaN(pos))
                throw new TypeError("NaN is not a position");
            pos = Number(pos);
            if (pos >= length || pos < 0)
                throw new PositionOutOfRangeException(pos);
            elements.forEach(function (element, pos) {
                element.css('display', 'none');
            });
            elements[Number(pos)].css('display', 'block');
            position = pos;
        }

        this.next = function () {
            this.switchTo(position + 1);
        }

        this.last = function () {
            this.switchTo(position - 1);
        }

        this.release = function () {
            elements.forEach(function (element) {
                element.style = null;
            });
        }

        this.switchTo(position);
        //makes the object read-only
        if (Object.freeze)
            Object.freeze(this);

    }

    //makes the object read-only
    if (Object.freeze)
        Object.freeze(this);
}

