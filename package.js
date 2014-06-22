
if (Package.describe != undefined){
    Package.describe({
	summary: 'Administration UI for Translation, the translation in the reactive way'
    });
}

if (Package.on_use != undefined){
    Package.on_use(function (api) {
	api.use(['underscore', 'iron-router'], ['client', 'server']);
	api.use(['less', 'templating'], ['client']);


	api.add_files('translation-admin.js', ['client', 'server']);
	api.add_files(['translation-admin.html',
		       'translation-admin.less'
		      ], ['client']);
    });
}