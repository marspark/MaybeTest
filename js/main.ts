// TODO: overall architecture
// TODO: build script node.js?
// TODO: unit testing, jasmin/buster

// Whole-script strict mode syntax
module Maybelline {
    // manages all service including ajax calls
    export class ServiceManager {
        private _baseUrl:string;
        constructor() {
            this._baseUrl = 'http://10.5.30.109:8071';
        }

        getAllItems( url:string, numberOfItemsPerPage:number, tag:string, vm:ILooksModel, succssCallback:string, errorCallback:string) {
            $('#loader').show();
            var returnData:IPages;
            $.ajax({
                //url: this._baseUrl + url,
                url: "http://test.localhost/MaybellineWebRevamp/data/data.txt",
                type: "GET",
                data: {
                    number: numberOfItemsPerPage,
                    tags: tag
                },
                async: false,
                dataType:'jsonp',
                jsonpCallback: 'jsonCallback',
                contentType: "application/json",
                timeout : 10000,
                success:function(response) {
                    $('#loader').hide();
                    returnData = <IPages>response;
                    vm[succssCallback](returnData);

                },
                error:function(error:any) {
                    vm[errorCallback](error);
                }
            });
        }

        getItemsByPage( url:string, lastId:number, numberOfItemsPerPage:number, tag:string, vm:ILooksModel, succssCallback:string, errorCallback:string) {
            $('#loader').show();
            var returnData:IPage;
            $.ajax({
                //url: this._baseUrl + url,
                //url: "http://10.5.30.109:8071/Umbraco/Api/DemoApi/getstring",
                url: "http://test.localhost/MaybellineWebRevamp/data/dataLooks.txt",
                type: "GET",
                data: {
                    id: lastId,
                    number: numberOfItemsPerPage,
                    tags: tag
                },
                async: false,
                dataType:'jsonp',
                jsonpCallback: 'jsonCallback',
                contentType: "application/json",
                timeout : 10000,
                success:function(response) {
                    $('#loader').hide();
                    returnData = <IPage>response;
                    vm[succssCallback](returnData);
                },
                error:function(error:any) {
                    vm[errorCallback](error);
                }
            });
        }
    }

    export class TagsModel{
        tagList:any;
        currentLooksModel:ILooksModel;
        private _serviceManager:ServiceManager;

        constructor(){
            this._serviceManager = new ServiceManager();

            this.tagList = ko.observableArray([
                <ITag>{'name':'Tag1', 'identifier':'mm'},
                <ITag>{'name':'Tag2', 'identifier':'tag2'},
                <ITag>{'name':'Tag3', 'identifier':'tag3'},
                <ITag>{'name':'Tag4', 'identifier':'tag4'}
        ]);
        }

        // get filtered items
        getFilteredItems(key:string){
            this.currentLooksModel.getDefaultItems(key);
        }
    }

    // view model to be used in knockout.js
    export class LooksBaseModel implements ILooksModel{
        dataList:any;
        serviceManager:ServiceManager;
        currentFilter:string;
        currentSortBy:string;
        numOfItems:number;

        constructor(){
            this.serviceManager = new ServiceManager();

            this.dataList = ko.observableArray();

            this.currentFilter = '';
            this.currentSortBy = SortByDataType.all;
            this.numOfItems = 8;
        }

        // html pre-compiled template
        template():string{
            var designTemplate:string  = '';
            return Hogan.compile(designTemplate);
        }

        // get items (initial load)
        getDefaultItems(key:string){
            this.currentFilter = key;
        }

        getItemsError(error:any){
            console.log(error.message)
        }

        showMakeup(elem:any){
            if (elem.nodeType === 1){
                //$(elem).hide().fadeIn('1000');
            }
        }
    }

    export class LooksPagingModel extends LooksBaseModel{
        private _lastId:number;

        constructor(){
            super();
            this._lastId = 0;
            this.numOfItems = 24;
        }

        template():string{
            var designTemplate:string  =
                '<div class="item" data-url="{{mbllink}}">' +
                    '<div class="overlay">' +
                        '<div class="top">' +
                            '<div class="title">{{description}}</div>' +
                        '</div>' +
                        '<div class="bottom">' +
                            '<div class="likes">{{mblflowers}}</div>' +
                        '</div>' +
                    '</div>' +
                    '<img class="lazy" src="img/blank.gif" data-src="{{imageupload}}" />' +
                '</div>';
            return Hogan.compile(designTemplate);
        }

        getDefaultItems(key:string){
            super.getDefaultItems(key);
            this.serviceManager.getItemsByPage('AjaxMakeup.GetMakeupList.dubing', 1, this.numOfItems, this.currentFilter, this, 'getItemsSuccess', 'getItemsError');
        }

        getItemsSuccess(data:IPage){
            this._lastId = data.looks[data.looks.length - 1].id;

            var lookData:IPage;

            for(var i = 0; i < data.looks.length; i++){
                lookData = data.looks[i];
                this.dataList.push(lookData);
            }

            applyLazyLoading();
            applyLink();
        }

        // get more items
        getMoreItems(){
            this.serviceManager.getItemsByPage('AjaxMakeup.GetMakeupList.dubing', this._lastId, this.numOfItems, this.currentFilter, this, 'getItemsSuccess', 'getItemsError');
        }
    }

    export class LooksScrollerModel extends LooksBaseModel{
        private _currentIndex;
        private _currentTotalPages:number;

        constructor(){
            super();
            this._currentIndex = 1;
            this._currentTotalPages = 3;
            this.numOfItems = 8;
        }

        // html pre-compiled template
        template():string{
            var designTemplate:string  =
                '<li>' +
                    '{{#looks}}' +
                    '<div class="item" data-url="{{mbllink}}">' +
                        '<div class="overlay">' +
                            '<div class="top">' +
                                '<div class="title">{{description}}</div>' +
                            '</div>' +
                            '<div class="bottom">' +
                                '<div class="likes">{{mblflowers}}</div>' +
                            '</div>' +
                        '</div>' +
                    '<img class="lazy" src="img/blank.gif" data-src="{{imageupload}}" />' +
                    '</div>' +
                    '{{/looks}}' +
                '</li>';
            return Hogan.compile(designTemplate);
        }

        getDefaultItems(key:string){
            super.getDefaultItems(key);
            this.serviceManager.getAllItems('AjaxMakeup.GetMakeupList.dubing', this.numOfItems, this.currentFilter, this, 'getItemsSuccess', 'getItemsError');
        }

        getItemsSuccess(data:IPages){
            var pageData:IPage;

            for(var i = 0; i < data.pages.length; i++){
                pageData = data.pages[i];
                this.dataList.push(pageData);
            }
            this._currentTotalPages = data.pages.length;

            applyCarousel(this);
            applyLazyLoading();
            applyLink();
        }

        loadPreviousPage(){
            this._currentIndex--;
            if(this._currentIndex < 1){
                this._currentIndex = this._currentTotalPages;
            }
            $(':rs-carousel').carousel('prev');
        }

        loadNextPage(){
            if(this._currentIndex === this._currentTotalPages){
                this._currentIndex = 0;
            }
            this._currentIndex++;
            $(':rs-carousel').carousel('next');
        }

        loadImagesInCurrentPage(){
            console.log(this._currentIndex);
        }
    }

    // enum
    export class TagDataType {
        public static all: string = "ALL";
    }

    export class SortByDataType {
        public static all: string = "ALL";
        public static latest: string = "LATEST";
        public static popular: string = "POPULAR";
    }

    // private functions
    function applyCarousel(vm:LooksScrollerModel){
        $('.rs-carousel').carousel({
            continuous: true,
            whitespace: true,
            pagination: false,
            nextPrevActions: false,
            itemsPerTransition: 1
        });

        $(':rs-carousel').on('carouselafter', function(event, data) {
            vm.loadImagesInCurrentPage();
        });
    }

    function applyLazyLoading(speed:number = 1000){
        $('img.lazy[data-src]').jail({
            timeout: 300,
            //effect: 'fadeIn',
            speed : speed
        });
    }

    function applyLink(){
        $('.item').bind('click', function(){
            window.location = $(this).attr('data-url');
        })
    }

    // interfaces
    export interface ILooksModel{
        template():string;
        getDefaultItems(key:string):void;
        getItemsError(error:any):void;
        showMakeup(elem:any):void;
    }

    // ipage interface is needed for generating templates
    export interface IPages{
        pages:IPage[];
    }

    export interface IPage{
        looks:IMakeup[];
    }

    export interface IMakeup{
        id:number;
        imageupload:string;
        mblflowers:number;
        description:string;
        mbllink:string;
    }

    export interface ITag{
        name:string;
        identifier:string;
    }
}

// main
$(document).ready(init);

function init(){
    var tagsModel:Maybelline.TagsModel = new Maybelline.TagsModel();
    ko.applyBindings(tagsModel, $('#tags')[0]);

    if ( $("#layout-scroller").length > 0 ) {
        var looksScrollerModel:Maybelline.LooksScrollerModel = new Maybelline.LooksScrollerModel();
        ko.applyBindings(looksScrollerModel, $('#layout-scroller')[0]);

        tagsModel.currentLooksModel = looksScrollerModel;
        looksScrollerModel.getDefaultItems(Maybelline.TagDataType.all);

        $('#carousel-prev').bind('click', function(){
            looksScrollerModel.loadPreviousPage();
        });

        $('#carousel-next').bind('click', function(){
            looksScrollerModel.loadNextPage();
        });
    }

    if ( $("#layout-paging").length > 0 ) {
        var looksPagingModel:Maybelline.LooksPagingModel = new Maybelline.LooksPagingModel();
        ko.applyBindings(looksPagingModel, $('#layout-paging')[0]);

        tagsModel.currentLooksModel = looksPagingModel;
        looksPagingModel.getDefaultItems(Maybelline.TagDataType.all);

        $('#show-more-button > a').bind('click', function(){
            looksPagingModel.getMoreItems();
        });
    }
}