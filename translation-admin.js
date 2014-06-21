
var Schemas = {};
Schemas.Translations = new SimpleSchema({
    domain:{
        type: [String],
        label: "Domains"
    },
    key:{
        type: String,
        label: "Key"
    },
    lang:{
        type: [String],
        label: "Langs"
    },
    value:{
        type: String,
        label: "Translation"
    }
});

Translation.collection.attachSchema(Schemas.Translations);


if (Meteor.isClient) {
    Template.insert_translation.collection = function(){
        return Translation.collection;
    };

    Template.search_translation.search_result = function(){
        return Translation.collection.find({});
    };
}

if (Meteor.isServer) {
    Meteor.startup(function () {
        // code to run on server at startup
    });
}
