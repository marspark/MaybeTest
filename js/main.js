var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Maybelline;
(function (Maybelline) {
    var ServiceManager = (function () {
        function ServiceManager() {
            this._baseUrl = 'http://10.5.30.109:8071';
        }
        ServiceManager.prototype.getAllItems = function (url, numberOfItemsPerPage, tag, vm, succssCallback, errorCallback) {
            $('#loader').show();
            var returnData;
            $.ajax({
                url: "http://test.localhost/MaybellineWebRevamp/data/data.txt",
                type: "GET",
                data: {
                    number: numberOfItemsPerPage,
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
        ServiceManager.prototype.getItemsByPage = function (url, lastId, numberOfItemsPerPage, tag, vm, succssCallback, errorCallback) {
            $('#loader').show();
            var returnData;
            $.ajax({
                url: "http://test.localhost/MaybellineWebRevamp/data/dataLooks.txt",
                type: "GET",
                data: {
                    id: lastId,
                    number: numberOfItemsPerPage,
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
    var TagsModel = (function () {
        function TagsModel() {
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
        }
        TagsModel.prototype.getFilteredItems = function (key) {
            this.currentLooksModel.getDefaultItems(key);
        };
        return TagsModel;
    })();
    Maybelline.TagsModel = TagsModel;    
    var LooksBaseModel = (function () {
        function LooksBaseModel() {
            this.serviceManager = new ServiceManager();
            this.dataList = ko.observableArray();
            this.currentFilter = '';
            this.currentSortBy = SortByDataType.all;
            this.numOfItems = 8;
        }
        LooksBaseModel.prototype.template = function () {
            var designTemplate = '';
            return Hogan.compile(designTemplate);
        };
        LooksBaseModel.prototype.getDefaultItems = function (key) {
            this.currentFilter = key;
        };
        LooksBaseModel.prototype.getItemsError = function (error) {
            console.log(error.message);
        };
        LooksBaseModel.prototype.showMakeup = function (elem) {
            if(elem.nodeType === 1) {
            }
        };
        return LooksBaseModel;
    })();
    Maybelline.LooksBaseModel = LooksBaseModel;    
    var LooksPagingModel = (function (_super) {
        __extends(LooksPagingModel, _super);
        function LooksPagingModel() {
                _super.call(this);
            this._lastId = 0;
            this.numOfItems = 24;
        }
        LooksPagingModel.prototype.template = function () {
            var designTemplate = '<div class="item" data-url="{{mbllink}}">' + '<div class="overlay">' + '<div class="top">' + '<div class="title">{{description}}</div>' + '</div>' + '<div class="bottom">' + '<div class="likes">{{mblflowers}}</div>' + '</div>' + '</div>' + '<img class="lazy" src="img/blank.gif" data-src="{{imageupload}}" />' + '</div>';
            return Hogan.compile(designTemplate);
        };
        LooksPagingModel.prototype.getDefaultItems = function (key) {
            _super.prototype.getDefaultItems.call(this, key);
            this.serviceManager.getItemsByPage('AjaxMakeup.GetMakeupList.dubing', 1, this.numOfItems, this.currentFilter, this, 'getItemsSuccess', 'getItemsError');
        };
        LooksPagingModel.prototype.getItemsSuccess = function (data) {
            this._lastId = data.looks[data.looks.length - 1].id;
            var lookData;
            for(var i = 0; i < data.looks.length; i++) {
                lookData = data.looks[i];
                this.dataList.push(lookData);
            }
            applyLazyLoading();
            applyLink();
        };
        LooksPagingModel.prototype.getMoreItems = function () {
            this.serviceManager.getItemsByPage('AjaxMakeup.GetMakeupList.dubing', this._lastId, this.numOfItems, this.currentFilter, this, 'getItemsSuccess', 'getItemsError');
        };
        return LooksPagingModel;
    })(LooksBaseModel);
    Maybelline.LooksPagingModel = LooksPagingModel;    
    var LooksScrollerModel = (function (_super) {
        __extends(LooksScrollerModel, _super);
        function LooksScrollerModel() {
                _super.call(this);
            this._currentIndex = 1;
            this._currentTotalPages = 3;
            this.numOfItems = 8;
        }
        LooksScrollerModel.prototype.template = function () {
            var designTemplate = '<li>' + '{{#looks}}' + '<div class="item" data-url="{{mbllink}}">' + '<div class="overlay">' + '<div class="top">' + '<div class="title">{{description}}</div>' + '</div>' + '<div class="bottom">' + '<div class="likes">{{mblflowers}}</div>' + '</div>' + '</div>' + '<img class="lazy" src="img/blank.gif" data-src="{{imageupload}}" />' + '</div>' + '{{/looks}}' + '</li>';
            return Hogan.compile(designTemplate);
        };
        LooksScrollerModel.prototype.getDefaultItems = function (key) {
            _super.prototype.getDefaultItems.call(this, key);
            this.serviceManager.getAllItems('AjaxMakeup.GetMakeupList.dubing', this.numOfItems, this.currentFilter, this, 'getItemsSuccess', 'getItemsError');
        };
        LooksScrollerModel.prototype.getItemsSuccess = function (data) {
            var pageData;
            for(var i = 0; i < data.pages.length; i++) {
                pageData = data.pages[i];
                this.dataList.push(pageData);
            }
            this._currentTotalPages = data.pages.length;
            applyCarousel(this);
            applyLazyLoading();
            applyLink();
        };
        LooksScrollerModel.prototype.loadPreviousPage = function () {
            this._currentIndex--;
            if(this._currentIndex < 1) {
                this._currentIndex = this._currentTotalPages;
            }
            $(':rs-carousel').carousel('prev');
        };
        LooksScrollerModel.prototype.loadNextPage = function () {
            if(this._currentIndex === this._currentTotalPages) {
                this._currentIndex = 0;
            }
            this._currentIndex++;
            $(':rs-carousel').carousel('next');
        };
        LooksScrollerModel.prototype.loadImagesInCurrentPage = function () {
            console.log(this._currentIndex);
        };
        return LooksScrollerModel;
    })(LooksBaseModel);
    Maybelline.LooksScrollerModel = LooksScrollerModel;    
    var TagDataType = (function () {
        function TagDataType() { }
        TagDataType.all = "ALL";
        return TagDataType;
    })();
    Maybelline.TagDataType = TagDataType;    
    var SortByDataType = (function () {
        function SortByDataType() { }
        SortByDataType.all = "ALL";
        SortByDataType.latest = "LATEST";
        SortByDataType.popular = "POPULAR";
        return SortByDataType;
    })();
    Maybelline.SortByDataType = SortByDataType;    
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
    var tagsModel = new Maybelline.TagsModel();
    ko.applyBindings(tagsModel, $('#tags')[0]);
    if($("#layout-scroller").length > 0) {
        var looksScrollerModel = new Maybelline.LooksScrollerModel();
        ko.applyBindings(looksScrollerModel, $('#layout-scroller')[0]);
        tagsModel.currentLooksModel = looksScrollerModel;
        looksScrollerModel.getDefaultItems(Maybelline.TagDataType.all);
        $('#carousel-prev').bind('click', function () {
            looksScrollerModel.loadPreviousPage();
        });
        $('#carousel-next').bind('click', function () {
            looksScrollerModel.loadNextPage();
        });
    }
    if($("#layout-paging").length > 0) {
        var looksPagingModel = new Maybelline.LooksPagingModel();
        ko.applyBindings(looksPagingModel, $('#layout-paging')[0]);
        tagsModel.currentLooksModel = looksPagingModel;
        looksPagingModel.getDefaultItems(Maybelline.TagDataType.all);
        $('#show-more-button > a').bind('click', function () {
            looksPagingModel.getMoreItems();
        });
    }
}
//@ sourceMappingURL=main.js.map
