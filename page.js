var lib = new library();


function Template(content) {
    //[init]
    if (typeof content != 'string')
        throw new MissRequiredParamException('content');

    //private var
    var data;

    //create function
    this.fill = function () {
        var func = new Function("data", content);
        return func(data);
    };
    this.setData = function (_data) { data = _data };

    //makes the object read-only
    if (Object.freeze)
        Object.freeze(this);
}

function Fragment(native_content) {
    //[init]
    if (!(native_content instanceof HTMLElement)) {
        throw new MissRequiredParamException('native_content');
    }
    var $ = lib.$;

    if (checkFills([Object.assign, Array.prototype.forEach]));

    //exception
    function ContentParseFailException(msg) { this.message = msg };

    //private var
    var content;
    var backup;
    var placement = [];
    var templates = [];
    var onUpdate = pass;
    var data;

    //private getter
    this.getCurrentData = function () {
        return data;
    };

    if ($("warpper", native_content).length != 0)
        throw new ContentParseFailException("Unexpected warpper");

    content = document.createElement("warpper");
    content.appendChild(native_content.cloneNode(true));

    //public var
    this.name = $("warpper>fragment", content)[0].getAttribute('name');
    if (!this.name)
        throw new ContentParseFailException("Miss fragment name");


    
    (function () {
        var temps = $("warpper>fragment>template", content);
        temps.forEach(function (item) {
            var temp = new Template(item.innerHTML);
            item.innerHTML = "";
            templates.push(temp);
        });

        backup = content.innerHTML;
    })()

    //replace native content with a comment node
    var replace = document.createComment('Fragment point '+this.name);
        native_content.parentNode.replaceChild(replace,native_content);
        native_content = replace;


    //public methods
    this.setData = function (_data) {
        data = _data;
        templates.forEach(function (item) {
            item.setData(_data);
        })
    }

    this.setOnUpdate = function (callback) {
        if (!callback || typeof callback != 'function')
            return false;
        onUpdate = callback;
    }

    this.update = function () {
        content.innerHTML = backup;
        for (var key in placement) {
            placement[key].parentNode.removeChild(placement[key]);
        }

        placement = [];

        var temps = $("warpper>fragment>template", content);
        temps.forEach(function (item, index) {
            item.outerHTML = templates[index].fill() || "";
        });

        var frag = $("warpper>fragment", content)[0];

        var nodeHold = document.createDocumentFragment();
        frag.childNodes.forEach(function (item) {
            nodeHold.appendChild(item.cloneNode(true));
        });


        onUpdate(nodeHold); //new


        nodeHold.childNodes.forEach(function (item) {
            placement.push(item);
        });

        for (var key in placement) {
                native_content.parentNode.insertBefore(placement[key], native_content);
        }
    }

    //makes the object read-only
    if (Object.freeze)
        Object.freeze(this);
}

function Page(dataset) {
    if (typeof dataset != 'object')
        throw new MissRequiredParamException('dataset');
    var $ = lib.$;
    /*definations of dataset
        name :string //this page's name
        rootElement : Element //default:$('html')[0] ,a element used to put page
        pageWarpper : string //default:'body' ,this page's top element
        url : string //load the page with url
        content : string //load the page with HTML
        element : Element //load the page with a Element
        cloneNode : bool //default:false ,if you use element to load this page,you can select to copy the Node instead of directly use
        onCreate : func //default:pass, dispatch after preLoaded
        onShow : func //default:pass,call when page showing
        onHide : func //default:pass,call when page hidding
        onDistory : func //default:pass,call when page distory
    */

    //exception
    function FailToCreatePageException() { }
    function PageNotLoadedException() { }
    function RootElementHasBeenUsedException() { }

    var defaultData = { name: null, rootElement: $('html')[0], pageWarpper: 'body', url: null, content: null, element: null, cloneNode: false, onCreate: pass, onShow: pass, onHide: pass, onDistory: pass };
    var setting = Object.assign(defaultData, dataset);

    var content;
    var contentType;

    if (setting.url) {
        if (typeof setting.url != 'string')
            throw new TypeError('url is not string');
        contentType = 'url';
        content = setting.url;
    } else if (setting.content) {
        if (typeof setting.content != 'string')
            throw new TypeError('content is not string');
        contentType = 'html';
        content = setting.content;
    } else if (setting.element) {
        if (!(setting.element instanceof HTMLElement))
            throw new TypeError('element is not HTMLElement');
        contentType = 'element';
        content = setting.element;
    }

    if (!content)
        throw new MissRequiredParamException('url|content|element');
    if ((typeof setting.name == 'string') ? (setting.name.length <= 0) : (true))
        throw new MissRequiredParamException('name');
    if ((typeof setting.pageWarpper == 'string') ? (setting.pageWarpper.length <= 0 || setting.pageWarpper.indexOf(' ') != -1) : (true))
        throw new MissRequiredParamException('pageWarpper');

    if (!(setting.rootElement instanceof HTMLElement))
        throw new TypeError('rootElement is not HTMLElement')



    //private var
    var dom_content; //The Node in DOM
    var isShowing; //true : this page is visible /false: this page was hidden;
    var isLoaded = false; //set to true,if it preLoaded

    //private getter
    this.isLoaded = function () { return isLoaded; }
    this.isShowing = function () { return isShowing; }

    //public vars
    this.fragments = {}; //This Page's fragments
    this.name = setting.name; //A name use to point this page in Handler

    //private methods
    function parseContent(_t) {
        $("fragment", dom_content).forEach(function (item) {
            var frag = new Fragment(item);
            _t.fragments[frag.name] = frag;
        });
        delete content;
        delete contentType;
    }

    function onPageCreate(_t) {
        function nodeScriptReplace(node) {
            if (nodeScriptIs(node) === true) {
                node.parentNode.replaceChild(nodeScriptClone(node), node);
            }
            else {
                var i = 0;
                var children = node.childNodes;
                while (i < children.length) {
                    nodeScriptReplace(children[i++]);
                }
            }

            return node;
        }
        function nodeScriptIs(node) {
            return node.tagName === 'SCRIPT';
        }
        function nodeScriptClone(node) {
            var script = document.createElement("script");
            script.text = node.innerHTML;
            for (var i = node.attributes.length - 1; i >= 0; i--) {
                script.setAttribute(node.attributes[i].name, node.attributes[i].value);
            }
            return script;
        }
        isShowing = false;
        nodeScriptReplace(dom_content);
        setting.onCreate(_t, dom_content);
    }


    this.preLoad = function (callback) {
        if (isLoaded)
            return true;
        if (contentType == 'url') {
            dom_content = document.createElement(setting.pageWarpper);
            dom_content.setAttribute("name", setting.name);
            var _t = this;
            lib.XHRequest({
                url: content, dataType: "text", success: function (data) {
                    dom_content.innerHTML = data;
                    parseContent(_t);
                    isLoaded = true;
                    onPageCreate(_t);
                    try { callback(_t, dom_content) } catch (e) { }
                }, error: function () { throw new FailToCreatePageException; }
            });
            return;
        }

        if (contentType == 'html') {
            dom_content = document.createElement(setting.pageWarpper);
            dom_content.setAttribute("name", setting.name);
            dom_content.classList.add("lib_page");
            dom_content.innerHTML = content;
            parseContent(this);
            isLoaded = true;
            onPageCreate(this);
            try { callback(_t, dom_content) } catch (e) { }
            return;
        }

        if (contentType == 'element') {
            dom_content = document.createElement(setting.pageWarpper);
            dom_content.setAttribute("name", setting.name);
            dom_content.classList.add("lib_page");
            dom_content.appendChild((setting.cloneNode) ? content.cloneNode(true) : content);
            parseContent(this);
            isLoaded = true;
            onPageCreate(this);
            try { callback(_t, dom_content) } catch (e) { }
            return;
        }

    }

    this.show = function (callback) {
        if (callback != undefined && typeof callback == 'function') {
            setting.onShow = callback;
            return;
        }

        if (!isLoaded)
            throw new PageNotLoadedException;
        if (isShowing)
            return true;

        var test_root = $(setting.pageWarpper, setting.rootElement);
        if (test_root.length > 1)
            throw new RootElementHasBeenUsedException;
        if (test_root.length > 0) {
            if (test_root[0].getAttribute('name') == null)
                test_root[0].parentNode.removeChild(test_root[0]);
            else
                return false;
        }
        try {
            setting.onShow(this, dom_content);
        } catch (e) { }
        setting.rootElement.appendChild(dom_content);
        isShowing = true;
        return true;
    }

    this.hide = function (callback) {
        if (callback != undefined && typeof callback == 'function') {
            setting.onHide = callback;
            return;
        }

        if (!isLoaded)
            throw new PageNotLoadedException;
        if (!isShowing)
            return;
        try {
            setting.rootElement.removeChild(dom_content);
        } catch (e) { }
        try {
            setting.onHide(this, dom_content);
        } catch (e) { }
        isShowing = false;

    }

    this.distory = function () {
        if (!isLoaded)
            throw new PageNotLoadedException;
        if (isShowing)
            return false;
        setting.onDistory(this, dom_content);
        try {
            dom_content.parentNode.removeChild(dom_content);
        } catch (e) { }
        delete isLoaded;
        delete isShowing;
        delete dom_content;
        delete setting;
        return true;
    }
}

function pageHandler(firstPage, pageSets) {
    //private vars
    var pages = {};
    var showing;
    //private functions
    function createPage(pageSet, replaceOld) {
        try {
            var page = new Page(pageSet);
            if (pages[page.name] == undefined || (replaceOld && pages[page.name] != showing))
                pages[page.name] = page;
        } catch (e) { }
    }


    if (!pageSets)
        throw new MissRequiredParamException('pageSets');
    if (!firstPage || typeof firstPage != 'string' || firstPage.length <= 0)
        throw new MissRequiredParamException('firstPage');

    if (!Array.isArray(pageSets))
        throw new TypeError('pages is not array');

    pageSets.forEach(function (item) {
        createPage(item);
    });

    //public functions
    this.remove = function (pagename) {
        if (!pagename || typeof pagename != string || pagename.length == 0 || !pages[pagename])
            return false;
        if (!pages[pagename].isLoaded() || pagename == showing)
            return false;
        pages[pagename].distory();
        pages[pagename] = undefined;
        delete pages[pagename];
        return true;
    }

    this.add = function (replaceOld, pageSet) {
        createPage(pageSet, replaceOld);
    }


    this.show = function (pagename) {
        var _t = this;
        if (!pagename || typeof pagename != 'string' || pagename.length == 0 || !pages[pagename])
            return false;
        if (pages[pagename].isLoaded()) {
            if (pagename == showing)
                return true;
            if (showing != undefined) {
                pages[showing].hide();
            }
            pages[pagename].show();
            showing = pagename;
        } else {
            try {
                pages[pagename].preLoad(function () { _t.show(pagename) });
            } catch (e) {
                return false;
            }
        }
        return true;
    }

    this.getPageFragments = function (pagename) {
        if (!pagename || typeof pagename != 'string' || pagename.length == 0 || !pages[pagename])
            return false;
        return pages[pagename].fragments;
    }

    this.setPageOnShow = function (pagename, callback) {
        if (!pagename || typeof pagename != 'string' || pagename.length == 0 || !pages[pagename])
            return false;
        if (callback != undefined && typeof callback == 'function')
            return false;
        pages[pagename].show(callback);
        return true;
    }

    this.setPageOnHide = function (pagename, callback) {
        if (!pagename || typeof pagename != 'string' || pagename.length == 0 || !pages[pagename])
            return false;
        if (callback != undefined && typeof callback == 'function')
            return false;
        pages[pagename].hide(callback);
        return true;
    }
    this.show(firstPage);
}

(function () {
    var $ = lib.$;
    var style = document.createElement('style');
    style.innerHTML = "fragment{display:none;}";
    $('head')[0].appendChild(style);
})()