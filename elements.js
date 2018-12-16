/*!
 * Luniverse Elements v2.10
 * ES2017 micro-templating engine
 * Licensed under the MIT license
 * Copyright (c) 2018 Lukas Jans
 * https://github.com/luniverse/elements-js
 */
class Elements {
	
	// Constructor
	constructor(template, config={}) {
		this.template = template;
		this.config = Object.assign({}, Elements.config, config);
	}
	
	// Escape regex pattern
	escape(pattern) {
		return pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	}
	
	// Check whether value is considered empty
	empty(value) {
		if(value instanceof Function || value instanceof Date) return false;
		if(value instanceof Object) return Object.keys(value).length == 0;
		return !value;
	}
	
	// Clean comments and whitespace
	clean(template) {
		const pattern = new RegExp(this.escape(this.config.open)+'!.+?'+this.escape(this.config.close), 'g');
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
		const pattern = new RegExp(this.escape(this.config.open)+'(\\^|#)(.+?)'+this.escape(this.config.close)+'((?:\\s|\\S)+?)'+this.escape(this.config.open)+'\/\\2'+this.escape(this.config.close), 'g');
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
		
		// Render size of list
		if(data instanceof Array) data = {length: data.length};
		
		// Iterate over values
		for(const [key, value] of Object.entries(data)) {
			
			// Render next dimension of hash with prefix
			if(value instanceof Object) template = this.renderVariables(template, value, prefix+key+'.');
			
			// Render scalar value
			else {
				const pattern = new RegExp(this.escape(this.config.open + prefix + key + this.config.close), 'g');
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
		if(element instanceof Array) return this.renderList(template, element);
		
		// Render date
		if(element instanceof Date) return this.renderDate(template, element);
	
		// Render hash
		if(element instanceof Object) return this.renderRecursive(template, element);
		
		// Render scalar item (of list or hash)
		if(context instanceof Array) return this.renderRecursive(template, {'.': element});
		if(context instanceof Object) return this.renderRecursive(template, Object.assign({'.': element}, context));
	}

	// Recursive renderer
	renderRecursive(template, data) {
		template = this.renderVariables(template, data);
		template = this.renderSections(template, data);
		return template;
	}
	
	// Map list on template
	renderList(template, list) {
		return list.map(element => this.renderElement(template, element, list)).join('');
	}
	
	// Render date
	renderDate(template, date) {
		
		// Setup native fragments
		date.j = date.getDate();
		date.w = date.getDay();
		date.n = date.getMonth() + 1;
		date.F = this.config.months[date.getMonth()];
		date.Y = date.getFullYear();
		date.G = date.getHours();
		date.i = date.getMinutes().toString().padStart(2, 0);
		date.s = date.getSeconds().toString().padStart(2, 0);
		date.v = date.getTime();
		
		// Add derived fragments
		date.d = date.j.toString().padStart(2, 0);
		date.N = date.w + 1;
		date.l = this.config.days[date.w];
		date.m = date.n.toString().padStart(2, 0);
		date.H = date.G.toString().padStart(2, 0);
		date.U = Math.floor(date.v / 1000);
		date.D = date.l.substr(0, this.config.D);
		date.M = date.F.substr(0, this.config.M);
		
		// Render fragments
		return this.renderVariables(template, date);
	}	
}

// Default configuration
Elements.config = {
	D: 3,
	M: 3,
	open: '{{',
	close: '}}',
	days: ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
	months: ['January','February','March','April','May','June','July','August','September','October','November','December']
}