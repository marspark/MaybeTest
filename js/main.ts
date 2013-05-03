// Whole-script strict mode syntax
"use strict";

module Maybelline {
    // manages all service including ajax calls
    export class ServiceManager {
        private _baseUrl:string;
        constructor() {
            this._baseUrl = 'http://10.5.30.109:8093/';
        }
        getAllItemsByPage( url:string, lastId:number, numberOfItems:number, tag:string, vm:Maybelline.DefaultViewModel, succssCallback:string, errorCallback:string) {
            $('#loader').show();
            var returnData = [];
            $.ajax({
                //url: this._baseUrl + url,
                url: "http://test.localhost/MaybellineWebRevamp/data/data.txt",
                type: "GET",
                data: {
                    id: lastId,
                    number: numberOfItems,
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
    }

    // view model to be used in knockout.js
    export class DefaultViewModel{
        public tagList:any;
        public dataList:any;
        private _serviceManager:Maybelline.ServiceManager;
        private _lastId:number;
        private _currentFilter:string;
        private _currentNumOfItems:number;
        private _currentIndex:number;
        private _currentTotalPages:number;

        constructor(){
            this._serviceManager = new ServiceManager();

            this.tagList = ko.observableArray([
                <ITag>{'name':'Tag1', 'identifier':'mm'},
                <ITag>{'name':'Tag2', 'identifier':'tag2'},
                <ITag>{'name':'Tag3', 'identifier':'tag3'},
                <ITag>{'name':'Tag4', 'identifier':'tag4'}
            ]);
            this.dataList = ko.observableArray();
            this._currentIndex = 1;
            this._currentTotalPages = 20;

            this._lastId = 0;
            this._currentFilter = '';
            this._currentNumOfItems = 20;
        }

        // html pre-compiled template
        templateCallback(){
            var designTemplate:string  =
                '<li>' +
                    '{{#page}}' +
                    '<div class="item" data-url="{{mbllink}}">' +
                        '<div class="overlay">' +
                            '<div class="top">' +
                                '<div class="title">{{description}}</div>' +
                            '</div>' +
                            '<div class="bottom">' +
                                '<div class="likes">{{mblflowers}}</div>' +
                                '<div class="comments">{{mblcoments}}</div>' +
                            '</div>' +
                        '</div>' +
                        '<img class="lazy" src="img/blank.gif" data-src="{{imageupload}}" />' +
                    '</div>' +
                    '{{/page}}' +
                '</li>';
            return Hogan.compile(designTemplate);
        }

        // get items (initial load)
        getDefaultItems(){
            this._serviceManager.getAllItemsByPage('AjaxMakeup.GetMakeupList.dubing', 1, this._currentNumOfItems, this._currentFilter, this, 'getItemsSuccess', 'getItemsError');
        }

        // get more items
        getMoreItems(){
            this._serviceManager.getAllItemsByPage('AjaxMakeup.GetMakeupList.dubing', this._lastId, this._currentNumOfItems, this._currentFilter, this, 'getItemsSuccess', 'getItemsError');
        }

        getItemsSuccess(data:IPages){
            var pageData:IPage;

            for(var i = 0; i < data.pages.length; i++){
                pageData = data.pages[i];
                this.dataList.push(pageData);
            }

            this._currentTotalPages = data.totalPages;

            applyCarousel(this);
            applyLazyLoading();
            applyLink();
        }

        getItemsError(error:any){
            console.log(error.message)
        }

        // get filtered items
        getFilteredItems(identifier:string){
            this._currentFilter = identifier;
            this._serviceManager.getAllItemsByPage('AjaxMakeup.GetMakeupList.dubing', 1, this._currentNumOfItems, this._currentFilter, this, 'filteredItemsSuccess', 'filteredItemsError');
        }

        filteredItemsSuccess(data:IMakeup){
            this._lastId = data[data.length - 1].id;

            for(var i = 0; i < this.dataList().length; i++){
                var oldData:IMakeup = this.dataList()[i];

                var found = $.grep(data, function(n:IMakeup){return n.id === oldData.id});

                if(found.length < 1){
                    this.dataList.remove(oldData);
                    i--;
                }
            }
            applyLazyLoading();
            applyLink();
        }

        filteredItemsError(data:any){
            console.log(data.message);
        }

        showMakeup(elem:any){
            if (elem.nodeType === 1){
                //$(elem).hide().fadeIn('1000');
            }
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

    function applyCarousel(vm:Maybelline.DefaultViewModel){
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

    interface IMakeup{
        id:number;
        imageupload:string;
        mblflowers:number;
        mblcoments:number;
        description:string;
        mbllink:string;
        first:bool;
        last:bool;
    }

    // ipage interface is needed for generating templates
    interface IPage{
        page:IMakeup;
    }

    interface IPages{
        pages:IPage[];
        totalPages:number;
    }

    interface ITag{
        name:string;
        identifier:string;
    }
}

// main
$(document).ready(init);

function init(){
    var defaultVM:Maybelline.DefaultViewModel = new Maybelline.DefaultViewModel();
    ko.applyBindings(defaultVM);
    defaultVM.getDefaultItems();

    $('#carousel-prev').bind('click', function(){
        defaultVM.loadPreviousPage();
    });

    $('#carousel-next').bind('click', function(){
        defaultVM.loadNextPage();
    });
}