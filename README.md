# page.js
A Single Page App helper

## Quick Start Guide

### Include in Your HTML
``` HTML
<script src="lib.js"></script>
<script src="Page.js"></script>
```
### Usage
```javascript
const pages = new pageHandler(pageSets);
const pageSets = [pageSet1, pageSet2, ...];
const pageSet1 = {
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
```
## Common Props

| Prop | Type | Description |
|---|---|---|
|**`name *`**|String|An identify to the page.|
|**`url`**|String|An url to make an Ajax call.|
|**`content`**|String|A string of HTML to create content.|
|**`element`**|HTML Element|The TextInput component.|
|**`cloneNode`**|bool|if true will copy the Element to the page.|
|**`onCreate`**|function|Called after page loaded.|
|**`onShow`**|function|Called before page show.|
|**`onHide`**|function|Called before page hide.|
|**`onDestroy`**|function|Called before page removed.|

`* Required`

## Common Behavior

### pageHandler

``` javascript
pageHandler.add();
```

| Function | Parameter | Description |
|---|---|---|
|add|replaceld, pageSet|Add a page to pageHandler.(Will replace page, if pageName exists and replaceld is set to true.)|
|remove|pagename|Remove a page with pagename.|
|show|pagename|Show a page.|
|getPageFragments|pagename|Get page fragments with pagename(An array of fragment).|
|setPageOnShow|pagename, callback|Change page before page show with pagename and callback.|
|setPageOnHide|pagename, callback|Change page before page removed with pagename and callback.|

### fragment
A unit in page,it can be changed

```javascript
fragment.update();
```

| Function | Description |
|update|Update the template in the fragment.|
|setData|Set data.|
|getCurrentData|Get data.|

### template
A part of fragment, it can write javascript and call like a function.

## Example

``` HTML
<fragment name="test">
  <template>
    data || new Date().getTime();
  </template>
  <template>
    !data && 'no data';
  </template>
</fragment>
```
>You can set data to change the fragment.
