
var set_default = function(setting, default_value){
    return  (typeof Meteor.settings != 'undefined' &&
             typeof Meteor.settings.public != 'undefined' &&
             typeof Meteor.settings.public.translation != 'undefined' &&
             typeof Meteor.settings.public.translation.admin != 'undefined' &&
             Meteor.settings.public.translation.admin[setting])
        ? Meteor.settings.public.translation.admin[setting] : default_value;
};

var max_query_size = set_default("max_query_size", 100);
var admin_domain = set_default("admin_domain", "translation_admin");
var use_router = set_default("use_router", false);
var route_name = set_default("route_name", "translation_admin");
var route_path = set_default("route_path", "/");
var route_template_layout = set_default("route_template_layout", 'translation_admin_layout');
var route_yieldTemplates = set_default("route_yieldTemplates", {});




if (use_router && typeof Router !== 'undefined') {
    Router.map(function() {
	this.route("",
		   {
		       path: '/',
                       template: 'main',
		       waitOn: function() {
                           return Meteor.subscribe(Translation.publish, ['nav', 'general', 'sandbox', 'readme'], Translation.currentLang());
		       },
		       layoutTemplate: route_template_layout,
                       yieldTemplates: route_yieldTemplates,
                       fastRender: true
		   });
	this.route(route_name,
		   {
		       path: route_path,
                       template: 'translation_admin',
		       waitOn: function() {
                           return Meteor.subscribe(Translation.publish, ['nav', 'general', admin_domain], Translation.currentLang());
		       },
		       layoutTemplate: route_template_layout,
                       yieldTemplates: route_yieldTemplates,
                       action: function() {
                            if(this.ready()) {
                                this.render();  //render your templates as normal when data in onWait is ready
                            }
                       },
		       onAfterAction: function() {
			   Session.set("translationSearch_domain",""),
			   Session.set("translationSearch_key",""),
			   Session.set("translationSearch_lang",""),
			   Session.set("translationSearch_value","");
		       },
                       fastRender: true
		   });
    });
}



if (Meteor.isClient) {
    Meteor.startup(function () {
        Session.setDefault("translationSearch_domain",""),
        Session.setDefault("translationSearch_key",""),
        Session.setDefault("translationSearch_lang",""),
        Session.setDefault("translationSearch_value","");

        Deps.autorun(function () {
	    if (Router.current() && Router.current().route.name === route_name)
		Meteor.subscribe("translationSearch",
				 Session.get("translationSearch_domain"),
				 Session.get("translationSearch_key"),
				 Session.get("translationSearch_lang"),
				 Session.get("translationSearch_value"));
        });

        Template.translation_admin.admin_domain = function(){
            return admin_domain;
        };

        Template.translation_admin.search_result = function(){
            var set={};
            if (!_.isEmpty(Session.get("translationSearch_domain")))
                set.domain = {$regex: Session.get("translationSearch_domain")};
            if (!_.isEmpty(Session.get("translationSearch_key")))
                set.key = {$regex: Session.get("translationSearch_key")};
            if (!_.isEmpty(Session.get("translationSearch_lang")))
                set.lang = {$regex: Session.get("translationSearch_lang")};
            if (!_.isEmpty(Session.get("translationSearch_value")))
                set.value = {$regex: Session.get("translationSearch_value")};

	    return Translation.collection.find(set, { sort: ["domain", "key"], limit: max_query_size, skip: 0 });
        };

        Template.translation_admin.newline = function(){
	    return Session.get('translation_edit') === 'new' || _.isObject(Session.get('translation_edit'));
        };

        Template.translation_admin.initial_new_line = function(){
            if (_.isObject(Session.get('translation_edit')))
	        return Session.get('translation_edit');
            else
                return {};
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
	    },
            'click #remove': function(e, tpl){
                Translation.collection.remove(tpl.data._id);
            },
            'click #copy': function(e, tpl){
	        Session.set('translation_edit', tpl.data);
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

	Template.layout.activeNavbar = function(item){
	    return Router.current().route.name === item && "active" || false;
	};

	Template.layout.events({
	    'click #chooseEN': function(){
		Translation.currentLang('en');
	    },
	    'click #chooseFR': function(){
		Translation.currentLang('fr');
	    }
	});

    });

}

if (Meteor.isServer) {
    Meteor.startup(function () {


        Translation.addTranslation([admin_domain], 'domains', Translation.lang_EN, 'Domains');
        Translation.addTranslation([admin_domain], 'key', Translation.lang_EN, 'Key');
        Translation.addTranslation([admin_domain], 'languages', Translation.lang_EN, 'Languages');
        Translation.addTranslation([admin_domain], 'translation', Translation.lang_EN, 'Translation');

        Translation.addTranslation([admin_domain], 'domains', Translation.lang_FR, 'Domaines');
        Translation.addTranslation([admin_domain], 'key', Translation.lang_FR, 'Clé');
        Translation.addTranslation([admin_domain], 'languages', Translation.lang_FR, 'Langues');
        Translation.addTranslation([admin_domain], 'translation', Translation.lang_FR, 'Traduction');

        Translation.addTranslation(['general'], 'projectName', Translation.lang_EN, 'Translation');
        Translation.addTranslation(['general'], 'projectName', Translation.lang_FR, 'Translation');

        Translation.addTranslation(['nav'], 'toggleNavigation', Translation.lang_EN, 'Toggle Navigation');
        Translation.addTranslation(['nav'], 'toggleNavigation', Translation.lang_FR, 'Changer la Navigation');


        Translation.addTranslation(['nav'], 'about', Translation.lang_EN, 'About');
        Translation.addTranslation(['nav'], 'admin', Translation.lang_EN, 'Administration');

        Translation.addTranslation(['nav'], 'about', Translation.lang_FR, 'À propos');
        Translation.addTranslation(['nav'], 'admin', Translation.lang_FR, 'Administration');

        Translation.addTranslation(['nav'], 'currentLang', Translation.lang_EN, 'EN');
        Translation.addTranslation(['nav'], 'currentLang', Translation.lang_FR, 'FR');

        Translation.addTranslation(['nav'], 'english', Translation.lang_EN, 'English');
        Translation.addTranslation(['nav'], 'english', Translation.lang_FR, 'Anglais');

        Translation.addTranslation(['nav'], 'french', Translation.lang_EN, 'French');
        Translation.addTranslation(['nav'], 'french', Translation.lang_FR, 'Français');


        Translation.addTranslation(['sandbox'], 'sandbox', Translation.lang_FR, 'Bac à sable');
        Translation.addTranslation(['sandbox'], 'sandbox', Translation.lang_EN, 'Sandbox');


	Translation.addTranslationFromJSON(Assets.getText('translations.json'));


	Meteor.publish('translationSearch',
		       function(domain, key, lang, value){
			   check(domain,String);
			   check(key,String);
			   check(lang,String);
			   check(value,String);

			   return Translation.collection.canPublish(this.userId, domain, lang, key) &&
			       Translation.collection.find({domain: {$regex: domain},
							    key: {$regex: key},
							    lang: {$regex: lang},
							    value: {$regex: value}
							   },
							   {
							       limit: max_query_size,
							       skip: 0
							   }
							  ) || [];
		       });



	Translation.collection.allow({
	    insert: function(userId, doc) {
		//console.log('i',doc);
		if (doc && doc.key === 'sandbox' && _.find(doc.domain, function(e){return e === 'sandbox';})) {
		    var search = Translation.collection.findOne({key:'sandbox', domain:'sandbox', lang:doc.lang});
		    return search === undefined;
		}
		if (doc && doc.value !== undefined && doc.value.length > 128)
		    return false;


		return false;
	    },
	    update: function(userId, doc, fieldNames, modifier) {
		//console.log('u',modifier);
		if (modifier.$set.value !== undefined && modifier.$set.value.length > 128)
		    return false;
		if (modifier.$set.key !== undefined && modifier.$set.key !== 'sandbox')
		    return false;
		if (modifier.$set.domain !== undefined && ! _.find(modifier.$set.domain, function(e){return e === 'sandbox';}))
		    return false;

		return (doc && doc.key === 'sandbox' && _.find(doc.domain, function(e){return e === 'sandbox';}));
	    },
	    remove: function(userId, doc) {
		return false;
		// },
		// publish: function(userId, domain, lang) {
		//     return true;
	    }
	});
    });
}
