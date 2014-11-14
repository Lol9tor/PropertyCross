(function () {
     window.PropertyCross = {
         Models: {},
         Views: {},
         Collections: {},
         Router: {}
     };

    PropertyCross.Router = Backbone.Router.extend({
        routes: {
            '' : 'index',
            'proplist': 'propertyList',
            'details': 'details',
            'faves': 'favourites',
            /*'*other': 'defaults'*/
},
        index: function () {
            console.log('index');
        },
        propertyList: function () {
            console.log('propList');
        },
        details: function () {
            console.log('details');
        },
        favourites: function () {
            console.log('favourites');
        }
/*        defaults: function () {

        }*/
    });

    PropertyCross.Models.Details = Backbone.Model.extend({
        defaults: {
            title: 'Property Details',
            price: 2000,
            place: 'main street',
            bigImg: 'url',
            smallImg: 'some another url',
            description: 'some description',
            isFaves: false
        }
    });

    PropertyCross.Collections.LastSearch = Backbone.Collection.extend({
        model: PropertyCross.Models.Details
    });

    PropertyCross.Collections.Search = Backbone.Collection.extend({
        model: PropertyCross.Models.Details
    });

    PropertyCross.Views.Main = Backbone.View.extend({
        tagName: 'div',
        template: _.template($('#templateFirstPage').html()),
        events: {
            "click #go": "openSearch",
            "click #faves": "openSearch",
            "click li": "openSearch"
        },
        initialize: function () {

        },
        render: function () {
            this.$el.html( this.template() );
        },
        openSearch: function () {
            //move to hash proplist
        }

    });

    PropertyCross.Views.Search = Backbone.View.extend({
        tagName: 'ul',
        events: {
            "click li": "openDetails"
        },
        initialize: function () {

        },
        render: function () {

        },
        openDetails: function () {
            //move to hash details
        }

    });

    PropertyCross.Views.Details = Backbone.View.extend({
        tagName: 'li',
        model: PropertyCross.Models.Details,
        events: {
            'click button': 'addToFaves'
        },
        initialize: function () {

        },
        render: function () {

        },
        addToFaves: function () {

        }
    });
    //var config = [] - object from server
    var lastSearch = new PropertyCross.Collections.LastSearch({
        price: 3000,
        description: 'very big house near the Sea'
    });
    console.log(lastSearch);
    new PropertyCross.Router;
    Backbone.history.start();
})();
