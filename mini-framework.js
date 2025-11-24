// Implementation of the `Idea - quote-unquote-framework` (See our notes repo, [Nov 2025])

export const qs = (...args) => {
    if (args.length >= 2) return args[0].querySelector(args[1]);
    else                 return document.querySelector(args[0]);
};

let debounceTimers = {}
export const debounce = (id, delay, fn) => {
    clearTimeout(debounceTimers[id]);
    debounceTimers[id] = setTimeout(fn, delay);
};


 /* outlet() is meant for components since you can't define ids/classes on the <mf-component> root node directly from the outside.
    Usage: 
        - Give the component an identifier in your declarative UI:
            let html = `...<htmlstuff>${ MyComponent().outlet('my-component-id') }</htmlstuff>...`
        - After the component has been rendered in the DOM, get a reference, so you can observe its properties etc.
            let myComponent = getOutlet('my-component-id')
        [Nov 2025] 
    TODO: 
        -> Maybe move this into the `Idea - quote-unquote-framework` doc.
*/
String.prototype.outlet = function (id) {
    return `<div class="outlet ${id}" style="display: contents">${this}</div>` /// LLM told me to use `style="display: contents"`. Possibly paranoia/overengineering.
}

export const getOutlet = (...args) => {
    if (args.length >= 2) return qs(args[0], `.outlet.${args[1]} > *`);
    else                  return qs(document, `.outlet.${args[0]} > *`);
}

const connectedCallbacksProvidedByUser = {};
let instanceCounter = 0;

export function wrapInCustomElement(innerHtml, { connected, dbgname }) {
    
    const instanceid = `${instanceCounter++}`;
    
    connectedCallbacksProvidedByUser[instanceid] = connected;

    if (!window.customElements.get('mf-component')) {

        let pendingConnectedCallbacks = [];
        
        window.customElements.define('mf-component', class extends HTMLElement {    
            connectedCallback() {
                pendingConnectedCallbacks.push(this); // Call connectedCallback() in reverse order per each runLoop iteration, so that child-components are initialized before their parents. () [Nov 2025]
                debounce("connectedCallback", 0, () => {
                    for (let this_ of pendingConnectedCallbacks.toReversed()) {
                        //if (!connectedCallbacksProvidedByUser[this.dataset.instanceid]) continue;
                        connectedCallbacksProvidedByUser[this_.dataset.instanceid].call(this_);
                        delete connectedCallbacksProvidedByUser[this_.dataset.instanceid];
                    }
                    pendingConnectedCallbacks = [];
                });
            }
        });
    }

    return `<mf-component data-dbgname="${dbgname}" data-instanceid="${instanceid}" style="display: contents">${innerHtml}</mf-component>`;
}


// Primitives for UI <-> model syncing

    export const listen = function (obj, eventname, callback, triggerImmediately) { 
        obj.addEventListener(eventname, () => callback())
        if (triggerImmediately) callback();
    }

    export const observe = function (obj, prop, callback, triggerImmediately) {

        if (!obj[`__mf-observers_${prop}__`]) { // First time observing this property
            obj[`__mf-observers_${prop}__`] = [];

            // Catch (possibly?) common footgun of trying to observe a computed property, like `HTMLSelectElement.value`
            {   
                // Look up the propertyDescriptor of obj.prop
                let desc;
                for (let o = obj; o; o = Object.getPrototypeOf(o)) {
                    if (Object.getOwnPropertyDescriptor(o, prop)) { 
                        desc = Object.getOwnPropertyDescriptor(o, prop); 
                        break; 
                    }
                }

                // Check if there's already a getter/setter for obj.prop
                if (desc && (desc.get || desc.set)) { // Not sure if this should be an Error or a Warning. I think we might be breaking things by overriding existing setters without calling the original setter from the override??
                    console.warn(`observe():\nProperty '${prop}' on object '${obj}' already has a getter/setter and may not be observable.\n\nFor HTMLElements, you may have to listen() for 'input', 'change', etc. instead of observing properties such as 'value' directly.`);
                }
            }

            // Install the observation
            {
                let value = obj[prop];
                
                Object.defineProperty(obj, prop, {
                    get: () => value,
                    set: (newVal) => {
                        value = newVal;
                        for (let cb of obj[`__mf-observers_${prop}__`]) cb(obj[prop]);
                    },
                });
            }
        }

        obj[`__mf-observers_${prop}__`].push(callback);

        if (triggerImmediately) callback(obj[prop]);
    }

    /**
        There is no 'observeMultiple()' or 'combineCallbacks()' primitive. Instead you can just use this pattern:

            {
                observe(obj,     'prop1', cb, false),
                observe(obj,     'prop2', cb, false),
                listen(pickerEl, 'input', cb, false),
                cb();
                function cb() {
                    console.log(`prop1 or prop2 or pickerEl changed!`);
                }
            }

            -> Super clean and easy.

            TODO: Maybe add this to `Idea - quote-unquote-framework`

        Discussion of triggerImmediately arg:
            The user will usually want `triggerImmediately = true` for observe(), but not when using it in combineCallbacks().
            The user will usually want `triggerImmediately = false` for listen(),
            -> We're not using default values to reduce footguns and keep consistency. (Not sure if that's the right choice)
    */