// Implementation of the `Idea - quote-unquote-framework` (See our notes repo, [Nov 2025])

export const qs = (...args) => {
    if (args.length >= 2) return args[0].querySelector(args[1]);
    else                 return document.querySelector(args[0]);
};
export const listen = function (obj, eventname, callback) { obj.addEventListener(eventname, callback) }

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

export const getOutlet = (root, id) => {
    return qs(root, `.outlet.${id} > *`)
}

let debounceTimers = {}
const debounce = (id, delay, fn) => {
    clearTimeout(debounceTimers[id]);
    debounceTimers[id] = setTimeout(fn, delay);
};

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
                        connectedCallbacksProvidedByUser[this_.dataset.instanceid].call(this_);
                        delete connectedCallbacksProvidedByUser[this_.dataset.instanceid];
                    }
                    pendingConnectedCallbacks = [];
                });
            }
        });
    }

    return `<mf-component data-dbgname="${dbgname}" data-instanceid="${instanceid}">${innerHtml}</mf-component>`;
}

export const observe = function (obj, prop, callback, triggerImmediately = true) {

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

    if (triggerImmediately) callback(obj[prop]);
}

export function observeMultiple(objsAndProps, callback, triggerImmediately = true) {
    objsAndProps.forEach(x => observe(x[0], x[1], callback, false));
    if (triggerImmediately) callback();
}