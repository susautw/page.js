# page.js
A Single Page App helper

Put lib.js first Page.js second

Usage:
like this
> var pages = new pageHandler(pageSets:array);
pageSets is a array to defind a set of pages;
>>var pageSet = [pageSet,pageSet,.....]
>>a pageSet has some part:
>>>{name:str|required,url:str,content:str,element:HTMLElement,cloneNode:bool|false,onCreate:func|pass,onShow:func|pass,onHide:func|pass,onDistory:func|pass}

>>>name:A Identify to the page

>>>url,content,element:It is page's content,need one to create the page
>>>>url:will use Ajax to get content

>>>>content:A string of HTML to create content

>>>>element:A Exists HTMLElement move to page( or Copy the Element to the page ,if cloneNode is true)

>>>onCreate:call after page loaded (this,dom_content)

>>>onShow|onHide|onDistory : call after page Show | before page hide | before page removed  (this,dom_content)

pageHandler.add(replaceld,pageSet) : add a page to pageHandler(replace page ,if pageName exists and replaceOld is true)
pageHandler.remove(pagename) : remove a page with pagename
pageHandler.show(pagename) : show a page
pageHandler.getPageFragments(pagename) : get page fragments with pagename(a array of fragment)
pageHandler.setPageOnShow|setPageOnHide(pagename,callback) : change page onShow|onHide with pagename and callback

fragment : A unit in page,it can be changed
>fragment.update() : update the template in the fragment<br>
>fragment.setData() : set data.<br>
>fragment.getCurrentData() get data<br>

template: A part of fragment,it can write javascript and call like a function

Example:

&lt;fragment name="test">(name is needed)
 &lt;template&gt;
    if(data)return data;
    else return new Data().getTime();
   &lt;/template&gt;
data:
  &lt;template&gt;
    if(!data)
      return 'no data';
  &lt;/template&gt;
 &lt;/fragment&gt;
 
 >you can set data to change the fragment
