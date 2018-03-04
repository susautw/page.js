# page.js
A Single Page App helper

## Quick Start Guide

### Include in Your HTML
``` HTML
<script src="lib.js"></script>
<script src="page.js"></script>
```
### Usage
```javascript
var pageSet1 = {
  name: 'name',
  url: 'url',
  content: 'content',
  element: HTMLElement,
  cloneNode: bool,
  onCreate: onCreate(),
  onShow: onShow(),
  onHide: onHide(),
  onDistory: onDistory(),
};
 ...
var pageSets = [pageSet1, pageSet2, ...]; 
//firstPage is a name in pageSets,firstPage will load when pageHandler Created.
var pages = new pageHandler(firstPage,pageSets);
```
## Common Props

| Prop | Type | Description |
|---|---|---|
|**`name *`**|String|An identify to the page.|
|**`url`**|String|An url to make an Ajax call.|
|**`content`**|String|A string of HTML to create content.|
|**`element`**|HTMLElement|An Element copy or put it to page|
|**`cloneNode`**|bool|if true will copy the Element to the page.|
|**`onCreate`**|function|Called after page loaded.|
|**`onShow`**|function|Called before page show.|
|**`onHide`**|function|Called after page hide.|
|**`onDestroy`**|function|Called before page removed.|

`* Required`
`Need to choose one between url,content and element`

## Common Behavior

### pageHandler

``` javascript
pageHandler.add();
```

| Function | Parameter | Description |
|---|---|---|
|add|replaceOld, pageSet|Add a page to pageHandler.(Will replace page, if pageName exists and replaceOld is set to true.)|
|remove|pagename|Remove a page with pagename.|
|show|pagename|Show a page.|
|getPageFragments|pagename|Get page fragments with pagename(An array of fragment).|
|setPageOnShow|pagename, callback|Change page before page show with pagename and callback.|
|setPageOnHide|pagename, callback|Change page before page removed with pagename and callback.|

### fragment
A unit in page,it can be changed

```javascript
var fragments pageHandler.getPageFragments('name');
var fragment = fragments['test'] //use fragment name to access

fragment.update();
fragment.setData(data);
fragment.getCurrentData();
```

| Function | Parameter | Description |
|---|---|---|
|update| - |Update the template in the fragment.|
|setData| data |Set data.|
|getCurrentData| - |Get data.|

### template
A part of fragment, it can write javascript and call like a function.

## Example

``` HTML
<fragment name="test">
  <template>
    if(data)
     return data;
    else
     return new Date().getTime();
  </template>
  <template>
    if(!data)
     return 'no data';
  </template>
 here can write something
</fragment>
```
>You can set data to change the fragment. \
`A funny Demo?` http://susautw-rin.qov.tw/page.js_demo/?i=1
