// Implementation of the `Idea - quote-unquote-framework` (See our notes repo, [Nov 2025])

export const qs = (...args) => {
    if (args.length >= 2) return args[0].querySelector(args[1]);
    else                 return document.querySelector(args[0]);
};
export const listen = function (obj, eventname, callback) { obj.addEventListener(eventname, callback) }

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

export const observe = function (obj, prop, callback, triggerImmediately = true) {

    if (
        prop === 'value' && 
        (
            obj instanceof HTMLInputElement ||
            obj instanceof HTMLSelectElement ||
            obj instanceof HTMLTextAreaElement
        )
    ) {
        // Special case: 
        // Use addEventListener for .value on `<input>, <select>, and <textarea>` elements, because it can't be observed using Object.defineProperty(). (It seems, [Nov 2025])
        //     Discussion: This is a bit ugly / abstracted - not sure if in spirit of mini-framework.js
        //      - Might be better to add a 'triggerImmediately' option to listen()?
        //      - Or maybe we could simplify observe() by using a Proxy-based observer instead of Object.defineProperty()?

        obj.addEventListener('change', () => { callback(obj.value) });
    }
    else {

        // Default case: 
        // Use Object.defineProperty() to set up an observation

        if (!obj[`__mf-observers_${prop}__`]) { // First time observing this property
            obj[`__mf-observers_${prop}__`] = [];

            let value = obj[prop];
            
            Object.defineProperty(obj, prop, {
                get: () => value,
                set: (newVal) => {
                    value = newVal;
                    obj[`__mf-observers_${prop}__`].forEach(cb => cb(newVal));
                },
            });
        }

        obj[`__mf-observers_${prop}__`].push(callback);
    }

    if (triggerImmediately) callback(obj[prop]);
}

export function observeMultiple(objsAndProps, callback, triggerImmediately = true) {
    objsAndProps.forEach(x => observe(x[0], x[1], callback, false));
    if (triggerImmediately) callback();
}