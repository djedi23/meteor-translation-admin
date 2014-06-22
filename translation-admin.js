     if (! _.isUndefined(Router)) {
	 Router.map(function() {
	     this.route('translation_admin',
			{
			    path: '/',
			    waitOn: function() { return Meteor.subscribe("translationSearch",
									 Session.get("translationSearch_domain"),
									 Session.get("translationSearch_key"),
									 Session.get("translationSearch_lang"),
									 Session.get("translationSearch_value"));
					       },
			    layoutTemplate: 'translation_admin_layout'
			});
	 });
     }


if (Meteor.isClient) {

    Session.setDefault("translationSearch_domain",""),
    Session.setDefault("translationSearch_key",""),
    Session.setDefault("translationSearch_lang",""),
    Session.setDefault("translationSearch_value","");


    Template.translation_admin.search_result = function(){
	return Translation.collection.find({});
    };

    Template.translation_admin.newline = function(){
	return Session.get('translation_edit') === 'new';
    };


    Template.translation_admin.events({
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
	    Session.set("translationSearch_lang", val);
	},
	"change #filterValue, keyup #filterValue" : function (e,tpl) {
	    var val = $(e.target).val();
	    Session.set("translationSearch_value", val);
	},
	"click #add_line" : function() {
	    Session.set('translation_edit', "new");
	}
    });

    Template.table_item.events({
	'click .view' : function (e, tpl){
	    Session.set('translation_edit', tpl.data._id);
	},
	'click #validate': function(e, tpl){
	    var set={};
	    var value = $(tpl.find('.ivalue')).val().trim();
	    if (!_.isEmpty(value) && tpl.data.value !== value)
		set.value = value;
	    var key = $(tpl.find('.ikey')).val().trim();
	    if (!_.isEmpty(key) && tpl.data.key !== key)
		set.key = key;
	    var lang = $(tpl.find('.ilang')).val().trim().split(',');
	    if (!_.isEmpty($(tpl.find('.ilang')).val().trim()) && tpl.data.lang != lang)
		set.lang = lang;
	    var domain = $(tpl.find('.idomain')).val().trim().split(',');
	    if (!_.isEmpty($(tpl.find('.idomain')).val().trim()) && tpl.data.domain != domain)
		set.domain = domain;

	    console.log(set);
	    if (! _.isEmpty(set)){
		Translation.collection.update(tpl.data._id, {$set: set});
		Session.set('translation_edit', undefined);
	    }
	}
    });

    Template.table_item.edit = function(){
	return this._id === Session.get('translation_edit');
    };

    Template.new_table_item.events({
	'click #validate': function(e, tpl){
	    var set={};
	    var value = $(tpl.find('.ivalue')).val().trim();
	    if (!_.isEmpty(value))
		set.value = value;
	    else
		return;
	    var key = $(tpl.find('.ikey')).val().trim();
	    if (!_.isEmpty(key))
		set.key = key;
	    else
		return;
	    var lang = $(tpl.find('.ilang')).val().trim().split(',');
	    if (!_.isEmpty($(tpl.find('.ilang')).val().trim()))
		set.lang = lang;
	    else
		return;
	    var domain = $(tpl.find('.idomain')).val().trim().split(',');
	    if (!_.isEmpty($(tpl.find('.idomain')).val().trim()))
		set.domain = domain;
	    else
		return;

	    console.log(set);
	    if (! _.isEmpty(set)){
		Translation.collection.insert(set);
		Session.set('translation_edit', undefined);
	    }
	}
    });


}

if (Meteor.isServer) {
    Meteor.startup(function () {

        Translation.add_translation(['translation'], 'domains', Translation.lang_EN, 'Domains');
        Translation.add_translation(['translation'], 'key', Translation.lang_EN, 'Key');
        Translation.add_translation(['translation'], 'languages', Translation.lang_EN, 'Languages');
        Translation.add_translation(['translation'], 'translation', Translation.lang_EN, 'Translation');

        Translation.add_translation(['translation'], 'domains', Translation.lang_FR, 'Domaines');
        Translation.add_translation(['translation'], 'key', Translation.lang_FR, 'Clé');
        Translation.add_translation(['translation'], 'languages', Translation.lang_FR, 'Langues');
        Translation.add_translation(['translation'], 'translation', Translation.lang_FR, 'Tranduction');



	Meteor.publish('translationSearch',
		       function(domain, key, lang, value){
			   check(domain,String);
			   check(key,String);
			   check(lang,String);
			   check(value,String);
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
