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
            'proplist': 'propertyList',
            'details/:query': 'details',
            'faves': 'favourites',
            '*other': 'defaults'
},
        index: function () {
            this.hideListView();
            PropertyCross.instance.views.main.render();
        },
        propertyList: function () {
            if (PropertyCross.instance.views.details){
                PropertyCross.instance.views.details.$el.remove();
            }
            var city = PropertyCross.instance.views.main.getValue();
            if (city && /^[a-zA-Z-]*$/.test(city)) {
                PropertyCross.instance.collections.search.fetch({
                    url: 'http://api.nestoria.co.uk/api?country=uk&pretty=1&action=search_listings&encoding=json&listing_type=buy&page=1&place_name='+city,
                    type: 'POST',
                    dataType: 'jsonp',
                    reset: true,
                    success: function (collection, response, options) {
                        var data = response;
                        if (data.response.application_response_code <= 110) {
                            PropertyCross.instance.collections.search.totalResults = data.response.total_results;
                            PropertyCross.instance.views.main.$el.remove();
                            PropertyCross.instance.views.search = new PropertyCross.constructor.Views.Search({
                                collection: PropertyCross.instance.collections.search
                            });
                            PropertyCross.instance.collections.lastSearch.push({
                                totalResult: PropertyCross.instance.collections.search.totalResults,
                                city: city
                            })
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
            this.hideListView();
            var model = PropertyCross.instance.collections.search.where({guid: id});
            PropertyCross.instance.views.details = new PropertyCross.constructor.Views.Details({
                model: model[0]
            });
        },
        favourites: function () {
            console.log('favourites');
        },
        hideListView: function () {
            if (PropertyCross.instance.views.search){
                PropertyCross.instance.views.search.$el.remove();
            }
        },
        defaults: function () {
            this.hideListView();
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
        }
    });

    PropertyCross.constructor.Collections.Search = Backbone.Collection.extend({
        model: PropertyCross.constructor.Models.Details,
        url: '',
        totalResuts: 0,
        parse: function (data) {
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
        model: PropertyCross.constructor.Models.Details,
        initialize: function () {

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
            "click li": "openSearch"
        },
        initialize: function () {
            this.render();
        },
        render: function () {
            this.$el.html( this.template() );
            document.body.appendChild(this.el);
        },
        openSearch: function () {
            //move to hash proplist
            console.log('ok');
            PropertyCross.instance.router.navigate('proplist', {trigger: true });
        },
        openFaves: function () {
            PropertyCross.instance.router.navigate('faves', {trigger: true });
        },
        getValue: function () {
            return this.$('#cityInput').val();
        }
    });
    PropertyCross.instance.views.main = new PropertyCross.constructor.Views.Main();


    PropertyCross.constructor.Views.Search = Backbone.View.extend({
        tagName: 'ul',
        template: _.template($('#templateSearchPage').html()),
        events: {
            "click li": "openDetails",
            "click #backToMain": "returnBack"
        },
        initialize: function () {
            this.render();
        },
        render: function () {
            this.$el.html( this.template({model: this.collection.toJSON(), totalResults: this.collection.totalResults}) );
            document.body.appendChild(this.el);
            return this;
        },
        openDetails: function (e) {
            //move to hash details
           var id = $(e.currentTarget).attr('id');
           PropertyCross.instance.router.navigate('details/'+id, {trigger: true });
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
            document.body.appendChild(this.el);
            return this;
        },
        addToFaves: function () {
            if (!(this.model in PropertyCross.instance.collections.faves)){
                PropertyCross.instance.collections.faves.push(this.model);
            }
        },
        returnBack: function () {
            PropertyCross.instance.router.navigate('proplist', {trigger: true });
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
    PropertyCross.instance.views.error = new PropertyCross.constructor.Views.Error();

    /*      */

    Backbone.history.start();
})();
