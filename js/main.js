"use strict";
var Maybelline;
(function (Maybelline) {
    var ServiceManager = (function () {
        function ServiceManager() {
            this._baseUrl = 'http://10.5.30.109:8093/';
        }
        ServiceManager.prototype.getAllItemsByPage = function (url, lastId, numberOfItems, tag, vm, succssCallback, errorCallback) {
            $('#loader').show();
            var returnData = [];
            $.ajax({
                url: "http://test.localhost/MaybellineWebRevamp/data/data.txt",
                type: "GET",
                data: {
                    id: lastId,
                    number: numberOfItems,
                    tags: tag
                },
                async: false,
                dataType: 'jsonp',
                jsonpCallback: 'jsonCallback',
                contentType: "application/json",
                timeout: 10000,
                success: function (response) {
                    $('#loader').hide();
                    returnData = response;
                    vm[succssCallback](returnData);
                },
                error: function (error) {
                    vm[errorCallback](error);
                }
            });
        };
        return ServiceManager;
    })();
    Maybelline.ServiceManager = ServiceManager;    
    var DefaultViewModel = (function () {
        function DefaultViewModel() {
            this._serviceManager = new ServiceManager();
            this.tagList = ko.observableArray([
                {
                    'name': 'Tag1',
                    'identifier': 'mm'
                }, 
                {
                    'name': 'Tag2',
                    'identifier': 'tag2'
                }, 
                {
                    'name': 'Tag3',
                    'identifier': 'tag3'
                }, 
                {
                    'name': 'Tag4',
                    'identifier': 'tag4'
                }
            ]);
            this.dataList = ko.observableArray();
            this._currentIndex = 1;
            this._currentTotalPages = 20;
            this._lastId = 0;
            this._currentFilter = '';
            this._currentNumOfItems = 20;
        }
        DefaultViewModel.prototype.templateCallback = function () {
            var designTemplate = '<li>' + '{{#page}}' + '<div class="item" data-url="{{mbllink}}">' + '<div class="overlay">' + '<div class="top">' + '<div class="title">{{description}}</div>' + '</div>' + '<div class="bottom">' + '<div class="likes">{{mblflowers}}</div>' + '<div class="comments">{{mblcoments}}</div>' + '</div>' + '</div>' + '<img class="lazy" src="img/blank.gif" data-src="{{imageupload}}" />' + '</div>' + '{{/page}}' + '</li>';
            return Hogan.compile(designTemplate);
        };
        DefaultViewModel.prototype.getDefaultItems = function () {
            this._serviceManager.getAllItemsByPage('AjaxMakeup.GetMakeupList.dubing', 1, this._currentNumOfItems, this._currentFilter, this, 'getItemsSuccess', 'getItemsError');
        };
        DefaultViewModel.prototype.getMoreItems = function () {
            this._serviceManager.getAllItemsByPage('AjaxMakeup.GetMakeupList.dubing', this._lastId, this._currentNumOfItems, this._currentFilter, this, 'getItemsSuccess', 'getItemsError');
        };
        DefaultViewModel.prototype.getItemsSuccess = function (data) {
            var pageData;
            for(var i = 0; i < data.pages.length; i++) {
                pageData = data.pages[i];
                this.dataList.push(pageData);
            }
            this._currentTotalPages = data.totalPages;
            applyCarousel(this);
            applyLazyLoading();
            applyLink();
        };
        DefaultViewModel.prototype.getItemsError = function (error) {
            console.log(error.message);
        };
        DefaultViewModel.prototype.getFilteredItems = function (identifier) {
            this._currentFilter = identifier;
            this._serviceManager.getAllItemsByPage('AjaxMakeup.GetMakeupList.dubing', 1, this._currentNumOfItems, this._currentFilter, this, 'filteredItemsSuccess', 'filteredItemsError');
        };
        DefaultViewModel.prototype.filteredItemsSuccess = function (data) {
            this._lastId = data[data.length - 1].id;
            for(var i = 0; i < this.dataList().length; i++) {
                var oldData = this.dataList()[i];
                var found = $.grep(data, function (n) {
                    return n.id === oldData.id;
                });
                if(found.length < 1) {
                    this.dataList.remove(oldData);
                    i--;
                }
            }
            applyLazyLoading();
            applyLink();
        };
        DefaultViewModel.prototype.filteredItemsError = function (data) {
            console.log(data.message);
        };
        DefaultViewModel.prototype.showMakeup = function (elem) {
            if(elem.nodeType === 1) {
            }
        };
        DefaultViewModel.prototype.loadPreviousPage = function () {
            this._currentIndex--;
            if(this._currentIndex < 1) {
                this._currentIndex = this._currentTotalPages;
            }
            $(':rs-carousel').carousel('prev');
        };
        DefaultViewModel.prototype.loadNextPage = function () {
            if(this._currentIndex === this._currentTotalPages) {
                this._currentIndex = 0;
            }
            this._currentIndex++;
            $(':rs-carousel').carousel('next');
        };
        DefaultViewModel.prototype.loadImagesInCurrentPage = function () {
            console.log(this._currentIndex);
        };
        return DefaultViewModel;
    })();
    Maybelline.DefaultViewModel = DefaultViewModel;    
    function applyCarousel(vm) {
        $('.rs-carousel').carousel({
            continuous: true,
            whitespace: true,
            pagination: false,
            nextPrevActions: false,
            itemsPerTransition: 1
        });
        $(':rs-carousel').on('carouselafter', function (event, data) {
            vm.loadImagesInCurrentPage();
        });
    }
    function applyLazyLoading(speed) {
        if (typeof speed === "undefined") { speed = 1000; }
        $('img.lazy[data-src]').jail({
            timeout: 300,
            speed: speed
        });
    }
    function applyLink() {
        $('.item').bind('click', function () {
            window.location = $(this).attr('data-url');
        });
    }
})(Maybelline || (Maybelline = {}));
$(document).ready(init);
function init() {
    var defaultVM = new Maybelline.DefaultViewModel();
    ko.applyBindings(defaultVM);
    defaultVM.getDefaultItems();
    $('#carousel-prev').bind('click', function () {
        defaultVM.loadPreviousPage();
    });
    $('#carousel-next').bind('click', function () {
        defaultVM.loadNextPage();
    });
}
//@ sourceMappingURL=main.js.map
