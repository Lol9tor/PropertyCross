(function () {
    location.hash = "";
    window.PropertyCross = {
        constructor: {
            Models: {},
            Views: {},
            Collections: {},
            Router: {}
        },
        instance: {
            models: {},
            views: {},
            collections: {},
            router: {}
        }
    };

    /*    MODELS      */

    PropertyCross.constructor.Models.Details = Backbone.Model.extend({
        defaults: {
            title: 'Property Details',
            price: 2000,
            place: 'main street',
            bigImg: 'url',
            smallImg: 'some another url',
            bathroomNumber: 1,
            bedroomNumber: 2,
            keywords: 'some words',
            description: 'some description',
            name: 'model',
            guid: '',
            isFaves: false
        }
    });
    PropertyCross.instance.models.details = new PropertyCross.constructor.Models.Details();

    /*    ROUTER      */

    PropertyCross.constructor.Router = Backbone.Router.extend({
        routes: {
            '' : 'index',
            'proplist/:query/:page': 'propertyList',
            'details/:query': 'details',
            'faves': 'favourites',
            '*other': 'defaults'
        },
        index: function () {
            this.hideAllView();
            PropertyCross.instance.views.main.render();
            this.navigateMainView();
        },
        propertyList: function (city, page) {
            this.hideAllView();
            var self = this;
            if (city && /^[a-zA-Z-]*$/.test(city)) {
                PropertyCross.instance.collections.search.fetch({
                    url: 'http://api.nestoria.co.uk/api?country=uk&pretty=1&action=search_listings&encoding=json&listing_type=buy&page='+page+'&place_name='+city,
                    type: 'POST',
                    dataType: 'jsonp',
                    reset: true,
                    success: function (collection, response, options) {
                        var data = response;
                        if (data.response.application_response_code <= 110) {
                            PropertyCross.instance.collections.search.totalResults = data.response.total_results;
                            PropertyCross.instance.views.search.attachCollection(PropertyCross.instance.collections.search);
                            PropertyCross.instance.collections.lastSearch.setData(city, data.response.total_results);
                            self.navigateSearchView();
                        } else {
                            PropertyCross.instance.router.navigate('error', {trigger: true});
                        }
                    },
                    error: function () {
                        console.log('error!');
                    }
                });
            } else {
                PropertyCross.instance.router.navigate('error', {trigger: true});
            }
        },
        details: function (id) {
            this.hideAllView();
            var model = PropertyCross.instance.collections.search.where({guid: id});
                if (!model[0]){
                    model = PropertyCross.instance.collections.faves.where({guid: id});
                }
            PropertyCross.instance.views.details.attachModel(model[0]);
            this.navigateDetailsView();
        },
        favourites: function () {
            this.hideAllView();
            PropertyCross.instance.collections.faves.totalResults = PropertyCross.instance.collections.faves.length;
            PropertyCross.instance.views.search.attachCollection(PropertyCross.instance.collections.faves);
            this.navigateSearchView();
        },
        hideAllView: function () {
            PropertyCross.instance.views.main.$el.hide();
            PropertyCross.instance.views.search.$el.hide();
            PropertyCross.instance.views.details.$el.hide();
            PropertyCross.instance.views.main.$el.detach();
            PropertyCross.instance.views.search.$el.detach();
            PropertyCross.instance.views.details.$el.detach();
        },
        navigateMainView: function () {
            PropertyCross.instance.views.main.$el.appendTo(document.body);
            PropertyCross.instance.views.main.$el.show();
        },
        navigateSearchView: function () {
            PropertyCross.instance.views.search.$el.appendTo(document.body);
            PropertyCross.instance.views.search.$el.show();
        },
        navigateDetailsView: function () {
            PropertyCross.instance.views.details.$el.appendTo(document.body);
            PropertyCross.instance.views.details.$el.show();
        },
        defaults: function () {
            //this.hideAllView();
            PropertyCross.instance.views.error.$el.remove();
            PropertyCross.instance.views.main.$el.append(PropertyCross.instance.views.error.el)
        }
    });
    PropertyCross.instance.router = new PropertyCross.constructor.Router;

    /*    COLLECTIONS       */

    PropertyCross.constructor.Collections.LastSearch = Backbone.Collection.extend({
        initialize: function () {
            this.on('add', this.saveLocal);
            this.on('change', this.saveLocal);
            this.on('remove', this.saveLocal);
            this.loadLocal();
        },
        saveLocal: function () {
            var data = JSON.stringify(this.toJSON());
            localStorage.setItem('lastSearchList', data);
        },
        loadLocal: function () {
            var data = localStorage.getItem('lastSearchList');
            this.reset(JSON.parse(data));
        },
        setData: function (city, totalResults) {
            if (!this.where({totalResults: totalResults, city: city}).length){
                this.push({
                    totalResults: totalResults,
                    city: city,
                    date: Date.now()
                })
            }
        }
    });

    PropertyCross.constructor.Collections.Search = Backbone.Collection.extend({
        model: PropertyCross.constructor.Models.Details,
        url: '',
        totalResuts: 0,
        parse: function (data) {
            if (!data.response.listings){
                return;
            }
            var modelsData = data.response.listings;
            for (var i = 0; i < modelsData.length; i++) {
                this.push({
                    title: modelsData[i].lister_name,
                    price: modelsData[i].price,
                    place: modelsData[i].title,
                    bigImg: modelsData[i].img_url,
                    smallImg: modelsData[i].thumb_url,
                    bathroomNumber: modelsData[i].bathroom_number,
                    bedroomNumber: modelsData[i].bedroom_number,
                    keywords: modelsData[i].keywords,
                    description: modelsData[i].summary,
                    name: modelsData[i].datasource_name,
                    guid: modelsData[i].guid,
                    isFaves: false
                })
            }
        },
        initialize: function () {
            this.on('add', this.saveLocal);
            this.on('change', this.saveLocal);
            this.on('remove', this.saveLocal);
            this.loadLocal();
        },
        saveLocal: function () {
            var data = JSON.stringify(this.toJSON());
            localStorage.setItem('searchList', data);
        },
        loadLocal: function () {
            var data = localStorage.getItem('searchList');
            this.reset(JSON.parse(data));
        }
    });

    PropertyCross.constructor.Collections.Faves = Backbone.Collection.extend({
        totalResults: 0,
        initialize: function () {
            this.on('add', this.saveLocal);
            this.on('change', this.saveLocal);
            this.on('remove', this.saveLocal);
            this.loadLocal();
        },
        saveLocal: function () {
            var data = JSON.stringify(this.toJSON());
            localStorage.setItem('favesList', data);
        },
        loadLocal: function () {
            var data = localStorage.getItem('favesList');
            this.reset(JSON.parse(data));
        }
    });
    PropertyCross.instance.collections.faves = new PropertyCross.constructor.Collections.Faves;
    PropertyCross.instance.collections.search = new PropertyCross.constructor.Collections.Search();
    PropertyCross.instance.collections.lastSearch = new PropertyCross.constructor.Collections.LastSearch();

    /*     VIEWS         */

    PropertyCross.constructor.Views.Main = Backbone.View.extend({
        tagName: 'div',
        id: 'main',
        template: _.template($('#templateFirstPage').html()),
        events: {
            "click #go": "openSearch",
            "click #faves": "openFaves",
            "click #list>div": "openLastSearch",
            "click #delHistory": "clearHistory"
        },
        initialize: function () {
            this.render();
        },
        render: function () {
            var lastSearch = null;
            if (localStorage.lastSearchList){
                lastSearch = localStorage.lastSearchList;
            }
            this.$el.html( this.template({models: JSON.parse(lastSearch)}) );
        },
        openSearch: function () {
            var city = this.getValue();
            PropertyCross.instance.router.navigate('proplist/'+city+'/1', {trigger: true });
        },
        openLastSearch: function (e) {
            var city = $(e.currentTarget).find('span').text();
            PropertyCross.instance.router.navigate('proplist/'+city+'/1', {trigger: true });
        },
        openFaves: function () {
            PropertyCross.instance.router.navigate('faves', {trigger: true });
        },
        getValue: function () {
            return this.$('#cityInput').val();
        },
        clearHistory: function () {
            localStorage.removeItem('lastSearchList');
            PropertyCross.instance.collections.lastSearch.reset();
            this.render();
        }
    });

    PropertyCross.constructor.Views.Search = Backbone.View.extend({
        tagName: 'ul',
        template: _.template($('#templateSearchPage').html()),
        events: {
            "click li": "openDetails",
            "click #backToMain": "returnBack",
            "click #more": "addMoreResults"
        },
        initialize: function () {
            this.render();
        },
        render: function () {
            this.$el.html( this.template({model: this.collection.toJSON(), totalResults: this.collection.totalResults}) );
            return this;
        },
        attachCollection: function (collection) {
            this.collection.set(collection.toJSON());
            console.log(collection);
            this.render();
        },
        openDetails: function (e) {
            //move to hash details
            var id = $(e.currentTarget).attr('id');
            PropertyCross.instance.router.navigate('details/'+id, {trigger: true });
        },
        addMoreResults: function (e) {
            e.preventDefault();
            var page = location.hash[location.hash.length-1];
            page = parseInt(page);
            page++;
            var hash = location.hash.slice(1, -1);
            console.log(hash, page);
            PropertyCross.instance.router.navigate(hash+page, {trigger: true });
        },
        returnBack: function () {
            PropertyCross.instance.router.navigate('', {trigger: true });
        }

    });

    PropertyCross.constructor.Views.Details = Backbone.View.extend({
        tagName: 'div',
        events: {
            'click #addToFaves': 'addToFaves',
            'click #backToSearch': 'returnBack'
        },
        template: _.template($('#templateDetails').html()),
        initialize: function () {
            this.render();
        },
        render: function () {
            this.$el.html( this.template(this.model.toJSON()) );
            return this;
        },
        attachModel: function (model) {
            this.model.set(model.toJSON());
            this.render();
        },
        addToFaves: function () {
            if (!(this.model in PropertyCross.instance.collections.faves)){
                this.model.attributes.isFaves = true;
                PropertyCross.instance.collections.faves.push(this.model);
                this.render();
            }
        },
        returnBack: function () {
            window.history.back();
/*            var lastSearch = PropertyCross.instance.collections.lastSearch;
            var city = (lastSearch.at(lastSearch.length-1)).attributes.city;
            PropertyCross.instance.router.navigate('proplist/'+city, {trigger: true });*/
        }
    });

    PropertyCross.constructor.Views.Error = Backbone.View.extend({
        tagName: 'div',
        template: _.template($('#templateError').html()),
        initialize: function () {
            this.render();
        },
        render: function () {
            this.$el.html( this.template() )
        }
    });

    PropertyCross.instance.views.main = new PropertyCross.constructor.Views.Main();
    PropertyCross.instance.views.search = new PropertyCross.constructor.Views.Search({
        collection: PropertyCross.instance.collections.search
    });
    PropertyCross.instance.views.details = new PropertyCross.constructor.Views.Details({
        model: PropertyCross.instance.models.details
    });
    PropertyCross.instance.views.error = new PropertyCross.constructor.Views.Error();

    /*      */

    Backbone.history.start();
})();