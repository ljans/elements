/*!
 * Luniverse Elements v3.0
 * ECMAScript 2017 template processor
 * Licensed under the MIT license
 * Copyright (c) 2019 Lukas Jans
 * https://github.com/luniverse/elements
 */
class Elements {
	
	// Configure tag enclosing
	get open() { return this.escape(this.config.open || this.constructor.open || '{{'); }
	get close() { return this.escape(this.config.close || this.constructor.close || '}}'); }
	set open(open) { this.config.open = open; }
	set close(close) { this.config.close = close; }
	
	// Constructor
	constructor(template, config={}) {
		this.template = template;
		this.config = config;
	}
	
	// Search named context
	context(name, data, fallback) {
		
		// Use local context
		if(name == '.') return data;
		
		// Traverse provided data
		let context = data;
		for(const part of name.split('.')) {
			context = context[part];
			
			// Use a fallback when the context is not found
			if(typeof context == 'undefined') {
				if(fallback) context = this.context(name, fallback);
				break;
			}
		} return context;
	}
	
	// Escape regex pattern
	escape(pattern) {
		return pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	}
	
	// Check whether value is considered empty
	empty(value) {
		if(value instanceof Function || value instanceof Date) return false;
		if(value instanceof Object) return !Object.keys(value).length;
		return !value;
	}
	
	// Clean comments and whitespace
	clean(template) {
		const pattern = new RegExp(this.open+'!.+?'+this.close, 'g');
		return template.replace(pattern, '').replace(/[\r\n\t]/g, '');
	}
	
	// Static renderer
	static render(template, data) {
		return new this(template).render(data);
	}
	
	// Render data
	render(data={}) {
		this.data = data;
		const template = this.renderRecursive(this.template, data);
		return this.clean(template);
	}
	
	/*
	 * This method renders all sections in the first dimension.
	 * It matches the names of sections against the current or global data.
	 * If the found context meets the section's condition, it is used to render the content.
	 * Otherwise, the section is deleted.
	 * Nested sections are ignored by this method.
	 */
	renderSections(template, data) {
		const pattern = new RegExp(this.open+'(\\^|#)(.+?)'+this.close+'((?:\\s|\\S)+?)'+this.open+'\/\\2'+this.close, 'g');
		return template.replace(pattern, ($null, type, name, content) => {
			
			/*
			 * Search the named context in the current data.
			 * Use the global context as fallback for low-dimensional sections nested in higher-dimensional sections.
			 * These are skipped when rendering their dimension, because at this time they are only the content of a section with higher dimension.
			 * So if a sections context cannot be found in the current data, it is searched in the global data.
			 */
			const context = this.context(name, data, this.data);
			
			// Regular section with non-empty context or inverted section with empty context
			if(type == '#' ^ this.empty(context)) return this.renderRecursive(content, context);
			
			// Regular section with empty context or inverted section with non-empty context
			return '';
		});	
	}
	
	/*
	 * This method renders all placeholders in the first dimension.
	 * It matches the names of found placeholders against the current or global data.
	 * If the found context is scalar, it is used as replacement.
	 * Otherwise, the placeholder is ignored.
	 */
	renderPlaceholders(template, data) {
		const pattern = new RegExp(this.open+'(.+?)'+this.close, 'g');
		return template.replace(pattern, (raw, name) => {
			
			/*
			 * Search the named context in the current data.
			 * There is no need to fall back to the global data.
			 * Placeholders in sections are not skipped but even rendered with higher priority.
			 * This happens, because sections are rendered recursively through all dimensions first.
			 * After that, replacing starts from the highest dimension backwards.
			 * So if a placeholder is ignored, it can be rendered later in a lower dimension.
			 */
			const context = this.context(name, data);
			
			// Render scalar value
			if(typeof context == 'string' || typeof context == 'number') return context;
			
			// Ignore placeholder without context
			return raw;
		});
	}
	
	/*
	 * This method renders the data recursively.
	 * It checks for the data type and passes it to subsequent renderers.
	 */
	renderRecursive(template, data) {
		
		// Invoke lambda
		if(data instanceof Function) return data(template);
		
		// Render array
		if(data instanceof Array && data.length) return this.renderArray(template, data);
		
		// Render date
		if(data instanceof Date) return this.renderDate(template, data);
		
		/*
		 * At this point, data is scalar or an object and has to be checked against placeholders and sections.
		 * - A scalar may occur as placeholder or conditional section (both times only '.' possible)
		 * - An object may occur as section or container for scalar values
		 */
		template = this.renderSections(template, data);
		template = this.renderPlaceholders(template, data);
		return template;
	}
	
	/*
	 * This method maps an array on a template.
	 * The template is rendered recursively with each item.
	 */
	renderArray(template, array) {
		return array.map(item => this.renderRecursive(template, item)).join('');
	}
	
	// Render date
	renderDate(template, date) {
		return this.renderPlaceholders(template, {
			d: date.getDate().toString().padStart(2, 0),
			j: date.getDate(),
			w: date.getDay(),
			m: (date.getMonth() + 1).toString().padStart(2, 0),
			n: date.getMonth() + 1,
			Y: date.getFullYear(),
			G: date.getHours(),
			H: date.getHours().toString().padStart(2, 0),
			i: date.getMinutes().toString().padStart(2, 0),
			s: date.getSeconds().toString().padStart(2, 0),
		});
	}
}
