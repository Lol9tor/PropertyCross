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
            totalResults: 19,
            isFaves: false
        }
    });

    PropertyCross.instance.models.details = new PropertyCross.constructor.Models.Details();

    PropertyCross.constructor.Router = Backbone.Router.extend({
        routes: {
            '' : 'index',
            'proplist': 'propertyList',
            'details': 'details',
            'faves': 'favourites',
            '*other': 'defaults'
},
        index: function () {
            $('ul').remove();
            PropertyCross.instance.views.main = new PropertyCross.constructor.Views.Main();
        },
        propertyList: function () {
            var city = $('#cityInput').val();
            if (city && /^[a-zA-Z]*$/.test(city)) {
                PropertyCross.instance.collections.search = new PropertyCross.constructor.Collections.Search();
                $.ajax({
                    url: 'http://api.nestoria.co.uk/api?country=uk&pretty=1&action=search_listings&encoding=json&listing_type=buy&page=1&place_name=' + city,
                    type: 'POST',
                    dataType: 'jsonp',
                    success: function (data) {
                        if (data.response.application_response_code <= 110) {
                            var modelsData = data.response.listings;
                            for (var i = 0; i < modelsData.length; i++) {
                                PropertyCross.instance.collections.search.push({
                                    title: modelsData[i].lister_name,
                                    price: modelsData[i].price,
                                    place: modelsData[i].title,
                                    bigImg: modelsData[i].img_url,
                                    smallImg: modelsData[i].thumb_url,
                                    bathroomNumber: modelsData[i].bathroom_number,
                                    bedroomNumber: modelsData[i].bedroom_number,
                                    keywords: modelsData[i].keywords,
                                    description: modelsData[i].summary,
                                    totalResults: data.response.total_results,
                                    isFaves: false
                                })
                            }
                            $('#main').remove();
                            console.log(PropertyCross.instance.collections.search);
                            PropertyCross.instance.views.search = new PropertyCross.constructor.Views.Search({
                                collection: PropertyCross.instance.collections.search
                            });
                        } else {
                            PropertyCross.instance.router.navigate('error', {trigger: true});
                        }

                    }
                });
            } else {
                PropertyCross.instance.router.navigate('error', {trigger: true});
            }
        },
        details: function () {
            console.log('details');
        },
        favourites: function () {
            console.log('favourites');
        },
        defaults: function () {
            $('ul').remove();
            $('#error').remove();
            //PropertyCross.instance.views.main = new PropertyCross.constructor.Views.Main();
            $('#main').append('<p id="error">Error input! Check the correct input city and try again.</p>')
        }
    });
    PropertyCross.instance.router = new PropertyCross.constructor.Router;

    PropertyCross.constructor.Collections.LastSearch = Backbone.Collection.extend({
        model: PropertyCross.constructor.Models.Details,
        initialize: function () {
            this.listenTo(this, 'add', this.render);
            this.listenTo(this, 'remove', this.remove);
        },
        render: function () {

        }
    });

    PropertyCross.constructor.Collections.Search = Backbone.Collection.extend({
        model: PropertyCross.constructor.Models.Details,
        initialize: function () {
            this.listenTo(this, 'add', this.render);
            this.listenTo(this, 'remove', this.remove);
        },
        render: function () {

        }
    });

    PropertyCross.constructor.Collections.Faves = Backbone.Collection.extend({
        model: PropertyCross.constructor.Models.Details,
        initialize: function () {
            this.listenTo(this, 'add', this.render);
            this.listenTo(this, 'remove', this.remove);
        },
        render: function () {

        }
    });

    PropertyCross.constructor.Views.Main = Backbone.View.extend({
        tagName: 'div',
        id: 'main',
        template: _.template($('#templateFirstPage').html()),
        events: {
            "click #go": "openSearch",
            //"click #faves": "openSearch",
            "click li": "openSearch"
        },
        initialize: function () {
            this.render();
            //this.listenTo(this.model, 'change', this.render);
            //this.listenTo(this.model, 'destroy', this.remove);
        },
        render: function () {
            this.$el.html( this.template() );
            document.body.appendChild(this.el);
        },
        openSearch: function () {
            //move to hash proplist
            PropertyCross.instance.router.navigate('proplist', {trigger: true });
        }

    });

    PropertyCross.constructor.Views.Search = Backbone.View.extend({
        tagName: 'ul',
        template: _.template($('#templateSearchPage').html()),
        events: {
            //"click li": "openDetails"
        },
        initialize: function () {
            this.render();
        },
        render: function () {
            this.$el.html( this.template({model: this.collection.toJSON()}) );
/*            this.collection.each(function (model) {
                var detailsView = new PropertyCross.constructor.Views.Details({model: model});
                this.$el.append( detailsView.el );
            }, this);*/
            document.body.appendChild(this.el);
            return this;
        },
        openDetails: function () {
            //move to hash details
            var router = new PropertyCross.constructor.Router;
            router.navigate('details', {trigger: true });
        }

    });

    PropertyCross.constructor.Views.Details = Backbone.View.extend({
        tagName: 'li',
        model: PropertyCross.instance.models.details,
        events: {
            'click button': 'addToFaves'
        },
        initialize: function () {

        },
        render: function () {


            return this;

        },
        addToFaves: function () {

        }
    });
    Backbone.history.start();
})();
