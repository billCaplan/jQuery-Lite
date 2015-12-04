(function(){

  var queue = [function(){ alert('Your Document is ready!') }];

  var executeQueueFunctions = function() {
    queue.forEach(function(f){
      f();
    });
  };

  window.$l = function(selector) {
    if (typeof(selector) === 'function') {
      if (document.readystate === 'complete') {
        selector();
      } else {
        queue.push(selector);
      }
    } else if (selector instanceof HTMLElement) {
      return new DOMNodeCollection([selector]);
    } else {
      var NodeList = document.querySelectorAll(selector);
      var HTMLElements = [].slice.call(NodeList);

      return new DOMNodeCollection(HTMLElements);
    }
  };

  window.$l.extend = function() {
    var args = [].slice.call(arguments);
    result = args.shift();
    args.forEach(function(arg) {
      for(var property in arg) {
        result[property] = arg[property];
      }
    });
    return result;
  }

  window.$l.ajax = function(settings) {
    var defaultSettings = {
      success: function(){ console.log("success") },
      error: function(errcode) { alert("There was an error of type " + errcode) },
      url: "",
      method: "GET",
      data: {},
      contentType: 'application/x-www-form-urlencoded; charset=UTF-8'
    }

    options = window.$l.extend(defaultSettings, settings)
    // merge defaultSettings with settings

    var xmlhttp;

    if (window.XMLHttpRequest) {
      xmlhttp = new XMLHttpRequest();
    } else {
      xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }

    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == XMLHttpRequest.DONE) {
        if (xmlhttp.status == 200) {
          console.log("Success!");
        } else {
          options.error(xmlhttp.status);
        }
      }
    }

    var f = function() {
      console.log(this.responseText);
    }
    xmlhttp.addEventListener('load', f)
    xmlhttp.open(options.method, options.url, true);
    xmlhttp.send();
  }

  document.addEventListener('readystatechange', function(e){
    if (document.readyState === 'complete') {
      executeQueueFunctions();
    }
  });

  var DOMNodeCollection = function(HTMLElements) {
    this.HTMLElements = HTMLElements;
  };

  DOMNodeCollection.prototype.html = function (html){
      if (typeof html !== 'undefined') {
        this.HTMLElements.forEach(function(el){
          el.innerHTML = html;
        });
      } else {
        return this.HTMLElements[0].innerHTML;
      }
  };

  DOMNodeCollection.prototype.empty = function (){
      this.html("");
  };

  DOMNodeCollection.prototype.append = function(object) {
    if (typeof(object) === 'string') {
      this.HTMLElements.forEach(function(el){
        el.innerHTML = el.innerHTML + object;
      });
    } else if (typeof(object) === 'DOMNodeCollection'){
      var appendedHTML = "";
      object.HTMLElements.forEach(function(el){
        appendedHTML += el.outerHTML;
      });
      this.HTMLElements.forEach(function(el){
        el.innerHTML += appendedHTML;
      });
    } else {
      this.HTMLElements.forEach(function(el){
        el.innerHTML = el.innerHTML + object.outerHTML;
      });
    }
  };


  DOMNodeCollection.prototype.attr = function(selector, newvalue) {
    if (typeof(newvalue) === 'undefined') {
      return this.HTMLElements[0].attributes[selector];
    } else {
      this.HTMLElements.forEach(function(el){
        el.attributes[selector] = newvalue;
      });
    }
  };

  DOMNodeCollection.prototype.addClass = function(newClass) {
    this.HTMLElements.forEach(function(el) {
      el.add(newClass);
    })
  };

  DOMNodeCollection.prototype.removeClass = function(oldClass) {
    this.HTMLElements.forEach(function(el) {
      el.remove(oldClass);
    });
  };


  DOMNodeCollection.prototype.children = function () {
    var result = [];
    for(var i = 0; i < this.HTMLElements.length; i++) {
      for(var j = 0; j < this.HTMLElements[i].children.length; j++) {
        result.push(this.HTMLElements[i].children[j]);
      }
    }
    return new DOMNodeCollection(result);
  };

  DOMNodeCollection.prototype.parents = function () {
    var result = [];
    for(var i = 0; i < this.HTMLElements.length; i++) {
      result.push(this.HTMLElements[i].parentElement);
    }
    return new DOMNodeCollection(result);
  };

  DOMNodeCollection.prototype.find = function(selector) {
    var NodeList = [];
    this.HTMLElements.forEach(function(el){
      var newNodes = el.querySelectorAll(selector);
      newNodes = [].slice.call(newNodes);
      NodeList = NodeList.concat(newNodes);
    })
    return new DOMNodeCollection(NodeList);
  };

  DOMNodeCollection.prototype.remove = function() {
    this.HTMLElements.forEach(function(el){
      el.remove();
    });
  }

  DOMNodeCollection.prototype.on = function(events, selector, data, handler) {
    if (selector !== null) {
      var descendents = this.find(selector);
    } else {
      var descendents = this;
    }
    descendents.HTMLElements.forEach(function(el){
      var eventList = events.split(' ');
      eventList.forEach(function(e){
        // add data;
        el.addEventListener(e, handler);
      });
    });
  }

  DOMNodeCollection.prototype.off = function(type, listener) {
    this.HTMLElements.forEach(function(el){
      el.removeEventListener(type, listener);
    });
  }

})();
