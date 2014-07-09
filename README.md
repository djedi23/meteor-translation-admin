Administration GUI for translation

Try the demo at: http://translation.meteor.com/translation



# Instalation

```
$ mrt add translation-admin
```

# Usage

## Basic usage

Just go to:
http://url/translation


# Configuration

```
{
    "public": {
        "translation" : {
	    "admin": {
		"max_query_size" : 100,
		"admin_domain": "translation_admin",
		"use_router" : true,
		"route_name": "translation_admin",
		"route_path": "/translation",
		"route_template_layout": "translation_admin_layout",
		"route_yieldTemplates", {}
	    }
	}
    }
}
```