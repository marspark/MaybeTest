var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Maybelline;
(function (Maybelline) {
    var ServiceManager = (function () {
        function ServiceManager() {
            this._baseUrl = 'http://10.5.30.109:8093/';
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
                url: "http://test.localhost/MaybellineWebRevamp/data/data.txt",
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
                    'identifier': 'mm',
                    'layout': Maybelline.LayoutDataType.scroller
                }, 
                {
                    'name': 'Tag2',
                    'identifier': 'tag2',
                    'layout': Maybelline.LayoutDataType.paging
                }, 
                {
                    'name': 'Tag3',
                    'identifier': 'tag3',
                    'layout': Maybelline.LayoutDataType.paging
                }, 
                {
                    'name': 'Tag4',
                    'identifier': 'tag4',
                    'layout': Maybelline.LayoutDataType.paging
                }
            ]);
        }
        return TagsModel;
    })();
    Maybelline.TagsModel = TagsModel;    
    var LooksScrollerModel = (function (_super) {
        __extends(LooksScrollerModel, _super);
        function LooksScrollerModel() {
                _super.call(this);
        }
        return LooksScrollerModel;
    })(Maybelline.LooksBaseModel);
    Maybelline.LooksScrollerModel = LooksScrollerModel;    
    var LooksBaseModel = (function () {
        function LooksBaseModel() {
            this._serviceManager = new ServiceManager();
            this.dataList = ko.observableArray();
            this._currentIndex = 1;
            this._currentTotalPages = 20;
            this._lastId = 0;
            this._currentFilter = '';
            this._currentSortBy = Maybelline.SortByDataType.all;
            this._numOfItemsScrollerLayout = 8;
            this._numOfItemsPagingLayout = 16;
        }
        LooksBaseModel.prototype.templateScrollerLayout = function () {
            var designTemplate = '<li>' + '{{#makeups}}' + '<div class="item" data-url="{{mbllink}}">' + '<div class="overlay">' + '<div class="top">' + '<div class="title">{{description}}</div>' + '</div>' + '<div class="bottom">' + '<div class="likes">{{mblflowers}}</div>' + '<div class="comments">{{mblcoments}}</div>' + '</div>' + '</div>' + '<img class="lazy" src="img/blank.gif" data-src="{{imageupload}}" />' + '</div>' + '{{/makeups}}' + '</li>';
            return Hogan.compile(designTemplate);
        };
        LooksBaseModel.prototype.templatePagingLayout = function () {
            var designTemplate = '<div class="item" data-url="{{mbllink}}">' + '<div class="overlay">' + '<div class="top">' + '<div class="title">{{description}}</div>' + '</div>' + '<div class="bottom">' + '<div class="likes">{{mblflowers}}</div>' + '<div class="comments">{{mblcoments}}</div>' + '</div>' + '</div>' + '<img class="lazy" src="img/blank.gif" data-src="{{imageupload}}" />' + '</div>';
            return Hogan.compile(designTemplate);
        };
        LooksBaseModel.prototype.getDefaultItems = function () {
            this._serviceManager.getItemsByPage('AjaxMakeup.GetMakeupList.dubing', 1, this._numOfItemsScrollerLayout, this._currentFilter, this, 'getItemsSuccess', 'getItemsError');
        };
        LooksBaseModel.prototype.getFilteredItems = function (identifier, layout) {
            this.dataList = ko.observableArray();
            this._currentFilter = identifier;
            if(layout === Maybelline.LayoutDataType.scroller) {
                $('#layout-scroller').show();
                $('#layout-paging').hide();
                this._serviceManager.getAllItems('AjaxMakeup.GetMakeupList.dubing', this._numOfItemsScrollerLayout, this._currentFilter, this, 'getItemsSuccess', 'getItemsError');
            } else if(layout === Maybelline.LayoutDataType.paging) {
                $('#layout-paging').show();
                $('#layout-scroller').hide();
                this._serviceManager.getItemsByPage('AjaxMakeup.GetMakeupList.dubing', 1, this._numOfItemsPagingLayout, this._currentFilter, this, 'getItemsSuccess', 'getItemsError');
            }
        };
        LooksBaseModel.prototype.getMoreItems = function () {
            this._serviceManager.getItemsByPage('AjaxMakeup.GetMakeupList.dubing', this._lastId, this._numOfItemsPagingLayout, this._currentFilter, this, 'getItemsSuccess', 'getItemsError');
        };
        LooksBaseModel.prototype.getItemsSuccess = function (data) {
            var lastPage = data.pages[data.pages.length - 1];
            this._lastId = lastPage.makeups[lastPage.makeups.length - 1].id;
            this._currentTotalPages = data.totalPages;
            var pageData;
            for(var i = 0; i < data.pages.length; i++) {
                pageData = data.pages[i];
                this.dataList.push(pageData);
            }
            applyCarousel(this);
            applyLazyLoading();
            applyLink();
        };
        LooksBaseModel.prototype.getItemsError = function (error) {
            console.log(error.message);
        };
        LooksBaseModel.prototype.showMakeup = function (elem) {
            if(elem.nodeType === 1) {
            }
        };
        LooksBaseModel.prototype.loadPreviousPage = function () {
            this._currentIndex--;
            if(this._currentIndex < 1) {
                this._currentIndex = this._currentTotalPages;
            }
            $(':rs-carousel').carousel('prev');
        };
        LooksBaseModel.prototype.loadNextPage = function () {
            if(this._currentIndex === this._currentTotalPages) {
                this._currentIndex = 0;
            }
            this._currentIndex++;
            $(':rs-carousel').carousel('next');
        };
        LooksBaseModel.prototype.loadImagesInCurrentPage = function () {
            console.log(this._currentIndex);
        };
        return LooksBaseModel;
    })();
    Maybelline.LooksBaseModel = LooksBaseModel;    
    var LayoutDataType = (function () {
        function LayoutDataType() { }
        LayoutDataType.paging = "PAGING";
        LayoutDataType.scroller = "SCROLLER";
        return LayoutDataType;
    })();
    Maybelline.LayoutDataType = LayoutDataType;    
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
    var looksModel = new Maybelline.LooksScrollerModel();
    ko.applyBindings(looksModel, $('#content'));
    var tagsModel = new Maybelline.TagsModel();
    ko.applyBindings(tagsModel, $('#nav'));
    looksModel.getDefaultItems();
    $('#carousel-prev').bind('click', function () {
        looksModel.loadPreviousPage();
    });
    $('#carousel-next').bind('click', function () {
        looksModel.loadNextPage();
    });
    $('#show-more-button > a').bind('click', function () {
        looksModel.getMoreItems();
    });
}
//@ sourceMappingURL=main.js.map
