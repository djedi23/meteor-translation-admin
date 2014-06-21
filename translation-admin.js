
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
    Deps.autorun(function () {
	Meteor.subscribe("translationSearch",
			 Session.get("translationSearch_domain"),
			 Session.get("translationSearch_key"),
			 Session.get("translationSearch_lang"),
			 Session.get("translationSearch_value"));
    });

    Template.insert_translation.collection = function(){
        return Translation.collection;
    };

    Template.search_translation.search_result = function(){
        return Translation.collection.find({});
    };

    Template.search_translation.events({
	"change #filterDomain, keyup #filterDomain" : function (e,tpl) {
	    var val = $(e.target).val();
	    Session.set("translationSearch_domain", val);
	},
	"change #filterKey, keyup #filterKey" : function (e,tpl) {
	    var val = $(e.target).val();
	    Session.set("translationSearch_key", val);
	},
	"change #filterLang, keyup #filterLang" : function (e,tpl) {
	    var val = $(e.target).val();
	    console.log(val);
	    Session.set("translationSearch_lang", val);
	},
	"change #filterValue, keyup #filterValue" : function (e,tpl) {
	    var val = $(e.target).val();
	    Session.set("translationSearch_value", val);
	}
    });
}

if (Meteor.isServer) {
    Meteor.startup(function () {
	Meteor.publish('translationSearch', 
		       function(domain, key, lang, value){
			   return Translation.collection.find({domain: {$regex: domain},
							       key: {$regex: key},
							       lang: {$regex: lang},
							       value: {$regex: value}
							      },
							      {
								  sort: ["domain", "key"],
								  limit: 20,
								  skip: 0
							      }
							     );
		       });
    });
}
