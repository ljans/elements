/*!
 * Luniverse Elements v2.2
 * ES2017 micro-templating engine
 * Licensed under the MIT license
 * Copyright (c) 2018 Lukas Jans
 * https://github.com/luniverse/elements-js
 */
class Elements {
	
	// Constructor
	constructor(template, settings=Elements.settings) {
		this.template = template;
		this.settings = settings;
	}
	
	// Check whether value is considered as empty
	empty(value) {
		return !value || value instanceof Array && !value.length;
	}
	
	// Add leading zero
	zero(number) {
		return number < 10 ? '0'+number : number;
	}
	
	// Clean comments and whitespace
	clean(template) {
		const pattern = new RegExp(this.settings.open+'!.+?'+this.settings.close, 'g');
		return template.replace(pattern, '').replace(/[\r\n\t]/g, '');
	}
	
	// Static renderer
	static render(template, data) {
		return new Elements(template).render(data);
	}

	// Render data
	render(data) {
		const template = this.renderElement(this.template, data);
		return this.clean(template);
	}

	// Render sections
	renderSections(template, data) {
		
		// Match regex
		const pattern = new RegExp(this.settings.open+'(\\^|#)(.+?)'+this.settings.close+'((?:\\s|\\S)+?)'+this.settings.open+'\/\\2'+this.settings.close, 'g');
		return template.replace(pattern, ($null, type, key, content) => {
			
			// Determine value
			const value = data[key];
	
			// Render value for normal section with non-empty value
			if(type == '#' && !this.empty(value)) return this.renderElement(content, value, data);
	
			// Adopt content for inverted section with empty value
			if(type == '^' && this.empty(value)) return this.renderRecursive(content, data);
			
			// Skip content in other cases
			return '';
		});
	}
			
	// Render variables
	renderVariables(template, data, prefix='') {
		
		// Skip arrays
		if(data instanceof Array) return template;
		
		// Iterate over values
		for(const [key, value] of Object.entries(data)) {
			
			// Render next dimension of hash with prefix
			if(value instanceof Object) template = this.renderVariables(template, value, prefix+key+'.');
			
			// Render scalar value
			else {
				const pattern = new RegExp(this.settings.open + prefix + key + this.settings.close, 'g');
				template = template.replace(pattern, value);
			}
		}
		return template;
	}	
	
	// Render element
	renderElement(template, element, context={}) {
		
		// Call lambda
		if(element instanceof Function) return element(template);
		
		// Render list
		if(element instanceof Array) return this.renderList(template, element, context);
		
		// Render date
		if(element instanceof Date) return this.renderDate(template, element);
	
		// Render hash with local context extended by inherited context
		if(element instanceof Object) return this.renderRecursive(template, Object.assign({'.': context}, element));
		
		// Render scalar list item with local context
		if(context instanceof Array) return this.renderRecursive(template, {'.': element});
		
		// Render scalar hash item with inherited context extended by local context
		if(context instanceof Object) return this.renderRecursive(template, Object.assign({}, context, {'.': element}));
	}

	// Recursive renderer
	renderRecursive(template, data) {
		template = this.renderSections(template, data);
		template = this.renderVariables(template, data);
		return template;
	}
	
	// Map list on template
	renderList(template, list, context) {
		return list.map(element => this.renderElement(template, element, context)).join('');
	}
	
	// Render date
	renderDate(template, date) {
		const f = {};
		
		// Setup native fragments
		f.j = date.getDate();
		f.w = date.getDay();
		f.n = date.getMonth() + 1;
		f.F = this.settings.months[date.getMonth()];
		f.Y = date.getFullYear();
		f.G = date.getHours();
		f.i = this.zero(date.getMinutes());
		f.s = this.zero(date.getSeconds());
		f.v = date.getTime();
		
		// Add derived fragments
		f.d = this.zero(f.j)
		f.N = f.w + 1;
		f.l = this.settings.days[f.w];
		f.m = this.zero(f.n);
		f.H = this.zero(f.G);
		f.U = Math.floor(f.v / 1000);
		f.D = f.l.substr(0,3);
		f.M = f.F.substr(0,3);
		
		// Render fragments
		return this.renderVariables(template, f);
	}	
}

// Default settings
Elements.settings = {
	open: '{{',
	close: '}}',
	days: ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
	months: ['January','February','March','April','May','June','July','August','September','October','November','December']
}