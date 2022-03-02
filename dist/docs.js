function noop() { }
const identity = x => x;
function assign(tar, src) {
    // @ts-ignore
    for (const k in src)
        tar[k] = src[k];
    return tar;
}
function add_location(element, file, line, column, char) {
    element.__svelte_meta = {
        loc: { file, line, column, char }
    };
}
function run(fn) {
    return fn();
}
function blank_object() {
    return Object.create(null);
}
function run_all(fns) {
    fns.forEach(run);
}
function is_function(thing) {
    return typeof thing === 'function';
}
function safe_not_equal(a, b) {
    return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
}
function is_empty(obj) {
    return Object.keys(obj).length === 0;
}
function create_slot(definition, ctx, $$scope, fn) {
    if (definition) {
        const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
        return definition[0](slot_ctx);
    }
}
function get_slot_context(definition, ctx, $$scope, fn) {
    return definition[1] && fn
        ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
        : $$scope.ctx;
}
function get_slot_changes(definition, $$scope, dirty, fn) {
    if (definition[2] && fn) {
        const lets = definition[2](fn(dirty));
        if ($$scope.dirty === undefined) {
            return lets;
        }
        if (typeof lets === 'object') {
            const merged = [];
            const len = Math.max($$scope.dirty.length, lets.length);
            for (let i = 0; i < len; i += 1) {
                merged[i] = $$scope.dirty[i] | lets[i];
            }
            return merged;
        }
        return $$scope.dirty | lets;
    }
    return $$scope.dirty;
}
function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
    if (slot_changes) {
        const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
        slot.p(slot_context, slot_changes);
    }
}
function get_all_dirty_from_scope($$scope) {
    if ($$scope.ctx.length > 32) {
        const dirty = [];
        const length = $$scope.ctx.length / 32;
        for (let i = 0; i < length; i++) {
            dirty[i] = -1;
        }
        return dirty;
    }
    return -1;
}
function compute_slots(slots) {
    const result = {};
    for (const key in slots) {
        result[key] = true;
    }
    return result;
}
function action_destroyer(action_result) {
    return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
}

const is_client = typeof window !== 'undefined';
let now = is_client
    ? () => window.performance.now()
    : () => Date.now();
let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

const tasks = new Set();
function run_tasks(now) {
    tasks.forEach(task => {
        if (!task.c(now)) {
            tasks.delete(task);
            task.f();
        }
    });
    if (tasks.size !== 0)
        raf(run_tasks);
}
/**
 * Creates a new task that runs on each raf frame
 * until it returns a falsy value or is aborted
 */
function loop(callback) {
    let task;
    if (tasks.size === 0)
        raf(run_tasks);
    return {
        promise: new Promise(fulfill => {
            tasks.add(task = { c: callback, f: fulfill });
        }),
        abort() {
            tasks.delete(task);
        }
    };
}
function append(target, node) {
    target.appendChild(node);
}
function get_root_for_style(node) {
    if (!node)
        return document;
    const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
    if (root && root.host) {
        return root;
    }
    return node.ownerDocument;
}
function append_empty_stylesheet(node) {
    const style_element = element('style');
    append_stylesheet(get_root_for_style(node), style_element);
    return style_element.sheet;
}
function append_stylesheet(node, style) {
    append(node.head || node, style);
}
function insert(target, node, anchor) {
    target.insertBefore(node, anchor || null);
}
function detach(node) {
    node.parentNode.removeChild(node);
}
function destroy_each(iterations, detaching) {
    for (let i = 0; i < iterations.length; i += 1) {
        if (iterations[i])
            iterations[i].d(detaching);
    }
}
function element(name) {
    return document.createElement(name);
}
function text(data) {
    return document.createTextNode(data);
}
function space() {
    return text(' ');
}
function empty() {
    return text('');
}
function listen(node, event, handler, options) {
    node.addEventListener(event, handler, options);
    return () => node.removeEventListener(event, handler, options);
}
function prevent_default(fn) {
    return function (event) {
        event.preventDefault();
        // @ts-ignore
        return fn.call(this, event);
    };
}
function stop_propagation(fn) {
    return function (event) {
        event.stopPropagation();
        // @ts-ignore
        return fn.call(this, event);
    };
}
function attr(node, attribute, value) {
    if (value == null)
        node.removeAttribute(attribute);
    else if (node.getAttribute(attribute) !== value)
        node.setAttribute(attribute, value);
}
function children(element) {
    return Array.from(element.childNodes);
}
function set_input_value(input, value) {
    input.value = value == null ? '' : value;
}
function set_style(node, key, value, important) {
    if (value === null) {
        node.style.removeProperty(key);
    }
    else {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
}
function select_option(select, value) {
    for (let i = 0; i < select.options.length; i += 1) {
        const option = select.options[i];
        if (option.__value === value) {
            option.selected = true;
            return;
        }
    }
    select.selectedIndex = -1; // no option should be selected
}
function select_value(select) {
    const selected_option = select.querySelector(':checked') || select.options[0];
    return selected_option && selected_option.__value;
}
function toggle_class(element, name, toggle) {
    element.classList[toggle ? 'add' : 'remove'](name);
}
function custom_event(type, detail, bubbles = false) {
    const e = document.createEvent('CustomEvent');
    e.initCustomEvent(type, bubbles, false, detail);
    return e;
}
class HtmlTag {
    constructor() {
        this.e = this.n = null;
    }
    c(html) {
        this.h(html);
    }
    m(html, target, anchor = null) {
        if (!this.e) {
            this.e = element(target.nodeName);
            this.t = target;
            this.c(html);
        }
        this.i(anchor);
    }
    h(html) {
        this.e.innerHTML = html;
        this.n = Array.from(this.e.childNodes);
    }
    i(anchor) {
        for (let i = 0; i < this.n.length; i += 1) {
            insert(this.t, this.n[i], anchor);
        }
    }
    p(html) {
        this.d();
        this.h(html);
        this.i(this.a);
    }
    d() {
        this.n.forEach(detach);
    }
}

// we need to store the information for multiple documents because a Svelte application could also contain iframes
// https://github.com/sveltejs/svelte/issues/3624
const managed_styles = new Map();
let active = 0;
// https://github.com/darkskyapp/string-hash/blob/master/index.js
function hash(str) {
    let hash = 5381;
    let i = str.length;
    while (i--)
        hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
    return hash >>> 0;
}
function create_style_information(doc, node) {
    const info = { stylesheet: append_empty_stylesheet(node), rules: {} };
    managed_styles.set(doc, info);
    return info;
}
function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
    const step = 16.666 / duration;
    let keyframes = '{\n';
    for (let p = 0; p <= 1; p += step) {
        const t = a + (b - a) * ease(p);
        keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
    }
    const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
    const name = `__svelte_${hash(rule)}_${uid}`;
    const doc = get_root_for_style(node);
    const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
    if (!rules[name]) {
        rules[name] = true;
        stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
    }
    const animation = node.style.animation || '';
    node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
    active += 1;
    return name;
}
function delete_rule(node, name) {
    const previous = (node.style.animation || '').split(', ');
    const next = previous.filter(name
        ? anim => anim.indexOf(name) < 0 // remove specific animation
        : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
    );
    const deleted = previous.length - next.length;
    if (deleted) {
        node.style.animation = next.join(', ');
        active -= deleted;
        if (!active)
            clear_rules();
    }
}
function clear_rules() {
    raf(() => {
        if (active)
            return;
        managed_styles.forEach(info => {
            const { stylesheet } = info;
            let i = stylesheet.cssRules.length;
            while (i--)
                stylesheet.deleteRule(i);
            info.rules = {};
        });
        managed_styles.clear();
    });
}

let current_component;
function set_current_component(component) {
    current_component = component;
}
function get_current_component() {
    if (!current_component)
        throw new Error('Function called outside component initialization');
    return current_component;
}
function onMount(fn) {
    get_current_component().$$.on_mount.push(fn);
}
function onDestroy(fn) {
    get_current_component().$$.on_destroy.push(fn);
}
function createEventDispatcher() {
    const component = get_current_component();
    return (type, detail) => {
        const callbacks = component.$$.callbacks[type];
        if (callbacks) {
            // TODO are there situations where events could be dispatched
            // in a server (non-DOM) environment?
            const event = custom_event(type, detail);
            callbacks.slice().forEach(fn => {
                fn.call(component, event);
            });
        }
    };
}
// TODO figure out if we still want to support
// shorthand events, or if we want to implement
// a real bubbling mechanism
function bubble(component, event) {
    const callbacks = component.$$.callbacks[event.type];
    if (callbacks) {
        // @ts-ignore
        callbacks.slice().forEach(fn => fn.call(this, event));
    }
}

const dirty_components = [];
const binding_callbacks = [];
const render_callbacks = [];
const flush_callbacks = [];
const resolved_promise = Promise.resolve();
let update_scheduled = false;
function schedule_update() {
    if (!update_scheduled) {
        update_scheduled = true;
        resolved_promise.then(flush);
    }
}
function add_render_callback(fn) {
    render_callbacks.push(fn);
}
function add_flush_callback(fn) {
    flush_callbacks.push(fn);
}
// flush() calls callbacks in this order:
// 1. All beforeUpdate callbacks, in order: parents before children
// 2. All bind:this callbacks, in reverse order: children before parents.
// 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
//    for afterUpdates called during the initial onMount, which are called in
//    reverse order: children before parents.
// Since callbacks might update component values, which could trigger another
// call to flush(), the following steps guard against this:
// 1. During beforeUpdate, any updated components will be added to the
//    dirty_components array and will cause a reentrant call to flush(). Because
//    the flush index is kept outside the function, the reentrant call will pick
//    up where the earlier call left off and go through all dirty components. The
//    current_component value is saved and restored so that the reentrant call will
//    not interfere with the "parent" flush() call.
// 2. bind:this callbacks cannot trigger new flush() calls.
// 3. During afterUpdate, any updated components will NOT have their afterUpdate
//    callback called a second time; the seen_callbacks set, outside the flush()
//    function, guarantees this behavior.
const seen_callbacks = new Set();
let flushidx = 0; // Do *not* move this inside the flush() function
function flush() {
    const saved_component = current_component;
    do {
        // first, call beforeUpdate functions
        // and update components
        while (flushidx < dirty_components.length) {
            const component = dirty_components[flushidx];
            flushidx++;
            set_current_component(component);
            update(component.$$);
        }
        set_current_component(null);
        dirty_components.length = 0;
        flushidx = 0;
        while (binding_callbacks.length)
            binding_callbacks.pop()();
        // then, once components are updated, call
        // afterUpdate functions. This may cause
        // subsequent updates...
        for (let i = 0; i < render_callbacks.length; i += 1) {
            const callback = render_callbacks[i];
            if (!seen_callbacks.has(callback)) {
                // ...so guard against infinite loops
                seen_callbacks.add(callback);
                callback();
            }
        }
        render_callbacks.length = 0;
    } while (dirty_components.length);
    while (flush_callbacks.length) {
        flush_callbacks.pop()();
    }
    update_scheduled = false;
    seen_callbacks.clear();
    set_current_component(saved_component);
}
function update($$) {
    if ($$.fragment !== null) {
        $$.update();
        run_all($$.before_update);
        const dirty = $$.dirty;
        $$.dirty = [-1];
        $$.fragment && $$.fragment.p($$.ctx, dirty);
        $$.after_update.forEach(add_render_callback);
    }
}

let promise;
function wait() {
    if (!promise) {
        promise = Promise.resolve();
        promise.then(() => {
            promise = null;
        });
    }
    return promise;
}
function dispatch(node, direction, kind) {
    node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
}
const outroing = new Set();
let outros;
function group_outros() {
    outros = {
        r: 0,
        c: [],
        p: outros // parent group
    };
}
function check_outros() {
    if (!outros.r) {
        run_all(outros.c);
    }
    outros = outros.p;
}
function transition_in(block, local) {
    if (block && block.i) {
        outroing.delete(block);
        block.i(local);
    }
}
function transition_out(block, local, detach, callback) {
    if (block && block.o) {
        if (outroing.has(block))
            return;
        outroing.add(block);
        outros.c.push(() => {
            outroing.delete(block);
            if (callback) {
                if (detach)
                    block.d(1);
                callback();
            }
        });
        block.o(local);
    }
}
const null_transition = { duration: 0 };
function create_in_transition(node, fn, params) {
    let config = fn(node, params);
    let running = false;
    let animation_name;
    let task;
    let uid = 0;
    function cleanup() {
        if (animation_name)
            delete_rule(node, animation_name);
    }
    function go() {
        const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
        if (css)
            animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
        tick(0, 1);
        const start_time = now() + delay;
        const end_time = start_time + duration;
        if (task)
            task.abort();
        running = true;
        add_render_callback(() => dispatch(node, true, 'start'));
        task = loop(now => {
            if (running) {
                if (now >= end_time) {
                    tick(1, 0);
                    dispatch(node, true, 'end');
                    cleanup();
                    return running = false;
                }
                if (now >= start_time) {
                    const t = easing((now - start_time) / duration);
                    tick(t, 1 - t);
                }
            }
            return running;
        });
    }
    let started = false;
    return {
        start() {
            if (started)
                return;
            started = true;
            delete_rule(node);
            if (is_function(config)) {
                config = config();
                wait().then(go);
            }
            else {
                go();
            }
        },
        invalidate() {
            started = false;
        },
        end() {
            if (running) {
                cleanup();
                running = false;
            }
        }
    };
}
function create_out_transition(node, fn, params) {
    let config = fn(node, params);
    let running = true;
    let animation_name;
    const group = outros;
    group.r += 1;
    function go() {
        const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
        if (css)
            animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
        const start_time = now() + delay;
        const end_time = start_time + duration;
        add_render_callback(() => dispatch(node, false, 'start'));
        loop(now => {
            if (running) {
                if (now >= end_time) {
                    tick(0, 1);
                    dispatch(node, false, 'end');
                    if (!--group.r) {
                        // this will result in `end()` being called,
                        // so we don't need to clean up here
                        run_all(group.c);
                    }
                    return false;
                }
                if (now >= start_time) {
                    const t = easing((now - start_time) / duration);
                    tick(1 - t, t);
                }
            }
            return running;
        });
    }
    if (is_function(config)) {
        wait().then(() => {
            // @ts-ignore
            config = config();
            go();
        });
    }
    else {
        go();
    }
    return {
        end(reset) {
            if (reset && config.tick) {
                config.tick(1, 0);
            }
            if (running) {
                if (animation_name)
                    delete_rule(node, animation_name);
                running = false;
            }
        }
    };
}
function create_bidirectional_transition(node, fn, params, intro) {
    let config = fn(node, params);
    let t = intro ? 0 : 1;
    let running_program = null;
    let pending_program = null;
    let animation_name = null;
    function clear_animation() {
        if (animation_name)
            delete_rule(node, animation_name);
    }
    function init(program, duration) {
        const d = (program.b - t);
        duration *= Math.abs(d);
        return {
            a: t,
            b: program.b,
            d,
            duration,
            start: program.start,
            end: program.start + duration,
            group: program.group
        };
    }
    function go(b) {
        const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
        const program = {
            start: now() + delay,
            b
        };
        if (!b) {
            // @ts-ignore todo: improve typings
            program.group = outros;
            outros.r += 1;
        }
        if (running_program || pending_program) {
            pending_program = program;
        }
        else {
            // if this is an intro, and there's a delay, we need to do
            // an initial tick and/or apply CSS animation immediately
            if (css) {
                clear_animation();
                animation_name = create_rule(node, t, b, duration, delay, easing, css);
            }
            if (b)
                tick(0, 1);
            running_program = init(program, duration);
            add_render_callback(() => dispatch(node, b, 'start'));
            loop(now => {
                if (pending_program && now > pending_program.start) {
                    running_program = init(pending_program, duration);
                    pending_program = null;
                    dispatch(node, running_program.b, 'start');
                    if (css) {
                        clear_animation();
                        animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                    }
                }
                if (running_program) {
                    if (now >= running_program.end) {
                        tick(t = running_program.b, 1 - t);
                        dispatch(node, running_program.b, 'end');
                        if (!pending_program) {
                            // we're done
                            if (running_program.b) {
                                // intro — we can tidy up immediately
                                clear_animation();
                            }
                            else {
                                // outro — needs to be coordinated
                                if (!--running_program.group.r)
                                    run_all(running_program.group.c);
                            }
                        }
                        running_program = null;
                    }
                    else if (now >= running_program.start) {
                        const p = now - running_program.start;
                        t = running_program.a + running_program.d * easing(p / running_program.duration);
                        tick(t, 1 - t);
                    }
                }
                return !!(running_program || pending_program);
            });
        }
    }
    return {
        run(b) {
            if (is_function(config)) {
                wait().then(() => {
                    // @ts-ignore
                    config = config();
                    go(b);
                });
            }
            else {
                go(b);
            }
        },
        end() {
            clear_animation();
            running_program = pending_program = null;
        }
    };
}

const globals = (typeof window !== 'undefined'
    ? window
    : typeof globalThis !== 'undefined'
        ? globalThis
        : global);
function outro_and_destroy_block(block, lookup) {
    transition_out(block, 1, 1, () => {
        lookup.delete(block.key);
    });
}
function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
    let o = old_blocks.length;
    let n = list.length;
    let i = o;
    const old_indexes = {};
    while (i--)
        old_indexes[old_blocks[i].key] = i;
    const new_blocks = [];
    const new_lookup = new Map();
    const deltas = new Map();
    i = n;
    while (i--) {
        const child_ctx = get_context(ctx, list, i);
        const key = get_key(child_ctx);
        let block = lookup.get(key);
        if (!block) {
            block = create_each_block(key, child_ctx);
            block.c();
        }
        else if (dynamic) {
            block.p(child_ctx, dirty);
        }
        new_lookup.set(key, new_blocks[i] = block);
        if (key in old_indexes)
            deltas.set(key, Math.abs(i - old_indexes[key]));
    }
    const will_move = new Set();
    const did_move = new Set();
    function insert(block) {
        transition_in(block, 1);
        block.m(node, next);
        lookup.set(block.key, block);
        next = block.first;
        n--;
    }
    while (o && n) {
        const new_block = new_blocks[n - 1];
        const old_block = old_blocks[o - 1];
        const new_key = new_block.key;
        const old_key = old_block.key;
        if (new_block === old_block) {
            // do nothing
            next = new_block.first;
            o--;
            n--;
        }
        else if (!new_lookup.has(old_key)) {
            // remove old block
            destroy(old_block, lookup);
            o--;
        }
        else if (!lookup.has(new_key) || will_move.has(new_key)) {
            insert(new_block);
        }
        else if (did_move.has(old_key)) {
            o--;
        }
        else if (deltas.get(new_key) > deltas.get(old_key)) {
            did_move.add(new_key);
            insert(new_block);
        }
        else {
            will_move.add(old_key);
            o--;
        }
    }
    while (o--) {
        const old_block = old_blocks[o];
        if (!new_lookup.has(old_block.key))
            destroy(old_block, lookup);
    }
    while (n)
        insert(new_blocks[n - 1]);
    return new_blocks;
}
function validate_each_keys(ctx, list, get_context, get_key) {
    const keys = new Set();
    for (let i = 0; i < list.length; i++) {
        const key = get_key(get_context(ctx, list, i));
        if (keys.has(key)) {
            throw new Error('Cannot have duplicate keys in a keyed each');
        }
        keys.add(key);
    }
}

function bind(component, name, callback) {
    const index = component.$$.props[name];
    if (index !== undefined) {
        component.$$.bound[index] = callback;
        callback(component.$$.ctx[index]);
    }
}
function create_component(block) {
    block && block.c();
}
function mount_component(component, target, anchor, customElement) {
    const { fragment, on_mount, on_destroy, after_update } = component.$$;
    fragment && fragment.m(target, anchor);
    if (!customElement) {
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
    }
    after_update.forEach(add_render_callback);
}
function destroy_component(component, detaching) {
    const $$ = component.$$;
    if ($$.fragment !== null) {
        run_all($$.on_destroy);
        $$.fragment && $$.fragment.d(detaching);
        // TODO null out other refs, including component.$$ (but need to
        // preserve final state?)
        $$.on_destroy = $$.fragment = null;
        $$.ctx = [];
    }
}
function make_dirty(component, i) {
    if (component.$$.dirty[0] === -1) {
        dirty_components.push(component);
        schedule_update();
        component.$$.dirty.fill(0);
    }
    component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
}
function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
    const parent_component = current_component;
    set_current_component(component);
    const $$ = component.$$ = {
        fragment: null,
        ctx: null,
        // state
        props,
        update: noop,
        not_equal,
        bound: blank_object(),
        // lifecycle
        on_mount: [],
        on_destroy: [],
        on_disconnect: [],
        before_update: [],
        after_update: [],
        context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
        // everything else
        callbacks: blank_object(),
        dirty,
        skip_bound: false,
        root: options.target || parent_component.$$.root
    };
    append_styles && append_styles($$.root);
    let ready = false;
    $$.ctx = instance
        ? instance(component, options.props || {}, (i, ret, ...rest) => {
            const value = rest.length ? rest[0] : ret;
            if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                if (!$$.skip_bound && $$.bound[i])
                    $$.bound[i](value);
                if (ready)
                    make_dirty(component, i);
            }
            return ret;
        })
        : [];
    $$.update();
    ready = true;
    run_all($$.before_update);
    // `false` as a special case of no DOM component
    $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
    if (options.target) {
        if (options.hydrate) {
            const nodes = children(options.target);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            $$.fragment && $$.fragment.l(nodes);
            nodes.forEach(detach);
        }
        else {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            $$.fragment && $$.fragment.c();
        }
        if (options.intro)
            transition_in(component.$$.fragment);
        mount_component(component, options.target, options.anchor, options.customElement);
        flush();
    }
    set_current_component(parent_component);
}
/**
 * Base class for Svelte components. Used when dev=false.
 */
class SvelteComponent {
    $destroy() {
        destroy_component(this, 1);
        this.$destroy = noop;
    }
    $on(type, callback) {
        const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
        callbacks.push(callback);
        return () => {
            const index = callbacks.indexOf(callback);
            if (index !== -1)
                callbacks.splice(index, 1);
        };
    }
    $set($$props) {
        if (this.$$set && !is_empty($$props)) {
            this.$$.skip_bound = true;
            this.$$set($$props);
            this.$$.skip_bound = false;
        }
    }
}

function dispatch_dev(type, detail) {
    document.dispatchEvent(custom_event(type, Object.assign({ version: '3.46.4' }, detail), true));
}
function append_dev(target, node) {
    dispatch_dev('SvelteDOMInsert', { target, node });
    append(target, node);
}
function insert_dev(target, node, anchor) {
    dispatch_dev('SvelteDOMInsert', { target, node, anchor });
    insert(target, node, anchor);
}
function detach_dev(node) {
    dispatch_dev('SvelteDOMRemove', { node });
    detach(node);
}
function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
    const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
    if (has_prevent_default)
        modifiers.push('preventDefault');
    if (has_stop_propagation)
        modifiers.push('stopPropagation');
    dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
    const dispose = listen(node, event, handler, options);
    return () => {
        dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
        dispose();
    };
}
function attr_dev(node, attribute, value) {
    attr(node, attribute, value);
    if (value == null)
        dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
    else
        dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
}
function prop_dev(node, property, value) {
    node[property] = value;
    dispatch_dev('SvelteDOMSetProperty', { node, property, value });
}
function set_data_dev(text, data) {
    data = '' + data;
    if (text.wholeText === data)
        return;
    dispatch_dev('SvelteDOMSetData', { node: text, data });
    text.data = data;
}
function validate_each_argument(arg) {
    if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
        let msg = '{#each} only iterates over array-like objects.';
        if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
            msg += ' You can use a spread to convert this iterable into an array.';
        }
        throw new Error(msg);
    }
}
function validate_slots(name, slot, keys) {
    for (const slot_key of Object.keys(slot)) {
        if (!~keys.indexOf(slot_key)) {
            console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
        }
    }
}
/**
 * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
 */
class SvelteComponentDev extends SvelteComponent {
    constructor(options) {
        if (!options || (!options.target && !options.$$inline)) {
            throw new Error("'target' is a required option");
        }
        super();
    }
    $destroy() {
        super.$destroy();
        this.$destroy = () => {
            console.warn('Component was already destroyed'); // eslint-disable-line no-console
        };
    }
    $capture_state() { }
    $inject_state() { }
}

/* docs/app/nav-item.svelte generated by Svelte v3.46.4 */

const file$D = "docs/app/nav-item.svelte";

function create_fragment$E(ctx) {
	let a;
	let t;
	let a_href_value;

	const block = {
		c: function create() {
			a = element("a");
			t = text(/*name*/ ctx[1]);
			attr_dev(a, "href", a_href_value = "#" + /*hash*/ ctx[2]);
			toggle_class(a, "active", /*active*/ ctx[0] === /*hash*/ ctx[2]);
			add_location(a, file$D, 0, 0, 0);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, a, anchor);
			append_dev(a, t);
		},
		p: function update(ctx, [dirty]) {
			if (dirty & /*name*/ 2) set_data_dev(t, /*name*/ ctx[1]);

			if (dirty & /*hash*/ 4 && a_href_value !== (a_href_value = "#" + /*hash*/ ctx[2])) {
				attr_dev(a, "href", a_href_value);
			}

			if (dirty & /*active, hash*/ 5) {
				toggle_class(a, "active", /*active*/ ctx[0] === /*hash*/ ctx[2]);
			}
		},
		i: noop,
		o: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(a);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$E.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$E($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots('Nav_item', slots, []);
	let { active = location.hash.substr(1) } = $$props;
	let { name = '' } = $$props;
	let { hash = name.replace(/\s/g, '') } = $$props;
	const writable_props = ['active', 'name', 'hash'];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Nav_item> was created with unknown prop '${key}'`);
	});

	$$self.$$set = $$props => {
		if ('active' in $$props) $$invalidate(0, active = $$props.active);
		if ('name' in $$props) $$invalidate(1, name = $$props.name);
		if ('hash' in $$props) $$invalidate(2, hash = $$props.hash);
	};

	$$self.$capture_state = () => ({ active, name, hash });

	$$self.$inject_state = $$props => {
		if ('active' in $$props) $$invalidate(0, active = $$props.active);
		if ('name' in $$props) $$invalidate(1, name = $$props.name);
		if ('hash' in $$props) $$invalidate(2, hash = $$props.hash);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [active, name, hash];
}

class Nav_item extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$E, create_fragment$E, safe_not_equal, { active: 0, name: 1, hash: 2 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Nav_item",
			options,
			id: create_fragment$E.name
		});
	}

	get active() {
		throw new Error("<Nav_item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set active(value) {
		throw new Error("<Nav_item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get name() {
		throw new Error("<Nav_item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set name(value) {
		throw new Error("<Nav_item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get hash() {
		throw new Error("<Nav_item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set hash(value) {
		throw new Error("<Nav_item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

// Handles arrays, objects, null, strings, numbers, (no Date)
function deepCopy (o) {
	if (typeof o !== 'object'||o === null) return o;
	let newO, i;
	// handle case: array
	if (o instanceof Array) {
		let l = o.length;
		newO = [];
		for (i = 0; i < l; i++) newO[i] = deepCopy(o[i]);
		return newO;
	}
	// handle case: object
	newO = {};
	// eslint-disable-next-line no-prototype-builtins
	for (i in o) if (o.hasOwnProperty(i)) newO[i] = deepCopy(o[i]);
	return newO;
}


function fuzzy (hay = '', s = '') {
	hay = hay.toLowerCase();
	s = s.toLowerCase();
	let n = -1;
	for (let l of s) if (!~(n = hay.indexOf(l, n + 1))) return false;
	return true;
}


function emphasize (str, q) {
	if (!q) return str;
	str = '' + str;
	let idx = 0;
	let low = str.toLowerCase();

	// string includes the whole query block
	if (low.includes(q)) return str.replace(new RegExp(`(${q})`, 'ig'), '<b>$1</b>');

	// string includes the scattered query
	let stra = str.split('');
	q = q.toLowerCase();
	for (let l of q) {
		idx = low.indexOf(l, idx);
		let letter = stra[idx];
		if (letter) {
			stra.splice(idx, 1, `<b>${letter}</b>`);
			idx += 1;
		}
	}
	return stra.join('');
}

var users = '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-users" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/><path d="M21 21v-2a4 4 0 0 0 -3 -3.85"/></svg>';

var user = '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-user" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><circle cx="12" cy="7" r="4"/><path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2"/></svg>';

var trash = '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-trash" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><line x1="4" y1="7" x2="20" y2="7"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/><path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12"/><path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3"/></svg>';

var tag = '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-tag" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M11 3l9 9a1.5 1.5 0 0 1 0 2l-6 6a1.5 1.5 0 0 1 -2 0l-9 -9v-4a4 4 0 0 1 4 -4h4"/><circle cx="9" cy="9" r="2"/></svg>';

var shared = '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-share" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="6" r="3"/><circle cx="18" cy="18" r="3"/><line x1="8.7" y1="10.7" x2="15.3" y2="7.3"/><line x1="8.7" y1="13.3" x2="15.3" y2="16.7"/></svg>';

var search = '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-search" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><circle cx="10" cy="10" r="7"/><line x1="21" y1="21" x2="15" y2="15"/></svg>';

var reportMoney = '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-report-money" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2"/><rect x="9" y="3" width="6" height="4" rx="2"/><path d="M14 11h-2.5a1.5 1.5 0 0 0 0 3h1a1.5 1.5 0 0 1 0 3h-2.5"/><path d="M12 17v1m0 -8v1"/></svg>';

var reportAnalytics = '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-file-analytics" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M14 3v4a1 1 0 0 0 1 1h4"/><path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z"/><line x1="9" y1="17" x2="9" y2="12"/><line x1="12" y1="17" x2="12" y2="16"/><line x1="15" y1="17" x2="15" y2="14"/></svg>';

var reset = '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-arrow-back" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M9 11l-4 4l4 4m-4 -4h11a4 4 0 0 0 0 -8h-1"/></svg>';

var restore = '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-arrow-back-up" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M9 13l-4 -4l4 -4m-4 4h11a4 4 0 0 1 0 8h-1"/></svg>';

var receipt = '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-receipt" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 21v-16a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v16l-3 -2l-2 2l-2 -2l-2 2l-2 -2l-3 2m4 -14h6m-6 4h6m-2 4h2"/></svg>';

var plus = '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-plus" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>';

var pluscircle = '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-circle-plus" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><circle cx="12" cy="12" r="9"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="12" y1="9" x2="12" y2="15"/></svg>';

var minuscircle = '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-circle-minus" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><circle cx="12" cy="12" r="9" /><line x1="9" y1="12" x2="15" y2="12" /></svg>';

var meatballs = '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-dots-vertical" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/><circle cx="12" cy="5" r="1"/></svg>';

var math = '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-math-symbols" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><line x1="3" y1="12" x2="21" y2="12" /><line x1="12" y1="3" x2="12" y2="21" /><line x1="16.5" y1="4.5" x2="19.5" y2="7.5" /><line x1="19.5" y1="4.5" x2="16.5" y2="7.5" /><line x1="6" y1="4" x2="6" y2="8" /><line x1="4" y1="6" x2="8" y2="6" /><line x1="18" y1="16" x2="18.01" y2="16" /><line x1="18" y1="20" x2="18.01" y2="20" /><line x1="4" y1="18" x2="8" y2="18" /></svg>';

var logout = '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-logout" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2"/><path d="M7 12h14l-3 -3m0 6l3 -3"/></svg>';

var list = '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-list" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><line x1="5" y1="6" x2="5" y2="6.01"/><line x1="5" y1="12" x2="5" y2="12.01"/><line x1="5" y1="18" x2="5" y2="18.01"/></svg>';

var link = '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-link" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M10 14a3.5 3.5 0 0 0 5 0l4 -4a3.5 3.5 0 0 0 -5 -5l-.5 .5"/><path d="M14 10a3.5 3.5 0 0 0 -5 0l-4 4a3.5 3.5 0 0 0 5 5l.5 -.5"/></svg>';

var info = '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-info-circle" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12.01" y2="8"/><polyline points="11 12 12 12 12 16 13 16"/></svg>';

var home = '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-home" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><polyline points="5 12 3 12 12 3 21 12 19 12"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7"/><path d="M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6"/></svg>';

var folder = '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-folder" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 4h4l3 3h7a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-11a2 2 0 0 1 2 -2"/></svg>';

var eyeOff = '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-eye-off" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><line x1="3" y1="3" x2="21" y2="21" /><path d="M10.584 10.587a2 2 0 0 0 2.828 2.83" /><path d="M9.363 5.365a9.466 9.466 0 0 1 2.637 -.365c4 0 7.333 2.333 10 7c-.778 1.361 -1.612 2.524 -2.503 3.488m-2.14 1.861c-1.631 1.1 -3.415 1.651 -5.357 1.651c-4 0 -7.333 -2.333 -10 -7c1.369 -2.395 2.913 -4.175 4.632 -5.341" /></svg>';

var eye = '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-eye" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><circle cx="12" cy="12" r="2" /><path d="M22 12c-2.667 4.667 -6 7 -10 7s-7.333 -2.333 -10 -7c2.667 -4.667 6 -7 10 -7s7.333 2.333 10 7" /></svg>';

var edit = '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-edit" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M9 7h-3a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-3"/><path d="M9 15h3l8.5 -8.5a1.5 1.5 0 0 0 -3 -3l-8.5 8.5v3"/><line x1="16" y1="5" x2="19" y2="8"/></svg>';

var dots = '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-dots" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></svg>';

var cog = '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-settings" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z"/><circle cx="12" cy="12" r="3"/></svg>';

var close = '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-x" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

var chevronRight = '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-chevron-right" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><polyline points="9 6 15 12 9 18"/></svg>';

var chevronLeft = '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-chevron-left" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><polyline points="15 6 9 12 15 18"/></svg>';

var checklist = '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-list-check" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3.5 5.5l1.5 1.5l2.5 -2.5"/><path d="M3.5 11.5l1.5 1.5l2.5 -2.5"/><path d="M3.5 17.5l1.5 1.5l2.5 -2.5"/><line x1="11" y1="6" x2="20" y2="6"/><line x1="11" y1="12" x2="20" y2="12"/><line x1="11" y1="18" x2="20" y2="18"/></svg>';

var checkbox = '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-square" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><rect x="4" y="4" width="16" height="16" rx="2"/></svg>';

var checkboxChecked = '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-square-check" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 12l2 2l4 -4"/></svg>';

var check = '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-check" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 12l5 5l10 -10"/></svg>';

var cash = '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-cash" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><rect x="7" y="9" width="14" height="10" rx="2"/><circle cx="14" cy="14" r="2"/><path d="M17 9v-2a2 2 0 0 0 -2 -2h-10a2 2 0 0 0 -2 2v6a2 2 0 0 0 2 2h2"/></svg>';

var calendar = '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-calendar" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><rect x="4" y="5" width="16" height="16" rx="2" /><line x1="16" y1="3" x2="16" y2="7" /><line x1="8" y1="3" x2="8" y2="7" /><line x1="4" y1="11" x2="20" y2="11" /><line x1="11" y1="15" x2="12" y2="15" /><line x1="12" y1="15" x2="12" y2="18" /></svg>';

var calculator = '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-calculator" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><rect x="4" y="3" width="16" height="18" rx="2" /><rect x="8" y="7" width="8" height="3" rx="1" /><line x1="8" y1="14" x2="8" y2="14.01" /><line x1="12" y1="14" x2="12" y2="14.01" /><line x1="16" y1="14" x2="16" y2="14.01" /><line x1="8" y1="17" x2="8" y2="17.01" /><line x1="12" y1="17" x2="12" y2="17.01" /><line x1="16" y1="17" x2="16" y2="17.01" /></svg>';

var bookmark = '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-bookmark" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M9 4h6a2 2 0 0 1 2 2v14l-5 -3l-5 3v-14a2 2 0 0 1 2 -2"/></svg>';

var book = '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-book" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 19a9 9 0 0 1 9 0a9 9 0 0 1 9 0"/><path d="M3 6a9 9 0 0 1 9 0a9 9 0 0 1 9 0"/><line x1="3" y1="6" x2="3" y2="19"/><line x1="12" y1="6" x2="12" y2="19"/><line x1="21" y1="6" x2="21" y2="19"/></svg>';

var bell = '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-bell" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M10 5a2 2 0 0 1 4 0a7 7 0 0 1 4 6v3a4 4 0 0 0 2 3h-16a4 4 0 0 0 2 -3v-3a7 7 0 0 1 4 -6"/><path d="M9 17v1a3 3 0 0 0 6 0v-1"/></svg>';

var bank = '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-building-bank" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><line x1="3" y1="21" x2="21" y2="21"/><line x1="3" y1="10" x2="21" y2="10"/><polyline points="5 6 12 3 19 6"/><line x1="4" y1="10" x2="4" y2="21"/><line x1="20" y1="10" x2="20" y2="21"/><line x1="8" y1="14" x2="8" y2="17"/><line x1="12" y1="14" x2="12" y2="17"/><line x1="16" y1="14" x2="16" y2="17"/></svg>';

var arrowRight = '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-arrow-right" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><line x1="5" y1="12" x2="19" y2="12"/><line x1="13" y1="18" x2="19" y2="12"/><line x1="13" y1="6" x2="19" y2="12"/></svg>';

var arrowLeft = '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-arrow-left" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><line x1="5" y1="12" x2="19" y2="12"/><line x1="5" y1="12" x2="11" y2="18"/><line x1="5" y1="12" x2="11" y2="6"/></svg>';

var apps = '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-apps" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/><line x1="14" y1="7" x2="20" y2="7"/><line x1="17" y1="4" x2="17" y2="10"/></svg>';

var alert$1 = '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-alert-triangle" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 9v2m0 4v.01"/><path d="M5 19h14a2 2 0 0 0 1.84 -2.75l-7.1 -12.25a2 2 0 0 0 -3.5 0l-7.1 12.25a2 2 0 0 0 1.75 2.75"/></svg>';

var adjustments = '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-adjustments-horizontal" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><circle cx="14" cy="6" r="2"/><line x1="4" y1="6" x2="12" y2="6"/><line x1="16" y1="6" x2="20" y2="6"/><circle cx="8" cy="12" r="2"/><line x1="4" y1="12" x2="6" y2="12"/><line x1="10" y1="12" x2="20" y2="12"/><circle cx="17" cy="18" r="2"/><line x1="4" y1="18" x2="15" y2="18"/><line x1="19" y1="18" x2="20" y2="18"/></svg>';

/* src/icon/index.svelte generated by Svelte v3.46.4 */

function create_fragment$D(ctx) {
	let html_tag;
	let html_anchor;

	const block = {
		c: function create() {
			html_tag = new HtmlTag();
			html_anchor = empty();
			html_tag.a = html_anchor;
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			html_tag.m(/*svg*/ ctx[0], target, anchor);
			insert_dev(target, html_anchor, anchor);
		},
		p: function update(ctx, [dirty]) {
			if (dirty & /*svg*/ 1) html_tag.p(/*svg*/ ctx[0]);
		},
		i: noop,
		o: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(html_anchor);
			if (detaching) html_tag.d();
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$D.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

const icons = {
	adjustments,
	alert: alert$1,
	add: plus,
	apps,
	arrowLeft,
	arrowRight,
	bank,
	bell,
	book,
	bookmark,
	calculator,
	calendar,
	cash,
	check,
	checkboxChecked,
	checkbox,
	checklist,
	chevronLeft,
	chevronRight,
	close,
	cog,
	dots,
	edit,
	eye,
	eyeOff,
	folder,
	home,
	info,
	link,
	list,
	logout,
	math,
	meatballs,
	minuscircle,
	plus,
	pluscircle,
	receipt,
	restore,
	reset,
	report: reportAnalytics,
	reportAnalytics,
	reportMoney,
	search,
	shared,
	tag,
	trash,
	user,
	users
};

function instance$D($$self, $$props, $$invalidate) {
	let svg;
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots('Icon', slots, []);
	let { name = '' } = $$props;
	const writable_props = ['name'];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Icon> was created with unknown prop '${key}'`);
	});

	$$self.$$set = $$props => {
		if ('name' in $$props) $$invalidate(1, name = $$props.name);
	};

	$$self.$capture_state = () => ({
		adjustments,
		alert: alert$1,
		apps,
		arrowLeft,
		arrowRight,
		bank,
		bell,
		book,
		bookmark,
		calculator,
		calendar,
		cash,
		check,
		checkboxChecked,
		checkbox,
		checklist,
		chevronLeft,
		chevronRight,
		close,
		cog,
		dots,
		edit,
		eye,
		eyeOff,
		folder,
		home,
		info,
		link,
		list,
		logout,
		math,
		meatballs,
		minuscircle,
		pluscircle,
		plus,
		receipt,
		restore,
		reset,
		reportAnalytics,
		reportMoney,
		search,
		shared,
		tag,
		trash,
		user,
		users,
		icons,
		name,
		svg
	});

	$$self.$inject_state = $$props => {
		if ('name' in $$props) $$invalidate(1, name = $$props.name);
		if ('svg' in $$props) $$invalidate(0, svg = $$props.svg);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*name*/ 2) {
			$$invalidate(0, svg = icons[name] || '<svg width="20" height="20"></svg>');
		}
	};

	return [svg, name];
}

class Icon extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$D, create_fragment$D, safe_not_equal, { name: 1 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Icon",
			options,
			id: create_fragment$D.name
		});
	}

	get name() {
		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set name(value) {
		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* src/autocomplete/index.svelte generated by Svelte v3.46.4 */

const { Object: Object_1$3 } = globals;
const file$C = "src/autocomplete/index.svelte";

function get_each_context$3(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[41] = list[i];
	return child_ctx;
}

function get_each_context_1$1(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[44] = list[i];
	return child_ctx;
}

// (32:54) 
function create_if_block_3(ctx) {
	let div;
	let t0;
	let b;
	let t1;
	let mounted;
	let dispose;

	const block = {
		c: function create() {
			div = element("div");
			t0 = text("Create: ");
			b = element("b");
			t1 = text(/*text*/ ctx[1]);
			add_location(b, file$C, 34, 13, 1050);
			attr_dev(div, "class", "autocomplete-list-item selected");
			add_location(div, file$C, 32, 3, 944);
		},
		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);
			append_dev(div, t0);
			append_dev(div, b);
			append_dev(b, t1);

			if (!mounted) {
				dispose = listen_dev(div, "click", /*click_handler_1*/ ctx[24], false, false, false);
				mounted = true;
			}
		},
		p: function update(ctx, dirty) {
			if (dirty[0] & /*text*/ 2) set_data_dev(t1, /*text*/ ctx[1]);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div);
			mounted = false;
			dispose();
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_3.name,
		type: "if",
		source: "(32:54) ",
		ctx
	});

	return block;
}

// (16:2) {#if filteredData.length}
function create_if_block$4(ctx) {
	let each_1_anchor;
	let each_value = /*groupedData*/ ctx[12];
	validate_each_argument(each_value);
	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
	}

	const block = {
		c: function create() {
			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			each_1_anchor = empty();
		},
		m: function mount(target, anchor) {
			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(target, anchor);
			}

			insert_dev(target, each_1_anchor, anchor);
		},
		p: function update(ctx, dirty) {
			if (dirty[0] & /*groupedData, highlightIndex, onclick*/ 20736) {
				each_value = /*groupedData*/ ctx[12];
				validate_each_argument(each_value);
				let i;

				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context$3(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block$3(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value.length;
			}
		},
		d: function destroy(detaching) {
			destroy_each(each_blocks, detaching);
			if (detaching) detach_dev(each_1_anchor);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block$4.name,
		type: "if",
		source: "(16:2) {#if filteredData.length}",
		ctx
	});

	return block;
}

// (18:4) {#if group.name}
function create_if_block_2(ctx) {
	let div;
	let t_value = /*group*/ ctx[41].name + "";
	let t;

	const block = {
		c: function create() {
			div = element("div");
			t = text(t_value);
			attr_dev(div, "class", "autocomplete-list-header");
			add_location(div, file$C, 18, 5, 524);
		},
		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);
			append_dev(div, t);
		},
		p: function update(ctx, dirty) {
			if (dirty[0] & /*groupedData*/ 4096 && t_value !== (t_value = /*group*/ ctx[41].name + "")) set_data_dev(t, t_value);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_2.name,
		type: "if",
		source: "(18:4) {#if group.name}",
		ctx
	});

	return block;
}

// (21:4) {#if group.items}
function create_if_block_1$1(ctx) {
	let each_1_anchor;
	let each_value_1 = /*group*/ ctx[41].items;
	validate_each_argument(each_value_1);
	let each_blocks = [];

	for (let i = 0; i < each_value_1.length; i += 1) {
		each_blocks[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
	}

	const block = {
		c: function create() {
			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			each_1_anchor = empty();
		},
		m: function mount(target, anchor) {
			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(target, anchor);
			}

			insert_dev(target, each_1_anchor, anchor);
		},
		p: function update(ctx, dirty) {
			if (dirty[0] & /*groupedData, highlightIndex, onclick*/ 20736) {
				each_value_1 = /*group*/ ctx[41].items;
				validate_each_argument(each_value_1);
				let i;

				for (i = 0; i < each_value_1.length; i += 1) {
					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block_1$1(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value_1.length;
			}
		},
		d: function destroy(detaching) {
			destroy_each(each_blocks, detaching);
			if (detaching) detach_dev(each_1_anchor);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_1$1.name,
		type: "if",
		source: "(21:4) {#if group.items}",
		ctx
	});

	return block;
}

// (22:5) {#each group.items as item}
function create_each_block_1$1(ctx) {
	let div;
	let html_tag;
	let raw_value = (/*item*/ ctx[44].highlightedName || /*item*/ ctx[44].name) + "";
	let t;
	let mounted;
	let dispose;

	function click_handler() {
		return /*click_handler*/ ctx[23](/*item*/ ctx[44]);
	}

	const block = {
		c: function create() {
			div = element("div");
			html_tag = new HtmlTag();
			t = space();
			html_tag.a = t;
			attr_dev(div, "class", "autocomplete-list-item");
			toggle_class(div, "selected", /*item*/ ctx[44].idx === /*highlightIndex*/ ctx[8]);
			add_location(div, file$C, 22, 6, 652);
		},
		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);
			html_tag.m(raw_value, div);
			append_dev(div, t);

			if (!mounted) {
				dispose = listen_dev(div, "click", click_handler, false, false, false);
				mounted = true;
			}
		},
		p: function update(new_ctx, dirty) {
			ctx = new_ctx;
			if (dirty[0] & /*groupedData*/ 4096 && raw_value !== (raw_value = (/*item*/ ctx[44].highlightedName || /*item*/ ctx[44].name) + "")) html_tag.p(raw_value);

			if (dirty[0] & /*groupedData, highlightIndex*/ 4352) {
				toggle_class(div, "selected", /*item*/ ctx[44].idx === /*highlightIndex*/ ctx[8]);
			}
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div);
			mounted = false;
			dispose();
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_each_block_1$1.name,
		type: "each",
		source: "(22:5) {#each group.items as item}",
		ctx
	});

	return block;
}

// (17:3) {#each groupedData as group}
function create_each_block$3(ctx) {
	let t;
	let if_block1_anchor;
	let if_block0 = /*group*/ ctx[41].name && create_if_block_2(ctx);
	let if_block1 = /*group*/ ctx[41].items && create_if_block_1$1(ctx);

	const block = {
		c: function create() {
			if (if_block0) if_block0.c();
			t = space();
			if (if_block1) if_block1.c();
			if_block1_anchor = empty();
		},
		m: function mount(target, anchor) {
			if (if_block0) if_block0.m(target, anchor);
			insert_dev(target, t, anchor);
			if (if_block1) if_block1.m(target, anchor);
			insert_dev(target, if_block1_anchor, anchor);
		},
		p: function update(ctx, dirty) {
			if (/*group*/ ctx[41].name) {
				if (if_block0) {
					if_block0.p(ctx, dirty);
				} else {
					if_block0 = create_if_block_2(ctx);
					if_block0.c();
					if_block0.m(t.parentNode, t);
				}
			} else if (if_block0) {
				if_block0.d(1);
				if_block0 = null;
			}

			if (/*group*/ ctx[41].items) {
				if (if_block1) {
					if_block1.p(ctx, dirty);
				} else {
					if_block1 = create_if_block_1$1(ctx);
					if_block1.c();
					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
				}
			} else if (if_block1) {
				if_block1.d(1);
				if_block1 = null;
			}
		},
		d: function destroy(detaching) {
			if (if_block0) if_block0.d(detaching);
			if (detaching) detach_dev(t);
			if (if_block1) if_block1.d(detaching);
			if (detaching) detach_dev(if_block1_anchor);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_each_block$3.name,
		type: "each",
		source: "(17:3) {#each groupedData as group}",
		ctx
	});

	return block;
}

function create_fragment$C(ctx) {
	let div1;
	let icon;
	let t0;
	let input_1;
	let input_1_value_value;
	let t1;
	let div0;
	let div0_class_value;
	let current;
	let mounted;
	let dispose;
	icon = new Icon({ props: { name: "dots" }, $$inline: true });

	function select_block_type(ctx, dirty) {
		if (/*filteredData*/ ctx[11].length) return create_if_block$4;
		if (/*allowNew*/ ctx[2] === true || /*allowNew*/ ctx[2] === 'true') return create_if_block_3;
	}

	let current_block_type = select_block_type(ctx);
	let if_block = current_block_type && current_block_type(ctx);

	const block = {
		c: function create() {
			div1 = element("div");
			create_component(icon.$$.fragment);
			t0 = space();
			input_1 = element("input");
			t1 = space();
			div0 = element("div");
			if (if_block) if_block.c();
			attr_dev(input_1, "type", "text");
			attr_dev(input_1, "class", "autocomplete-input");
			input_1.required = /*required*/ ctx[4];
			input_1.disabled = /*disabled*/ ctx[5];
			input_1.value = input_1_value_value = /*value*/ ctx[0] && /*value*/ ctx[0].name || /*text*/ ctx[1] || '';
			attr_dev(input_1, "placeholder", /*placeholder*/ ctx[3]);
			add_location(input_1, file$C, 2, 1, 66);
			attr_dev(div0, "class", div0_class_value = "autocomplete-list " + (/*opened*/ ctx[7] ? '' : 'hidden'));
			add_location(div0, file$C, 14, 1, 362);
			attr_dev(div1, "class", "autocomplete");
			add_location(div1, file$C, 0, 0, 0);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, div1, anchor);
			mount_component(icon, div1, null);
			append_dev(div1, t0);
			append_dev(div1, input_1);
			/*input_1_binding*/ ctx[22](input_1);
			append_dev(div1, t1);
			append_dev(div1, div0);
			if (if_block) if_block.m(div0, null);
			/*div0_binding*/ ctx[25](div0);
			/*div1_binding*/ ctx[26](div1);
			current = true;

			if (!mounted) {
				dispose = [
					listen_dev(input_1, "input", /*filter*/ ctx[13], false, false, false),
					listen_dev(input_1, "focus", /*open*/ ctx[18], false, false, false),
					listen_dev(input_1, "change", /*onchange*/ ctx[15], false, false, false),
					listen_dev(input_1, "keydown", /*onkeydown*/ ctx[16], false, false, false),
					listen_dev(input_1, "keypress", /*onkeypress*/ ctx[17], false, false, false)
				];

				mounted = true;
			}
		},
		p: function update(ctx, dirty) {
			if (!current || dirty[0] & /*required*/ 16) {
				prop_dev(input_1, "required", /*required*/ ctx[4]);
			}

			if (!current || dirty[0] & /*disabled*/ 32) {
				prop_dev(input_1, "disabled", /*disabled*/ ctx[5]);
			}

			if (!current || dirty[0] & /*value, text*/ 3 && input_1_value_value !== (input_1_value_value = /*value*/ ctx[0] && /*value*/ ctx[0].name || /*text*/ ctx[1] || '') && input_1.value !== input_1_value_value) {
				prop_dev(input_1, "value", input_1_value_value);
			}

			if (!current || dirty[0] & /*placeholder*/ 8) {
				attr_dev(input_1, "placeholder", /*placeholder*/ ctx[3]);
			}

			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
				if_block.p(ctx, dirty);
			} else {
				if (if_block) if_block.d(1);
				if_block = current_block_type && current_block_type(ctx);

				if (if_block) {
					if_block.c();
					if_block.m(div0, null);
				}
			}

			if (!current || dirty[0] & /*opened*/ 128 && div0_class_value !== (div0_class_value = "autocomplete-list " + (/*opened*/ ctx[7] ? '' : 'hidden'))) {
				attr_dev(div0, "class", div0_class_value);
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(icon.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(icon.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div1);
			destroy_component(icon);
			/*input_1_binding*/ ctx[22](null);

			if (if_block) {
				if_block.d();
			}

			/*div0_binding*/ ctx[25](null);
			/*div1_binding*/ ctx[26](null);
			mounted = false;
			run_all(dispose);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$C.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$C($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots('Autocomplete', slots, []);
	let { data = [] } = $$props;
	let { value = null } = $$props;
	let { text = '' } = $$props;
	let { allowNew = false } = $$props;
	let { showAllInitially = true } = $$props;
	let { clearOnEsc = false } = $$props;
	let { placeholder = '' } = $$props;
	let { required = false } = $$props;
	let { disabled = undefined } = $$props;
	let el;
	let opened = false;
	let hasEdited = false;
	let highlightIndex = 0;
	let input, list, filteredData = [], groupedData = [];
	const dispatch = createEventDispatcher();

	function filter() {
		$$invalidate(1, text = input.value || '');
		open({ type: 'filter' });
		const showAll = (showAllInitially === true || showAllInitially === 'true') && !hasEdited;
		const q = showAll ? '' : text.toLowerCase().trim();
		let filtered = deepCopy(data);

		if (text) {
			filtered = filtered.filter(item => typeof item === 'string' || fuzzy(item.name, q)).map(item => {
				item.highlightedName = emphasize(item.name, q);

				// item.score = 1;
				// if (item.name.toLowerCase().includes(q)) item.score = 2;
				// if (item.name.includes(text)) item.score = 3;
				// if (item.name.toLowerCase() === q) item.score = 4;
				// if (item.name === text) item.score = 5;
				return item;
			});
		} // .sort((a, b) => b.score - a.score);

		filtered.forEach((item, idx) => item.idx = idx);
		$$invalidate(11, filteredData = filtered);
		let nogroup = [];
		const _groups = {};

		filtered.forEach(item => {
			if (!item.group) return nogroup.push(item);
			_groups[item.group] = _groups[item.group] || { name: item.group, items: [] };
			_groups[item.group].items.push(item);
		});

		const groups = Object.values(_groups).filter(g => !!g.items.length);
		$$invalidate(12, groupedData = [{ items: nogroup }, ...groups]);
		$$invalidate(8, highlightIndex = -1);
		hasEdited = true;
		requestAnimationFrame(recalculateListHeight);
		down();
	}

	function highlight() {
		const selectedEl = list.querySelector('.selected');
		if (!selectedEl) return;
		const listEl = selectedEl.parentNode;

		// going up
		if (listEl.scrollTop > selectedEl.offsetTop) {
			listEl.scrollTo({
				top: selectedEl.offsetTop,
				behavior: 'smooth'
			});
		} else // going down
		if (listEl.scrollTop < selectedEl.offsetTop + selectedEl.offsetHeight - listEl.offsetHeight) {
			listEl.scrollTo({
				top: selectedEl.offsetTop + selectedEl.offsetHeight - listEl.offsetHeight,
				behavior: 'smooth'
			});
		}
	}

	function onclick(item) {
		$$invalidate(0, value = item);
		$$invalidate(1, text = item.name);
		close();
	}

	function onchange() {
		selectItem();
	}

	function onkeydown(e) {
		let key = e.key;
		if (key === 'Tab') return close();

		const fnmap = {
			ArrowDown: down.bind(this),
			ArrowUp: up.bind(this),
			Escape: onEsc.bind(this)
		};

		const fn = fnmap[key];

		if (typeof fn === 'function') {
			e.preventDefault();
			fn(e);
		}
	}

	function onkeypress(e) {
		if (e.key === 'Enter') {
			e.preventDefault();
			selectItem();
		}
	}

	function onEsc(e) {
		e.stopPropagation();
		if (clearOnEsc && text) return clear();

		if (opened) {
			revert();
			input.focus();
			close();
		} else dispatch('keydown', e);
	}

	function selectItem() {
		if (filteredData[highlightIndex]) {
			$$invalidate(0, value = filteredData[highlightIndex]);
			$$invalidate(1, text = value.name);
		} else // should create a new item
		if (allowNew) {
			$$invalidate(0, value = { id: null, name: text });
		} else revert();

		close();
	}

	function up() {
		if (!opened) return open({ type: 'up' });
		let idx = highlightIndex - 1;
		while (idx > 0 && !filteredData[idx]) idx -= 1;

		if (idx !== highlightIndex && filteredData[idx]) {
			$$invalidate(8, highlightIndex = filteredData[idx].idx);
			requestAnimationFrame(highlight);
		}
	}

	function down() {
		if (!opened) return open({ type: 'down' });
		let idx = highlightIndex + 1;
		while (idx < filteredData.length - 1 && !filteredData[idx]) idx += 1;

		if (idx !== highlightIndex && filteredData[idx]) {
			$$invalidate(8, highlightIndex = filteredData[idx].idx);
			requestAnimationFrame(highlight);
		}
	}

	function revert() {
		$$invalidate(1, text = value.name);
		if (input.value !== text) $$invalidate(9, input.value = text, input);
	}

	function clear() {
		$$invalidate(1, text = '');
		$$invalidate(9, input.value = '', input);
		filter();
		requestAnimationFrame(() => input.focus());
	}

	function open(e) {
		if (opened) return;
		$$invalidate(7, opened = true);
		hasEdited = false;
		addEventListeners();
		filter();
		const id = value && typeof value === 'number' ? value : value.id;

		if (id && filteredData && filteredData.length) {
			$$invalidate(8, highlightIndex = filteredData.findIndex(i => i.id === id));
			if (!text) $$invalidate(1, text = filteredData[highlightIndex].name);
		}

		if (input.value !== text) $$invalidate(9, input.value = text, input);

		requestAnimationFrame(() => {
			if (e && e.type === 'focus') input.select();
			highlight();
		});
	}

	function close() {
		if (!opened) return;
		removeEventListeners();
		$$invalidate(7, opened = false);
	}

	function recalculateListHeight(e) {
		if (!opened) return;
		if (e && e.type === 'scroll') return;

		if (list && list.style) {
			$$invalidate(10, list.style.top = input.offsetHeight + 2 + 'px', list);
			$$invalidate(10, list.style.height = 'auto', list);
			const listBox = list.getBoundingClientRect();
			const listT = listBox.top;
			const listH = listBox.height;
			const winH = window.innerHeight;

			if (listT + listH + 10 > winH) {
				const maxH = winH - listT - 10;
				$$invalidate(10, list.style.height = maxH + 'px', list);
			}
		}
	}

	function onDocumentClick(e) {
		if (el && !el.contains(e.target)) close();
	}

	function addEventListeners() {
		document.addEventListener('click', onDocumentClick);
		window.addEventListener('resize', recalculateListHeight);
		document.addEventListener('scroll', recalculateListHeight, true);
	}

	function removeEventListeners() {
		document.removeEventListener('click', onDocumentClick);
		window.removeEventListener('resize', recalculateListHeight);
		document.removeEventListener('scroll', recalculateListHeight, true);
	}

	const writable_props = [
		'data',
		'value',
		'text',
		'allowNew',
		'showAllInitially',
		'clearOnEsc',
		'placeholder',
		'required',
		'disabled'
	];

	Object_1$3.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Autocomplete> was created with unknown prop '${key}'`);
	});

	function input_1_binding($$value) {
		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
			input = $$value;
			$$invalidate(9, input);
		});
	}

	const click_handler = item => onclick(item);
	const click_handler_1 = () => onclick({ name: text });

	function div0_binding($$value) {
		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
			list = $$value;
			$$invalidate(10, list);
		});
	}

	function div1_binding($$value) {
		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
			el = $$value;
			$$invalidate(6, el);
		});
	}

	$$self.$$set = $$props => {
		if ('data' in $$props) $$invalidate(19, data = $$props.data);
		if ('value' in $$props) $$invalidate(0, value = $$props.value);
		if ('text' in $$props) $$invalidate(1, text = $$props.text);
		if ('allowNew' in $$props) $$invalidate(2, allowNew = $$props.allowNew);
		if ('showAllInitially' in $$props) $$invalidate(20, showAllInitially = $$props.showAllInitially);
		if ('clearOnEsc' in $$props) $$invalidate(21, clearOnEsc = $$props.clearOnEsc);
		if ('placeholder' in $$props) $$invalidate(3, placeholder = $$props.placeholder);
		if ('required' in $$props) $$invalidate(4, required = $$props.required);
		if ('disabled' in $$props) $$invalidate(5, disabled = $$props.disabled);
	};

	$$self.$capture_state = () => ({
		createEventDispatcher,
		deepCopy,
		emphasize,
		fuzzy,
		Icon,
		data,
		value,
		text,
		allowNew,
		showAllInitially,
		clearOnEsc,
		placeholder,
		required,
		disabled,
		el,
		opened,
		hasEdited,
		highlightIndex,
		input,
		list,
		filteredData,
		groupedData,
		dispatch,
		filter,
		highlight,
		onclick,
		onchange,
		onkeydown,
		onkeypress,
		onEsc,
		selectItem,
		up,
		down,
		revert,
		clear,
		open,
		close,
		recalculateListHeight,
		onDocumentClick,
		addEventListeners,
		removeEventListeners
	});

	$$self.$inject_state = $$props => {
		if ('data' in $$props) $$invalidate(19, data = $$props.data);
		if ('value' in $$props) $$invalidate(0, value = $$props.value);
		if ('text' in $$props) $$invalidate(1, text = $$props.text);
		if ('allowNew' in $$props) $$invalidate(2, allowNew = $$props.allowNew);
		if ('showAllInitially' in $$props) $$invalidate(20, showAllInitially = $$props.showAllInitially);
		if ('clearOnEsc' in $$props) $$invalidate(21, clearOnEsc = $$props.clearOnEsc);
		if ('placeholder' in $$props) $$invalidate(3, placeholder = $$props.placeholder);
		if ('required' in $$props) $$invalidate(4, required = $$props.required);
		if ('disabled' in $$props) $$invalidate(5, disabled = $$props.disabled);
		if ('el' in $$props) $$invalidate(6, el = $$props.el);
		if ('opened' in $$props) $$invalidate(7, opened = $$props.opened);
		if ('hasEdited' in $$props) hasEdited = $$props.hasEdited;
		if ('highlightIndex' in $$props) $$invalidate(8, highlightIndex = $$props.highlightIndex);
		if ('input' in $$props) $$invalidate(9, input = $$props.input);
		if ('list' in $$props) $$invalidate(10, list = $$props.list);
		if ('filteredData' in $$props) $$invalidate(11, filteredData = $$props.filteredData);
		if ('groupedData' in $$props) $$invalidate(12, groupedData = $$props.groupedData);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [
		value,
		text,
		allowNew,
		placeholder,
		required,
		disabled,
		el,
		opened,
		highlightIndex,
		input,
		list,
		filteredData,
		groupedData,
		filter,
		onclick,
		onchange,
		onkeydown,
		onkeypress,
		open,
		data,
		showAllInitially,
		clearOnEsc,
		input_1_binding,
		click_handler,
		click_handler_1,
		div0_binding,
		div1_binding
	];
}

class Autocomplete extends SvelteComponentDev {
	constructor(options) {
		super(options);

		init(
			this,
			options,
			instance$C,
			create_fragment$C,
			safe_not_equal,
			{
				data: 19,
				value: 0,
				text: 1,
				allowNew: 2,
				showAllInitially: 20,
				clearOnEsc: 21,
				placeholder: 3,
				required: 4,
				disabled: 5
			},
			null,
			[-1, -1]
		);

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Autocomplete",
			options,
			id: create_fragment$C.name
		});
	}

	get data() {
		throw new Error("<Autocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set data(value) {
		throw new Error("<Autocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get value() {
		throw new Error("<Autocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set value(value) {
		throw new Error("<Autocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get text() {
		throw new Error("<Autocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set text(value) {
		throw new Error("<Autocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get allowNew() {
		throw new Error("<Autocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set allowNew(value) {
		throw new Error("<Autocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get showAllInitially() {
		throw new Error("<Autocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set showAllInitially(value) {
		throw new Error("<Autocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get clearOnEsc() {
		throw new Error("<Autocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set clearOnEsc(value) {
		throw new Error("<Autocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get placeholder() {
		throw new Error("<Autocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set placeholder(value) {
		throw new Error("<Autocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get required() {
		throw new Error("<Autocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set required(value) {
		throw new Error("<Autocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get disabled() {
		throw new Error("<Autocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set disabled(value) {
		throw new Error("<Autocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* src/button/index.svelte generated by Svelte v3.46.4 */
const file$B = "src/button/index.svelte";

// (20:1) {#if icon}
function create_if_block$3(ctx) {
	let icon_1;
	let current;

	icon_1 = new Icon({
			props: { name: /*icon*/ ctx[8] },
			$$inline: true
		});

	const block = {
		c: function create() {
			create_component(icon_1.$$.fragment);
		},
		m: function mount(target, anchor) {
			mount_component(icon_1, target, anchor);
			current = true;
		},
		p: function update(ctx, dirty) {
			const icon_1_changes = {};
			if (dirty & /*icon*/ 256) icon_1_changes.name = /*icon*/ ctx[8];
			icon_1.$set(icon_1_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(icon_1.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(icon_1.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(icon_1, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block$3.name,
		type: "if",
		source: "(20:1) {#if icon}",
		ctx
	});

	return block;
}

function create_fragment$B(ctx) {
	let button;
	let t;
	let button_type_value;
	let button_class_value;
	let current;
	let mounted;
	let dispose;
	let if_block = /*icon*/ ctx[8] && create_if_block$3(ctx);
	const default_slot_template = /*#slots*/ ctx[16].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[15], null);

	const block = {
		c: function create() {
			button = element("button");
			if (if_block) if_block.c();
			t = space();
			if (default_slot) default_slot.c();
			button.disabled = /*disabled*/ ctx[0];
			attr_dev(button, "form", /*form*/ ctx[11]);
			attr_dev(button, "title", /*title*/ ctx[10]);
			attr_dev(button, "type", button_type_value = /*submit*/ ctx[4] ? 'submit' : 'button');
			attr_dev(button, "class", button_class_value = "button " + /*cssClass*/ ctx[12]);
			toggle_class(button, "button-normal", !/*link*/ ctx[6] && !/*text*/ ctx[7] && !/*outline*/ ctx[5]);
			toggle_class(button, "button-outline", /*outline*/ ctx[5]);
			toggle_class(button, "button-link", /*link*/ ctx[6]);
			toggle_class(button, "button-text", /*text*/ ctx[7]);
			toggle_class(button, "button-has-text", /*$$slots*/ ctx[14].default);
			toggle_class(button, "round", /*round*/ ctx[9]);
			toggle_class(button, "success", /*success*/ ctx[1]);
			toggle_class(button, "warning", /*warning*/ ctx[2]);
			toggle_class(button, "danger", /*danger*/ ctx[3]);
			add_location(button, file$B, 0, 0, 0);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, button, anchor);
			if (if_block) if_block.m(button, null);
			append_dev(button, t);

			if (default_slot) {
				default_slot.m(button, null);
			}

			current = true;

			if (!mounted) {
				dispose = listen_dev(button, "click", /*click_handler*/ ctx[17], false, false, false);
				mounted = true;
			}
		},
		p: function update(ctx, [dirty]) {
			if (/*icon*/ ctx[8]) {
				if (if_block) {
					if_block.p(ctx, dirty);

					if (dirty & /*icon*/ 256) {
						transition_in(if_block, 1);
					}
				} else {
					if_block = create_if_block$3(ctx);
					if_block.c();
					transition_in(if_block, 1);
					if_block.m(button, t);
				}
			} else if (if_block) {
				group_outros();

				transition_out(if_block, 1, 1, () => {
					if_block = null;
				});

				check_outros();
			}

			if (default_slot) {
				if (default_slot.p && (!current || dirty & /*$$scope*/ 32768)) {
					update_slot_base(
						default_slot,
						default_slot_template,
						ctx,
						/*$$scope*/ ctx[15],
						!current
						? get_all_dirty_from_scope(/*$$scope*/ ctx[15])
						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[15], dirty, null),
						null
					);
				}
			}

			if (!current || dirty & /*disabled*/ 1) {
				prop_dev(button, "disabled", /*disabled*/ ctx[0]);
			}

			if (!current || dirty & /*form*/ 2048) {
				attr_dev(button, "form", /*form*/ ctx[11]);
			}

			if (!current || dirty & /*title*/ 1024) {
				attr_dev(button, "title", /*title*/ ctx[10]);
			}

			if (!current || dirty & /*submit*/ 16 && button_type_value !== (button_type_value = /*submit*/ ctx[4] ? 'submit' : 'button')) {
				attr_dev(button, "type", button_type_value);
			}

			if (!current || dirty & /*cssClass*/ 4096 && button_class_value !== (button_class_value = "button " + /*cssClass*/ ctx[12])) {
				attr_dev(button, "class", button_class_value);
			}

			if (dirty & /*cssClass, link, text, outline*/ 4320) {
				toggle_class(button, "button-normal", !/*link*/ ctx[6] && !/*text*/ ctx[7] && !/*outline*/ ctx[5]);
			}

			if (dirty & /*cssClass, outline*/ 4128) {
				toggle_class(button, "button-outline", /*outline*/ ctx[5]);
			}

			if (dirty & /*cssClass, link*/ 4160) {
				toggle_class(button, "button-link", /*link*/ ctx[6]);
			}

			if (dirty & /*cssClass, text*/ 4224) {
				toggle_class(button, "button-text", /*text*/ ctx[7]);
			}

			if (dirty & /*cssClass, $$slots*/ 20480) {
				toggle_class(button, "button-has-text", /*$$slots*/ ctx[14].default);
			}

			if (dirty & /*cssClass, round*/ 4608) {
				toggle_class(button, "round", /*round*/ ctx[9]);
			}

			if (dirty & /*cssClass, success*/ 4098) {
				toggle_class(button, "success", /*success*/ ctx[1]);
			}

			if (dirty & /*cssClass, warning*/ 4100) {
				toggle_class(button, "warning", /*warning*/ ctx[2]);
			}

			if (dirty & /*cssClass, danger*/ 4104) {
				toggle_class(button, "danger", /*danger*/ ctx[3]);
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(if_block);
			transition_in(default_slot, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(if_block);
			transition_out(default_slot, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(button);
			if (if_block) if_block.d();
			if (default_slot) default_slot.d(detaching);
			mounted = false;
			dispose();
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$B.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$B($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots('Button', slots, ['default']);
	const $$slots = compute_slots(slots);
	let { disabled = false } = $$props;
	let { success = false } = $$props;
	let { warning = false } = $$props;
	let { danger = false } = $$props;
	let { submit = false } = $$props;
	let { outline = false } = $$props;
	let { link = false } = $$props;
	let { text = false } = $$props;
	let { icon = undefined } = $$props;
	let { round = undefined } = $$props;
	let { title = undefined } = $$props;
	let { form = undefined } = $$props;
	let { cssClass = '' } = $$props;
	const dispatch = createEventDispatcher();

	const writable_props = [
		'disabled',
		'success',
		'warning',
		'danger',
		'submit',
		'outline',
		'link',
		'text',
		'icon',
		'round',
		'title',
		'form',
		'cssClass'
	];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Button> was created with unknown prop '${key}'`);
	});

	const click_handler = e => dispatch('click', e);

	$$self.$$set = $$props => {
		if ('disabled' in $$props) $$invalidate(0, disabled = $$props.disabled);
		if ('success' in $$props) $$invalidate(1, success = $$props.success);
		if ('warning' in $$props) $$invalidate(2, warning = $$props.warning);
		if ('danger' in $$props) $$invalidate(3, danger = $$props.danger);
		if ('submit' in $$props) $$invalidate(4, submit = $$props.submit);
		if ('outline' in $$props) $$invalidate(5, outline = $$props.outline);
		if ('link' in $$props) $$invalidate(6, link = $$props.link);
		if ('text' in $$props) $$invalidate(7, text = $$props.text);
		if ('icon' in $$props) $$invalidate(8, icon = $$props.icon);
		if ('round' in $$props) $$invalidate(9, round = $$props.round);
		if ('title' in $$props) $$invalidate(10, title = $$props.title);
		if ('form' in $$props) $$invalidate(11, form = $$props.form);
		if ('cssClass' in $$props) $$invalidate(12, cssClass = $$props.cssClass);
		if ('$$scope' in $$props) $$invalidate(15, $$scope = $$props.$$scope);
	};

	$$self.$capture_state = () => ({
		createEventDispatcher,
		Icon,
		disabled,
		success,
		warning,
		danger,
		submit,
		outline,
		link,
		text,
		icon,
		round,
		title,
		form,
		cssClass,
		dispatch
	});

	$$self.$inject_state = $$props => {
		if ('disabled' in $$props) $$invalidate(0, disabled = $$props.disabled);
		if ('success' in $$props) $$invalidate(1, success = $$props.success);
		if ('warning' in $$props) $$invalidate(2, warning = $$props.warning);
		if ('danger' in $$props) $$invalidate(3, danger = $$props.danger);
		if ('submit' in $$props) $$invalidate(4, submit = $$props.submit);
		if ('outline' in $$props) $$invalidate(5, outline = $$props.outline);
		if ('link' in $$props) $$invalidate(6, link = $$props.link);
		if ('text' in $$props) $$invalidate(7, text = $$props.text);
		if ('icon' in $$props) $$invalidate(8, icon = $$props.icon);
		if ('round' in $$props) $$invalidate(9, round = $$props.round);
		if ('title' in $$props) $$invalidate(10, title = $$props.title);
		if ('form' in $$props) $$invalidate(11, form = $$props.form);
		if ('cssClass' in $$props) $$invalidate(12, cssClass = $$props.cssClass);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [
		disabled,
		success,
		warning,
		danger,
		submit,
		outline,
		link,
		text,
		icon,
		round,
		title,
		form,
		cssClass,
		dispatch,
		$$slots,
		$$scope,
		slots,
		click_handler
	];
}

class Button extends SvelteComponentDev {
	constructor(options) {
		super(options);

		init(this, options, instance$B, create_fragment$B, safe_not_equal, {
			disabled: 0,
			success: 1,
			warning: 2,
			danger: 3,
			submit: 4,
			outline: 5,
			link: 6,
			text: 7,
			icon: 8,
			round: 9,
			title: 10,
			form: 11,
			cssClass: 12
		});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Button",
			options,
			id: create_fragment$B.name
		});
	}

	get disabled() {
		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set disabled(value) {
		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get success() {
		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set success(value) {
		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get warning() {
		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set warning(value) {
		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get danger() {
		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set danger(value) {
		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get submit() {
		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set submit(value) {
		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get outline() {
		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set outline(value) {
		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get link() {
		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set link(value) {
		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get text() {
		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set text(value) {
		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get icon() {
		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set icon(value) {
		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get round() {
		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set round(value) {
		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get title() {
		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set title(value) {
		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get form() {
		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set form(value) {
		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get cssClass() {
		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set cssClass(value) {
		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

let ANIMATION_SPEED = 300;

// Grab the prefers reduced media query.
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
if (!reducedMotion || reducedMotion.matches) ANIMATION_SPEED = 0;


// native js animation
function animate (el, from, to, _options = {}) {
	const dflt = { duration: ANIMATION_SPEED, easing: 'ease-out', fill: 'forwards' };
	const opts = Object.assign({}, dflt, _options);

	return new Promise(resolve => {
		requestAnimationFrame(() => {
			const anim = el.animate([from, to], opts);
			anim.oncancel = resolve;
			anim.onfinish = resolve;
		});
	});
}

/* src/dialog/index.svelte generated by Svelte v3.46.4 */
const file$A = "src/dialog/index.svelte";
const get_footer_slot_changes = dirty => ({});
const get_footer_slot_context = ctx => ({});

function create_fragment$A(ctx) {
	let div5;
	let div4;
	let div0;
	let t0;
	let h1;
	let t1;
	let t2;
	let div1;
	let t3;
	let div2;
	let t4;
	let div3;
	let div5_class_value;
	let current;
	let mounted;
	let dispose;
	const default_slot_template = /*#slots*/ ctx[14].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[13], null);
	const footer_slot_template = /*#slots*/ ctx[14].footer;
	const footer_slot = create_slot(footer_slot_template, ctx, /*$$scope*/ ctx[13], get_footer_slot_context);

	const block = {
		c: function create() {
			div5 = element("div");
			div4 = element("div");
			div0 = element("div");
			t0 = space();
			h1 = element("h1");
			t1 = text(/*title*/ ctx[1]);
			t2 = space();
			div1 = element("div");
			if (default_slot) default_slot.c();
			t3 = space();
			div2 = element("div");
			if (footer_slot) footer_slot.c();
			t4 = space();
			div3 = element("div");
			attr_dev(div0, "tabindex", "0");
			attr_dev(div0, "class", "focus-trap focus-trap-top");
			add_location(div0, file$A, 9, 2, 271);
			attr_dev(h1, "class", "dialog-header");
			add_location(h1, file$A, 10, 2, 355);
			attr_dev(div1, "class", "dialog-content");
			add_location(div1, file$A, 11, 2, 396);
			attr_dev(div2, "class", "dialog-footer");
			add_location(div2, file$A, 12, 2, 470);
			attr_dev(div3, "tabindex", "0");
			attr_dev(div3, "class", "focus-trap focus-trap-bottom");
			add_location(div3, file$A, 13, 2, 556);
			attr_dev(div4, "class", "dialog");
			add_location(div4, file$A, 8, 1, 225);
			attr_dev(div5, "aria-modal", "true");
			attr_dev(div5, "aria-label", /*title*/ ctx[1]);
			attr_dev(div5, "class", div5_class_value = "dialog-backdrop " + /*cssClass*/ ctx[3]);
			toggle_class(div5, "opened", /*opened*/ ctx[0]);
			toggle_class(div5, "draw-borders", /*drawborders*/ ctx[2] === 'true' || /*drawborders*/ ctx[2] === true);
			add_location(div5, file$A, 0, 0, 0);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, div5, anchor);
			append_dev(div5, div4);
			append_dev(div4, div0);
			append_dev(div4, t0);
			append_dev(div4, h1);
			append_dev(h1, t1);
			append_dev(div4, t2);
			append_dev(div4, div1);

			if (default_slot) {
				default_slot.m(div1, null);
			}

			/*div1_binding*/ ctx[15](div1);
			append_dev(div4, t3);
			append_dev(div4, div2);

			if (footer_slot) {
				footer_slot.m(div2, null);
			}

			/*div2_binding*/ ctx[16](div2);
			append_dev(div4, t4);
			append_dev(div4, div3);
			/*div4_binding*/ ctx[17](div4);
			/*div5_binding*/ ctx[18](div5);
			current = true;

			if (!mounted) {
				dispose = [
					listen_dev(div0, "focus", /*focusLast*/ ctx[9], false, false, false),
					listen_dev(div3, "focus", /*focusFirst*/ ctx[8], false, false, false),
					listen_dev(div5, "click", /*onBackdropClick*/ ctx[10], false, false, false)
				];

				mounted = true;
			}
		},
		p: function update(ctx, [dirty]) {
			if (!current || dirty & /*title*/ 2) set_data_dev(t1, /*title*/ ctx[1]);

			if (default_slot) {
				if (default_slot.p && (!current || dirty & /*$$scope*/ 8192)) {
					update_slot_base(
						default_slot,
						default_slot_template,
						ctx,
						/*$$scope*/ ctx[13],
						!current
						? get_all_dirty_from_scope(/*$$scope*/ ctx[13])
						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[13], dirty, null),
						null
					);
				}
			}

			if (footer_slot) {
				if (footer_slot.p && (!current || dirty & /*$$scope*/ 8192)) {
					update_slot_base(
						footer_slot,
						footer_slot_template,
						ctx,
						/*$$scope*/ ctx[13],
						!current
						? get_all_dirty_from_scope(/*$$scope*/ ctx[13])
						: get_slot_changes(footer_slot_template, /*$$scope*/ ctx[13], dirty, get_footer_slot_changes),
						get_footer_slot_context
					);
				}
			}

			if (!current || dirty & /*title*/ 2) {
				attr_dev(div5, "aria-label", /*title*/ ctx[1]);
			}

			if (!current || dirty & /*cssClass*/ 8 && div5_class_value !== (div5_class_value = "dialog-backdrop " + /*cssClass*/ ctx[3])) {
				attr_dev(div5, "class", div5_class_value);
			}

			if (dirty & /*cssClass, opened*/ 9) {
				toggle_class(div5, "opened", /*opened*/ ctx[0]);
			}

			if (dirty & /*cssClass, drawborders*/ 12) {
				toggle_class(div5, "draw-borders", /*drawborders*/ ctx[2] === 'true' || /*drawborders*/ ctx[2] === true);
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(default_slot, local);
			transition_in(footer_slot, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(default_slot, local);
			transition_out(footer_slot, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div5);
			if (default_slot) default_slot.d(detaching);
			/*div1_binding*/ ctx[15](null);
			if (footer_slot) footer_slot.d(detaching);
			/*div2_binding*/ ctx[16](null);
			/*div4_binding*/ ctx[17](null);
			/*div5_binding*/ ctx[18](null);
			mounted = false;
			run_all(dispose);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$A.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$A($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots('Dialog', slots, ['default','footer']);
	let { title = '' } = $$props;
	let { opened = false } = $$props;
	let { drawborders = false } = $$props;
	let { cssClass = '' } = $$props;
	let backdropEl, dialogEl, contentEl, footerEl, triggerEl, openTimer, closeTimer;

	function focusFirst() {
		let first = getFocusableElements().shift();
		const last = getFocusableElements().pop();

		if (!first && !last) {
			contentEl.setAttribute('tabindex', 0);
			first = contentEl;
		}

		if (last) last.scrollIntoView({ block: 'end' });
		if (first) first.focus();
	}

	function focusLast() {
		const first = getFocusableElements().shift();
		let last = getFocusableElements().pop();

		if (!first && !last) {
			contentEl.setAttribute('tabindex', 0);
			last = contentEl;
		}

		if (first) first.scrollIntoView({ block: 'end' });
		if (last) last.focus();
	}

	function getFocusableElements() {
		const FOCUSABLE_SELECTOR = 'a[href],button:not([disabled]),iframe:not([disabled]),input:not([disabled]),' + 'select:not([disabled]),textarea:not([disabled]),[contentEditable],[tabindex]';
		const contentElements = Array.from(contentEl.querySelectorAll(FOCUSABLE_SELECTOR));
		const footerElements = Array.from(footerEl.querySelectorAll(FOCUSABLE_SELECTOR));
		return [...contentElements, ...footerElements];
	}

	function onBackdropClick(e) {
		if (!dialogEl.contains(e.target)) {
			e.stopPropagation();
			close();
		}
	}

	function onDocKeydown(e) {
		const hasFocus = backdropEl.contains(document.activeElement);

		if (e.key === 'Escape' && opened && hasFocus) {
			e.stopPropagation();
			close();
		}
	}

	function open(openedBy) {
		if (opened) return;
		triggerEl = openedBy || document.activeElement;
		$$invalidate(4, backdropEl.style.display = 'flex', backdropEl);
		if (openTimer) clearTimeout(openTimer);

		openTimer = setTimeout(
			() => {
				$$invalidate(0, opened = true);
				$$invalidate(4, backdropEl.style.display = 'flex', backdropEl);
				focusFirst();
				document.addEventListener('keydown', onDocKeydown, true);
			},
			100
		);
	}

	function close() {
		if (!opened) return;
		$$invalidate(0, opened = false);
		if (triggerEl) triggerEl.focus();
		if (closeTimer) clearTimeout(closeTimer);

		closeTimer = setTimeout(
			() => {
				$$invalidate(0, opened = false);
				$$invalidate(4, backdropEl.style.display = 'none', backdropEl);
				document.removeEventListener('keydown', onDocKeydown);
				if (triggerEl) triggerEl.focus();
			},
			ANIMATION_SPEED
		);
	}

	const writable_props = ['title', 'opened', 'drawborders', 'cssClass'];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Dialog> was created with unknown prop '${key}'`);
	});

	function div1_binding($$value) {
		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
			contentEl = $$value;
			$$invalidate(6, contentEl);
		});
	}

	function div2_binding($$value) {
		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
			footerEl = $$value;
			$$invalidate(7, footerEl);
		});
	}

	function div4_binding($$value) {
		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
			dialogEl = $$value;
			$$invalidate(5, dialogEl);
		});
	}

	function div5_binding($$value) {
		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
			backdropEl = $$value;
			$$invalidate(4, backdropEl);
		});
	}

	$$self.$$set = $$props => {
		if ('title' in $$props) $$invalidate(1, title = $$props.title);
		if ('opened' in $$props) $$invalidate(0, opened = $$props.opened);
		if ('drawborders' in $$props) $$invalidate(2, drawborders = $$props.drawborders);
		if ('cssClass' in $$props) $$invalidate(3, cssClass = $$props.cssClass);
		if ('$$scope' in $$props) $$invalidate(13, $$scope = $$props.$$scope);
	};

	$$self.$capture_state = () => ({
		ANIMATION_SPEED,
		title,
		opened,
		drawborders,
		cssClass,
		backdropEl,
		dialogEl,
		contentEl,
		footerEl,
		triggerEl,
		openTimer,
		closeTimer,
		focusFirst,
		focusLast,
		getFocusableElements,
		onBackdropClick,
		onDocKeydown,
		open,
		close
	});

	$$self.$inject_state = $$props => {
		if ('title' in $$props) $$invalidate(1, title = $$props.title);
		if ('opened' in $$props) $$invalidate(0, opened = $$props.opened);
		if ('drawborders' in $$props) $$invalidate(2, drawborders = $$props.drawborders);
		if ('cssClass' in $$props) $$invalidate(3, cssClass = $$props.cssClass);
		if ('backdropEl' in $$props) $$invalidate(4, backdropEl = $$props.backdropEl);
		if ('dialogEl' in $$props) $$invalidate(5, dialogEl = $$props.dialogEl);
		if ('contentEl' in $$props) $$invalidate(6, contentEl = $$props.contentEl);
		if ('footerEl' in $$props) $$invalidate(7, footerEl = $$props.footerEl);
		if ('triggerEl' in $$props) triggerEl = $$props.triggerEl;
		if ('openTimer' in $$props) openTimer = $$props.openTimer;
		if ('closeTimer' in $$props) closeTimer = $$props.closeTimer;
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [
		opened,
		title,
		drawborders,
		cssClass,
		backdropEl,
		dialogEl,
		contentEl,
		footerEl,
		focusFirst,
		focusLast,
		onBackdropClick,
		open,
		close,
		$$scope,
		slots,
		div1_binding,
		div2_binding,
		div4_binding,
		div5_binding
	];
}

class Dialog extends SvelteComponentDev {
	constructor(options) {
		super(options);

		init(this, options, instance$A, create_fragment$A, safe_not_equal, {
			title: 1,
			opened: 0,
			drawborders: 2,
			cssClass: 3,
			open: 11,
			close: 12
		});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Dialog",
			options,
			id: create_fragment$A.name
		});
	}

	get title() {
		return this.$$.ctx[1];
	}

	set title(title) {
		this.$$set({ title });
		flush();
	}

	get opened() {
		return this.$$.ctx[0];
	}

	set opened(opened) {
		this.$$set({ opened });
		flush();
	}

	get drawborders() {
		return this.$$.ctx[2];
	}

	set drawborders(drawborders) {
		this.$$set({ drawborders });
		flush();
	}

	get cssClass() {
		return this.$$.ctx[3];
	}

	set cssClass(cssClass) {
		this.$$set({ cssClass });
		flush();
	}

	get open() {
		return this.$$.ctx[11];
	}

	set open(value) {
		throw new Error("<Dialog>: Cannot set read-only property 'open'");
	}

	get close() {
		return this.$$.ctx[12];
	}

	set close(value) {
		throw new Error("<Dialog>: Cannot set read-only property 'close'");
	}
}

function hasProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

function lastItemOf(arr) {
  return arr[arr.length - 1];
}

// push only the items not included in the array
function pushUnique(arr, ...items) {
  items.forEach((item) => {
    if (arr.includes(item)) {
      return;
    }
    arr.push(item);
  });
  return arr;
}

function stringToArray(str, separator) {
  // convert empty string to an empty array
  return str ? str.split(separator) : [];
}

function isInRange(testVal, min, max) {
  const minOK = min === undefined || testVal >= min;
  const maxOK = max === undefined || testVal <= max;
  return minOK && maxOK;
}

function limitToRange(val, min, max) {
  if (val < min) {
    return min;
  }
  if (val > max) {
    return max;
  }
  return val;
}

function createTagRepeat(tagName, repeat, attributes = {}, index = 0, html = '') {
  const openTagSrc = Object.keys(attributes).reduce((src, attr) => {
    let val = attributes[attr];
    if (typeof val === 'function') {
      val = val(index);
    }
    return `${src} ${attr}="${val}"`;
  }, tagName);
  html += `<${openTagSrc}></${tagName}>`;

  const next = index + 1;
  return next < repeat
    ? createTagRepeat(tagName, repeat, attributes, next, html)
    : html;
}

// Remove the spacing surrounding tags for HTML parser not to create text nodes
// before/after elements
function optimizeTemplateHTML(html) {
  return html.replace(/>\s+/g, '>').replace(/\s+</, '<');
}

function stripTime(timeValue) {
  return new Date(timeValue).setHours(0, 0, 0, 0);
}

function today() {
  return new Date().setHours(0, 0, 0, 0);
}

// Get the time value of the start of given date or year, month and day
function dateValue(...args) {
  switch (args.length) {
    case 0:
      return today();
    case 1:
      return stripTime(args[0]);
  }

  // use setFullYear() to keep 2-digit year from being mapped to 1900-1999
  const newDate = new Date(0);
  newDate.setFullYear(...args);
  return newDate.setHours(0, 0, 0, 0);
}

function addDays(date, amount) {
  const newDate = new Date(date);
  return newDate.setDate(newDate.getDate() + amount);
}

function addWeeks(date, amount) {
  return addDays(date, amount * 7);
}

function addMonths(date, amount) {
  // If the day of the date is not in the new month, the last day of the new
  // month will be returned. e.g. Jan 31 + 1 month → Feb 28 (not Mar 03)
  const newDate = new Date(date);
  const monthsToSet = newDate.getMonth() + amount;
  let expectedMonth = monthsToSet % 12;
  if (expectedMonth < 0) {
    expectedMonth += 12;
  }

  const time = newDate.setMonth(monthsToSet);
  return newDate.getMonth() !== expectedMonth ? newDate.setDate(0) : time;
}

function addYears(date, amount) {
  // If the date is Feb 29 and the new year is not a leap year, Feb 28 of the
  // new year will be returned.
  const newDate = new Date(date);
  const expectedMonth = newDate.getMonth();
  const time = newDate.setFullYear(newDate.getFullYear() + amount);
  return expectedMonth === 1 && newDate.getMonth() === 2 ? newDate.setDate(0) : time;
}

// Calculate the distance bettwen 2 days of the week
function dayDiff(day, from) {
  return (day - from + 7) % 7;
}

// Get the date of the specified day of the week of given base date
function dayOfTheWeekOf(baseDate, dayOfWeek, weekStart = 0) {
  const baseDay = new Date(baseDate).getDay();
  return addDays(baseDate, dayDiff(dayOfWeek, weekStart) - dayDiff(baseDay, weekStart));
}

// Get the ISO week of a date
function getWeek(date) {
  // start of ISO week is Monday
  const thuOfTheWeek = dayOfTheWeekOf(date, 4, 1);
  // 1st week == the week where the 4th of January is in
  const firstThu = dayOfTheWeekOf(new Date(thuOfTheWeek).setMonth(0, 4), 4, 1);
  return Math.round((thuOfTheWeek - firstThu) / 604800000) + 1;
}

// Get the start year of the period of years that includes given date
// years: length of the year period
function startOfYearPeriod(date, years) {
  /* @see https://en.wikipedia.org/wiki/Year_zero#ISO_8601 */
  const year = new Date(date).getFullYear();
  return Math.floor(year / years) * years;
}

// Convert date to the first/last date of the month/year of the date
function regularizeDate(date, timeSpan, useLastDate) {
  if (timeSpan !== 1 && timeSpan !== 2) {
    return date;
  }
  const newDate = new Date(date);
  if (timeSpan === 1) {
    useLastDate
      ? newDate.setMonth(newDate.getMonth() + 1, 0)
      : newDate.setDate(1);
  } else {
    useLastDate
      ? newDate.setFullYear(newDate.getFullYear() + 1, 0, 0)
      : newDate.setMonth(0, 1);
  }
  return newDate.setHours(0, 0, 0, 0);
}

// pattern for format parts
const reFormatTokens = /dd?|DD?|mm?|MM?|yy?(?:yy)?/;
// pattern for non date parts
const reNonDateParts = /[\s!-/:-@[-`{-~年月日]+/;
// cache for persed formats
let knownFormats = {};
// parse funtions for date parts
const parseFns = {
  y(date, year) {
    return new Date(date).setFullYear(parseInt(year, 10));
  },
  m(date, month, locale) {
    const newDate = new Date(date);
    let monthIndex = parseInt(month, 10) - 1;

    if (isNaN(monthIndex)) {
      if (!month) {
        return NaN;
      }

      const monthName = month.toLowerCase();
      const compareNames = name => name.toLowerCase().startsWith(monthName);
      // compare with both short and full names because some locales have periods
      // in the short names (not equal to the first X letters of the full names)
      monthIndex = locale.monthsShort.findIndex(compareNames);
      if (monthIndex < 0) {
        monthIndex = locale.months.findIndex(compareNames);
      }
      if (monthIndex < 0) {
        return NaN;
      }
    }

    newDate.setMonth(monthIndex);
    return newDate.getMonth() !== normalizeMonth(monthIndex)
      ? newDate.setDate(0)
      : newDate.getTime();
  },
  d(date, day) {
    return new Date(date).setDate(parseInt(day, 10));
  },
};
// format functions for date parts
const formatFns = {
  d(date) {
    return date.getDate();
  },
  dd(date) {
    return padZero(date.getDate(), 2);
  },
  D(date, locale) {
    return locale.daysShort[date.getDay()];
  },
  DD(date, locale) {
    return locale.days[date.getDay()];
  },
  m(date) {
    return date.getMonth() + 1;
  },
  mm(date) {
    return padZero(date.getMonth() + 1, 2);
  },
  M(date, locale) {
    return locale.monthsShort[date.getMonth()];
  },
  MM(date, locale) {
    return locale.months[date.getMonth()];
  },
  y(date) {
    return date.getFullYear();
  },
  yy(date) {
    return padZero(date.getFullYear(), 2).slice(-2);
  },
  yyyy(date) {
    return padZero(date.getFullYear(), 4);
  },
};

// get month index in normal range (0 - 11) from any number
function normalizeMonth(monthIndex) {
  return monthIndex > -1 ? monthIndex % 12 : normalizeMonth(monthIndex + 12);
}

function padZero(num, length) {
  return num.toString().padStart(length, '0');
}

function parseFormatString(format) {
  if (typeof format !== 'string') {
    throw new Error("Invalid date format.");
  }
  if (format in knownFormats) {
    return knownFormats[format];
  }

  // sprit the format string into parts and seprators
  const separators = format.split(reFormatTokens);
  const parts = format.match(new RegExp(reFormatTokens, 'g'));
  if (separators.length === 0 || !parts) {
    throw new Error("Invalid date format.");
  }

  // collect format functions used in the format
  const partFormatters = parts.map(token => formatFns[token]);

  // collect parse function keys used in the format
  // iterate over parseFns' keys in order to keep the order of the keys.
  const partParserKeys = Object.keys(parseFns).reduce((keys, key) => {
    const token = parts.find(part => part[0] !== 'D' && part[0].toLowerCase() === key);
    if (token) {
      keys.push(key);
    }
    return keys;
  }, []);

  return knownFormats[format] = {
    parser(dateStr, locale) {
      const dateParts = dateStr.split(reNonDateParts).reduce((dtParts, part, index) => {
        if (part.length > 0 && parts[index]) {
          const token = parts[index][0];
          if (token === 'M') {
            dtParts.m = part;
          } else if (token !== 'D') {
            dtParts[token] = part;
          }
        }
        return dtParts;
      }, {});

      // iterate over partParserkeys so that the parsing is made in the oder
      // of year, month and day to prevent the day parser from correcting last
      // day of month wrongly
      return partParserKeys.reduce((origDate, key) => {
        const newDate = parseFns[key](origDate, dateParts[key], locale);
        // ingnore the part failed to parse
        return isNaN(newDate) ? origDate : newDate;
      }, today());
    },
    formatter(date, locale) {
      let dateStr = partFormatters.reduce((str, fn, index) => {
        return str += `${separators[index]}${fn(date, locale)}`;
      }, '');
      // separators' length is always parts' length + 1,
      return dateStr += lastItemOf(separators);
    },
  };
}

function parseDate(dateStr, format, locale) {
  if (dateStr instanceof Date || typeof dateStr === 'number') {
    const date = stripTime(dateStr);
    return isNaN(date) ? undefined : date;
  }
  if (!dateStr) {
    return undefined;
  }
  if (dateStr === 'today') {
    return today();
  }

  if (format && format.toValue) {
    const date = format.toValue(dateStr, format, locale);
    return isNaN(date) ? undefined : stripTime(date);
  }

  return parseFormatString(format).parser(dateStr, locale);
}

function formatDate(date, format, locale) {
  if (isNaN(date) || (!date && date !== 0)) {
    return '';
  }

  const dateObj = typeof date === 'number' ? new Date(date) : date;

  if (format.toDisplay) {
    return format.toDisplay(dateObj, format, locale);
  }

  return parseFormatString(format).formatter(dateObj, locale);
}

const range = document.createRange();

function parseHTML(html) {
  return range.createContextualFragment(html);
}

function getParent(el) {
  return el.parentElement
    || (el.parentNode instanceof ShadowRoot ? el.parentNode.host : undefined);
}

function isActiveElement(el) {
  return el.getRootNode().activeElement === el;
}

function hideElement(el) {
  if (el.style.display === 'none') {
    return;
  }
  // back up the existing display setting in data-style-display
  if (el.style.display) {
    el.dataset.styleDisplay = el.style.display;
  }
  el.style.display = 'none';
}

function showElement(el) {
  if (el.style.display !== 'none') {
    return;
  }
  if (el.dataset.styleDisplay) {
    // restore backed-up dispay property
    el.style.display = el.dataset.styleDisplay;
    delete el.dataset.styleDisplay;
  } else {
    el.style.display = '';
  }
}

function emptyChildNodes(el) {
  if (el.firstChild) {
    el.removeChild(el.firstChild);
    emptyChildNodes(el);
  }
}

function replaceChildNodes(el, newChildNodes) {
  emptyChildNodes(el);
  if (newChildNodes instanceof DocumentFragment) {
    el.appendChild(newChildNodes);
  } else if (typeof newChildNodes === 'string') {
    el.appendChild(parseHTML(newChildNodes));
  } else if (typeof newChildNodes.forEach === 'function') {
    newChildNodes.forEach((node) => {
      el.appendChild(node);
    });
  }
}

const listenerRegistry = new WeakMap();
const {addEventListener, removeEventListener} = EventTarget.prototype;

// Register event listeners to a key object
// listeners: array of listener definitions;
//   - each definition must be a flat array of event target and the arguments
//     used to call addEventListener() on the target
function registerListeners(keyObj, listeners) {
  let registered = listenerRegistry.get(keyObj);
  if (!registered) {
    registered = [];
    listenerRegistry.set(keyObj, registered);
  }
  listeners.forEach((listener) => {
    addEventListener.call(...listener);
    registered.push(listener);
  });
}

function unregisterListeners(keyObj) {
  let listeners = listenerRegistry.get(keyObj);
  if (!listeners) {
    return;
  }
  listeners.forEach((listener) => {
    removeEventListener.call(...listener);
  });
  listenerRegistry.delete(keyObj);
}

// Event.composedPath() polyfill for Edge
// based on https://gist.github.com/kleinfreund/e9787d73776c0e3750dcfcdc89f100ec
if (!Event.prototype.composedPath) {
  const getComposedPath = (node, path = []) => {
    path.push(node);

    let parent;
    if (node.parentNode) {
      parent = node.parentNode;
    } else if (node.host) { // ShadowRoot
      parent = node.host;
    } else if (node.defaultView) {  // Document
      parent = node.defaultView;
    }
    return parent ? getComposedPath(parent, path) : path;
  };

  Event.prototype.composedPath = function () {
    return getComposedPath(this.target);
  };
}

function findFromPath(path, criteria, currentTarget) {
  const [node, ...rest] = path;
  if (criteria(node)) {
    return node;
  }
  if (node === currentTarget || node.tagName === 'HTML' || rest.length === 0) {
    // stop when reaching currentTarget or <html>
    return;
  }
  return findFromPath(rest, criteria, currentTarget);
}

// Search for the actual target of a delegated event
function findElementInEventPath(ev, selector) {
  const criteria = typeof selector === 'function'
    ? selector
    : el => el instanceof Element && el.matches(selector);
  return findFromPath(ev.composedPath(), criteria, ev.currentTarget);
}

// default locales
const locales = {
  en: {
    days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    daysShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    daysMin: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
    months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    monthsShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    today: "Today",
    clear: "Clear",
    titleFormat: "MM y"
  }
};

// config options updatable by setOptions() and their default values
const defaultOptions = {
  autohide: false,
  beforeShowDay: null,
  beforeShowDecade: null,
  beforeShowMonth: null,
  beforeShowYear: null,
  calendarWeeks: false,
  clearBtn: false,
  dateDelimiter: ',',
  datesDisabled: [],
  daysOfWeekDisabled: [],
  daysOfWeekHighlighted: [],
  defaultViewDate: undefined, // placeholder, defaults to today() by the program
  disableTouchKeyboard: false,
  format: 'mm/dd/yyyy',
  language: 'en',
  maxDate: null,
  maxNumberOfDates: 1,
  maxView: 3,
  minDate: null,
  nextArrow: '»',
  orientation: 'auto',
  pickLevel: 0,
  prevArrow: '«',
  showDaysOfWeek: true,
  showOnClick: true,
  showOnFocus: true,
  startView: 0,
  title: '',
  todayBtn: false,
  todayBtnMode: 0,
  todayHighlight: false,
  updateOnBlur: true,
  weekStart: 0,
};

const {
  language: defaultLang,
  format: defaultFormat,
  weekStart: defaultWeekStart,
} = defaultOptions;

// Reducer function to filter out invalid day-of-week from the input
function sanitizeDOW(dow, day) {
  return dow.length < 6 && day >= 0 && day < 7
    ? pushUnique(dow, day)
    : dow;
}

function calcEndOfWeek(startOfWeek) {
  return (startOfWeek + 6) % 7;
}

// validate input date. if invalid, fallback to the original value
function validateDate(value, format, locale, origValue) {
  const date = parseDate(value, format, locale);
  return date !== undefined ? date : origValue;
}

// Validate viewId. if invalid, fallback to the original value
function validateViewId(value, origValue, max = 3) {
  const viewId = parseInt(value, 10);
  return viewId >= 0 && viewId <= max ? viewId : origValue;
}

// Create Datepicker configuration to set
function processOptions(options, datepicker) {
  const inOpts = Object.assign({}, options);
  const config = {};
  const locales = datepicker.constructor.locales;
  const rangeSideIndex = datepicker.rangeSideIndex;
  let {
    format,
    language,
    locale,
    maxDate,
    maxView,
    minDate,
    pickLevel,
    startView,
    weekStart,
  } = datepicker.config || {};

  if (inOpts.language) {
    let lang;
    if (inOpts.language !== language) {
      if (locales[inOpts.language]) {
        lang = inOpts.language;
      } else {
        // Check if langauge + region tag can fallback to the one without
        // region (e.g. fr-CA → fr)
        lang = inOpts.language.split('-')[0];
        if (locales[lang] === undefined) {
          lang = false;
        }
      }
    }
    delete inOpts.language;
    if (lang) {
      language = config.language = lang;

      // update locale as well when updating language
      const origLocale = locale || locales[defaultLang];
      // use default language's properties for the fallback
      locale = Object.assign({
        format: defaultFormat,
        weekStart: defaultWeekStart
      }, locales[defaultLang]);
      if (language !== defaultLang) {
        Object.assign(locale, locales[language]);
      }
      config.locale = locale;
      // if format and/or weekStart are the same as old locale's defaults,
      // update them to new locale's defaults
      if (format === origLocale.format) {
        format = config.format = locale.format;
      }
      if (weekStart === origLocale.weekStart) {
        weekStart = config.weekStart = locale.weekStart;
        config.weekEnd = calcEndOfWeek(locale.weekStart);
      }
    }
  }

  if (inOpts.format) {
    const hasToDisplay = typeof inOpts.format.toDisplay === 'function';
    const hasToValue = typeof inOpts.format.toValue === 'function';
    const validFormatString = reFormatTokens.test(inOpts.format);
    if ((hasToDisplay && hasToValue) || validFormatString) {
      format = config.format = inOpts.format;
    }
    delete inOpts.format;
  }

  //*** pick level ***//
  let newPickLevel = pickLevel;
  if (inOpts.pickLevel !== undefined) {
    newPickLevel = validateViewId(inOpts.pickLevel, 2);
    delete inOpts.pickLevel;
  }
  if (newPickLevel !== pickLevel) {
    if (newPickLevel > pickLevel) {
      // complement current minDate/madDate so that the existing range will be
      // expanded to fit the new level later
      if (inOpts.minDate === undefined) {
        inOpts.minDate = minDate;
      }
      if (inOpts.maxDate === undefined) {
        inOpts.maxDate = maxDate;
      }
    }
    // complement datesDisabled so that it will be reset later
    if (!inOpts.datesDisabled) {
      inOpts.datesDisabled = [];
    }
    pickLevel = config.pickLevel = newPickLevel;
  }

  //*** dates ***//
  // while min and maxDate for "no limit" in the options are better to be null
  // (especially when updating), the ones in the config have to be undefined
  // because null is treated as 0 (= unix epoch) when comparing with time value
  let minDt = minDate;
  let maxDt = maxDate;
  if (inOpts.minDate !== undefined) {
    const defaultMinDt = dateValue(0, 0, 1);
    minDt = inOpts.minDate === null
      ? defaultMinDt  // set 0000-01-01 to prevent negative values for year
      : validateDate(inOpts.minDate, format, locale, minDt);
    if (minDt !== defaultMinDt) {
      minDt = regularizeDate(minDt, pickLevel, false);
    }
    delete inOpts.minDate;
  }
  if (inOpts.maxDate !== undefined) {
    maxDt = inOpts.maxDate === null
      ? undefined
      : validateDate(inOpts.maxDate, format, locale, maxDt);
    if (maxDt !== undefined) {
      maxDt = regularizeDate(maxDt, pickLevel, true);
    }
    delete inOpts.maxDate;
  }
  if (maxDt < minDt) {
    minDate = config.minDate = maxDt;
    maxDate = config.maxDate = minDt;
  } else {
    if (minDate !== minDt) {
      minDate = config.minDate = minDt;
    }
    if (maxDate !== maxDt) {
      maxDate = config.maxDate = maxDt;
    }
  }

  if (inOpts.datesDisabled) {
    config.datesDisabled = inOpts.datesDisabled.reduce((dates, dt) => {
      const date = parseDate(dt, format, locale);
      return date !== undefined
        ? pushUnique(dates, regularizeDate(date, pickLevel, rangeSideIndex))
        : dates;
    }, []);
    delete inOpts.datesDisabled;
  }
  if (inOpts.defaultViewDate !== undefined) {
    const viewDate = parseDate(inOpts.defaultViewDate, format, locale);
    if (viewDate !== undefined) {
      config.defaultViewDate = viewDate;
    }
    delete inOpts.defaultViewDate;
  }

  //*** days of week ***//
  if (inOpts.weekStart !== undefined) {
    const wkStart = Number(inOpts.weekStart) % 7;
    if (!isNaN(wkStart)) {
      weekStart = config.weekStart = wkStart;
      config.weekEnd = calcEndOfWeek(wkStart);
    }
    delete inOpts.weekStart;
  }
  if (inOpts.daysOfWeekDisabled) {
    config.daysOfWeekDisabled = inOpts.daysOfWeekDisabled.reduce(sanitizeDOW, []);
    delete inOpts.daysOfWeekDisabled;
  }
  if (inOpts.daysOfWeekHighlighted) {
    config.daysOfWeekHighlighted = inOpts.daysOfWeekHighlighted.reduce(sanitizeDOW, []);
    delete inOpts.daysOfWeekHighlighted;
  }

  //*** multi date ***//
  if (inOpts.maxNumberOfDates !== undefined) {
    const maxNumberOfDates = parseInt(inOpts.maxNumberOfDates, 10);
    if (maxNumberOfDates >= 0) {
      config.maxNumberOfDates = maxNumberOfDates;
      config.multidate = maxNumberOfDates !== 1;
    }
    delete inOpts.maxNumberOfDates;
  }
  if (inOpts.dateDelimiter) {
    config.dateDelimiter = String(inOpts.dateDelimiter);
    delete inOpts.dateDelimiter;
  }

  //*** view ***//
  let newMaxView = maxView;
  if (inOpts.maxView !== undefined) {
    newMaxView = validateViewId(inOpts.maxView, maxView);
    delete inOpts.maxView;
  }
  // ensure max view >= pick level
  newMaxView = pickLevel > newMaxView ? pickLevel : newMaxView;
  if (newMaxView !== maxView) {
    maxView = config.maxView = newMaxView;
  }

  let newStartView = startView;
  if (inOpts.startView !== undefined) {
    newStartView = validateViewId(inOpts.startView, newStartView);
    delete inOpts.startView;
  }
  // ensure pick level <= start view <= max view
  if (newStartView < pickLevel) {
    newStartView = pickLevel;
  } else if (newStartView > maxView) {
    newStartView = maxView;
  }
  if (newStartView !== startView) {
    config.startView = newStartView;
  }

  //*** template ***//
  if (inOpts.prevArrow) {
    const prevArrow = parseHTML(inOpts.prevArrow);
    if (prevArrow.childNodes.length > 0) {
      config.prevArrow = prevArrow.childNodes;
    }
    delete inOpts.prevArrow;
  }
  if (inOpts.nextArrow) {
    const nextArrow = parseHTML(inOpts.nextArrow);
    if (nextArrow.childNodes.length > 0) {
      config.nextArrow = nextArrow.childNodes;
    }
    delete inOpts.nextArrow;
  }

  //*** misc ***//
  if (inOpts.disableTouchKeyboard !== undefined) {
    config.disableTouchKeyboard = 'ontouchstart' in document && !!inOpts.disableTouchKeyboard;
    delete inOpts.disableTouchKeyboard;
  }
  if (inOpts.orientation) {
    const orientation = inOpts.orientation.toLowerCase().split(/\s+/g);
    config.orientation = {
      x: orientation.find(x => (x === 'left' || x === 'right')) || 'auto',
      y: orientation.find(y => (y === 'top' || y === 'bottom')) || 'auto',
    };
    delete inOpts.orientation;
  }
  if (inOpts.todayBtnMode !== undefined) {
    switch(inOpts.todayBtnMode) {
      case 0:
      case 1:
        config.todayBtnMode = inOpts.todayBtnMode;
    }
    delete inOpts.todayBtnMode;
  }

  //*** copy the rest ***//
  Object.keys(inOpts).forEach((key) => {
    if (inOpts[key] !== undefined && hasProperty(defaultOptions, key)) {
      config[key] = inOpts[key];
    }
  });

  return config;
}

const pickerTemplate = optimizeTemplateHTML(`<div class="datepicker">
  <div class="datepicker-picker">
    <div class="datepicker-header">
      <div class="datepicker-title"></div>
      <div class="datepicker-controls">
        <button type="button" class="%buttonClass% prev-btn"></button>
        <button type="button" class="%buttonClass% view-switch"></button>
        <button type="button" class="%buttonClass% next-btn"></button>
      </div>
    </div>
    <div class="datepicker-main"></div>
    <div class="datepicker-footer">
      <div class="datepicker-controls">
        <button type="button" class="%buttonClass% today-btn"></button>
        <button type="button" class="%buttonClass% clear-btn"></button>
      </div>
    </div>
  </div>
</div>`);

const daysTemplate = optimizeTemplateHTML(`<div class="days">
  <div class="days-of-week">${createTagRepeat('span', 7, {class: 'dow'})}</div>
  <div class="datepicker-grid">${createTagRepeat('span', 42)}</div>
</div>`);

const calendarWeeksTemplate = optimizeTemplateHTML(`<div class="calendar-weeks">
  <div class="days-of-week"><span class="dow"></span></div>
  <div class="weeks">${createTagRepeat('span', 6, {class: 'week'})}</div>
</div>`);

// Base class of the view classes
class View {
  constructor(picker, config) {
    Object.assign(this, config, {
      picker,
      element: parseHTML(`<div class="datepicker-view"></div>`).firstChild,
      selected: [],
    });
    this.init(this.picker.datepicker.config);
  }

  init(options) {
    if (options.pickLevel !== undefined) {
      this.isMinView = this.id === options.pickLevel;
    }
    this.setOptions(options);
    this.updateFocus();
    this.updateSelection();
  }

  // Execute beforeShow() callback and apply the result to the element
  // args:
  // - current - current value on the iteration on view rendering
  // - timeValue - time value of the date to pass to beforeShow()
  performBeforeHook(el, current, timeValue) {
    let result = this.beforeShow(new Date(timeValue));
    switch (typeof result) {
      case 'boolean':
        result = {enabled: result};
        break;
      case 'string':
        result = {classes: result};
    }

    if (result) {
      if (result.enabled === false) {
        el.classList.add('disabled');
        pushUnique(this.disabled, current);
      }
      if (result.classes) {
        const extraClasses = result.classes.split(/\s+/);
        el.classList.add(...extraClasses);
        if (extraClasses.includes('disabled')) {
          pushUnique(this.disabled, current);
        }
      }
      if (result.content) {
        replaceChildNodes(el, result.content);
      }
    }
  }
}

class DaysView extends View {
  constructor(picker) {
    super(picker, {
      id: 0,
      name: 'days',
      cellClass: 'day',
    });
  }

  init(options, onConstruction = true) {
    if (onConstruction) {
      const inner = parseHTML(daysTemplate).firstChild;
      this.dow = inner.firstChild;
      this.grid = inner.lastChild;
      this.element.appendChild(inner);
    }
    super.init(options);
  }

  setOptions(options) {
    let updateDOW;

    if (hasProperty(options, 'minDate')) {
      this.minDate = options.minDate;
    }
    if (hasProperty(options, 'maxDate')) {
      this.maxDate = options.maxDate;
    }
    if (options.datesDisabled) {
      this.datesDisabled = options.datesDisabled;
    }
    if (options.daysOfWeekDisabled) {
      this.daysOfWeekDisabled = options.daysOfWeekDisabled;
      updateDOW = true;
    }
    if (options.daysOfWeekHighlighted) {
      this.daysOfWeekHighlighted = options.daysOfWeekHighlighted;
    }
    if (options.todayHighlight !== undefined) {
      this.todayHighlight = options.todayHighlight;
    }
    if (options.weekStart !== undefined) {
      this.weekStart = options.weekStart;
      this.weekEnd = options.weekEnd;
      updateDOW = true;
    }
    if (options.locale) {
      const locale = this.locale = options.locale;
      this.dayNames = locale.daysMin;
      this.switchLabelFormat = locale.titleFormat;
      updateDOW = true;
    }
    if (options.beforeShowDay !== undefined) {
      this.beforeShow = typeof options.beforeShowDay === 'function'
        ? options.beforeShowDay
        : undefined;
    }

    if (options.calendarWeeks !== undefined) {
      if (options.calendarWeeks && !this.calendarWeeks) {
        const weeksElem = parseHTML(calendarWeeksTemplate).firstChild;
        this.calendarWeeks = {
          element: weeksElem,
          dow: weeksElem.firstChild,
          weeks: weeksElem.lastChild,
        };
        this.element.insertBefore(weeksElem, this.element.firstChild);
      } else if (this.calendarWeeks && !options.calendarWeeks) {
        this.element.removeChild(this.calendarWeeks.element);
        this.calendarWeeks = null;
      }
    }
    if (options.showDaysOfWeek !== undefined) {
      if (options.showDaysOfWeek) {
        showElement(this.dow);
        if (this.calendarWeeks) {
          showElement(this.calendarWeeks.dow);
        }
      } else {
        hideElement(this.dow);
        if (this.calendarWeeks) {
          hideElement(this.calendarWeeks.dow);
        }
      }
    }

    // update days-of-week when locale, daysOfweekDisabled or weekStart is changed
    if (updateDOW) {
      Array.from(this.dow.children).forEach((el, index) => {
        const dow = (this.weekStart + index) % 7;
        el.textContent = this.dayNames[dow];
        el.className = this.daysOfWeekDisabled.includes(dow) ? 'dow disabled' : 'dow';
      });
    }
  }

  // Apply update on the focused date to view's settings
  updateFocus() {
    const viewDate = new Date(this.picker.viewDate);
    const viewYear = viewDate.getFullYear();
    const viewMonth = viewDate.getMonth();
    const firstOfMonth = dateValue(viewYear, viewMonth, 1);
    const start = dayOfTheWeekOf(firstOfMonth, this.weekStart, this.weekStart);

    this.first = firstOfMonth;
    this.last = dateValue(viewYear, viewMonth + 1, 0);
    this.start = start;
    this.focused = this.picker.viewDate;
  }

  // Apply update on the selected dates to view's settings
  updateSelection() {
    const {dates, rangepicker} = this.picker.datepicker;
    this.selected = dates;
    if (rangepicker) {
      this.range = rangepicker.dates;
    }
  }

   // Update the entire view UI
  render() {
    // update today marker on ever render
    this.today = this.todayHighlight ? today() : undefined;
    // refresh disabled dates on every render in order to clear the ones added
    // by beforeShow hook at previous render
    this.disabled = [...this.datesDisabled];

    const switchLabel = formatDate(this.focused, this.switchLabelFormat, this.locale);
    this.picker.setViewSwitchLabel(switchLabel);
    this.picker.setPrevBtnDisabled(this.first <= this.minDate);
    this.picker.setNextBtnDisabled(this.last >= this.maxDate);

    if (this.calendarWeeks) {
      // start of the UTC week (Monday) of the 1st of the month
      const startOfWeek = dayOfTheWeekOf(this.first, 1, 1);
      Array.from(this.calendarWeeks.weeks.children).forEach((el, index) => {
        el.textContent = getWeek(addWeeks(startOfWeek, index));
      });
    }
    Array.from(this.grid.children).forEach((el, index) => {
      const classList = el.classList;
      const current = addDays(this.start, index);
      const date = new Date(current);
      const day = date.getDay();

      el.className = `datepicker-cell ${this.cellClass}`;
      el.dataset.date = current;
      el.textContent = date.getDate();

      if (current < this.first) {
        classList.add('prev');
      } else if (current > this.last) {
        classList.add('next');
      }
      if (this.today === current) {
        classList.add('today');
      }
      if (current < this.minDate || current > this.maxDate || this.disabled.includes(current)) {
        classList.add('disabled');
      }
      if (this.daysOfWeekDisabled.includes(day)) {
        classList.add('disabled');
        pushUnique(this.disabled, current);
      }
      if (this.daysOfWeekHighlighted.includes(day)) {
        classList.add('highlighted');
      }
      if (this.range) {
        const [rangeStart, rangeEnd] = this.range;
        if (current > rangeStart && current < rangeEnd) {
          classList.add('range');
        }
        if (current === rangeStart) {
          classList.add('range-start');
        }
        if (current === rangeEnd) {
          classList.add('range-end');
        }
      }
      if (this.selected.includes(current)) {
        classList.add('selected');
      }
      if (current === this.focused) {
        classList.add('focused');
      }

      if (this.beforeShow) {
        this.performBeforeHook(el, current, current);
      }
    });
  }

  // Update the view UI by applying the changes of selected and focused items
  refresh() {
    const [rangeStart, rangeEnd] = this.range || [];
    this.grid
      .querySelectorAll('.range, .range-start, .range-end, .selected, .focused')
      .forEach((el) => {
        el.classList.remove('range', 'range-start', 'range-end', 'selected', 'focused');
      });
    Array.from(this.grid.children).forEach((el) => {
      const current = Number(el.dataset.date);
      const classList = el.classList;
      if (current > rangeStart && current < rangeEnd) {
        classList.add('range');
      }
      if (current === rangeStart) {
        classList.add('range-start');
      }
      if (current === rangeEnd) {
        classList.add('range-end');
      }
      if (this.selected.includes(current)) {
        classList.add('selected');
      }
      if (current === this.focused) {
        classList.add('focused');
      }
    });
  }

  // Update the view UI by applying the change of focused item
  refreshFocus() {
    const index = Math.round((this.focused - this.start) / 86400000);
    this.grid.querySelectorAll('.focused').forEach((el) => {
      el.classList.remove('focused');
    });
    this.grid.children[index].classList.add('focused');
  }
}

function computeMonthRange(range, thisYear) {
  if (!range || !range[0] || !range[1]) {
    return;
  }

  const [[startY, startM], [endY, endM]] = range;
  if (startY > thisYear || endY < thisYear) {
    return;
  }
  return [
    startY === thisYear ? startM : -1,
    endY === thisYear ? endM : 12,
  ];
}

class MonthsView extends View {
  constructor(picker) {
    super(picker, {
      id: 1,
      name: 'months',
      cellClass: 'month',
    });
  }

  init(options, onConstruction = true) {
    if (onConstruction) {
      this.grid = this.element;
      this.element.classList.add('months', 'datepicker-grid');
      this.grid.appendChild(parseHTML(createTagRepeat('span', 12, {'data-month': ix => ix})));
    }
    super.init(options);
  }

  setOptions(options) {
    if (options.locale) {
      this.monthNames = options.locale.monthsShort;
    }
    if (hasProperty(options, 'minDate')) {
      if (options.minDate === undefined) {
        this.minYear = this.minMonth = this.minDate = undefined;
      } else {
        const minDateObj = new Date(options.minDate);
        this.minYear = minDateObj.getFullYear();
        this.minMonth = minDateObj.getMonth();
        this.minDate = minDateObj.setDate(1);
      }
    }
    if (hasProperty(options, 'maxDate')) {
      if (options.maxDate === undefined) {
        this.maxYear = this.maxMonth = this.maxDate = undefined;
      } else {
        const maxDateObj = new Date(options.maxDate);
        this.maxYear = maxDateObj.getFullYear();
        this.maxMonth = maxDateObj.getMonth();
        this.maxDate = dateValue(this.maxYear, this.maxMonth + 1, 0);
      }
    }
    if (this.isMinView) {
      if (options.datesDisabled) {
        this.datesDisabled = options.datesDisabled;
      }
    } else {
      this.datesDisabled = [];
    }
    if (options.beforeShowMonth !== undefined) {
      this.beforeShow = typeof options.beforeShowMonth === 'function'
        ? options.beforeShowMonth
        : undefined;
    }
  }

  // Update view's settings to reflect the viewDate set on the picker
  updateFocus() {
    const viewDate = new Date(this.picker.viewDate);
    this.year = viewDate.getFullYear();
    this.focused = viewDate.getMonth();
  }

  // Update view's settings to reflect the selected dates
  updateSelection() {
    const {dates, rangepicker} = this.picker.datepicker;
    this.selected = dates.reduce((selected, timeValue) => {
      const date = new Date(timeValue);
      const year = date.getFullYear();
      const month = date.getMonth();
      if (selected[year] === undefined) {
        selected[year] = [month];
      } else {
        pushUnique(selected[year], month);
      }
      return selected;
    }, {});
    if (rangepicker && rangepicker.dates) {
      this.range = rangepicker.dates.map(timeValue => {
        const date = new Date(timeValue);
        return isNaN(date) ? undefined : [date.getFullYear(), date.getMonth()];
      });
    }
  }

  // Update the entire view UI
  render() {
    // refresh disabled months on every render in order to clear the ones added
    // by beforeShow hook at previous render
    // this.disabled = [...this.datesDisabled];
    this.disabled = this.datesDisabled.reduce((arr, disabled) => {
      const dt = new Date(disabled);
      if (this.year === dt.getFullYear()) {
        arr.push(dt.getMonth());
      }
      return arr;
    }, []);

    this.picker.setViewSwitchLabel(this.year);
    this.picker.setPrevBtnDisabled(this.year <= this.minYear);
    this.picker.setNextBtnDisabled(this.year >= this.maxYear);

    const selected = this.selected[this.year] || [];
    const yrOutOfRange = this.year < this.minYear || this.year > this.maxYear;
    const isMinYear = this.year === this.minYear;
    const isMaxYear = this.year === this.maxYear;
    const range = computeMonthRange(this.range, this.year);

    Array.from(this.grid.children).forEach((el, index) => {
      const classList = el.classList;
      const date = dateValue(this.year, index, 1);

      el.className = `datepicker-cell ${this.cellClass}`;
      if (this.isMinView) {
        el.dataset.date = date;
      }
      // reset text on every render to clear the custom content set
      // by beforeShow hook at previous render
      el.textContent = this.monthNames[index];

      if (
        yrOutOfRange
        || isMinYear && index < this.minMonth
        || isMaxYear && index > this.maxMonth
        || this.disabled.includes(index)
      ) {
        classList.add('disabled');
      }
      if (range) {
        const [rangeStart, rangeEnd] = range;
        if (index > rangeStart && index < rangeEnd) {
          classList.add('range');
        }
        if (index === rangeStart) {
          classList.add('range-start');
        }
        if (index === rangeEnd) {
          classList.add('range-end');
        }
      }
      if (selected.includes(index)) {
        classList.add('selected');
      }
      if (index === this.focused) {
        classList.add('focused');
      }

      if (this.beforeShow) {
        this.performBeforeHook(el, index, date);
      }
    });
  }

  // Update the view UI by applying the changes of selected and focused items
  refresh() {
    const selected = this.selected[this.year] || [];
    const [rangeStart, rangeEnd] = computeMonthRange(this.range, this.year) || [];
    this.grid
      .querySelectorAll('.range, .range-start, .range-end, .selected, .focused')
      .forEach((el) => {
        el.classList.remove('range', 'range-start', 'range-end', 'selected', 'focused');
      });
    Array.from(this.grid.children).forEach((el, index) => {
      const classList = el.classList;
      if (index > rangeStart && index < rangeEnd) {
        classList.add('range');
      }
      if (index === rangeStart) {
        classList.add('range-start');
      }
      if (index === rangeEnd) {
        classList.add('range-end');
      }
      if (selected.includes(index)) {
        classList.add('selected');
      }
      if (index === this.focused) {
        classList.add('focused');
      }
    });
  }

  // Update the view UI by applying the change of focused item
  refreshFocus() {
    this.grid.querySelectorAll('.focused').forEach((el) => {
      el.classList.remove('focused');
    });
    this.grid.children[this.focused].classList.add('focused');
  }
}

function toTitleCase(word) {
  return [...word].reduce((str, ch, ix) => str += ix ? ch : ch.toUpperCase(), '');
}

// Class representing the years and decades view elements
class YearsView extends View {
  constructor(picker, config) {
    super(picker, config);
  }

  init(options, onConstruction = true) {
    if (onConstruction) {
      this.navStep = this.step * 10;
      this.beforeShowOption = `beforeShow${toTitleCase(this.cellClass)}`;
      this.grid = this.element;
      this.element.classList.add(this.name, 'datepicker-grid');
      this.grid.appendChild(parseHTML(createTagRepeat('span', 12)));
    }
    super.init(options);
  }

  setOptions(options) {
    if (hasProperty(options, 'minDate')) {
      if (options.minDate === undefined) {
        this.minYear = this.minDate = undefined;
      } else {
        this.minYear = startOfYearPeriod(options.minDate, this.step);
        this.minDate = dateValue(this.minYear, 0, 1);
      }
    }
    if (hasProperty(options, 'maxDate')) {
      if (options.maxDate === undefined) {
        this.maxYear = this.maxDate = undefined;
      } else {
        this.maxYear = startOfYearPeriod(options.maxDate, this.step);
        this.maxDate = dateValue(this.maxYear, 11, 31);
      }
    }
    if (this.isMinView) {
      if (options.datesDisabled) {
        this.datesDisabled = options.datesDisabled;
      }
    } else {
      this.datesDisabled = [];
    }
    if (options[this.beforeShowOption] !== undefined) {
      const beforeShow = options[this.beforeShowOption];
      this.beforeShow = typeof beforeShow === 'function' ? beforeShow : undefined;
    }
  }

  // Update view's settings to reflect the viewDate set on the picker
  updateFocus() {
    const viewDate = new Date(this.picker.viewDate);
    const first = startOfYearPeriod(viewDate, this.navStep);
    const last = first + 9 * this.step;

    this.first = first;
    this.last = last;
    this.start = first - this.step;
    this.focused = startOfYearPeriod(viewDate, this.step);
  }

  // Update view's settings to reflect the selected dates
  updateSelection() {
    const {dates, rangepicker} = this.picker.datepicker;
    this.selected = dates.reduce((years, timeValue) => {
      return pushUnique(years, startOfYearPeriod(timeValue, this.step));
    }, []);
    if (rangepicker && rangepicker.dates) {
      this.range = rangepicker.dates.map(timeValue => {
        if (timeValue !== undefined) {
          return startOfYearPeriod(timeValue, this.step);
        }
      });
    }
  }

  // Update the entire view UI
  render() {
    // refresh disabled years on every render in order to clear the ones added
    // by beforeShow hook at previous render
    // this.disabled = [...this.datesDisabled];
    this.disabled = this.datesDisabled.map(disabled => new Date(disabled).getFullYear());

    this.picker.setViewSwitchLabel(`${this.first}-${this.last}`);
    this.picker.setPrevBtnDisabled(this.first <= this.minYear);
    this.picker.setNextBtnDisabled(this.last >= this.maxYear);

    Array.from(this.grid.children).forEach((el, index) => {
      const classList = el.classList;
      const current = this.start + (index * this.step);
      const date = dateValue(current, 0, 1);

      el.className = `datepicker-cell ${this.cellClass}`;
      if (this.isMinView) {
        el.dataset.date = date;
      }
      el.textContent = el.dataset.year = current;

      if (index === 0) {
        classList.add('prev');
      } else if (index === 11) {
        classList.add('next');
      }
      if (current < this.minYear || current > this.maxYear || this.disabled.includes(current)) {
        classList.add('disabled');
      }
      if (this.range) {
        const [rangeStart, rangeEnd] = this.range;
        if (current > rangeStart && current < rangeEnd) {
          classList.add('range');
        }
        if (current === rangeStart) {
          classList.add('range-start');
        }
        if (current === rangeEnd) {
          classList.add('range-end');
        }
      }
      if (this.selected.includes(current)) {
        classList.add('selected');
      }
      if (current === this.focused) {
        classList.add('focused');
      }

      if (this.beforeShow) {
        this.performBeforeHook(el, current, date);
      }
    });
  }

  // Update the view UI by applying the changes of selected and focused items
  refresh() {
    const [rangeStart, rangeEnd] = this.range || [];
    this.grid
      .querySelectorAll('.range, .range-start, .range-end, .selected, .focused')
      .forEach((el) => {
        el.classList.remove('range', 'range-start', 'range-end', 'selected', 'focused');
      });
    Array.from(this.grid.children).forEach((el) => {
      const current = Number(el.textContent);
      const classList = el.classList;
      if (current > rangeStart && current < rangeEnd) {
        classList.add('range');
      }
      if (current === rangeStart) {
        classList.add('range-start');
      }
      if (current === rangeEnd) {
        classList.add('range-end');
      }
      if (this.selected.includes(current)) {
        classList.add('selected');
      }
      if (current === this.focused) {
        classList.add('focused');
      }
    });
  }

  // Update the view UI by applying the change of focused item
  refreshFocus() {
    const index = Math.round((this.focused - this.start) / this.step);
    this.grid.querySelectorAll('.focused').forEach((el) => {
      el.classList.remove('focused');
    });
    this.grid.children[index].classList.add('focused');
  }
}

function triggerDatepickerEvent(datepicker, type) {
  const detail = {
    date: datepicker.getDate(),
    viewDate: new Date(datepicker.picker.viewDate),
    viewId: datepicker.picker.currentView.id,
    datepicker,
  };
  datepicker.element.dispatchEvent(new CustomEvent(type, {detail}));
}

// direction: -1 (to previous), 1 (to next)
function goToPrevOrNext(datepicker, direction) {
  const {minDate, maxDate} = datepicker.config;
  const {currentView, viewDate} = datepicker.picker;
  let newViewDate;
  switch (currentView.id) {
    case 0:
      newViewDate = addMonths(viewDate, direction);
      break;
    case 1:
      newViewDate = addYears(viewDate, direction);
      break;
    default:
      newViewDate = addYears(viewDate, direction * currentView.navStep);
  }
  newViewDate = limitToRange(newViewDate, minDate, maxDate);
  datepicker.picker.changeFocus(newViewDate).render();
}

function switchView(datepicker) {
  const viewId = datepicker.picker.currentView.id;
  if (viewId === datepicker.config.maxView) {
    return;
  }
  datepicker.picker.changeView(viewId + 1).render();
}

function unfocus(datepicker) {
  if (datepicker.config.updateOnBlur) {
    datepicker.update({revert: true});
  } else {
    datepicker.refresh('input');
  }
  datepicker.hide();
}

function goToSelectedMonthOrYear(datepicker, selection) {
  const picker = datepicker.picker;
  const viewDate = new Date(picker.viewDate);
  const viewId = picker.currentView.id;
  const newDate = viewId === 1
    ? addMonths(viewDate, selection - viewDate.getMonth())
    : addYears(viewDate, selection - viewDate.getFullYear());

  picker.changeFocus(newDate).changeView(viewId - 1).render();
}

function onClickTodayBtn(datepicker) {
  const picker = datepicker.picker;
  const currentDate = today();
  if (datepicker.config.todayBtnMode === 1) {
    if (datepicker.config.autohide) {
      datepicker.setDate(currentDate);
      return;
    }
    datepicker.setDate(currentDate, {render: false});
    picker.update();
  }
  if (picker.viewDate !== currentDate) {
    picker.changeFocus(currentDate);
  }
  picker.changeView(0).render();
}

function onClickClearBtn(datepicker) {
  datepicker.setDate({clear: true});
}

function onClickViewSwitch(datepicker) {
  switchView(datepicker);
}

function onClickPrevBtn(datepicker) {
  goToPrevOrNext(datepicker, -1);
}

function onClickNextBtn(datepicker) {
  goToPrevOrNext(datepicker, 1);
}

// For the picker's main block to delegete the events from `datepicker-cell`s
function onClickView(datepicker, ev) {
  const target = findElementInEventPath(ev, '.datepicker-cell');
  if (!target || target.classList.contains('disabled')) {
    return;
  }

  const {id, isMinView} = datepicker.picker.currentView;
  if (isMinView) {
    datepicker.setDate(Number(target.dataset.date));
  } else if (id === 1) {
    goToSelectedMonthOrYear(datepicker, Number(target.dataset.month));
  } else {
    goToSelectedMonthOrYear(datepicker, Number(target.dataset.year));
  }
}

function onMousedownPicker(ev) {
  ev.preventDefault();
}

const orientClasses = ['left', 'top', 'right', 'bottom'].reduce((obj, key) => {
  obj[key] = `datepicker-orient-${key}`;
  return obj;
}, {});
const toPx = num => num ? `${num}px` : num;

function processPickerOptions(picker, options) {
  if (options.title !== undefined) {
    if (options.title) {
      picker.controls.title.textContent = options.title;
      showElement(picker.controls.title);
    } else {
      picker.controls.title.textContent = '';
      hideElement(picker.controls.title);
    }
  }
  if (options.prevArrow) {
    const prevBtn = picker.controls.prevBtn;
    emptyChildNodes(prevBtn);
    options.prevArrow.forEach((node) => {
      prevBtn.appendChild(node.cloneNode(true));
    });
  }
  if (options.nextArrow) {
    const nextBtn = picker.controls.nextBtn;
    emptyChildNodes(nextBtn);
    options.nextArrow.forEach((node) => {
      nextBtn.appendChild(node.cloneNode(true));
    });
  }
  if (options.locale) {
    picker.controls.todayBtn.textContent = options.locale.today;
    picker.controls.clearBtn.textContent = options.locale.clear;
  }
  if (options.todayBtn !== undefined) {
    if (options.todayBtn) {
      showElement(picker.controls.todayBtn);
    } else {
      hideElement(picker.controls.todayBtn);
    }
  }
  if (hasProperty(options, 'minDate') || hasProperty(options, 'maxDate')) {
    const {minDate, maxDate} = picker.datepicker.config;
    picker.controls.todayBtn.disabled = !isInRange(today(), minDate, maxDate);
  }
  if (options.clearBtn !== undefined) {
    if (options.clearBtn) {
      showElement(picker.controls.clearBtn);
    } else {
      hideElement(picker.controls.clearBtn);
    }
  }
}

// Compute view date to reset, which will be...
// - the last item of the selected dates or defaultViewDate if no selection
// - limitted to minDate or maxDate if it exceeds the range
function computeResetViewDate(datepicker) {
  const {dates, config} = datepicker;
  const viewDate = dates.length > 0 ? lastItemOf(dates) : config.defaultViewDate;
  return limitToRange(viewDate, config.minDate, config.maxDate);
}

// Change current view's view date
function setViewDate(picker, newDate) {
  const oldViewDate = new Date(picker.viewDate);
  const newViewDate = new Date(newDate);
  const {id, year, first, last} = picker.currentView;
  const viewYear = newViewDate.getFullYear();

  picker.viewDate = newDate;
  if (viewYear !== oldViewDate.getFullYear()) {
    triggerDatepickerEvent(picker.datepicker, 'changeYear');
  }
  if (newViewDate.getMonth() !== oldViewDate.getMonth()) {
    triggerDatepickerEvent(picker.datepicker, 'changeMonth');
  }

  // return whether the new date is in different period on time from the one
  // displayed in the current view
  // when true, the view needs to be re-rendered on the next UI refresh.
  switch (id) {
    case 0:
      return newDate < first || newDate > last;
    case 1:
      return viewYear !== year;
    default:
      return viewYear < first || viewYear > last;
  }
}

function getTextDirection(el) {
  return window.getComputedStyle(el).direction;
}

// find the closet scrollable ancestor elemnt under the body
function findScrollParents(el) {
  const parent = getParent(el);
  if (parent === document.body || !parent) {
    return;
  }

  // checking overflow only is enough because computed overflow cannot be
  // visible or a combination of visible and other when either axis is set
  // to other than visible.
  // (Setting one axis to other than 'visible' while the other is 'visible'
  // results in the other axis turning to 'auto')
  return window.getComputedStyle(parent).overflow !== 'visible'
    ? parent
    : findScrollParents(parent);
}

// Class representing the picker UI
class Picker {
  constructor(datepicker) {
    const {config} = this.datepicker = datepicker;

    const template = pickerTemplate.replace(/%buttonClass%/g, config.buttonClass);
    const element = this.element = parseHTML(template).firstChild;
    const [header, main, footer] = element.firstChild.children;
    const title = header.firstElementChild;
    const [prevBtn, viewSwitch, nextBtn] = header.lastElementChild.children;
    const [todayBtn, clearBtn] = footer.firstChild.children;
    const controls = {
      title,
      prevBtn,
      viewSwitch,
      nextBtn,
      todayBtn,
      clearBtn,
    };
    this.main = main;
    this.controls = controls;

    const elementClass = datepicker.inline ? 'inline' : 'dropdown';
    element.classList.add(`datepicker-${elementClass}`);

    processPickerOptions(this, config);
    this.viewDate = computeResetViewDate(datepicker);

    // set up event listeners
    registerListeners(datepicker, [
      [element, 'mousedown', onMousedownPicker],
      [main, 'click', onClickView.bind(null, datepicker)],
      [controls.viewSwitch, 'click', onClickViewSwitch.bind(null, datepicker)],
      [controls.prevBtn, 'click', onClickPrevBtn.bind(null, datepicker)],
      [controls.nextBtn, 'click', onClickNextBtn.bind(null, datepicker)],
      [controls.todayBtn, 'click', onClickTodayBtn.bind(null, datepicker)],
      [controls.clearBtn, 'click', onClickClearBtn.bind(null, datepicker)],
    ]);

    // set up views
    this.views = [
      new DaysView(this),
      new MonthsView(this),
      new YearsView(this, {id: 2, name: 'years', cellClass: 'year', step: 1}),
      new YearsView(this, {id: 3, name: 'decades', cellClass: 'decade', step: 10}),
    ];
    this.currentView = this.views[config.startView];

    this.currentView.render();
    this.main.appendChild(this.currentView.element);
    if (config.container) {
      config.container.appendChild(this.element);
    } else {
      datepicker.inputField.after(this.element);
    }
  }

  setOptions(options) {
    processPickerOptions(this, options);
    this.views.forEach((view) => {
      view.init(options, false);
    });
    this.currentView.render();
  }

  detach() {
    this.element.remove();
  }

  show() {
    if (this.active) {
      return;
    }

    const {datepicker, element} = this;
    if (datepicker.inline) {
      element.classList.add('active');
    } else {
      // ensure picker's direction matches input's
      const inputDirection = getTextDirection(datepicker.inputField);
      if (inputDirection !== getTextDirection(getParent(element))) {
        element.dir = inputDirection;
      } else if (element.dir) {
        element.removeAttribute('dir');
      }

      element.style.visiblity = 'hidden';
      element.classList.add('active');
      this.place();
      element.style.visiblity = '';

      if (datepicker.config.disableTouchKeyboard) {
        datepicker.inputField.blur();
      }
    }
    this.active = true;
    triggerDatepickerEvent(datepicker, 'show');
  }

  hide() {
    if (!this.active) {
      return;
    }
    this.datepicker.exitEditMode();
    this.element.classList.remove('active');
    this.active = false;
    triggerDatepickerEvent(this.datepicker, 'hide');
  }

  place() {
    const {classList, offsetParent, style} = this.element;
    const {config, inputField} = this.datepicker;
    const {
      width: calendarWidth,
      height: calendarHeight,
    } = this.element.getBoundingClientRect();
    const {
      left: inputLeft,
      top: inputTop,
      right: inputRight,
      bottom: inputBottom,
      width: inputWidth,
      height: inputHeight
    } = inputField.getBoundingClientRect();
    let {x: orientX, y: orientY} = config.orientation;
    let left = inputLeft;
    let top = inputTop;

    // caliculate offsetLeft/Top of inputField
    if (offsetParent === document.body || !offsetParent) {
      left += window.scrollX;
      top += window.scrollY;
    } else {
      const offsetParentRect = offsetParent.getBoundingClientRect();
      left -= offsetParentRect.left - offsetParent.scrollLeft;
      top -= offsetParentRect.top - offsetParent.scrollTop;
    }

    // caliculate the boundaries of the visible area that contains inputField
    const scrollParent = findScrollParents(inputField);
    let scrollAreaLeft = 0;
    let scrollAreaTop = 0;
    let {
      clientWidth: scrollAreaRight,
      clientHeight: scrollAreaBottom,
    } = document.documentElement;

    if (scrollParent) {
      const scrollParentRect = scrollParent.getBoundingClientRect();
      if (scrollParentRect.top > 0) {
        scrollAreaTop = scrollParentRect.top;
      }
      if (scrollParentRect.left > 0) {
        scrollAreaLeft = scrollParentRect.left;
      }
      if (scrollParentRect.right < scrollAreaRight) {
        scrollAreaRight = scrollParentRect.right;
      }
      if (scrollParentRect.bottom < scrollAreaBottom) {
        scrollAreaBottom = scrollParentRect.bottom;
      }
    }

    // determine the horizontal orientation and left position
    let adjustment = 0;
    if (orientX === 'auto') {
      if (inputLeft < scrollAreaLeft) {
        orientX = 'left';
        adjustment = scrollAreaLeft - inputLeft;
      } else if (inputLeft + calendarWidth > scrollAreaRight) {
        orientX = 'right';
        if (scrollAreaRight < inputRight) {
          adjustment = scrollAreaRight - inputRight;
        }
      } else if (getTextDirection(inputField) === 'rtl') {
        orientX = inputRight - calendarWidth < scrollAreaLeft ? 'left' : 'right';
      } else {
        orientX = 'left';
      }
    }
    if (orientX === 'right') {
      left += inputWidth - calendarWidth;
    }
    left += adjustment;

    // determine the vertical orientation and top position
    if (orientY === 'auto') {
      if (inputTop - calendarHeight > scrollAreaTop) {
        orientY = inputBottom + calendarHeight > scrollAreaBottom ? 'top' : 'bottom';
      } else {
        orientY = 'bottom';
      }
    }
    if (orientY === 'top') {
      top -= calendarHeight;
    } else {
      top += inputHeight;
    }

    classList.remove(...Object.values(orientClasses));
    classList.add(orientClasses[orientX], orientClasses[orientY]);

    style.left = toPx(left);
    style.top = toPx(top);
  }

  setViewSwitchLabel(labelText) {
    this.controls.viewSwitch.textContent = labelText;
  }

  setPrevBtnDisabled(disabled) {
    this.controls.prevBtn.disabled = disabled;
  }

  setNextBtnDisabled(disabled) {
    this.controls.nextBtn.disabled = disabled;
  }

  changeView(viewId) {
    const oldView = this.currentView;
    const newView =  this.views[viewId];
    if (newView.id !== oldView.id) {
      this.currentView = newView;
      this._renderMethod = 'render';
      triggerDatepickerEvent(this.datepicker, 'changeView');
      this.main.replaceChild(newView.element, oldView.element);
    }
    return this;
  }

  // Change the focused date (view date)
  changeFocus(newViewDate) {
    this._renderMethod = setViewDate(this, newViewDate) ? 'render' : 'refreshFocus';
    this.views.forEach((view) => {
      view.updateFocus();
    });
    return this;
  }

  // Apply the change of the selected dates
  update() {
    const newViewDate = computeResetViewDate(this.datepicker);
    this._renderMethod = setViewDate(this, newViewDate) ? 'render' : 'refresh';
    this.views.forEach((view) => {
      view.updateFocus();
      view.updateSelection();
    });
    return this;
  }

  // Refresh the picker UI
  render(quickRender = true) {
    const renderMethod = (quickRender && this._renderMethod) || 'render';
    delete this._renderMethod;

    this.currentView[renderMethod]();
  }
}

// Find the closest date that doesn't meet the condition for unavailable date
// Returns undefined if no available date is found
// addFn: function to calculate the next date
//   - args: time value, amount
// increase: amount to pass to addFn
// testFn: function to test the unavailablity of the date
//   - args: time value; retun: true if unavailable
function findNextAvailableOne(date, addFn, increase, testFn, min, max) {
  if (!isInRange(date, min, max)) {
    return;
  }
  if (testFn(date)) {
    const newDate = addFn(date, increase);
    return findNextAvailableOne(newDate, addFn, increase, testFn, min, max);
  }
  return date;
}

// direction: -1 (left/up), 1 (right/down)
// vertical: true for up/down, false for left/right
function moveByArrowKey(datepicker, ev, direction, vertical) {
  const picker = datepicker.picker;
  const currentView = picker.currentView;
  const step = currentView.step || 1;
  let viewDate = picker.viewDate;
  let addFn;
  let testFn;
  switch (currentView.id) {
    case 0:
      if (vertical) {
        viewDate = addDays(viewDate, direction * 7);
      } else if (ev.ctrlKey || ev.metaKey) {
        viewDate = addYears(viewDate, direction);
      } else {
        viewDate = addDays(viewDate, direction);
      }
      addFn = addDays;
      testFn = (date) => currentView.disabled.includes(date);
      break;
    case 1:
      viewDate = addMonths(viewDate, vertical ? direction * 4 : direction);
      addFn = addMonths;
      testFn = (date) => {
        const dt = new Date(date);
        const {year, disabled} = currentView;
        return dt.getFullYear() === year && disabled.includes(dt.getMonth());
      };
      break;
    default:
      viewDate = addYears(viewDate, direction * (vertical ? 4 : 1) * step);
      addFn = addYears;
      testFn = date => currentView.disabled.includes(startOfYearPeriod(date, step));
  }
  viewDate = findNextAvailableOne(
    viewDate,
    addFn,
    direction < 0 ? -step : step,
    testFn,
    currentView.minDate,
    currentView.maxDate
  );
  if (viewDate !== undefined) {
    picker.changeFocus(viewDate).render();
  }
}

function onKeydown(datepicker, ev) {
  const key = ev.key;
  if (key === 'Tab') {
    unfocus(datepicker);
    return;
  }

  const picker = datepicker.picker;
  const {id, isMinView} = picker.currentView;
  if (!picker.active) {
    if (key === 'ArrowDown') {
      picker.show();
    } else {
      if (key === 'Enter') {
        datepicker.update();
      } else if (key === 'Escape') {
        picker.show();
      }
      return;
    }
  } else if (datepicker.editMode) {
    if (key === 'Enter') {
      datepicker.exitEditMode({update: true, autohide: datepicker.config.autohide});
    } else if (key === 'Escape') {
      picker.hide();
    }
    return;
  } else {
    if (key === 'ArrowLeft') {
      if (ev.ctrlKey || ev.metaKey) {
        goToPrevOrNext(datepicker, -1);
      } else if (ev.shiftKey) {
        datepicker.enterEditMode();
        return;
      } else {
        moveByArrowKey(datepicker, ev, -1, false);
      }
    } else if (key === 'ArrowRight') {
      if (ev.ctrlKey || ev.metaKey) {
        goToPrevOrNext(datepicker, 1);
      } else if (ev.shiftKey) {
        datepicker.enterEditMode();
        return;
      } else {
        moveByArrowKey(datepicker, ev, 1, false);
      }
    } else if (key === 'ArrowUp') {
      if (ev.ctrlKey || ev.metaKey) {
        switchView(datepicker);
      } else if (ev.shiftKey) {
        datepicker.enterEditMode();
        return;
      } else {
        moveByArrowKey(datepicker, ev, -1, true);
      }
    } else if (key === 'ArrowDown') {
      if (ev.shiftKey && !ev.ctrlKey && !ev.metaKey) {
        datepicker.enterEditMode();
        return;
      }
      moveByArrowKey(datepicker, ev, 1, true);
    } else if (key === 'Enter') {
      if (isMinView) {
        datepicker.setDate(picker.viewDate);
        return;
      }
      picker.changeView(id - 1).render();
    } else {
      if (key === 'Escape') {
        picker.hide();
      } else if (
        key === 'Backspace'
        || key === 'Delete'
        || (key.length === 1 && !ev.ctrlKey && !ev.metaKey)
      ) {
        datepicker.enterEditMode();
      }
      return;
    }
  }
  ev.preventDefault();
}

function onFocus(datepicker) {
  if (datepicker.config.showOnFocus && !datepicker._showing) {
    datepicker.show();
  }
}

// for the prevention for entering edit mode while getting focus on click
function onMousedown(datepicker, ev) {
  const el = ev.target;
  if (datepicker.picker.active || datepicker.config.showOnClick) {
    el._active = isActiveElement(el);
    el._clicking = setTimeout(() => {
      delete el._active;
      delete el._clicking;
    }, 2000);
  }
}

function onClickInput(datepicker, ev) {
  const el = ev.target;
  if (!el._clicking) {
    return;
  }
  clearTimeout(el._clicking);
  delete el._clicking;

  if (el._active) {
    datepicker.enterEditMode();
  }
  delete el._active;

  if (datepicker.config.showOnClick) {
    datepicker.show();
  }
}

function onPaste(datepicker, ev) {
  if (ev.clipboardData.types.includes('text/plain')) {
    datepicker.enterEditMode();
  }
}

// for the `document` to delegate the events from outside the picker/input field
function onClickOutside(datepicker, ev) {
  const {element, picker} = datepicker;
  // check both picker's and input's activeness to make updateOnBlur work in
  // the cases where...
  // - picker is hidden by ESC key press → input stays focused
  // - input is unfocused by closing mobile keyboard → piker is kept shown
  if (!picker.active && !isActiveElement(element)) {
    return;
  }
  const pickerElem = picker.element;
  if (findElementInEventPath(ev, el => el === element || el === pickerElem)) {
    return;
  }
  unfocus(datepicker);
}

function stringifyDates(dates, config) {
  return dates
    .map(dt => formatDate(dt, config.format, config.locale))
    .join(config.dateDelimiter);
}

// parse input dates and create an array of time values for selection
// returns undefined if there are no valid dates in inputDates
// when origDates (current selection) is passed, the function works to mix
// the input dates into the current selection
function processInputDates(datepicker, inputDates, clear = false) {
  // const {config, dates: origDates, rangepicker} = datepicker;
  const {config, dates: origDates, rangeSideIndex} = datepicker;
  if (inputDates.length === 0) {
    // empty input is considered valid unless origiDates is passed
    return clear ? [] : undefined;
  }

  // const rangeEnd = rangepicker && datepicker === rangepicker.datepickers[1];
  let newDates = inputDates.reduce((dates, dt) => {
    let date = parseDate(dt, config.format, config.locale);
    if (date === undefined) {
      return dates;
    }
    // adjust to 1st of the month/Jan 1st of the year
    // or to the last day of the monh/Dec 31st of the year if the datepicker
    // is the range-end picker of a rangepicker
    date = regularizeDate(date, config.pickLevel, rangeSideIndex);
    if (
      isInRange(date, config.minDate, config.maxDate)
      && !dates.includes(date)
      && !config.datesDisabled.includes(date)
      && (config.pickLevel > 0 || !config.daysOfWeekDisabled.includes(new Date(date).getDay()))
    ) {
      dates.push(date);
    }
    return dates;
  }, []);
  if (newDates.length === 0) {
    return;
  }
  if (config.multidate && !clear) {
    // get the synmetric difference between origDates and newDates
    newDates = newDates.reduce((dates, date) => {
      if (!origDates.includes(date)) {
        dates.push(date);
      }
      return dates;
    }, origDates.filter(date => !newDates.includes(date)));
  }
  // do length check always because user can input multiple dates regardless of the mode
  return config.maxNumberOfDates && newDates.length > config.maxNumberOfDates
    ? newDates.slice(config.maxNumberOfDates * -1)
    : newDates;
}

// refresh the UI elements
// modes: 1: input only, 2, picker only, 3 both
function refreshUI(datepicker, mode = 3, quickRender = true) {
  const {config, picker, inputField} = datepicker;
  if (mode & 2) {
    const newView = picker.active ? config.pickLevel : config.startView;
    picker.update().changeView(newView).render(quickRender);
  }
  if (mode & 1 && inputField) {
    inputField.value = stringifyDates(datepicker.dates, config);
  }
}

function setDate(datepicker, inputDates, options) {
  let {clear, render, autohide, revert} = options;
  if (render === undefined) {
    render = true;
  }
  if (!render) {
    autohide = false;
  } else if (autohide === undefined) {
    autohide = datepicker.config.autohide;
  }

  const newDates = processInputDates(datepicker, inputDates, clear);
  if (!newDates && !revert) {
    return;
  }
  if (newDates && newDates.toString() !== datepicker.dates.toString()) {
    datepicker.dates = newDates;
    refreshUI(datepicker, render ? 3 : 1);
    triggerDatepickerEvent(datepicker, 'changeDate');
  } else {
    refreshUI(datepicker, 1);
  }

  if (autohide) {
    datepicker.hide();
  }
}

/**
 * Class representing a date picker
 */
class Datepicker {
  /**
   * Create a date picker
   * @param  {Element} element - element to bind a date picker
   * @param  {Object} [options] - config options
   * @param  {DateRangePicker} [rangepicker] - DateRangePicker instance the
   * date picker belongs to. Use this only when creating date picker as a part
   * of date range picker
   */
  constructor(element, options = {}, rangepicker = undefined) {
    element.datepicker = this;
    this.element = element;

    const config = this.config = Object.assign({
      buttonClass: (options.buttonClass && String(options.buttonClass)) || 'button',
      container: null,
      defaultViewDate: today(),
      maxDate: undefined,
      minDate: undefined,
    }, processOptions(defaultOptions, this));
    // configure by type
    const inline = this.inline = element.tagName !== 'INPUT';
    let inputField;
    if (inline) {
      config.container = element;
    } else {
      if (options.container) {
        // omit string type check because it doesn't guarantee to avoid errors
        // (invalid selector string causes abend with sytax error)
        config.container = options.container instanceof HTMLElement
          ? options.container
          : document.querySelector(options.container);
      }
      inputField = this.inputField = element;
      inputField.classList.add('datepicker-input');
    }
    if (rangepicker) {
      // check validiry
      const index = rangepicker.inputs.indexOf(inputField);
      const datepickers = rangepicker.datepickers;
      if (index < 0 || index > 1 || !Array.isArray(datepickers)) {
        throw Error('Invalid rangepicker object.');
      }
      // attach itaelf to the rangepicker here so that processInputDates() can
      // determine if this is the range-end picker of the rangepicker while
      // setting inital values when pickLevel > 0
      datepickers[index] = this;
      // add getter for rangepicker
      Object.defineProperty(this, 'rangepicker', {
        get() {
          return rangepicker;
        },
      });
      Object.defineProperty(this, 'rangeSideIndex', {
        get() {
          return index;
        },
      });
    }

    // set up config
    this._options = options;
    Object.assign(config, processOptions(options, this));

    // set initial dates
    let initialDates;
    if (inline) {
      initialDates = stringToArray(element.dataset.date, config.dateDelimiter);
      delete element.dataset.date;
    } else {
      initialDates = stringToArray(inputField.value, config.dateDelimiter);
    }
    this.dates = [];
    // process initial value
    const inputDateValues = processInputDates(this, initialDates);
    if (inputDateValues && inputDateValues.length > 0) {
      this.dates = inputDateValues;
    }
    if (inputField) {
      inputField.value = stringifyDates(this.dates, config);
    }

    const picker = this.picker = new Picker(this);

    if (inline) {
      this.show();
    } else {
      // set up event listeners in other modes
      const onMousedownDocument = onClickOutside.bind(null, this);
      const listeners = [
        [inputField, 'keydown', onKeydown.bind(null, this)],
        [inputField, 'focus', onFocus.bind(null, this)],
        [inputField, 'mousedown', onMousedown.bind(null, this)],
        [inputField, 'click', onClickInput.bind(null, this)],
        [inputField, 'paste', onPaste.bind(null, this)],
        [document, 'mousedown', onMousedownDocument],
        [document, 'touchstart', onMousedownDocument],
        [window, 'resize', picker.place.bind(picker)]
      ];
      registerListeners(this, listeners);
    }
  }

  /**
   * Format Date object or time value in given format and language
   * @param  {Date|Number} date - date or time value to format
   * @param  {String|Object} format - format string or object that contains
   * toDisplay() custom formatter, whose signature is
   * - args:
   *   - date: {Date} - Date instance of the date passed to the method
   *   - format: {Object} - the format object passed to the method
   *   - locale: {Object} - locale for the language specified by `lang`
   * - return:
   *     {String} formatted date
   * @param  {String} [lang=en] - language code for the locale to use
   * @return {String} formatted date
   */
  static formatDate(date, format, lang) {
    return formatDate(date, format, lang && locales[lang] || locales.en);
  }

  /**
   * Parse date string
   * @param  {String|Date|Number} dateStr - date string, Date object or time
   * value to parse
   * @param  {String|Object} format - format string or object that contains
   * toValue() custom parser, whose signature is
   * - args:
   *   - dateStr: {String|Date|Number} - the dateStr passed to the method
   *   - format: {Object} - the format object passed to the method
   *   - locale: {Object} - locale for the language specified by `lang`
   * - return:
   *     {Date|Number} parsed date or its time value
   * @param  {String} [lang=en] - language code for the locale to use
   * @return {Number} time value of parsed date
   */
  static parseDate(dateStr, format, lang) {
    return parseDate(dateStr, format, lang && locales[lang] || locales.en);
  }

  /**
   * @type {Object} - Installed locales in `[languageCode]: localeObject` format
   * en`:_English (US)_ is pre-installed.
   */
  static get locales() {
    return locales;
  }

  /**
   * @type {Boolean} - Whether the picker element is shown. `true` whne shown
   */
  get active() {
    return !!(this.picker && this.picker.active);
  }

  /**
   * @type {HTMLDivElement} - DOM object of picker element
   */
  get pickerElement() {
    return this.picker ? this.picker.element : undefined;
  }

  /**
   * Set new values to the config options
   * @param {Object} options - config options to update
   */
  setOptions(options) {
    const picker = this.picker;
    const newOptions = processOptions(options, this);
    Object.assign(this._options, options);
    Object.assign(this.config, newOptions);
    picker.setOptions(newOptions);

    refreshUI(this, 3);
  }

  /**
   * Show the picker element
   */
  show() {
    if (this.inputField) {
      if (this.inputField.disabled) {
        return;
      }
      if (!isActiveElement(this.inputField) && !this.config.disableTouchKeyboard) {
        this._showing = true;
        this.inputField.focus();
        delete this._showing;
      }
    }
    this.picker.show();
  }

  /**
   * Hide the picker element
   * Not available on inline picker
   */
  hide() {
    if (this.inline) {
      return;
    }
    this.picker.hide();
    this.picker.update().changeView(this.config.startView).render();
  }

  /**
   * Destroy the Datepicker instance
   * @return {Detepicker} - the instance destroyed
   */
  destroy() {
    this.hide();
    unregisterListeners(this);
    this.picker.detach();
    if (!this.inline) {
      this.inputField.classList.remove('datepicker-input');
    }
    delete this.element.datepicker;
    return this;
  }

  /**
   * Get the selected date(s)
   *
   * The method returns a Date object of selected date by default, and returns
   * an array of selected dates in multidate mode. If format string is passed,
   * it returns date string(s) formatted in given format.
   *
   * @param  {String} [format] - Format string to stringify the date(s)
   * @return {Date|String|Date[]|String[]} - selected date(s), or if none is
   * selected, empty array in multidate mode and untitled in sigledate mode
   */
  getDate(format = undefined) {
    const callback = format
      ? date => formatDate(date, format, this.config.locale)
      : date => new Date(date);

    if (this.config.multidate) {
      return this.dates.map(callback);
    }
    if (this.dates.length > 0) {
      return callback(this.dates[0]);
    }
  }

  /**
   * Set selected date(s)
   *
   * In multidate mode, you can pass multiple dates as a series of arguments
   * or an array. (Since each date is parsed individually, the type of the
   * dates doesn't have to be the same.)
   * The given dates are used to toggle the select status of each date. The
   * number of selected dates is kept from exceeding the length set to
   * maxNumberOfDates.
   *
   * With clear: true option, the method can be used to clear the selection
   * and to replace the selection instead of toggling in multidate mode.
   * If the option is passed with no date arguments or an empty dates array,
   * it works as "clear" (clear the selection then set nothing), and if the
   * option is passed with new dates to select, it works as "replace" (clear
   * the selection then set the given dates)
   *
   * When render: false option is used, the method omits re-rendering the
   * picker element. In this case, you need to call refresh() method later in
   * order for the picker element to reflect the changes. The input field is
   * refreshed always regardless of this option.
   *
   * When invalid (unparsable, repeated, disabled or out-of-range) dates are
   * passed, the method ignores them and applies only valid ones. In the case
   * that all the given dates are invalid, which is distinguished from passing
   * no dates, the method considers it as an error and leaves the selection
   * untouched. (The input field also remains untouched unless revert: true
   * option is used.)
   *
   * @param {...(Date|Number|String)|Array} [dates] - Date strings, Date
   * objects, time values or mix of those for new selection
   * @param {Object} [options] - function options
   * - clear: {boolean} - Whether to clear the existing selection
   *     defualt: false
   * - render: {boolean} - Whether to re-render the picker element
   *     default: true
   * - autohide: {boolean} - Whether to hide the picker element after re-render
   *     Ignored when used with render: false
   *     default: config.autohide
   * - revert: {boolean} - Whether to refresh the input field when all the
   *     passed dates are invalid
   *     default: false
   */
  setDate(...args) {
    const dates = [...args];
    const opts = {};
    const lastArg = lastItemOf(args);
    if (
      typeof lastArg === 'object'
      && !Array.isArray(lastArg)
      && !(lastArg instanceof Date)
      && lastArg
    ) {
      Object.assign(opts, dates.pop());
    }

    const inputDates = Array.isArray(dates[0]) ? dates[0] : dates;
    setDate(this, inputDates, opts);
  }

  /**
   * Update the selected date(s) with input field's value
   * Not available on inline picker
   *
   * The input field will be refreshed with properly formatted date string.
   *
   * In the case that all the entered dates are invalid (unparsable, repeated,
   * disabled or out-of-range), whixh is distinguished from empty input field,
   * the method leaves the input field untouched as well as the selection by
   * default. If revert: true option is used in this case, the input field is
   * refreshed with the existing selection.
   *
   * @param  {Object} [options] - function options
   * - autohide: {boolean} - whether to hide the picker element after refresh
   *     default: false
   * - revert: {boolean} - Whether to refresh the input field when all the
   *     passed dates are invalid
   *     default: false
   */
  update(options = undefined) {
    if (this.inline) {
      return;
    }

    const opts = Object.assign(options || {}, {clear: true, render: true});
    const inputDates = stringToArray(this.inputField.value, this.config.dateDelimiter);
    setDate(this, inputDates, opts);
  }

  /**
   * Refresh the picker element and the associated input field
   * @param {String} [target] - target item when refreshing one item only
   * 'picker' or 'input'
   * @param {Boolean} [forceRender] - whether to re-render the picker element
   * regardless of its state instead of optimized refresh
   */
  refresh(target = undefined, forceRender = false) {
    if (target && typeof target !== 'string') {
      forceRender = target;
      target = undefined;
    }

    let mode;
    if (target === 'picker') {
      mode = 2;
    } else if (target === 'input') {
      mode = 1;
    } else {
      mode = 3;
    }
    refreshUI(this, mode, !forceRender);
  }

  /**
   * Enter edit mode
   * Not available on inline picker or when the picker element is hidden
   */
  enterEditMode() {
    if (this.inline || !this.picker.active || this.editMode) {
      return;
    }
    this.editMode = true;
    this.inputField.classList.add('in-edit');
  }

  /**
   * Exit from edit mode
   * Not available on inline picker
   * @param  {Object} [options] - function options
   * - update: {boolean} - whether to call update() after exiting
   *     If false, input field is revert to the existing selection
   *     default: false
   */
  exitEditMode(options = undefined) {
    if (this.inline || !this.editMode) {
      return;
    }
    const opts = Object.assign({update: false}, options);
    delete this.editMode;
    this.inputField.classList.remove('in-edit');
    if (opts.update) {
      this.update(opts);
    }
  }
}

/* src/datepicker/index.svelte generated by Svelte v3.46.4 */
const file$z = "src/datepicker/index.svelte";

function create_fragment$z(ctx) {
	let div;
	let input;
	let t;
	let icon;
	let current;
	let mounted;
	let dispose;

	icon = new Icon({
			props: { name: "calendar" },
			$$inline: true
		});

	const block = {
		c: function create() {
			div = element("div");
			input = element("input");
			t = space();
			create_component(icon.$$.fragment);
			attr_dev(input, "placeholder", /*placeholder*/ ctx[1]);
			add_location(input, file$z, 1, 1, 34);
			attr_dev(div, "class", "datepicker-wrapper");
			add_location(div, file$z, 0, 0, 0);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);
			append_dev(div, input);
			/*input_binding*/ ctx[5](input);
			set_input_value(input, /*value*/ ctx[0]);
			append_dev(div, t);
			mount_component(icon, div, null);
			current = true;

			if (!mounted) {
				dispose = [
					listen_dev(input, "changeDate", /*onchange*/ ctx[4], false, false, false),
					listen_dev(input, "input", /*oninput*/ ctx[3], false, false, false),
					listen_dev(input, "input", /*input_input_handler*/ ctx[6])
				];

				mounted = true;
			}
		},
		p: function update(ctx, [dirty]) {
			if (!current || dirty & /*placeholder*/ 2) {
				attr_dev(input, "placeholder", /*placeholder*/ ctx[1]);
			}

			if (dirty & /*value*/ 1 && input.value !== /*value*/ ctx[0]) {
				set_input_value(input, /*value*/ ctx[0]);
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(icon.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(icon.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div);
			/*input_binding*/ ctx[5](null);
			destroy_component(icon);
			mounted = false;
			run_all(dispose);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$z.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$z($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots('Datepicker', slots, []);
	let picker, inputEl;
	let { value = '' } = $$props;
	let { placeholder = undefined } = $$props;

	onMount(() => {
		picker = new Datepicker(inputEl,
		{
				autohide: true,
				format: 'yyyy-mm-dd',
				buttonClass: 'button button-normal button-text',
				todayBtn: true,
				todayBtnMode: 1,
				todayHighlight: true,
				updateOnBlur: false,
				weekStart: 1,
				prevArrow: icons.chevronLeft,
				nextArrow: icons.chevronRight
			});
	});

	function oninput() {
		requestAnimationFrame(() => {
			if ((/^\d{4}-\d{2}-\d{2}$/g).test(value)) {
				picker.setDate(value);
				picker.show();
			}
		});
	}

	function onchange() {
		$$invalidate(0, value = picker.getDate('yyyy-mm-dd'));
	}

	const writable_props = ['value', 'placeholder'];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Datepicker> was created with unknown prop '${key}'`);
	});

	function input_binding($$value) {
		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
			inputEl = $$value;
			$$invalidate(2, inputEl);
		});
	}

	function input_input_handler() {
		value = this.value;
		$$invalidate(0, value);
	}

	$$self.$$set = $$props => {
		if ('value' in $$props) $$invalidate(0, value = $$props.value);
		if ('placeholder' in $$props) $$invalidate(1, placeholder = $$props.placeholder);
	};

	$$self.$capture_state = () => ({
		onMount,
		Datepicker,
		Icon,
		icons,
		picker,
		inputEl,
		value,
		placeholder,
		oninput,
		onchange
	});

	$$self.$inject_state = $$props => {
		if ('picker' in $$props) picker = $$props.picker;
		if ('inputEl' in $$props) $$invalidate(2, inputEl = $$props.inputEl);
		if ('value' in $$props) $$invalidate(0, value = $$props.value);
		if ('placeholder' in $$props) $$invalidate(1, placeholder = $$props.placeholder);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [
		value,
		placeholder,
		inputEl,
		oninput,
		onchange,
		input_binding,
		input_input_handler
	];
}

class Datepicker_1$1 extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$z, create_fragment$z, safe_not_equal, { value: 0, placeholder: 1 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Datepicker_1",
			options,
			id: create_fragment$z.name
		});
	}

	get value() {
		throw new Error("<Datepicker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set value(value) {
		throw new Error("<Datepicker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get placeholder() {
		throw new Error("<Datepicker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set placeholder(value) {
		throw new Error("<Datepicker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

function cubicOut(t) {
    const f = t - 1.0;
    return f * f * f + 1.0;
}

function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 } = {}) {
    const style = getComputedStyle(node);
    const target_opacity = +style.opacity;
    const transform = style.transform === 'none' ? '' : style.transform;
    const od = target_opacity * (1 - opacity);
    return {
        delay,
        duration,
        easing,
        css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
    };
}
function scale(node, { delay = 0, duration = 400, easing = cubicOut, start = 0, opacity = 0 } = {}) {
    const style = getComputedStyle(node);
    const target_opacity = +style.opacity;
    const transform = style.transform === 'none' ? '' : style.transform;
    const sd = 1 - start;
    const od = target_opacity * (1 - opacity);
    return {
        delay,
        duration,
        easing,
        css: (_t, u) => `
			transform: ${transform} scale(${1 - (sd * u)});
			opacity: ${target_opacity - (od * u)}
		`
    };
}

/* src/drawer/index.svelte generated by Svelte v3.46.4 */
const file$y = "src/drawer/index.svelte";

// (1:0) {#if isVisible}
function create_if_block$2(ctx) {
	let div3;
	let div0;
	let t0;
	let header;
	let h1;
	let t1;
	let t2;
	let button;
	let t3;
	let div1;
	let t4;
	let div2;
	let div3_intro;
	let div3_outro;
	let current;
	let mounted;
	let dispose;

	button = new Button({
			props: {
				round: true,
				text: true,
				icon: "close",
				cssClass: "btn-close",
				title: "Close"
			},
			$$inline: true
		});

	button.$on("click", /*close*/ ctx[1]);
	const default_slot_template = /*#slots*/ ctx[11].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[10], null);

	const block = {
		c: function create() {
			div3 = element("div");
			div0 = element("div");
			t0 = space();
			header = element("header");
			h1 = element("h1");
			t1 = text(/*title*/ ctx[0]);
			t2 = space();
			create_component(button.$$.fragment);
			t3 = space();
			div1 = element("div");
			if (default_slot) default_slot.c();
			t4 = space();
			div2 = element("div");
			attr_dev(div0, "tabindex", "0");
			attr_dev(div0, "class", "focus-trap focus-trap-top");
			add_location(div0, file$y, 7, 2, 169);
			add_location(h1, file$y, 9, 3, 311);
			attr_dev(header, "class", "drawer-header");
			add_location(header, file$y, 8, 2, 253);
			attr_dev(div1, "class", "drawer-content");
			add_location(div1, file$y, 12, 2, 433);
			attr_dev(div2, "tabindex", "0");
			attr_dev(div2, "class", "focus-trap focus-trap-bottom");
			add_location(div2, file$y, 13, 2, 483);
			attr_dev(div3, "class", "drawer");
			attr_dev(div3, "tabindex", "-1");
			add_location(div3, file$y, 1, 1, 17);
		},
		m: function mount(target, anchor) {
			insert_dev(target, div3, anchor);
			append_dev(div3, div0);
			append_dev(div3, t0);
			append_dev(div3, header);
			append_dev(header, h1);
			append_dev(h1, t1);
			append_dev(header, t2);
			mount_component(button, header, null);
			/*header_binding*/ ctx[12](header);
			append_dev(div3, t3);
			append_dev(div3, div1);

			if (default_slot) {
				default_slot.m(div1, null);
			}

			append_dev(div3, t4);
			append_dev(div3, div2);
			/*div3_binding*/ ctx[13](div3);
			current = true;

			if (!mounted) {
				dispose = [
					listen_dev(div0, "focus", /*focusLast*/ ctx[7], false, false, false),
					listen_dev(div2, "focus", /*focusFirst*/ ctx[6], false, false, false),
					action_destroyer(/*docclick*/ ctx[5].call(null, div3))
				];

				mounted = true;
			}
		},
		p: function update(ctx, dirty) {
			if (!current || dirty & /*title*/ 1) set_data_dev(t1, /*title*/ ctx[0]);

			if (default_slot) {
				if (default_slot.p && (!current || dirty & /*$$scope*/ 1024)) {
					update_slot_base(
						default_slot,
						default_slot_template,
						ctx,
						/*$$scope*/ ctx[10],
						!current
						? get_all_dirty_from_scope(/*$$scope*/ ctx[10])
						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[10], dirty, null),
						null
					);
				}
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(button.$$.fragment, local);
			transition_in(default_slot, local);

			add_render_callback(() => {
				if (div3_outro) div3_outro.end(1);
				div3_intro = create_in_transition(div3, fly, { x: 380, duration: 200 });
				div3_intro.start();
			});

			current = true;
		},
		o: function outro(local) {
			transition_out(button.$$.fragment, local);
			transition_out(default_slot, local);
			if (div3_intro) div3_intro.invalidate();
			div3_outro = create_out_transition(div3, fly, { x: 380, duration: 300 });
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div3);
			destroy_component(button);
			/*header_binding*/ ctx[12](null);
			if (default_slot) default_slot.d(detaching);
			/*div3_binding*/ ctx[13](null);
			if (detaching && div3_outro) div3_outro.end();
			mounted = false;
			run_all(dispose);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block$2.name,
		type: "if",
		source: "(1:0) {#if isVisible}",
		ctx
	});

	return block;
}

function create_fragment$y(ctx) {
	let if_block_anchor;
	let current;
	let if_block = /*isVisible*/ ctx[2] && create_if_block$2(ctx);

	const block = {
		c: function create() {
			if (if_block) if_block.c();
			if_block_anchor = empty();
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			if (if_block) if_block.m(target, anchor);
			insert_dev(target, if_block_anchor, anchor);
			current = true;
		},
		p: function update(ctx, [dirty]) {
			if (/*isVisible*/ ctx[2]) {
				if (if_block) {
					if_block.p(ctx, dirty);

					if (dirty & /*isVisible*/ 4) {
						transition_in(if_block, 1);
					}
				} else {
					if_block = create_if_block$2(ctx);
					if_block.c();
					transition_in(if_block, 1);
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			} else if (if_block) {
				group_outros();

				transition_out(if_block, 1, 1, () => {
					if_block = null;
				});

				check_outros();
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o: function outro(local) {
			transition_out(if_block);
			current = false;
		},
		d: function destroy(detaching) {
			if (if_block) if_block.d(detaching);
			if (detaching) detach_dev(if_block_anchor);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$y.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$y($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots('Drawer', slots, ['default']);
	let { title = 'Drawer' } = $$props;
	let isVisible = false;
	let el, headerEl, targetBtn;

	function docclick() {
		requestAnimationFrame(() => document.addEventListener('click', onDocClick));

		return {
			destroy: () => document.removeEventListener('click', onDocClick)
		};
	}

	function onDocClick(e) {
		if (el.contains(e.target)) return;
		if (!isVisible) return;
		e.preventDefault();
		e.stopPropagation();
		close();
	}

	function toggle(target) {
		if (target) targetBtn = target;
		isVisible ? close() : open(target);
	}

	function open(target) {
		targetBtn = target || document.activeElement;
		$$invalidate(2, isVisible = true);
		requestAnimationFrame(() => headerEl.querySelector('.btn-close').focus());
	}

	function close() {
		$$invalidate(2, isVisible = false);
		if (targetBtn) targetBtn.focus();
	}

	function focusFirst() {
		const first = getFocusableElements().shift();
		const last = getFocusableElements().pop();
		if (last) last.scrollIntoView({ block: 'end' });
		if (first) first.focus();
	}

	function focusLast() {
		const first = getFocusableElements().shift();
		const last = getFocusableElements().pop();
		if (first) first.scrollIntoView({ block: 'end' });
		if (last) last.focus();
	}

	function getFocusableElements() {
		const FOCUSABLE_SELECTOR = 'a[href],button:not([disabled]),iframe:not([disabled]),input:not([disabled]),' + 'select:not([disabled]),textarea:not([disabled]),[contentEditable]';
		return Array.from(el.querySelectorAll(FOCUSABLE_SELECTOR));
	}

	const writable_props = ['title'];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Drawer> was created with unknown prop '${key}'`);
	});

	function header_binding($$value) {
		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
			headerEl = $$value;
			$$invalidate(4, headerEl);
		});
	}

	function div3_binding($$value) {
		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
			el = $$value;
			$$invalidate(3, el);
		});
	}

	$$self.$$set = $$props => {
		if ('title' in $$props) $$invalidate(0, title = $$props.title);
		if ('$$scope' in $$props) $$invalidate(10, $$scope = $$props.$$scope);
	};

	$$self.$capture_state = () => ({
		fly,
		Button,
		title,
		isVisible,
		el,
		headerEl,
		targetBtn,
		docclick,
		onDocClick,
		toggle,
		open,
		close,
		focusFirst,
		focusLast,
		getFocusableElements
	});

	$$self.$inject_state = $$props => {
		if ('title' in $$props) $$invalidate(0, title = $$props.title);
		if ('isVisible' in $$props) $$invalidate(2, isVisible = $$props.isVisible);
		if ('el' in $$props) $$invalidate(3, el = $$props.el);
		if ('headerEl' in $$props) $$invalidate(4, headerEl = $$props.headerEl);
		if ('targetBtn' in $$props) targetBtn = $$props.targetBtn;
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [
		title,
		close,
		isVisible,
		el,
		headerEl,
		docclick,
		focusFirst,
		focusLast,
		toggle,
		open,
		$$scope,
		slots,
		header_binding,
		div3_binding
	];
}

class Drawer extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$y, create_fragment$y, safe_not_equal, { title: 0, toggle: 8, open: 9, close: 1 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Drawer",
			options,
			id: create_fragment$y.name
		});
	}

	get title() {
		return this.$$.ctx[0];
	}

	set title(title) {
		this.$$set({ title });
		flush();
	}

	get toggle() {
		return this.$$.ctx[8];
	}

	set toggle(value) {
		throw new Error("<Drawer>: Cannot set read-only property 'toggle'");
	}

	get open() {
		return this.$$.ctx[9];
	}

	set open(value) {
		throw new Error("<Drawer>: Cannot set read-only property 'open'");
	}

	get close() {
		return this.$$.ctx[1];
	}

	set close(value) {
		throw new Error("<Drawer>: Cannot set read-only property 'close'");
	}
}

/* src/input-number/index.svelte generated by Svelte v3.46.4 */

const file$x = "src/input-number/index.svelte";

function create_fragment$x(ctx) {
	let input;
	let mounted;
	let dispose;

	const block = {
		c: function create() {
			input = element("input");
			attr_dev(input, "type", "text");
			add_location(input, file$x, 0, 0, 0);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, input, anchor);
			set_input_value(input, /*value*/ ctx[0]);

			if (!mounted) {
				dispose = [
					listen_dev(input, "input", /*input_input_handler*/ ctx[3]),
					listen_dev(input, "keydown", /*onkeydown*/ ctx[1], false, false, false),
					listen_dev(input, "change", /*onchange*/ ctx[2], false, false, false)
				];

				mounted = true;
			}
		},
		p: function update(ctx, [dirty]) {
			if (dirty & /*value*/ 1 && input.value !== /*value*/ ctx[0]) {
				set_input_value(input, /*value*/ ctx[0]);
			}
		},
		i: noop,
		o: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(input);
			mounted = false;
			run_all(dispose);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$x.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

const DECIMAL_SEPARATOR$1 = '.';

function instance$x($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots('Input_number', slots, []);
	let value = '';

	const allowedKeys = [
		'0',
		'1',
		'2',
		'3',
		'4',
		'5',
		'6',
		'7',
		'8',
		'9',
		'ArrowLeft',
		'ArrowDown',
		'ArrowUp',
		'ArrowRight',
		'Backspace',
		'Delete',
		'Tab',
		'Meta'
	];

	function onkeydown(e) {
		if (allowedKeys.includes(e.key)) return;
		if (e.key === DECIMAL_SEPARATOR$1 && !value.includes(DECIMAL_SEPARATOR$1)) return;
		e.preventDefault();
	}

	function onchange() {
		const num = parseFloat(value);
		$$invalidate(0, value = isNaN(num) ? '' : num);
	}

	const writable_props = [];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Input_number> was created with unknown prop '${key}'`);
	});

	function input_input_handler() {
		value = this.value;
		$$invalidate(0, value);
	}

	$$self.$capture_state = () => ({
		value,
		DECIMAL_SEPARATOR: DECIMAL_SEPARATOR$1,
		allowedKeys,
		onkeydown,
		onchange
	});

	$$self.$inject_state = $$props => {
		if ('value' in $$props) $$invalidate(0, value = $$props.value);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [value, onkeydown, onchange, input_input_handler];
}

class Input_number extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$x, create_fragment$x, safe_not_equal, {});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Input_number",
			options,
			id: create_fragment$x.name
		});
	}
}

/* src/input-math/index.svelte generated by Svelte v3.46.4 */
const file$w = "src/input-math/index.svelte";

function create_fragment$w(ctx) {
	let div;
	let icon;
	let t;
	let input;
	let current;
	let mounted;
	let dispose;

	icon = new Icon({
			props: { name: "calculator" },
			$$inline: true
		});

	const block = {
		c: function create() {
			div = element("div");
			create_component(icon.$$.fragment);
			t = space();
			input = element("input");
			attr_dev(input, "class", "input-math");
			attr_dev(input, "type", "text");
			attr_dev(input, "title", /*title*/ ctx[1]);
			attr_dev(input, "placeholder", /*placeholder*/ ctx[2]);
			add_location(input, file$w, 2, 1, 61);
			attr_dev(div, "class", "input-math-wrapper");
			add_location(div, file$w, 0, 0, 0);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);
			mount_component(icon, div, null);
			append_dev(div, t);
			append_dev(div, input);
			set_input_value(input, /*value*/ ctx[0]);
			current = true;

			if (!mounted) {
				dispose = [
					listen_dev(input, "input", /*input_input_handler*/ ctx[6]),
					listen_dev(input, "keydown", /*onkeydown*/ ctx[3], false, false, false),
					listen_dev(input, "change", /*onchange*/ ctx[4], false, false, false),
					listen_dev(input, "blur", /*onblur*/ ctx[5], false, false, false)
				];

				mounted = true;
			}
		},
		p: function update(ctx, [dirty]) {
			if (!current || dirty & /*title*/ 2) {
				attr_dev(input, "title", /*title*/ ctx[1]);
			}

			if (!current || dirty & /*placeholder*/ 4) {
				attr_dev(input, "placeholder", /*placeholder*/ ctx[2]);
			}

			if (dirty & /*value*/ 1 && input.value !== /*value*/ ctx[0]) {
				set_input_value(input, /*value*/ ctx[0]);
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(icon.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(icon.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div);
			destroy_component(icon);
			mounted = false;
			run_all(dispose);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$w.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

const DECIMAL_SEPARATOR = '.';

function instance$w($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots('Input_math', slots, []);
	let { value = '' } = $$props;
	let { title = undefined } = $$props;
	let { placeholder = '' } = $$props;
	const dispatch = createEventDispatcher();

	const allowedKeys = [
		'0',
		'1',
		'2',
		'3',
		'4',
		'5',
		'6',
		'7',
		'8',
		'9',
		'+',
		'-',
		'/',
		'*',
		'Meta',
		'ArrowLeft',
		'ArrowDown',
		'ArrowUp',
		'ArrowRight',
		'Backspace',
		'Delete',
		'Tab',
		'Enter',
		'Ctrl'
	];

	function onkeydown(e) {
		dispatch('keydown', e);

		if (e.key === 'Enter') {
			const num = parseAmount(value);
			$$invalidate(0, value = isNaN(num) ? '' : num);
			return;
		}

		if (allowedKeys.includes(e.key)) return;
		if (e.metaKey || e.ctrlKey) return;
		if (e.key === DECIMAL_SEPARATOR && !('' + value).includes(DECIMAL_SEPARATOR)) return;
		e.preventDefault();
	}

	function onchange(e) {
		const num = parseAmount(value);
		$$invalidate(0, value = isNaN(num) ? '' : num);
		dispatch('change', e);
	}

	function onblur(e) {
		dispatch('blur', e);
	}

	const save_eval = eval; // https://rollupjs.org/guide/en/#eval2--eval

	function parseAmount(amount) {
		amount = ('' + amount).replace(/[\s,]/g, '');
		if (!(/^[+\-\\*/()\d.]+$/i).test(amount)) return 0;

		if ((/[+\-\\*/.]+/i).test(amount)) {
			try {
				amount = save_eval(amount);
			} catch(e) {
				amount = 0;
			}
		}

		let num = parseFloat(amount);
		return num === Infinity || isNaN(num) ? 0 : num;
	}

	const writable_props = ['value', 'title', 'placeholder'];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Input_math> was created with unknown prop '${key}'`);
	});

	function input_input_handler() {
		value = this.value;
		$$invalidate(0, value);
	}

	$$self.$$set = $$props => {
		if ('value' in $$props) $$invalidate(0, value = $$props.value);
		if ('title' in $$props) $$invalidate(1, title = $$props.title);
		if ('placeholder' in $$props) $$invalidate(2, placeholder = $$props.placeholder);
	};

	$$self.$capture_state = () => ({
		createEventDispatcher,
		Icon,
		value,
		title,
		placeholder,
		dispatch,
		DECIMAL_SEPARATOR,
		allowedKeys,
		onkeydown,
		onchange,
		onblur,
		save_eval,
		parseAmount
	});

	$$self.$inject_state = $$props => {
		if ('value' in $$props) $$invalidate(0, value = $$props.value);
		if ('title' in $$props) $$invalidate(1, title = $$props.title);
		if ('placeholder' in $$props) $$invalidate(2, placeholder = $$props.placeholder);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [value, title, placeholder, onkeydown, onchange, onblur, input_input_handler];
}

class Input_math$1 extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$w, create_fragment$w, safe_not_equal, { value: 0, title: 1, placeholder: 2 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Input_math",
			options,
			id: create_fragment$w.name
		});
	}

	get value() {
		throw new Error("<Input_math>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set value(value) {
		throw new Error("<Input_math>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get title() {
		throw new Error("<Input_math>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set title(value) {
		throw new Error("<Input_math>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get placeholder() {
		throw new Error("<Input_math>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set placeholder(value) {
		throw new Error("<Input_math>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* src/input-password/index.svelte generated by Svelte v3.46.4 */
const file$v = "src/input-password/index.svelte";

function create_fragment$v(ctx) {
	let div;
	let input;
	let t;
	let button;
	let current;
	let mounted;
	let dispose;

	button = new Button({
			props: {
				link: true,
				icon: /*visible*/ ctx[4] ? 'eyeOff' : 'eye'
			},
			$$inline: true
		});

	button.$on("click", /*toggle*/ ctx[6]);

	const block = {
		c: function create() {
			div = element("div");
			input = element("input");
			t = space();
			create_component(button.$$.fragment);
			attr_dev(input, "class", "input-password");
			attr_dev(input, "type", "password");
			attr_dev(input, "id", /*id*/ ctx[1]);
			attr_dev(input, "name", /*name*/ ctx[2]);
			attr_dev(input, "placeholder", /*placeholder*/ ctx[3]);
			add_location(input, file$v, 1, 1, 52);
			attr_dev(div, "class", "input-password-wrapper");
			toggle_class(div, "visible", /*visible*/ ctx[4]);
			add_location(div, file$v, 0, 0, 0);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);
			append_dev(div, input);
			/*input_binding*/ ctx[10](input);
			set_input_value(input, /*value*/ ctx[0]);
			append_dev(div, t);
			mount_component(button, div, null);
			current = true;

			if (!mounted) {
				dispose = [
					listen_dev(input, "input", /*input_input_handler*/ ctx[11]),
					listen_dev(input, "keydown", /*onkeydown*/ ctx[7], false, false, false),
					listen_dev(input, "change", /*onchange*/ ctx[8], false, false, false),
					listen_dev(input, "blur", /*onblur*/ ctx[9], false, false, false)
				];

				mounted = true;
			}
		},
		p: function update(ctx, [dirty]) {
			if (!current || dirty & /*id*/ 2) {
				attr_dev(input, "id", /*id*/ ctx[1]);
			}

			if (!current || dirty & /*name*/ 4) {
				attr_dev(input, "name", /*name*/ ctx[2]);
			}

			if (!current || dirty & /*placeholder*/ 8) {
				attr_dev(input, "placeholder", /*placeholder*/ ctx[3]);
			}

			if (dirty & /*value*/ 1 && input.value !== /*value*/ ctx[0]) {
				set_input_value(input, /*value*/ ctx[0]);
			}

			const button_changes = {};
			if (dirty & /*visible*/ 16) button_changes.icon = /*visible*/ ctx[4] ? 'eyeOff' : 'eye';
			button.$set(button_changes);

			if (dirty & /*visible*/ 16) {
				toggle_class(div, "visible", /*visible*/ ctx[4]);
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(button.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(button.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div);
			/*input_binding*/ ctx[10](null);
			destroy_component(button);
			mounted = false;
			run_all(dispose);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$v.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$v($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots('Input_password', slots, []);
	let { value = '' } = $$props;
	let { id = undefined } = $$props;
	let { name = undefined } = $$props;
	let { placeholder = undefined } = $$props;
	let visible = false, inputEl;
	const dispatch = createEventDispatcher();

	function toggle() {
		$$invalidate(4, visible = !visible);
		$$invalidate(5, inputEl.type = visible ? 'text' : 'password', inputEl);
	}

	const onkeydown = e => dispatch('keydown', e);
	const onchange = e => dispatch('change', e);
	const onblur = e => dispatch('blur', e);
	const writable_props = ['value', 'id', 'name', 'placeholder'];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Input_password> was created with unknown prop '${key}'`);
	});

	function input_binding($$value) {
		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
			inputEl = $$value;
			$$invalidate(5, inputEl);
		});
	}

	function input_input_handler() {
		value = this.value;
		$$invalidate(0, value);
	}

	$$self.$$set = $$props => {
		if ('value' in $$props) $$invalidate(0, value = $$props.value);
		if ('id' in $$props) $$invalidate(1, id = $$props.id);
		if ('name' in $$props) $$invalidate(2, name = $$props.name);
		if ('placeholder' in $$props) $$invalidate(3, placeholder = $$props.placeholder);
	};

	$$self.$capture_state = () => ({
		createEventDispatcher,
		Button,
		value,
		id,
		name,
		placeholder,
		visible,
		inputEl,
		dispatch,
		toggle,
		onkeydown,
		onchange,
		onblur
	});

	$$self.$inject_state = $$props => {
		if ('value' in $$props) $$invalidate(0, value = $$props.value);
		if ('id' in $$props) $$invalidate(1, id = $$props.id);
		if ('name' in $$props) $$invalidate(2, name = $$props.name);
		if ('placeholder' in $$props) $$invalidate(3, placeholder = $$props.placeholder);
		if ('visible' in $$props) $$invalidate(4, visible = $$props.visible);
		if ('inputEl' in $$props) $$invalidate(5, inputEl = $$props.inputEl);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [
		value,
		id,
		name,
		placeholder,
		visible,
		inputEl,
		toggle,
		onkeydown,
		onchange,
		onblur,
		input_binding,
		input_input_handler
	];
}

class Input_password$1 extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$v, create_fragment$v, safe_not_equal, { value: 0, id: 1, name: 2, placeholder: 3 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Input_password",
			options,
			id: create_fragment$v.name
		});
	}

	get value() {
		throw new Error("<Input_password>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set value(value) {
		throw new Error("<Input_password>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get id() {
		throw new Error("<Input_password>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set id(value) {
		throw new Error("<Input_password>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get name() {
		throw new Error("<Input_password>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set name(value) {
		throw new Error("<Input_password>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get placeholder() {
		throw new Error("<Input_password>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set placeholder(value) {
		throw new Error("<Input_password>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* src/panel/index.svelte generated by Svelte v3.46.4 */
const file$u = "src/panel/index.svelte";

function create_fragment$u(ctx) {
	let div2;
	let details;
	let summary;
	let t0;
	let t1;
	let div0;
	let raw_value = icons.chevronRight + "";
	let t2;
	let div1;
	let current;
	let mounted;
	let dispose;
	const default_slot_template = /*#slots*/ ctx[7].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[6], null);

	const block = {
		c: function create() {
			div2 = element("div");
			details = element("details");
			summary = element("summary");
			t0 = text(/*title*/ ctx[1]);
			t1 = space();
			div0 = element("div");
			t2 = space();
			div1 = element("div");
			if (default_slot) default_slot.c();
			attr_dev(div0, "class", "chevron");
			add_location(div0, file$u, 4, 3, 202);
			attr_dev(summary, "class", "panel-header");
			add_location(summary, file$u, 2, 2, 134);
			attr_dev(div1, "class", "panel-content");
			add_location(div1, file$u, 6, 2, 271);
			attr_dev(details, "class", "panel");
			details.open = /*open*/ ctx[0];
			add_location(details, file$u, 1, 1, 62);
			attr_dev(div2, "class", "panel-wrap");
			toggle_class(div2, "expanded", /*expanded*/ ctx[4]);
			add_location(div2, file$u, 0, 0, 0);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, div2, anchor);
			append_dev(div2, details);
			append_dev(details, summary);
			append_dev(summary, t0);
			append_dev(summary, t1);
			append_dev(summary, div0);
			div0.innerHTML = raw_value;
			/*summary_binding*/ ctx[8](summary);
			append_dev(details, t2);
			append_dev(details, div1);

			if (default_slot) {
				default_slot.m(div1, null);
			}

			/*div2_binding*/ ctx[9](div2);
			current = true;

			if (!mounted) {
				dispose = [
					listen_dev(details, "keypress", /*toggle*/ ctx[5], false, false, false),
					listen_dev(details, "click", /*toggle*/ ctx[5], false, false, false)
				];

				mounted = true;
			}
		},
		p: function update(ctx, [dirty]) {
			if (!current || dirty & /*title*/ 2) set_data_dev(t0, /*title*/ ctx[1]);

			if (default_slot) {
				if (default_slot.p && (!current || dirty & /*$$scope*/ 64)) {
					update_slot_base(
						default_slot,
						default_slot_template,
						ctx,
						/*$$scope*/ ctx[6],
						!current
						? get_all_dirty_from_scope(/*$$scope*/ ctx[6])
						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[6], dirty, null),
						null
					);
				}
			}

			if (!current || dirty & /*open*/ 1) {
				prop_dev(details, "open", /*open*/ ctx[0]);
			}

			if (dirty & /*expanded*/ 16) {
				toggle_class(div2, "expanded", /*expanded*/ ctx[4]);
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(default_slot, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(default_slot, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div2);
			/*summary_binding*/ ctx[8](null);
			if (default_slot) default_slot.d(detaching);
			/*div2_binding*/ ctx[9](null);
			mounted = false;
			run_all(dispose);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$u.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$u($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots('Panel', slots, ['default']);
	let { title = '' } = $$props;
	let { open = false } = $$props;
	let wrapEl, headerEl, expanded = open;
	const expandedProps = { height: 0 };
	const collapsedProps = { height: 0 };
	onMount(calcHeights);

	function calcHeights() {
		const wasOpen = open;
		$$invalidate(0, open = true);

		requestAnimationFrame(() => {
			const wrapCss = getComputedStyle(wrapEl);
			const borderTop = parseInt(wrapCss.borderTopWidth || 0, 10);
			const borderBottom = parseInt(wrapCss.borderTopWidth || 0, 10);
			expandedProps.height = wrapEl.getBoundingClientRect().height + 'px';
			collapsedProps.height = headerEl.offsetHeight + borderTop + borderBottom + 'px';
			$$invalidate(0, open = wasOpen);
		});
	}

	function toggle(e) {
		e.preventDefault();
		if (e.type === 'keypress' && e.key !== 'Enter') return;

		if (expanded) {
			$$invalidate(4, expanded = false);
			animate(wrapEl, expandedProps, collapsedProps).then(() => $$invalidate(0, open = expanded));
		} else {
			$$invalidate(4, expanded = true);
			$$invalidate(0, open = true);
			animate(wrapEl, collapsedProps, expandedProps);
		}
	}

	const writable_props = ['title', 'open'];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Panel> was created with unknown prop '${key}'`);
	});

	function summary_binding($$value) {
		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
			headerEl = $$value;
			$$invalidate(3, headerEl);
		});
	}

	function div2_binding($$value) {
		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
			wrapEl = $$value;
			$$invalidate(2, wrapEl);
		});
	}

	$$self.$$set = $$props => {
		if ('title' in $$props) $$invalidate(1, title = $$props.title);
		if ('open' in $$props) $$invalidate(0, open = $$props.open);
		if ('$$scope' in $$props) $$invalidate(6, $$scope = $$props.$$scope);
	};

	$$self.$capture_state = () => ({
		onMount,
		icons,
		animate,
		title,
		open,
		wrapEl,
		headerEl,
		expanded,
		expandedProps,
		collapsedProps,
		calcHeights,
		toggle
	});

	$$self.$inject_state = $$props => {
		if ('title' in $$props) $$invalidate(1, title = $$props.title);
		if ('open' in $$props) $$invalidate(0, open = $$props.open);
		if ('wrapEl' in $$props) $$invalidate(2, wrapEl = $$props.wrapEl);
		if ('headerEl' in $$props) $$invalidate(3, headerEl = $$props.headerEl);
		if ('expanded' in $$props) $$invalidate(4, expanded = $$props.expanded);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [
		open,
		title,
		wrapEl,
		headerEl,
		expanded,
		toggle,
		$$scope,
		slots,
		summary_binding,
		div2_binding
	];
}

class Panel extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$u, create_fragment$u, safe_not_equal, { title: 1, open: 0 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Panel",
			options,
			id: create_fragment$u.name
		});
	}

	get title() {
		throw new Error("<Panel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set title(value) {
		throw new Error("<Panel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get open() {
		throw new Error("<Panel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set open(value) {
		throw new Error("<Panel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* src/select/index.svelte generated by Svelte v3.46.4 */

const { Object: Object_1$2, console: console_1$2 } = globals;
const file$t = "src/select/index.svelte";

function get_each_context$2(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[9] = list[i];
	return child_ctx;
}

function get_each_context_1(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[12] = list[i];
	return child_ctx;
}

// (16:3) {:else}
function create_else_block(ctx) {
	let option;
	let t_value = /*group*/ ctx[9].name + "";
	let t;
	let option_value_value;

	const block = {
		c: function create() {
			option = element("option");
			t = text(t_value);
			option.__value = option_value_value = /*group*/ ctx[9].id;
			option.value = option.__value;
			add_location(option, file$t, 16, 4, 392);
		},
		m: function mount(target, anchor) {
			insert_dev(target, option, anchor);
			append_dev(option, t);
		},
		p: function update(ctx, dirty) {
			if (dirty & /*groups*/ 16 && t_value !== (t_value = /*group*/ ctx[9].name + "")) set_data_dev(t, t_value);

			if (dirty & /*groups*/ 16 && option_value_value !== (option_value_value = /*group*/ ctx[9].id)) {
				prop_dev(option, "__value", option_value_value);
				option.value = option.__value;
			}
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(option);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_else_block.name,
		type: "else",
		source: "(16:3) {:else}",
		ctx
	});

	return block;
}

// (10:3) {#if group.items}
function create_if_block$1(ctx) {
	let optgroup;
	let optgroup_label_value;
	let each_value_1 = /*group*/ ctx[9].items;
	validate_each_argument(each_value_1);
	let each_blocks = [];

	for (let i = 0; i < each_value_1.length; i += 1) {
		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
	}

	const block = {
		c: function create() {
			optgroup = element("optgroup");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			attr_dev(optgroup, "label", optgroup_label_value = /*group*/ ctx[9].name);
			add_location(optgroup, file$t, 10, 4, 230);
		},
		m: function mount(target, anchor) {
			insert_dev(target, optgroup, anchor);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(optgroup, null);
			}
		},
		p: function update(ctx, dirty) {
			if (dirty & /*groups*/ 16) {
				each_value_1 = /*group*/ ctx[9].items;
				validate_each_argument(each_value_1);
				let i;

				for (i = 0; i < each_value_1.length; i += 1) {
					const child_ctx = get_each_context_1(ctx, each_value_1, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block_1(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(optgroup, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value_1.length;
			}

			if (dirty & /*groups*/ 16 && optgroup_label_value !== (optgroup_label_value = /*group*/ ctx[9].name)) {
				attr_dev(optgroup, "label", optgroup_label_value);
			}
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(optgroup);
			destroy_each(each_blocks, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block$1.name,
		type: "if",
		source: "(10:3) {#if group.items}",
		ctx
	});

	return block;
}

// (12:5) {#each group.items as item}
function create_each_block_1(ctx) {
	let option;
	let t_value = /*item*/ ctx[12].name + "";
	let t;
	let option_value_value;

	const block = {
		c: function create() {
			option = element("option");
			t = text(t_value);
			option.__value = option_value_value = /*item*/ ctx[12].id;
			option.value = option.__value;
			add_location(option, file$t, 12, 6, 301);
		},
		m: function mount(target, anchor) {
			insert_dev(target, option, anchor);
			append_dev(option, t);
		},
		p: function update(ctx, dirty) {
			if (dirty & /*groups*/ 16 && t_value !== (t_value = /*item*/ ctx[12].name + "")) set_data_dev(t, t_value);

			if (dirty & /*groups*/ 16 && option_value_value !== (option_value_value = /*item*/ ctx[12].id)) {
				prop_dev(option, "__value", option_value_value);
				option.value = option.__value;
			}
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(option);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_each_block_1.name,
		type: "each",
		source: "(12:5) {#each group.items as item}",
		ctx
	});

	return block;
}

// (9:2) {#each groups as group}
function create_each_block$2(ctx) {
	let if_block_anchor;

	function select_block_type(ctx, dirty) {
		if (/*group*/ ctx[9].items) return create_if_block$1;
		return create_else_block;
	}

	let current_block_type = select_block_type(ctx);
	let if_block = current_block_type(ctx);

	const block = {
		c: function create() {
			if_block.c();
			if_block_anchor = empty();
		},
		m: function mount(target, anchor) {
			if_block.m(target, anchor);
			insert_dev(target, if_block_anchor, anchor);
		},
		p: function update(ctx, dirty) {
			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
				if_block.p(ctx, dirty);
			} else {
				if_block.d(1);
				if_block = current_block_type(ctx);

				if (if_block) {
					if_block.c();
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			}
		},
		d: function destroy(detaching) {
			if_block.d(detaching);
			if (detaching) detach_dev(if_block_anchor);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_each_block$2.name,
		type: "each",
		source: "(9:2) {#each groups as group}",
		ctx
	});

	return block;
}

function create_fragment$t(ctx) {
	let div;
	let select;
	let option;
	let mounted;
	let dispose;
	let each_value = /*groups*/ ctx[4];
	validate_each_argument(each_value);
	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
	}

	const block = {
		c: function create() {
			div = element("div");
			select = element("select");
			option = element("option");
			option.textContent = "None";

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			option.__value = "";
			option.value = option.__value;
			add_location(option, file$t, 7, 2, 148);
			select.disabled = /*disabled*/ ctx[2];
			attr_dev(select, "name", /*name*/ ctx[1]);
			if (/*value*/ ctx[0] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[7].call(select));
			add_location(select, file$t, 1, 1, 42);
			attr_dev(div, "class", "select-wrap");
			toggle_class(div, "disabled", /*disabled*/ ctx[2]);
			add_location(div, file$t, 0, 0, 0);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);
			append_dev(div, select);
			append_dev(select, option);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(select, null);
			}

			select_option(select, /*value*/ ctx[0]);
			/*select_binding*/ ctx[8](select);

			if (!mounted) {
				dispose = [
					listen_dev(select, "change", /*select_change_handler*/ ctx[7]),
					listen_dev(select, "change", /*onChange*/ ctx[5], false, false, false)
				];

				mounted = true;
			}
		},
		p: function update(ctx, [dirty]) {
			if (dirty & /*groups*/ 16) {
				each_value = /*groups*/ ctx[4];
				validate_each_argument(each_value);
				let i;

				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context$2(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block$2(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(select, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value.length;
			}

			if (dirty & /*disabled*/ 4) {
				prop_dev(select, "disabled", /*disabled*/ ctx[2]);
			}

			if (dirty & /*name*/ 2) {
				attr_dev(select, "name", /*name*/ ctx[1]);
			}

			if (dirty & /*value*/ 1) {
				select_option(select, /*value*/ ctx[0]);
			}

			if (dirty & /*disabled*/ 4) {
				toggle_class(div, "disabled", /*disabled*/ ctx[2]);
			}
		},
		i: noop,
		o: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(div);
			destroy_each(each_blocks, detaching);
			/*select_binding*/ ctx[8](null);
			mounted = false;
			run_all(dispose);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$t.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$t($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots('Select', slots, []);
	let { value = undefined } = $$props;
	let { name = undefined } = $$props;
	let { items = [] } = $$props;
	let { disabled = undefined } = $$props;
	let el, groups = [];

	function onChange() {
		console.log(value);
	}

	const writable_props = ['value', 'name', 'items', 'disabled'];

	Object_1$2.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$2.warn(`<Select> was created with unknown prop '${key}'`);
	});

	function select_change_handler() {
		value = select_value(this);
		$$invalidate(0, value);
	}

	function select_binding($$value) {
		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
			el = $$value;
			$$invalidate(3, el);
			($$invalidate(4, groups), $$invalidate(6, items));
		});
	}

	$$self.$$set = $$props => {
		if ('value' in $$props) $$invalidate(0, value = $$props.value);
		if ('name' in $$props) $$invalidate(1, name = $$props.name);
		if ('items' in $$props) $$invalidate(6, items = $$props.items);
		if ('disabled' in $$props) $$invalidate(2, disabled = $$props.disabled);
	};

	$$self.$capture_state = () => ({
		value,
		name,
		items,
		disabled,
		el,
		groups,
		onChange
	});

	$$self.$inject_state = $$props => {
		if ('value' in $$props) $$invalidate(0, value = $$props.value);
		if ('name' in $$props) $$invalidate(1, name = $$props.name);
		if ('items' in $$props) $$invalidate(6, items = $$props.items);
		if ('disabled' in $$props) $$invalidate(2, disabled = $$props.disabled);
		if ('el' in $$props) $$invalidate(3, el = $$props.el);
		if ('groups' in $$props) $$invalidate(4, groups = $$props.groups);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*items*/ 64) {
			{
				let nogroup = [];
				const _groups = {};

				items.forEach(item => {
					if (!item.group) return nogroup.push(item);
					_groups[item.group] = _groups[item.group] || { name: item.group, items: [] };
					_groups[item.group].items.push(item);
				});

				$$invalidate(4, groups = [...nogroup, ...Object.values(_groups)]);
			}
		}
	};

	return [
		value,
		name,
		disabled,
		el,
		groups,
		onChange,
		items,
		select_change_handler,
		select_binding
	];
}

class Select extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$t, create_fragment$t, safe_not_equal, { value: 0, name: 1, items: 6, disabled: 2 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Select",
			options,
			id: create_fragment$t.name
		});
	}

	get value() {
		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set value(value) {
		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get name() {
		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set name(value) {
		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get items() {
		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set items(value) {
		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get disabled() {
		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set disabled(value) {
		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* src/table/index.svelte generated by Svelte v3.46.4 */

const file$s = "src/table/index.svelte";

function create_fragment$s(ctx) {
	let div;
	let table;
	let div_class_value;
	let current;
	const default_slot_template = /*#slots*/ ctx[2].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

	const block = {
		c: function create() {
			div = element("div");
			table = element("table");
			if (default_slot) default_slot.c();
			attr_dev(table, "class", "table");
			add_location(table, file$s, 1, 1, 40);
			attr_dev(div, "class", div_class_value = "table-wrapper " + /*cssClass*/ ctx[0]);
			add_location(div, file$s, 0, 0, 0);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);
			append_dev(div, table);

			if (default_slot) {
				default_slot.m(table, null);
			}

			current = true;
		},
		p: function update(ctx, [dirty]) {
			if (default_slot) {
				if (default_slot.p && (!current || dirty & /*$$scope*/ 2)) {
					update_slot_base(
						default_slot,
						default_slot_template,
						ctx,
						/*$$scope*/ ctx[1],
						!current
						? get_all_dirty_from_scope(/*$$scope*/ ctx[1])
						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[1], dirty, null),
						null
					);
				}
			}

			if (!current || dirty & /*cssClass*/ 1 && div_class_value !== (div_class_value = "table-wrapper " + /*cssClass*/ ctx[0])) {
				attr_dev(div, "class", div_class_value);
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(default_slot, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(default_slot, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div);
			if (default_slot) default_slot.d(detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$s.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$s($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots('Table', slots, ['default']);
	let { cssClass = '' } = $$props;
	const writable_props = ['cssClass'];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Table> was created with unknown prop '${key}'`);
	});

	$$self.$$set = $$props => {
		if ('cssClass' in $$props) $$invalidate(0, cssClass = $$props.cssClass);
		if ('$$scope' in $$props) $$invalidate(1, $$scope = $$props.$$scope);
	};

	$$self.$capture_state = () => ({ cssClass });

	$$self.$inject_state = $$props => {
		if ('cssClass' in $$props) $$invalidate(0, cssClass = $$props.cssClass);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [cssClass, $$scope, slots];
}

class Table extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$s, create_fragment$s, safe_not_equal, { cssClass: 0 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Table",
			options,
			id: create_fragment$s.name
		});
	}

	get cssClass() {
		throw new Error("<Table>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set cssClass(value) {
		throw new Error("<Table>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* src/textarea/index.svelte generated by Svelte v3.46.4 */

const file$r = "src/textarea/index.svelte";

function create_fragment$r(ctx) {
	let div;
	let textarea;
	let div_data_value_value;
	let mounted;
	let dispose;

	const block = {
		c: function create() {
			div = element("div");
			textarea = element("textarea");
			attr_dev(textarea, "class", "textarea-input");
			textarea.disabled = /*disabled*/ ctx[1];
			attr_dev(textarea, "placeholder", /*placeholder*/ ctx[2]);
			add_location(textarea, file$r, 1, 1, 83);
			attr_dev(div, "class", "textarea");
			attr_dev(div, "data-value", div_data_value_value = /*autogrow*/ ctx[3] ? /*value*/ ctx[0] : undefined);
			toggle_class(div, "autogrow", /*autogrow*/ ctx[3]);
			add_location(div, file$r, 0, 0, 0);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);
			append_dev(div, textarea);
			set_input_value(textarea, /*value*/ ctx[0]);

			if (!mounted) {
				dispose = listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[4]);
				mounted = true;
			}
		},
		p: function update(ctx, [dirty]) {
			if (dirty & /*disabled*/ 2) {
				prop_dev(textarea, "disabled", /*disabled*/ ctx[1]);
			}

			if (dirty & /*placeholder*/ 4) {
				attr_dev(textarea, "placeholder", /*placeholder*/ ctx[2]);
			}

			if (dirty & /*value*/ 1) {
				set_input_value(textarea, /*value*/ ctx[0]);
			}

			if (dirty & /*autogrow, value*/ 9 && div_data_value_value !== (div_data_value_value = /*autogrow*/ ctx[3] ? /*value*/ ctx[0] : undefined)) {
				attr_dev(div, "data-value", div_data_value_value);
			}

			if (dirty & /*autogrow*/ 8) {
				toggle_class(div, "autogrow", /*autogrow*/ ctx[3]);
			}
		},
		i: noop,
		o: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(div);
			mounted = false;
			dispose();
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$r.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$r($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots('Textarea', slots, []);
	let { disabled = undefined } = $$props;
	let { placeholder = undefined } = $$props;
	let { value = '' } = $$props;
	let { autogrow = false } = $$props;
	const writable_props = ['disabled', 'placeholder', 'value', 'autogrow'];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Textarea> was created with unknown prop '${key}'`);
	});

	function textarea_input_handler() {
		value = this.value;
		$$invalidate(0, value);
	}

	$$self.$$set = $$props => {
		if ('disabled' in $$props) $$invalidate(1, disabled = $$props.disabled);
		if ('placeholder' in $$props) $$invalidate(2, placeholder = $$props.placeholder);
		if ('value' in $$props) $$invalidate(0, value = $$props.value);
		if ('autogrow' in $$props) $$invalidate(3, autogrow = $$props.autogrow);
	};

	$$self.$capture_state = () => ({ disabled, placeholder, value, autogrow });

	$$self.$inject_state = $$props => {
		if ('disabled' in $$props) $$invalidate(1, disabled = $$props.disabled);
		if ('placeholder' in $$props) $$invalidate(2, placeholder = $$props.placeholder);
		if ('value' in $$props) $$invalidate(0, value = $$props.value);
		if ('autogrow' in $$props) $$invalidate(3, autogrow = $$props.autogrow);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [value, disabled, placeholder, autogrow, textarea_input_handler];
}

class Textarea extends SvelteComponentDev {
	constructor(options) {
		super(options);

		init(this, options, instance$r, create_fragment$r, safe_not_equal, {
			disabled: 1,
			placeholder: 2,
			value: 0,
			autogrow: 3
		});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Textarea",
			options,
			id: create_fragment$r.name
		});
	}

	get disabled() {
		throw new Error("<Textarea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set disabled(value) {
		throw new Error("<Textarea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get placeholder() {
		throw new Error("<Textarea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set placeholder(value) {
		throw new Error("<Textarea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get value() {
		throw new Error("<Textarea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set value(value) {
		throw new Error("<Textarea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get autogrow() {
		throw new Error("<Textarea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set autogrow(value) {
		throw new Error("<Textarea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* src/text-fit/index.svelte generated by Svelte v3.46.4 */
const file$q = "src/text-fit/index.svelte";

function create_fragment$q(ctx) {
	let span;
	let current;
	const default_slot_template = /*#slots*/ ctx[2].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

	const block = {
		c: function create() {
			span = element("span");
			if (default_slot) default_slot.c();
			attr_dev(span, "class", "text");
			add_location(span, file$q, 0, 0, 0);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, span, anchor);

			if (default_slot) {
				default_slot.m(span, null);
			}

			/*span_binding*/ ctx[3](span);
			current = true;
		},
		p: function update(ctx, [dirty]) {
			if (default_slot) {
				if (default_slot.p && (!current || dirty & /*$$scope*/ 2)) {
					update_slot_base(
						default_slot,
						default_slot_template,
						ctx,
						/*$$scope*/ ctx[1],
						!current
						? get_all_dirty_from_scope(/*$$scope*/ ctx[1])
						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[1], dirty, null),
						null
					);
				}
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(default_slot, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(default_slot, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(span);
			if (default_slot) default_slot.d(detaching);
			/*span_binding*/ ctx[3](null);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$q.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

const MARGIN = 15;
const DEBOUNCE_RESIZE = 10;

function instance$q($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots('Text_fit', slots, ['default']);
	let el, parent, resizeObserver, timer, mutationObserver;

	function resize() {
		$$invalidate(0, el.style.transform = '', el);
		const textW = el.getBoundingClientRect().width;
		const parentW = parent.getBoundingClientRect().width;
		const val = (parentW - MARGIN) / textW;
		$$invalidate(0, el.style.transform = `matrix(${val}, 0, 0, ${val}, 0, 0)`, el);
	}

	onMount(() => {
		parent = el.parentNode;

		resizeObserver = new ResizeObserver(() => {
				if (timer) clearTimeout(timer);
				timer = setTimeout(resize, DEBOUNCE_RESIZE);
			});

		resizeObserver.observe(parent);
		mutationObserver = new MutationObserver(resize);
		mutationObserver.observe(el.firstChild, { characterData: true });
		resize();
	});

	onDestroy(() => {
		resizeObserver.unobserve(parent);
		mutationObserver.disconnect();
	});

	const writable_props = [];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Text_fit> was created with unknown prop '${key}'`);
	});

	function span_binding($$value) {
		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
			el = $$value;
			$$invalidate(0, el);
		});
	}

	$$self.$$set = $$props => {
		if ('$$scope' in $$props) $$invalidate(1, $$scope = $$props.$$scope);
	};

	$$self.$capture_state = () => ({
		onMount,
		onDestroy,
		MARGIN,
		DEBOUNCE_RESIZE,
		el,
		parent,
		resizeObserver,
		timer,
		mutationObserver,
		resize
	});

	$$self.$inject_state = $$props => {
		if ('el' in $$props) $$invalidate(0, el = $$props.el);
		if ('parent' in $$props) parent = $$props.parent;
		if ('resizeObserver' in $$props) resizeObserver = $$props.resizeObserver;
		if ('timer' in $$props) timer = $$props.timer;
		if ('mutationObserver' in $$props) mutationObserver = $$props.mutationObserver;
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [el, $$scope, slots, span_binding];
}

class Text_fit$1 extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$q, create_fragment$q, safe_not_equal, {});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Text_fit",
			options,
			id: create_fragment$q.name
		});
	}
}

const subscriber_queue = [];
/**
 * Create a `Writable` store that allows both updating and reading by subscription.
 * @param {*=}value initial value
 * @param {StartStopNotifier=}start start and stop notifications for subscriptions
 */
function writable(value, start = noop) {
    let stop;
    const subscribers = new Set();
    function set(new_value) {
        if (safe_not_equal(value, new_value)) {
            value = new_value;
            if (stop) { // store is ready
                const run_queue = !subscriber_queue.length;
                for (const subscriber of subscribers) {
                    subscriber[1]();
                    subscriber_queue.push(subscriber, value);
                }
                if (run_queue) {
                    for (let i = 0; i < subscriber_queue.length; i += 2) {
                        subscriber_queue[i][0](subscriber_queue[i + 1]);
                    }
                    subscriber_queue.length = 0;
                }
            }
        }
    }
    function update(fn) {
        set(fn(value));
    }
    function subscribe(run, invalidate = noop) {
        const subscriber = [run, invalidate];
        subscribers.add(subscriber);
        if (subscribers.size === 1) {
            stop = start(set) || noop;
        }
        run(value);
        return () => {
            subscribers.delete(subscriber);
            if (subscribers.size === 0) {
                stop();
                stop = null;
            }
        };
    }
    return { set, update, subscribe };
}

/* src/toaster/index.svelte generated by Svelte v3.46.4 */

const { Object: Object_1$1 } = globals;
const file$p = "src/toaster/index.svelte";

function get_each_context$1(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[7] = list[i];
	return child_ctx;
}

// (5:3) {#if toast.btn}
function create_if_block_1(ctx) {
	let button;
	let t_value = /*toast*/ ctx[7].btn + "";
	let t;
	let mounted;
	let dispose;

	function click_handler() {
		return /*click_handler*/ ctx[3](/*toast*/ ctx[7]);
	}

	const block = {
		c: function create() {
			button = element("button");
			t = text(t_value);
			add_location(button, file$p, 5, 4, 227);
		},
		m: function mount(target, anchor) {
			insert_dev(target, button, anchor);
			append_dev(button, t);

			if (!mounted) {
				dispose = listen_dev(button, "click", prevent_default(click_handler), false, true, false);
				mounted = true;
			}
		},
		p: function update(new_ctx, dirty) {
			ctx = new_ctx;
			if (dirty & /*toasts*/ 2 && t_value !== (t_value = /*toast*/ ctx[7].btn + "")) set_data_dev(t, t_value);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(button);
			mounted = false;
			dispose();
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_1.name,
		type: "if",
		source: "(5:3) {#if toast.btn}",
		ctx
	});

	return block;
}

// (9:3) {#if toast.showProgress}
function create_if_block(ctx) {
	let div1;
	let div0;

	const block = {
		c: function create() {
			div1 = element("div");
			div0 = element("div");
			attr_dev(div0, "class", "toast-progress");
			set_style(div0, "width", /*progress*/ ctx[2][/*toast*/ ctx[7].id] + "%");
			add_location(div0, file$p, 10, 5, 490);
			attr_dev(div1, "class", "toast-progressbar");
			add_location(div1, file$p, 9, 4, 453);
		},
		m: function mount(target, anchor) {
			insert_dev(target, div1, anchor);
			append_dev(div1, div0);
		},
		p: function update(ctx, dirty) {
			if (dirty & /*progress, toasts*/ 6) {
				set_style(div0, "width", /*progress*/ ctx[2][/*toast*/ ctx[7].id] + "%");
			}
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div1);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block.name,
		type: "if",
		source: "(9:3) {#if toast.showProgress}",
		ctx
	});

	return block;
}

// (2:1) {#each toasts as toast (toast.id)}
function create_each_block$1(key_1, ctx) {
	let div1;
	let div0;
	let raw_value = /*toast*/ ctx[7].msg + "";
	let t0;
	let t1;
	let button;
	let t3;
	let t4;
	let div1_class_value;
	let div1_transition;
	let current;
	let mounted;
	let dispose;
	let if_block0 = /*toast*/ ctx[7].btn && create_if_block_1(ctx);

	function click_handler_1() {
		return /*click_handler_1*/ ctx[4](/*toast*/ ctx[7]);
	}

	let if_block1 = /*toast*/ ctx[7].showProgress && create_if_block(ctx);

	const block = {
		key: key_1,
		first: null,
		c: function create() {
			div1 = element("div");
			div0 = element("div");
			t0 = space();
			if (if_block0) if_block0.c();
			t1 = space();
			button = element("button");
			button.textContent = "×";
			t3 = space();
			if (if_block1) if_block1.c();
			t4 = space();
			attr_dev(div0, "class", "toast-msg");
			add_location(div0, file$p, 3, 3, 157);
			attr_dev(button, "class", "toast-close");
			add_location(button, file$p, 7, 3, 321);
			attr_dev(div1, "class", div1_class_value = "toast toast-" + /*toast*/ ctx[7].type);
			add_location(div1, file$p, 2, 2, 79);
			this.first = div1;
		},
		m: function mount(target, anchor) {
			insert_dev(target, div1, anchor);
			append_dev(div1, div0);
			div0.innerHTML = raw_value;
			append_dev(div1, t0);
			if (if_block0) if_block0.m(div1, null);
			append_dev(div1, t1);
			append_dev(div1, button);
			append_dev(div1, t3);
			if (if_block1) if_block1.m(div1, null);
			append_dev(div1, t4);
			current = true;

			if (!mounted) {
				dispose = listen_dev(button, "click", stop_propagation(click_handler_1), false, false, true);
				mounted = true;
			}
		},
		p: function update(new_ctx, dirty) {
			ctx = new_ctx;
			if ((!current || dirty & /*toasts*/ 2) && raw_value !== (raw_value = /*toast*/ ctx[7].msg + "")) div0.innerHTML = raw_value;
			if (/*toast*/ ctx[7].btn) {
				if (if_block0) {
					if_block0.p(ctx, dirty);
				} else {
					if_block0 = create_if_block_1(ctx);
					if_block0.c();
					if_block0.m(div1, t1);
				}
			} else if (if_block0) {
				if_block0.d(1);
				if_block0 = null;
			}

			if (/*toast*/ ctx[7].showProgress) {
				if (if_block1) {
					if_block1.p(ctx, dirty);
				} else {
					if_block1 = create_if_block(ctx);
					if_block1.c();
					if_block1.m(div1, t4);
				}
			} else if (if_block1) {
				if_block1.d(1);
				if_block1 = null;
			}

			if (!current || dirty & /*toasts*/ 2 && div1_class_value !== (div1_class_value = "toast toast-" + /*toast*/ ctx[7].type)) {
				attr_dev(div1, "class", div1_class_value);
			}
		},
		i: function intro(local) {
			if (current) return;

			add_render_callback(() => {
				if (!div1_transition) div1_transition = create_bidirectional_transition(div1, scale, { start: 0.5 }, true);
				div1_transition.run(1);
			});

			current = true;
		},
		o: function outro(local) {
			if (!div1_transition) div1_transition = create_bidirectional_transition(div1, scale, { start: 0.5 }, false);
			div1_transition.run(0);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div1);
			if (if_block0) if_block0.d();
			if (if_block1) if_block1.d();
			if (detaching && div1_transition) div1_transition.end();
			mounted = false;
			dispose();
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_each_block$1.name,
		type: "each",
		source: "(2:1) {#each toasts as toast (toast.id)}",
		ctx
	});

	return block;
}

function create_fragment$p(ctx) {
	let div;
	let each_blocks = [];
	let each_1_lookup = new Map();
	let div_class_value;
	let current;
	let each_value = /*toasts*/ ctx[1];
	validate_each_argument(each_value);
	const get_key = ctx => /*toast*/ ctx[7].id;
	validate_each_keys(ctx, each_value, get_each_context$1, get_key);

	for (let i = 0; i < each_value.length; i += 1) {
		let child_ctx = get_each_context$1(ctx, each_value, i);
		let key = get_key(child_ctx);
		each_1_lookup.set(key, each_blocks[i] = create_each_block$1(key, child_ctx));
	}

	const block = {
		c: function create() {
			div = element("div");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			attr_dev(div, "class", div_class_value = "toaster toaster-" + /*position*/ ctx[0]);
			add_location(div, file$p, 0, 0, 0);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(div, null);
			}

			current = true;
		},
		p: function update(ctx, [dirty]) {
			if (dirty & /*toasts, progress, hideToast*/ 6) {
				each_value = /*toasts*/ ctx[1];
				validate_each_argument(each_value);
				group_outros();
				validate_each_keys(ctx, each_value, get_each_context$1, get_key);
				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div, outro_and_destroy_block, create_each_block$1, null, get_each_context$1);
				check_outros();
			}

			if (!current || dirty & /*position*/ 1 && div_class_value !== (div_class_value = "toaster toaster-" + /*position*/ ctx[0])) {
				attr_dev(div, "class", div_class_value);
			}
		},
		i: function intro(local) {
			if (current) return;

			for (let i = 0; i < each_value.length; i += 1) {
				transition_in(each_blocks[i]);
			}

			current = true;
		},
		o: function outro(local) {
			for (let i = 0; i < each_blocks.length; i += 1) {
				transition_out(each_blocks[i]);
			}

			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].d();
			}
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$p.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

const _toasts = writable({});

function showToast(
	msg,
type = 'info',
timeout = 5000,
btn,
cb = () => {
		
	}
) {
	const id = guid();
	let showProgress = false;

	if (typeof timeout === 'number') {
		setTimeout(() => hideToast(id), timeout);
		showProgress = true;
		timeout = timeout - 500;
	}

	_toasts.update(list => {
		list[id] = {
			type,
			msg,
			id,
			timeout,
			cb,
			showProgress,
			btn
		};

		return list;
	});

	return id;
}

function hideToast(id) {
	_toasts.update(list => {
		delete list[id];
		return list;
	});
}

function guid() {
	return ('xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx').replace(/[xy]/g, c => {
		const r = Math.random() * 16 | 0;
		const v = c == 'x' ? r : r & 0x3 | 0x8;
		return v.toString(16);
	});
}

function instance$p($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots('Toaster', slots, []);
	let { position = 'top' } = $$props;
	let toasts = [], timers = {}, progress = {};

	_toasts.subscribe(val => {
		$$invalidate(1, toasts = Object.values(val));

		toasts.forEach(t => {
			if (!timers[t.id]) createTimer(t.id, t.timeout);
		});
	});

	function createTimer(id, timeout) {
		$$invalidate(2, progress[id] = 0, progress);

		timers[id] = setInterval(
			() => {
				$$invalidate(2, progress[id] += 1, progress);
				if (progress[id] >= 100) clearInterval(timers[id]);
			},
			timeout / 100
		);
	}

	const writable_props = ['position'];

	Object_1$1.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Toaster> was created with unknown prop '${key}'`);
	});

	const click_handler = toast => toast.cb(toast.id);
	const click_handler_1 = toast => hideToast(toast.id);

	$$self.$$set = $$props => {
		if ('position' in $$props) $$invalidate(0, position = $$props.position);
	};

	$$self.$capture_state = () => ({
		writable,
		scale,
		_toasts,
		showToast,
		hideToast,
		guid,
		position,
		toasts,
		timers,
		progress,
		createTimer
	});

	$$self.$inject_state = $$props => {
		if ('position' in $$props) $$invalidate(0, position = $$props.position);
		if ('toasts' in $$props) $$invalidate(1, toasts = $$props.toasts);
		if ('timers' in $$props) timers = $$props.timers;
		if ('progress' in $$props) $$invalidate(2, progress = $$props.progress);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [position, toasts, progress, click_handler, click_handler_1];
}

class Toaster extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$p, create_fragment$p, safe_not_equal, { position: 0 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Toaster",
			options,
			id: create_fragment$p.name
		});
	}

	get position() {
		throw new Error("<Toaster>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set position(value) {
		throw new Error("<Toaster>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* src/toggle/index.svelte generated by Svelte v3.46.4 */
const file$o = "src/toggle/index.svelte";

function create_fragment$o(ctx) {
	let div1;
	let label_1;
	let div0;
	let t;
	let input;
	let div1_tabindex_value;
	let mounted;
	let dispose;

	const block = {
		c: function create() {
			div1 = element("div");
			label_1 = element("label");
			div0 = element("div");
			t = space();
			input = element("input");
			attr_dev(div0, "class", "toggle-handle");
			add_location(div0, file$o, 8, 2, 306);
			attr_dev(input, "id", /*id*/ ctx[1]);
			attr_dev(input, "type", "checkbox");
			attr_dev(input, "class", "toggle-input");
			add_location(input, file$o, 9, 2, 363);
			attr_dev(label_1, "class", "toggle-label");
			add_location(label_1, file$o, 7, 1, 255);
			attr_dev(div1, "class", "toggle");
			attr_dev(div1, "disabled", /*disabled*/ ctx[2]);
			attr_dev(div1, "tabindex", div1_tabindex_value = /*disabled*/ ctx[2] ? undefined : 0);
			toggle_class(div1, "checked", /*value*/ ctx[0]);
			add_location(div1, file$o, 0, 0, 0);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, div1, anchor);
			append_dev(div1, label_1);
			append_dev(label_1, div0);
			/*div0_binding*/ ctx[10](div0);
			append_dev(label_1, t);
			append_dev(label_1, input);
			input.checked = /*value*/ ctx[0];
			/*label_1_binding*/ ctx[12](label_1);
			/*div1_binding*/ ctx[13](div1);

			if (!mounted) {
				dispose = [
					listen_dev(input, "change", /*input_change_handler*/ ctx[11]),
					listen_dev(div1, "keydown", /*onKey*/ ctx[6], false, false, false),
					listen_dev(div1, "touchstart", /*dragStart*/ ctx[7], false, false, false),
					listen_dev(div1, "mousedown", /*dragStart*/ ctx[7], false, false, false),
					listen_dev(div1, "contextmenu", prevent_default(/*contextmenu_handler*/ ctx[8]), false, true, false),
					listen_dev(div1, "click", prevent_default(/*click_handler*/ ctx[9]), false, true, false)
				];

				mounted = true;
			}
		},
		p: function update(ctx, [dirty]) {
			if (dirty & /*id*/ 2) {
				attr_dev(input, "id", /*id*/ ctx[1]);
			}

			if (dirty & /*value*/ 1) {
				input.checked = /*value*/ ctx[0];
			}

			if (dirty & /*disabled*/ 4) {
				attr_dev(div1, "disabled", /*disabled*/ ctx[2]);
			}

			if (dirty & /*disabled*/ 4 && div1_tabindex_value !== (div1_tabindex_value = /*disabled*/ ctx[2] ? undefined : 0)) {
				attr_dev(div1, "tabindex", div1_tabindex_value);
			}

			if (dirty & /*value*/ 1) {
				toggle_class(div1, "checked", /*value*/ ctx[0]);
			}
		},
		i: noop,
		o: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(div1);
			/*div0_binding*/ ctx[10](null);
			/*label_1_binding*/ ctx[12](null);
			/*div1_binding*/ ctx[13](null);
			mounted = false;
			run_all(dispose);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$o.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$o($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots('Toggle', slots, []);
	const dispatch = createEventDispatcher();
	const isTouchDevice = 'ontouchstart' in document.documentElement;

	const getMouseX = e => e.type.includes('touch')
	? e.touches[0].clientX
	: e.clientX;

	const outerWidth = el => el.getBoundingClientRect().width;

	const innerWidth = el => {
		const css = getComputedStyle(el);
		const borders = parseFloat(css.borderLeftWidth) + parseFloat(css.borderRightWidth);
		const padding = parseFloat(css.paddingLeft) + parseFloat(css.paddingRight);
		return el.getBoundingClientRect().width - borders - padding;
	};

	let { id = undefined } = $$props;
	let { value = false } = $$props;
	let { disabled = undefined } = $$props;
	let el, label, handle, startX, maxX, minX, currentX = 0;
	let isClick = false, isDragging = false;

	onMount(() => {
		maxX = innerWidth(el);
		minX = outerWidth(handle);
		setValue(undefined, true);
	});

	function setValue(v, skipEvent = false) {
		if (typeof v !== 'undefined') $$invalidate(0, value = v);
		startX = currentX = value ? maxX : minX;
		$$invalidate(4, label.style.width = `${currentX}px`, label);
		if (!skipEvent) dispatch('change', value);
	}

	function onKey(e) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			setValue(!value);
		}
	}

	function dragStart(e) {
		// prevent double call
		if (isTouchDevice && e.type !== 'touchstart') return;

		if (e.type === 'touchstart') {
			document.addEventListener('touchend', dragEnd);
			document.addEventListener('touchmove', drag, { passive: false });
		} else {
			document.addEventListener('mouseup', dragEnd);
			document.addEventListener('mousemove', drag, { passive: false });
		}

		$$invalidate(4, label.style.transition = 'none', label);
		startX = getMouseX(e) - currentX;
		isDragging = true;
		isClick = true;
	}

	function dragEnd() {
		document.removeEventListener('mouseup', dragEnd);
		document.removeEventListener('mousemove', drag);
		document.removeEventListener('touchend', dragEnd);
		document.removeEventListener('touchmove', drag);
		$$invalidate(4, label.style.transition = '', label);
		isDragging = false;
		if (isClick) setValue(!value); else setValue(currentX - minX >= (maxX - minX) / 2);
	}

	function drag(e) {
		if (!isDragging) return;
		isClick = false;
		e.preventDefault();
		currentX = getMouseX(e) - startX;
		if (currentX > maxX) currentX = maxX;
		if (currentX < minX) currentX = minX;
		$$invalidate(4, label.style.width = `${currentX}px`, label);
	}

	const writable_props = ['id', 'value', 'disabled'];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Toggle> was created with unknown prop '${key}'`);
	});

	function contextmenu_handler(event) {
		bubble.call(this, $$self, event);
	}

	function click_handler(event) {
		bubble.call(this, $$self, event);
	}

	function div0_binding($$value) {
		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
			handle = $$value;
			$$invalidate(5, handle);
		});
	}

	function input_change_handler() {
		value = this.checked;
		$$invalidate(0, value);
	}

	function label_1_binding($$value) {
		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
			label = $$value;
			$$invalidate(4, label);
		});
	}

	function div1_binding($$value) {
		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
			el = $$value;
			$$invalidate(3, el);
		});
	}

	$$self.$$set = $$props => {
		if ('id' in $$props) $$invalidate(1, id = $$props.id);
		if ('value' in $$props) $$invalidate(0, value = $$props.value);
		if ('disabled' in $$props) $$invalidate(2, disabled = $$props.disabled);
	};

	$$self.$capture_state = () => ({
		onMount,
		createEventDispatcher,
		dispatch,
		isTouchDevice,
		getMouseX,
		outerWidth,
		innerWidth,
		id,
		value,
		disabled,
		el,
		label,
		handle,
		startX,
		maxX,
		minX,
		currentX,
		isClick,
		isDragging,
		setValue,
		onKey,
		dragStart,
		dragEnd,
		drag
	});

	$$self.$inject_state = $$props => {
		if ('id' in $$props) $$invalidate(1, id = $$props.id);
		if ('value' in $$props) $$invalidate(0, value = $$props.value);
		if ('disabled' in $$props) $$invalidate(2, disabled = $$props.disabled);
		if ('el' in $$props) $$invalidate(3, el = $$props.el);
		if ('label' in $$props) $$invalidate(4, label = $$props.label);
		if ('handle' in $$props) $$invalidate(5, handle = $$props.handle);
		if ('startX' in $$props) startX = $$props.startX;
		if ('maxX' in $$props) maxX = $$props.maxX;
		if ('minX' in $$props) minX = $$props.minX;
		if ('currentX' in $$props) currentX = $$props.currentX;
		if ('isClick' in $$props) isClick = $$props.isClick;
		if ('isDragging' in $$props) isDragging = $$props.isDragging;
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [
		value,
		id,
		disabled,
		el,
		label,
		handle,
		onKey,
		dragStart,
		contextmenu_handler,
		click_handler,
		div0_binding,
		input_change_handler,
		label_1_binding,
		div1_binding
	];
}

class Toggle extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$o, create_fragment$o, safe_not_equal, { id: 1, value: 0, disabled: 2 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Toggle",
			options,
			id: create_fragment$o.name
		});
	}

	get id() {
		throw new Error("<Toggle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set id(value) {
		throw new Error("<Toggle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get value() {
		throw new Error("<Toggle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set value(value) {
		throw new Error("<Toggle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get disabled() {
		throw new Error("<Toggle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set disabled(value) {
		throw new Error("<Toggle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* src/context-menu/menu.svelte generated by Svelte v3.46.4 */
const file$n = "src/context-menu/menu.svelte";

function create_fragment$n(ctx) {
	let ul;
	let current;
	const default_slot_template = /*#slots*/ ctx[6].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], null);

	const block = {
		c: function create() {
			ul = element("ul");
			if (default_slot) default_slot.c();
			attr_dev(ul, "class", "context-menu");
			toggle_class(ul, "hidden", !/*opened*/ ctx[1]);
			add_location(ul, file$n, 0, 0, 0);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, ul, anchor);

			if (default_slot) {
				default_slot.m(ul, null);
			}

			/*ul_binding*/ ctx[7](ul);
			current = true;
		},
		p: function update(ctx, [dirty]) {
			if (default_slot) {
				if (default_slot.p && (!current || dirty & /*$$scope*/ 32)) {
					update_slot_base(
						default_slot,
						default_slot_template,
						ctx,
						/*$$scope*/ ctx[5],
						!current
						? get_all_dirty_from_scope(/*$$scope*/ ctx[5])
						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[5], dirty, null),
						null
					);
				}
			}

			if (dirty & /*opened*/ 2) {
				toggle_class(ul, "hidden", !/*opened*/ ctx[1]);
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(default_slot, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(default_slot, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(ul);
			if (default_slot) default_slot.d(detaching);
			/*ul_binding*/ ctx[7](null);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$n.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$n($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots('Menu', slots, ['default']);
	const dispatch = createEventDispatcher();
	let menuEl, targetEl, focusedEl, opened = false;
	let { targetSelector = 'body' } = $$props;

	onMount(() => {
		document.addEventListener('contextmenu', onContextMenu);
	});

	function updatePosition(e) {
		if (e) {
			// update position to pointer
			$$invalidate(0, menuEl.style.left = e.x + 'px', menuEl);

			$$invalidate(0, menuEl.style.top = e.y + 'px', menuEl);
		} else {
			// make sure it stays on screen
			let { x, y, width, height } = menuEl.getBoundingClientRect();

			const winH = window.innerHeight;
			const winW = window.innerWidth;
			const padding = 10;
			if (winH - height - y < padding) y = winH - height - padding;
			if (winW - width - x < padding) x = winW - width - padding;
			$$invalidate(0, menuEl.style.left = x + 'px', menuEl);
			$$invalidate(0, menuEl.style.top = y + 'px', menuEl);
		}
	}

	function onContextMenu(e) {
		close();
		targetEl = e.target.closest(targetSelector);
		if (!targetEl) return;
		e.stopPropagation();
		e.preventDefault();
		updatePosition(e);
		open();
	}

	function onDocumentClick(e) {
		if (e.button !== 0) return;
		if (!menuEl.contains(e.target)) close();
	}

	function onscroll() {
		if (opened) close();
	}

	function onmousemove() {
		if (focusedEl) {
			focusedEl.blur();
			focusedEl = null;
		}
	}

	function onKeydown(e) {
		if (e.key === 'Escape') close(); else if (e.key === 'ArrowDown') focusNext(); else if (e.key === 'ArrowUp') focusPrev();
	}

	function focusNext() {
		const buttons = Array.from(menuEl.querySelectorAll('.context-menu-button'));
		let idx = -1;
		if (focusedEl) idx = buttons.findIndex(el => el == focusedEl);
		if (idx >= buttons.length - 1) return;
		focusedEl = buttons[idx + 1];
		if (focusedEl) focusedEl.focus();
	}

	function focusPrev() {
		const buttons = Array.from(menuEl.querySelectorAll('.context-menu-button'));
		let idx = buttons.length;
		if (focusedEl) idx = buttons.findIndex(el => el == focusedEl);
		if (idx <= 0) return;
		focusedEl = buttons[idx - 1];
		if (focusedEl) focusedEl.focus();
	}

	function open() {
		$$invalidate(1, opened = true);
		focusedEl = null;

		return new Promise(resolve => requestAnimationFrame(() => {
				// needs to finish rendering first
				updatePosition();

				dispatch('open');
				addEventListeners();
				requestAnimationFrame(resolve);
			}));
	}

	function close() {
		$$invalidate(1, opened = false);

		return new Promise(resolve => requestAnimationFrame(() => {
				dispatch('close');
				removeEventListeners();
				requestAnimationFrame(resolve);
			}));
	}

	function addEventListeners() {
		document.addEventListener('click', onDocumentClick);
		document.addEventListener('keydown', onKeydown);
		document.addEventListener('wheel', onscroll);
		document.addEventListener('mousemove', onmousemove);
	}

	function removeEventListeners() {
		document.removeEventListener('click', onDocumentClick);
		document.removeEventListener('keydown', onKeydown);
		document.removeEventListener('wheel', onscroll);
		document.removeEventListener('mousemove', onmousemove);
	}

	const writable_props = ['targetSelector'];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Menu> was created with unknown prop '${key}'`);
	});

	function ul_binding($$value) {
		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
			menuEl = $$value;
			$$invalidate(0, menuEl);
		});
	}

	$$self.$$set = $$props => {
		if ('targetSelector' in $$props) $$invalidate(2, targetSelector = $$props.targetSelector);
		if ('$$scope' in $$props) $$invalidate(5, $$scope = $$props.$$scope);
	};

	$$self.$capture_state = () => ({
		createEventDispatcher,
		onMount,
		dispatch,
		menuEl,
		targetEl,
		focusedEl,
		opened,
		targetSelector,
		updatePosition,
		onContextMenu,
		onDocumentClick,
		onscroll,
		onmousemove,
		onKeydown,
		focusNext,
		focusPrev,
		open,
		close,
		addEventListeners,
		removeEventListeners
	});

	$$self.$inject_state = $$props => {
		if ('menuEl' in $$props) $$invalidate(0, menuEl = $$props.menuEl);
		if ('targetEl' in $$props) targetEl = $$props.targetEl;
		if ('focusedEl' in $$props) focusedEl = $$props.focusedEl;
		if ('opened' in $$props) $$invalidate(1, opened = $$props.opened);
		if ('targetSelector' in $$props) $$invalidate(2, targetSelector = $$props.targetSelector);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [menuEl, opened, targetSelector, open, close, $$scope, slots, ul_binding];
}

class Menu extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$n, create_fragment$n, safe_not_equal, { targetSelector: 2, open: 3, close: 4 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Menu",
			options,
			id: create_fragment$n.name
		});
	}

	get targetSelector() {
		return this.$$.ctx[2];
	}

	set targetSelector(targetSelector) {
		this.$$set({ targetSelector });
		flush();
	}

	get open() {
		return this.$$.ctx[3];
	}

	set open(value) {
		throw new Error("<Menu>: Cannot set read-only property 'open'");
	}

	get close() {
		return this.$$.ctx[4];
	}

	set close(value) {
		throw new Error("<Menu>: Cannot set read-only property 'close'");
	}
}

/* src/context-menu/menu-item.svelte generated by Svelte v3.46.4 */
const file$m = "src/context-menu/menu-item.svelte";

function create_fragment$m(ctx) {
	let li;
	let button;
	let current;
	let mounted;
	let dispose;
	const default_slot_template = /*#slots*/ ctx[2].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

	const block = {
		c: function create() {
			li = element("li");
			button = element("button");
			if (default_slot) default_slot.c();
			attr_dev(button, "class", "context-menu-button");
			add_location(button, file$m, 1, 1, 32);
			attr_dev(li, "class", "context-menu-item");
			add_location(li, file$m, 0, 0, 0);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, li, anchor);
			append_dev(li, button);

			if (default_slot) {
				default_slot.m(button, null);
			}

			current = true;

			if (!mounted) {
				dispose = listen_dev(button, "click", /*click_handler*/ ctx[3], false, false, false);
				mounted = true;
			}
		},
		p: function update(ctx, [dirty]) {
			if (default_slot) {
				if (default_slot.p && (!current || dirty & /*$$scope*/ 2)) {
					update_slot_base(
						default_slot,
						default_slot_template,
						ctx,
						/*$$scope*/ ctx[1],
						!current
						? get_all_dirty_from_scope(/*$$scope*/ ctx[1])
						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[1], dirty, null),
						null
					);
				}
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(default_slot, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(default_slot, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(li);
			if (default_slot) default_slot.d(detaching);
			mounted = false;
			dispose();
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$m.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$m($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots('Menu_item', slots, ['default']);
	const dispatch = createEventDispatcher();
	const writable_props = [];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Menu_item> was created with unknown prop '${key}'`);
	});

	const click_handler = e => dispatch('click', e);

	$$self.$$set = $$props => {
		if ('$$scope' in $$props) $$invalidate(1, $$scope = $$props.$$scope);
	};

	$$self.$capture_state = () => ({ createEventDispatcher, dispatch });
	return [dispatch, $$scope, slots, click_handler];
}

class Menu_item extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$m, create_fragment$m, safe_not_equal, {});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Menu_item",
			options,
			id: create_fragment$m.name
		});
	}
}

/* src/context-menu/menu-separator.svelte generated by Svelte v3.46.4 */

const file$l = "src/context-menu/menu-separator.svelte";

function create_fragment$l(ctx) {
	let li;

	const block = {
		c: function create() {
			li = element("li");
			attr_dev(li, "class", "context-menu-item context-menu-separator");
			add_location(li, file$l, 0, 0, 0);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, li, anchor);
		},
		p: noop,
		i: noop,
		o: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(li);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$l.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$l($$self, $$props) {
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots('Menu_separator', slots, []);
	const writable_props = [];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Menu_separator> was created with unknown prop '${key}'`);
	});

	return [];
}

class Menu_separator extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$l, create_fragment$l, safe_not_equal, {});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Menu_separator",
			options,
			id: create_fragment$l.name
		});
	}
}

/* docs/components/button.svelte generated by Svelte v3.46.4 */
const file$k = "docs/components/button.svelte";

// (6:0) <Button>
function create_default_slot_47(ctx) {
	let t;

	const block = {
		c: function create() {
			t = text("Hello");
		},
		m: function mount(target, anchor) {
			insert_dev(target, t, anchor);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(t);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_47.name,
		type: "slot",
		source: "(6:0) <Button>",
		ctx
	});

	return block;
}

// (7:0) <Button success>
function create_default_slot_46(ctx) {
	let t;

	const block = {
		c: function create() {
			t = text("Warning");
		},
		m: function mount(target, anchor) {
			insert_dev(target, t, anchor);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(t);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_46.name,
		type: "slot",
		source: "(7:0) <Button success>",
		ctx
	});

	return block;
}

// (8:0) <Button warning>
function create_default_slot_45(ctx) {
	let t;

	const block = {
		c: function create() {
			t = text("Warning");
		},
		m: function mount(target, anchor) {
			insert_dev(target, t, anchor);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(t);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_45.name,
		type: "slot",
		source: "(8:0) <Button warning>",
		ctx
	});

	return block;
}

// (9:0) <Button danger>
function create_default_slot_44(ctx) {
	let t;

	const block = {
		c: function create() {
			t = text("Danger");
		},
		m: function mount(target, anchor) {
			insert_dev(target, t, anchor);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(t);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_44.name,
		type: "slot",
		source: "(9:0) <Button danger>",
		ctx
	});

	return block;
}

// (12:0) <Button disabled>
function create_default_slot_43(ctx) {
	let t;

	const block = {
		c: function create() {
			t = text("Hello");
		},
		m: function mount(target, anchor) {
			insert_dev(target, t, anchor);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(t);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_43.name,
		type: "slot",
		source: "(12:0) <Button disabled>",
		ctx
	});

	return block;
}

// (13:0) <Button disabled success>
function create_default_slot_42(ctx) {
	let t;

	const block = {
		c: function create() {
			t = text("Success");
		},
		m: function mount(target, anchor) {
			insert_dev(target, t, anchor);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(t);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_42.name,
		type: "slot",
		source: "(13:0) <Button disabled success>",
		ctx
	});

	return block;
}

// (14:0) <Button disabled warning>
function create_default_slot_41(ctx) {
	let t;

	const block = {
		c: function create() {
			t = text("Warning");
		},
		m: function mount(target, anchor) {
			insert_dev(target, t, anchor);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(t);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_41.name,
		type: "slot",
		source: "(14:0) <Button disabled warning>",
		ctx
	});

	return block;
}

// (15:0) <Button disabled danger>
function create_default_slot_40(ctx) {
	let t;

	const block = {
		c: function create() {
			t = text("Danger");
		},
		m: function mount(target, anchor) {
			insert_dev(target, t, anchor);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(t);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_40.name,
		type: "slot",
		source: "(15:0) <Button disabled danger>",
		ctx
	});

	return block;
}

// (18:0) <Button icon="info">
function create_default_slot_39(ctx) {
	let t;

	const block = {
		c: function create() {
			t = text("Info");
		},
		m: function mount(target, anchor) {
			insert_dev(target, t, anchor);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(t);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_39.name,
		type: "slot",
		source: "(18:0) <Button icon=\\\"info\\\">",
		ctx
	});

	return block;
}

// (19:0) <Button icon="check" success>
function create_default_slot_38(ctx) {
	let t;

	const block = {
		c: function create() {
			t = text("Success");
		},
		m: function mount(target, anchor) {
			insert_dev(target, t, anchor);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(t);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_38.name,
		type: "slot",
		source: "(19:0) <Button icon=\\\"check\\\" success>",
		ctx
	});

	return block;
}

// (20:0) <Button icon="alert" warning>
function create_default_slot_37(ctx) {
	let t;

	const block = {
		c: function create() {
			t = text("Warning");
		},
		m: function mount(target, anchor) {
			insert_dev(target, t, anchor);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(t);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_37.name,
		type: "slot",
		source: "(20:0) <Button icon=\\\"alert\\\" warning>",
		ctx
	});

	return block;
}

// (21:0) <Button icon="trash" danger>
function create_default_slot_36(ctx) {
	let t;

	const block = {
		c: function create() {
			t = text("Delete");
		},
		m: function mount(target, anchor) {
			insert_dev(target, t, anchor);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(t);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_36.name,
		type: "slot",
		source: "(21:0) <Button icon=\\\"trash\\\" danger>",
		ctx
	});

	return block;
}

// (28:0) <Button outline>
function create_default_slot_35(ctx) {
	let t;

	const block = {
		c: function create() {
			t = text("Hello");
		},
		m: function mount(target, anchor) {
			insert_dev(target, t, anchor);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(t);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_35.name,
		type: "slot",
		source: "(28:0) <Button outline>",
		ctx
	});

	return block;
}

// (29:0) <Button outline success>
function create_default_slot_34(ctx) {
	let t;

	const block = {
		c: function create() {
			t = text("Success");
		},
		m: function mount(target, anchor) {
			insert_dev(target, t, anchor);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(t);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_34.name,
		type: "slot",
		source: "(29:0) <Button outline success>",
		ctx
	});

	return block;
}

// (30:0) <Button outline warning>
function create_default_slot_33(ctx) {
	let t;

	const block = {
		c: function create() {
			t = text("Warning");
		},
		m: function mount(target, anchor) {
			insert_dev(target, t, anchor);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(t);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_33.name,
		type: "slot",
		source: "(30:0) <Button outline warning>",
		ctx
	});

	return block;
}

// (31:0) <Button outline danger>
function create_default_slot_32(ctx) {
	let t;

	const block = {
		c: function create() {
			t = text("Danger");
		},
		m: function mount(target, anchor) {
			insert_dev(target, t, anchor);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(t);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_32.name,
		type: "slot",
		source: "(31:0) <Button outline danger>",
		ctx
	});

	return block;
}

// (34:0) <Button disabled outline>
function create_default_slot_31(ctx) {
	let t;

	const block = {
		c: function create() {
			t = text("Hello");
		},
		m: function mount(target, anchor) {
			insert_dev(target, t, anchor);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(t);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_31.name,
		type: "slot",
		source: "(34:0) <Button disabled outline>",
		ctx
	});

	return block;
}

// (35:0) <Button disabled outline success>
function create_default_slot_30(ctx) {
	let t;

	const block = {
		c: function create() {
			t = text("Success");
		},
		m: function mount(target, anchor) {
			insert_dev(target, t, anchor);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(t);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_30.name,
		type: "slot",
		source: "(35:0) <Button disabled outline success>",
		ctx
	});

	return block;
}

// (36:0) <Button disabled outline warning>
function create_default_slot_29(ctx) {
	let t;

	const block = {
		c: function create() {
			t = text("Warning");
		},
		m: function mount(target, anchor) {
			insert_dev(target, t, anchor);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(t);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_29.name,
		type: "slot",
		source: "(36:0) <Button disabled outline warning>",
		ctx
	});

	return block;
}

// (37:0) <Button disabled outline danger>
function create_default_slot_28(ctx) {
	let t;

	const block = {
		c: function create() {
			t = text("Danger");
		},
		m: function mount(target, anchor) {
			insert_dev(target, t, anchor);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(t);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_28.name,
		type: "slot",
		source: "(37:0) <Button disabled outline danger>",
		ctx
	});

	return block;
}

// (40:0) <Button outline icon="info">
function create_default_slot_27(ctx) {
	let t;

	const block = {
		c: function create() {
			t = text("Hello");
		},
		m: function mount(target, anchor) {
			insert_dev(target, t, anchor);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(t);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_27.name,
		type: "slot",
		source: "(40:0) <Button outline icon=\\\"info\\\">",
		ctx
	});

	return block;
}

// (41:0) <Button outline icon="check" success>
function create_default_slot_26(ctx) {
	let t;

	const block = {
		c: function create() {
			t = text("Success");
		},
		m: function mount(target, anchor) {
			insert_dev(target, t, anchor);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(t);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_26.name,
		type: "slot",
		source: "(41:0) <Button outline icon=\\\"check\\\" success>",
		ctx
	});

	return block;
}

// (42:0) <Button outline icon="alert" warning>
function create_default_slot_25(ctx) {
	let t;

	const block = {
		c: function create() {
			t = text("Warning");
		},
		m: function mount(target, anchor) {
			insert_dev(target, t, anchor);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(t);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_25.name,
		type: "slot",
		source: "(42:0) <Button outline icon=\\\"alert\\\" warning>",
		ctx
	});

	return block;
}

// (43:0) <Button outline icon="trash" danger>
function create_default_slot_24(ctx) {
	let t;

	const block = {
		c: function create() {
			t = text("Danger");
		},
		m: function mount(target, anchor) {
			insert_dev(target, t, anchor);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(t);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_24.name,
		type: "slot",
		source: "(43:0) <Button outline icon=\\\"trash\\\" danger>",
		ctx
	});

	return block;
}

// (50:0) <Button text>
function create_default_slot_23(ctx) {
	let t;

	const block = {
		c: function create() {
			t = text("Hello");
		},
		m: function mount(target, anchor) {
			insert_dev(target, t, anchor);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(t);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_23.name,
		type: "slot",
		source: "(50:0) <Button text>",
		ctx
	});

	return block;
}

// (51:0) <Button text success>
function create_default_slot_22(ctx) {
	let t;

	const block = {
		c: function create() {
			t = text("Success");
		},
		m: function mount(target, anchor) {
			insert_dev(target, t, anchor);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(t);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_22.name,
		type: "slot",
		source: "(51:0) <Button text success>",
		ctx
	});

	return block;
}

// (52:0) <Button text warning>
function create_default_slot_21(ctx) {
	let t;

	const block = {
		c: function create() {
			t = text("Warning");
		},
		m: function mount(target, anchor) {
			insert_dev(target, t, anchor);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(t);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_21.name,
		type: "slot",
		source: "(52:0) <Button text warning>",
		ctx
	});

	return block;
}

// (53:0) <Button text danger>
function create_default_slot_20(ctx) {
	let t;

	const block = {
		c: function create() {
			t = text("Danger");
		},
		m: function mount(target, anchor) {
			insert_dev(target, t, anchor);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(t);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_20.name,
		type: "slot",
		source: "(53:0) <Button text danger>",
		ctx
	});

	return block;
}

// (56:0) <Button disabled text>
function create_default_slot_19(ctx) {
	let t;

	const block = {
		c: function create() {
			t = text("Hello");
		},
		m: function mount(target, anchor) {
			insert_dev(target, t, anchor);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(t);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_19.name,
		type: "slot",
		source: "(56:0) <Button disabled text>",
		ctx
	});

	return block;
}

// (57:0) <Button disabled text success>
function create_default_slot_18(ctx) {
	let t;

	const block = {
		c: function create() {
			t = text("Success");
		},
		m: function mount(target, anchor) {
			insert_dev(target, t, anchor);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(t);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_18.name,
		type: "slot",
		source: "(57:0) <Button disabled text success>",
		ctx
	});

	return block;
}

// (58:0) <Button disabled text warning>
function create_default_slot_17(ctx) {
	let t;

	const block = {
		c: function create() {
			t = text("Warning");
		},
		m: function mount(target, anchor) {
			insert_dev(target, t, anchor);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(t);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_17.name,
		type: "slot",
		source: "(58:0) <Button disabled text warning>",
		ctx
	});

	return block;
}

// (59:0) <Button disabled text danger>
function create_default_slot_16(ctx) {
	let t;

	const block = {
		c: function create() {
			t = text("Danger");
		},
		m: function mount(target, anchor) {
			insert_dev(target, t, anchor);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(t);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_16.name,
		type: "slot",
		source: "(59:0) <Button disabled text danger>",
		ctx
	});

	return block;
}

// (62:0) <Button text icon="info">
function create_default_slot_15(ctx) {
	let t;

	const block = {
		c: function create() {
			t = text("Hello");
		},
		m: function mount(target, anchor) {
			insert_dev(target, t, anchor);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(t);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_15.name,
		type: "slot",
		source: "(62:0) <Button text icon=\\\"info\\\">",
		ctx
	});

	return block;
}

// (63:0) <Button text icon="check" success>
function create_default_slot_14(ctx) {
	let t;

	const block = {
		c: function create() {
			t = text("Success");
		},
		m: function mount(target, anchor) {
			insert_dev(target, t, anchor);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(t);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_14.name,
		type: "slot",
		source: "(63:0) <Button text icon=\\\"check\\\" success>",
		ctx
	});

	return block;
}

// (64:0) <Button text icon="alert" warning>
function create_default_slot_13(ctx) {
	let t;

	const block = {
		c: function create() {
			t = text("Warning");
		},
		m: function mount(target, anchor) {
			insert_dev(target, t, anchor);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(t);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_13.name,
		type: "slot",
		source: "(64:0) <Button text icon=\\\"alert\\\" warning>",
		ctx
	});

	return block;
}

// (65:0) <Button text icon="trash" danger>
function create_default_slot_12(ctx) {
	let t;

	const block = {
		c: function create() {
			t = text("Danger");
		},
		m: function mount(target, anchor) {
			insert_dev(target, t, anchor);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(t);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_12.name,
		type: "slot",
		source: "(65:0) <Button text icon=\\\"trash\\\" danger>",
		ctx
	});

	return block;
}

// (72:0) <Button link>
function create_default_slot_11(ctx) {
	let t;

	const block = {
		c: function create() {
			t = text("Hello");
		},
		m: function mount(target, anchor) {
			insert_dev(target, t, anchor);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(t);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_11.name,
		type: "slot",
		source: "(72:0) <Button link>",
		ctx
	});

	return block;
}

// (73:0) <Button link success>
function create_default_slot_10(ctx) {
	let t;

	const block = {
		c: function create() {
			t = text("Success");
		},
		m: function mount(target, anchor) {
			insert_dev(target, t, anchor);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(t);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_10.name,
		type: "slot",
		source: "(73:0) <Button link success>",
		ctx
	});

	return block;
}

// (74:0) <Button link warning>
function create_default_slot_9(ctx) {
	let t;

	const block = {
		c: function create() {
			t = text("Warning");
		},
		m: function mount(target, anchor) {
			insert_dev(target, t, anchor);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(t);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_9.name,
		type: "slot",
		source: "(74:0) <Button link warning>",
		ctx
	});

	return block;
}

// (75:0) <Button link danger>
function create_default_slot_8$1(ctx) {
	let t;

	const block = {
		c: function create() {
			t = text("Danger");
		},
		m: function mount(target, anchor) {
			insert_dev(target, t, anchor);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(t);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_8$1.name,
		type: "slot",
		source: "(75:0) <Button link danger>",
		ctx
	});

	return block;
}

// (78:0) <Button disabled link>
function create_default_slot_7$2(ctx) {
	let t;

	const block = {
		c: function create() {
			t = text("Hello");
		},
		m: function mount(target, anchor) {
			insert_dev(target, t, anchor);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(t);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_7$2.name,
		type: "slot",
		source: "(78:0) <Button disabled link>",
		ctx
	});

	return block;
}

// (79:0) <Button disabled link success>
function create_default_slot_6$2(ctx) {
	let t;

	const block = {
		c: function create() {
			t = text("Success");
		},
		m: function mount(target, anchor) {
			insert_dev(target, t, anchor);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(t);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_6$2.name,
		type: "slot",
		source: "(79:0) <Button disabled link success>",
		ctx
	});

	return block;
}

// (80:0) <Button disabled link warning>
function create_default_slot_5$2(ctx) {
	let t;

	const block = {
		c: function create() {
			t = text("Warning");
		},
		m: function mount(target, anchor) {
			insert_dev(target, t, anchor);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(t);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_5$2.name,
		type: "slot",
		source: "(80:0) <Button disabled link warning>",
		ctx
	});

	return block;
}

// (81:0) <Button disabled link danger>
function create_default_slot_4$3(ctx) {
	let t;

	const block = {
		c: function create() {
			t = text("Danger");
		},
		m: function mount(target, anchor) {
			insert_dev(target, t, anchor);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(t);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_4$3.name,
		type: "slot",
		source: "(81:0) <Button disabled link danger>",
		ctx
	});

	return block;
}

// (84:0) <Button link icon="info">
function create_default_slot_3$3(ctx) {
	let t;

	const block = {
		c: function create() {
			t = text("Hello");
		},
		m: function mount(target, anchor) {
			insert_dev(target, t, anchor);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(t);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_3$3.name,
		type: "slot",
		source: "(84:0) <Button link icon=\\\"info\\\">",
		ctx
	});

	return block;
}

// (85:0) <Button link icon="check" success>
function create_default_slot_2$5(ctx) {
	let t;

	const block = {
		c: function create() {
			t = text("Success");
		},
		m: function mount(target, anchor) {
			insert_dev(target, t, anchor);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(t);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_2$5.name,
		type: "slot",
		source: "(85:0) <Button link icon=\\\"check\\\" success>",
		ctx
	});

	return block;
}

// (86:0) <Button link icon="alert" warning>
function create_default_slot_1$6(ctx) {
	let t;

	const block = {
		c: function create() {
			t = text("Warning");
		},
		m: function mount(target, anchor) {
			insert_dev(target, t, anchor);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(t);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_1$6.name,
		type: "slot",
		source: "(86:0) <Button link icon=\\\"alert\\\" warning>",
		ctx
	});

	return block;
}

// (87:0) <Button link icon="trash" danger>
function create_default_slot$7(ctx) {
	let t;

	const block = {
		c: function create() {
			t = text("Danger");
		},
		m: function mount(target, anchor) {
			insert_dev(target, t, anchor);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(t);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot$7.name,
		type: "slot",
		source: "(87:0) <Button link icon=\\\"trash\\\" danger>",
		ctx
	});

	return block;
}

function create_fragment$k(ctx) {
	let h2;
	let t1;
	let h30;
	let t3;
	let h40;
	let t5;
	let button0;
	let t6;
	let button1;
	let t7;
	let button2;
	let t8;
	let button3;
	let t9;
	let h41;
	let t11;
	let button4;
	let t12;
	let button5;
	let t13;
	let button6;
	let t14;
	let button7;
	let t15;
	let h42;
	let t17;
	let button8;
	let t18;
	let button9;
	let t19;
	let button10;
	let t20;
	let button11;
	let t21;
	let hr0;
	let t22;
	let h31;
	let t24;
	let h43;
	let t26;
	let button12;
	let t27;
	let button13;
	let t28;
	let button14;
	let t29;
	let button15;
	let t30;
	let h44;
	let t32;
	let button16;
	let t33;
	let button17;
	let t34;
	let button18;
	let t35;
	let button19;
	let t36;
	let h45;
	let t38;
	let button20;
	let t39;
	let button21;
	let t40;
	let button22;
	let t41;
	let button23;
	let t42;
	let hr1;
	let t43;
	let h32;
	let t45;
	let h46;
	let t47;
	let button24;
	let t48;
	let button25;
	let t49;
	let button26;
	let t50;
	let button27;
	let t51;
	let h47;
	let t53;
	let button28;
	let t54;
	let button29;
	let t55;
	let button30;
	let t56;
	let button31;
	let t57;
	let h48;
	let t59;
	let button32;
	let t60;
	let button33;
	let t61;
	let button34;
	let t62;
	let button35;
	let t63;
	let hr2;
	let t64;
	let h33;
	let t66;
	let h49;
	let t68;
	let button36;
	let t69;
	let button37;
	let t70;
	let button38;
	let t71;
	let button39;
	let t72;
	let h410;
	let t74;
	let button40;
	let t75;
	let button41;
	let t76;
	let button42;
	let t77;
	let button43;
	let t78;
	let h411;
	let t80;
	let button44;
	let t81;
	let button45;
	let t82;
	let button46;
	let t83;
	let button47;
	let t84;
	let hr3;
	let t85;
	let h34;
	let t87;
	let h412;
	let t89;
	let button48;
	let t90;
	let button49;
	let t91;
	let button50;
	let t92;
	let button51;
	let t93;
	let h413;
	let t95;
	let button52;
	let t96;
	let button53;
	let t97;
	let button54;
	let t98;
	let button55;
	let t99;
	let h414;
	let t101;
	let button56;
	let t102;
	let button57;
	let t103;
	let button58;
	let t104;
	let button59;
	let t105;
	let h415;
	let t107;
	let button60;
	let t108;
	let button61;
	let t109;
	let button62;
	let t110;
	let button63;
	let t111;
	let hr4;
	let t112;
	let h35;
	let t114;
	let h416;
	let t116;
	let button64;
	let t117;
	let button65;
	let t118;
	let button66;
	let t119;
	let button67;
	let t120;
	let h417;
	let t122;
	let button68;
	let t123;
	let button69;
	let t124;
	let button70;
	let t125;
	let button71;
	let t126;
	let h418;
	let t128;
	let button72;
	let t129;
	let button73;
	let t130;
	let button74;
	let t131;
	let button75;
	let current;

	button0 = new Button({
			props: {
				$$slots: { default: [create_default_slot_47] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	button1 = new Button({
			props: {
				success: true,
				$$slots: { default: [create_default_slot_46] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	button2 = new Button({
			props: {
				warning: true,
				$$slots: { default: [create_default_slot_45] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	button3 = new Button({
			props: {
				danger: true,
				$$slots: { default: [create_default_slot_44] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	button4 = new Button({
			props: {
				disabled: true,
				$$slots: { default: [create_default_slot_43] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	button5 = new Button({
			props: {
				disabled: true,
				success: true,
				$$slots: { default: [create_default_slot_42] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	button6 = new Button({
			props: {
				disabled: true,
				warning: true,
				$$slots: { default: [create_default_slot_41] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	button7 = new Button({
			props: {
				disabled: true,
				danger: true,
				$$slots: { default: [create_default_slot_40] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	button8 = new Button({
			props: {
				icon: "info",
				$$slots: { default: [create_default_slot_39] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	button9 = new Button({
			props: {
				icon: "check",
				success: true,
				$$slots: { default: [create_default_slot_38] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	button10 = new Button({
			props: {
				icon: "alert",
				warning: true,
				$$slots: { default: [create_default_slot_37] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	button11 = new Button({
			props: {
				icon: "trash",
				danger: true,
				$$slots: { default: [create_default_slot_36] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	button12 = new Button({
			props: {
				outline: true,
				$$slots: { default: [create_default_slot_35] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	button13 = new Button({
			props: {
				outline: true,
				success: true,
				$$slots: { default: [create_default_slot_34] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	button14 = new Button({
			props: {
				outline: true,
				warning: true,
				$$slots: { default: [create_default_slot_33] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	button15 = new Button({
			props: {
				outline: true,
				danger: true,
				$$slots: { default: [create_default_slot_32] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	button16 = new Button({
			props: {
				disabled: true,
				outline: true,
				$$slots: { default: [create_default_slot_31] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	button17 = new Button({
			props: {
				disabled: true,
				outline: true,
				success: true,
				$$slots: { default: [create_default_slot_30] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	button18 = new Button({
			props: {
				disabled: true,
				outline: true,
				warning: true,
				$$slots: { default: [create_default_slot_29] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	button19 = new Button({
			props: {
				disabled: true,
				outline: true,
				danger: true,
				$$slots: { default: [create_default_slot_28] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	button20 = new Button({
			props: {
				outline: true,
				icon: "info",
				$$slots: { default: [create_default_slot_27] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	button21 = new Button({
			props: {
				outline: true,
				icon: "check",
				success: true,
				$$slots: { default: [create_default_slot_26] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	button22 = new Button({
			props: {
				outline: true,
				icon: "alert",
				warning: true,
				$$slots: { default: [create_default_slot_25] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	button23 = new Button({
			props: {
				outline: true,
				icon: "trash",
				danger: true,
				$$slots: { default: [create_default_slot_24] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	button24 = new Button({
			props: {
				text: true,
				$$slots: { default: [create_default_slot_23] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	button25 = new Button({
			props: {
				text: true,
				success: true,
				$$slots: { default: [create_default_slot_22] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	button26 = new Button({
			props: {
				text: true,
				warning: true,
				$$slots: { default: [create_default_slot_21] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	button27 = new Button({
			props: {
				text: true,
				danger: true,
				$$slots: { default: [create_default_slot_20] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	button28 = new Button({
			props: {
				disabled: true,
				text: true,
				$$slots: { default: [create_default_slot_19] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	button29 = new Button({
			props: {
				disabled: true,
				text: true,
				success: true,
				$$slots: { default: [create_default_slot_18] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	button30 = new Button({
			props: {
				disabled: true,
				text: true,
				warning: true,
				$$slots: { default: [create_default_slot_17] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	button31 = new Button({
			props: {
				disabled: true,
				text: true,
				danger: true,
				$$slots: { default: [create_default_slot_16] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	button32 = new Button({
			props: {
				text: true,
				icon: "info",
				$$slots: { default: [create_default_slot_15] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	button33 = new Button({
			props: {
				text: true,
				icon: "check",
				success: true,
				$$slots: { default: [create_default_slot_14] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	button34 = new Button({
			props: {
				text: true,
				icon: "alert",
				warning: true,
				$$slots: { default: [create_default_slot_13] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	button35 = new Button({
			props: {
				text: true,
				icon: "trash",
				danger: true,
				$$slots: { default: [create_default_slot_12] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	button36 = new Button({
			props: {
				link: true,
				$$slots: { default: [create_default_slot_11] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	button37 = new Button({
			props: {
				link: true,
				success: true,
				$$slots: { default: [create_default_slot_10] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	button38 = new Button({
			props: {
				link: true,
				warning: true,
				$$slots: { default: [create_default_slot_9] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	button39 = new Button({
			props: {
				link: true,
				danger: true,
				$$slots: { default: [create_default_slot_8$1] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	button40 = new Button({
			props: {
				disabled: true,
				link: true,
				$$slots: { default: [create_default_slot_7$2] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	button41 = new Button({
			props: {
				disabled: true,
				link: true,
				success: true,
				$$slots: { default: [create_default_slot_6$2] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	button42 = new Button({
			props: {
				disabled: true,
				link: true,
				warning: true,
				$$slots: { default: [create_default_slot_5$2] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	button43 = new Button({
			props: {
				disabled: true,
				link: true,
				danger: true,
				$$slots: { default: [create_default_slot_4$3] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	button44 = new Button({
			props: {
				link: true,
				icon: "info",
				$$slots: { default: [create_default_slot_3$3] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	button45 = new Button({
			props: {
				link: true,
				icon: "check",
				success: true,
				$$slots: { default: [create_default_slot_2$5] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	button46 = new Button({
			props: {
				link: true,
				icon: "alert",
				warning: true,
				$$slots: { default: [create_default_slot_1$6] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	button47 = new Button({
			props: {
				link: true,
				icon: "trash",
				danger: true,
				$$slots: { default: [create_default_slot$7] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	button48 = new Button({ props: { icon: "info" }, $$inline: true });

	button49 = new Button({
			props: { icon: "check", success: true },
			$$inline: true
		});

	button50 = new Button({
			props: { icon: "alert", warning: true },
			$$inline: true
		});

	button51 = new Button({
			props: { icon: "trash", danger: true },
			$$inline: true
		});

	button52 = new Button({
			props: { outline: true, icon: "info" },
			$$inline: true
		});

	button53 = new Button({
			props: {
				outline: true,
				icon: "check",
				success: true
			},
			$$inline: true
		});

	button54 = new Button({
			props: {
				outline: true,
				icon: "alert",
				warning: true
			},
			$$inline: true
		});

	button55 = new Button({
			props: {
				outline: true,
				icon: "trash",
				danger: true
			},
			$$inline: true
		});

	button56 = new Button({
			props: { text: true, icon: "info" },
			$$inline: true
		});

	button57 = new Button({
			props: { text: true, icon: "check", success: true },
			$$inline: true
		});

	button58 = new Button({
			props: { text: true, icon: "alert", warning: true },
			$$inline: true
		});

	button59 = new Button({
			props: { text: true, icon: "trash", danger: true },
			$$inline: true
		});

	button60 = new Button({
			props: { link: true, icon: "info" },
			$$inline: true
		});

	button61 = new Button({
			props: { link: true, icon: "check", success: true },
			$$inline: true
		});

	button62 = new Button({
			props: { link: true, icon: "alert", warning: true },
			$$inline: true
		});

	button63 = new Button({
			props: { link: true, icon: "trash", danger: true },
			$$inline: true
		});

	button64 = new Button({
			props: { round: true, icon: "info" },
			$$inline: true
		});

	button65 = new Button({
			props: {
				round: true,
				icon: "check",
				success: true
			},
			$$inline: true
		});

	button66 = new Button({
			props: {
				round: true,
				icon: "alert",
				warning: true
			},
			$$inline: true
		});

	button67 = new Button({
			props: { round: true, icon: "trash", danger: true },
			$$inline: true
		});

	button68 = new Button({
			props: { round: true, outline: true, icon: "info" },
			$$inline: true
		});

	button69 = new Button({
			props: {
				round: true,
				outline: true,
				icon: "check",
				success: true
			},
			$$inline: true
		});

	button70 = new Button({
			props: {
				round: true,
				outline: true,
				icon: "alert",
				warning: true
			},
			$$inline: true
		});

	button71 = new Button({
			props: {
				round: true,
				outline: true,
				icon: "trash",
				danger: true
			},
			$$inline: true
		});

	button72 = new Button({
			props: { round: true, text: true, icon: "info" },
			$$inline: true
		});

	button73 = new Button({
			props: {
				round: true,
				text: true,
				icon: "check",
				success: true
			},
			$$inline: true
		});

	button74 = new Button({
			props: {
				round: true,
				text: true,
				icon: "alert",
				warning: true
			},
			$$inline: true
		});

	button75 = new Button({
			props: {
				round: true,
				text: true,
				icon: "trash",
				danger: true
			},
			$$inline: true
		});

	const block = {
		c: function create() {
			h2 = element("h2");
			h2.textContent = "Button";
			t1 = space();
			h30 = element("h3");
			h30.textContent = "Normal";
			t3 = space();
			h40 = element("h4");
			h40.textContent = "Default";
			t5 = space();
			create_component(button0.$$.fragment);
			t6 = space();
			create_component(button1.$$.fragment);
			t7 = space();
			create_component(button2.$$.fragment);
			t8 = space();
			create_component(button3.$$.fragment);
			t9 = space();
			h41 = element("h4");
			h41.textContent = "Disabled";
			t11 = space();
			create_component(button4.$$.fragment);
			t12 = space();
			create_component(button5.$$.fragment);
			t13 = space();
			create_component(button6.$$.fragment);
			t14 = space();
			create_component(button7.$$.fragment);
			t15 = space();
			h42 = element("h4");
			h42.textContent = "With icon";
			t17 = space();
			create_component(button8.$$.fragment);
			t18 = space();
			create_component(button9.$$.fragment);
			t19 = space();
			create_component(button10.$$.fragment);
			t20 = space();
			create_component(button11.$$.fragment);
			t21 = space();
			hr0 = element("hr");
			t22 = space();
			h31 = element("h3");
			h31.textContent = "Outline";
			t24 = space();
			h43 = element("h4");
			h43.textContent = "Default";
			t26 = space();
			create_component(button12.$$.fragment);
			t27 = space();
			create_component(button13.$$.fragment);
			t28 = space();
			create_component(button14.$$.fragment);
			t29 = space();
			create_component(button15.$$.fragment);
			t30 = space();
			h44 = element("h4");
			h44.textContent = "Disabled";
			t32 = space();
			create_component(button16.$$.fragment);
			t33 = space();
			create_component(button17.$$.fragment);
			t34 = space();
			create_component(button18.$$.fragment);
			t35 = space();
			create_component(button19.$$.fragment);
			t36 = space();
			h45 = element("h4");
			h45.textContent = "With icon";
			t38 = space();
			create_component(button20.$$.fragment);
			t39 = space();
			create_component(button21.$$.fragment);
			t40 = space();
			create_component(button22.$$.fragment);
			t41 = space();
			create_component(button23.$$.fragment);
			t42 = space();
			hr1 = element("hr");
			t43 = space();
			h32 = element("h3");
			h32.textContent = "Text button";
			t45 = space();
			h46 = element("h4");
			h46.textContent = "Default";
			t47 = space();
			create_component(button24.$$.fragment);
			t48 = space();
			create_component(button25.$$.fragment);
			t49 = space();
			create_component(button26.$$.fragment);
			t50 = space();
			create_component(button27.$$.fragment);
			t51 = space();
			h47 = element("h4");
			h47.textContent = "Disabled";
			t53 = space();
			create_component(button28.$$.fragment);
			t54 = space();
			create_component(button29.$$.fragment);
			t55 = space();
			create_component(button30.$$.fragment);
			t56 = space();
			create_component(button31.$$.fragment);
			t57 = space();
			h48 = element("h4");
			h48.textContent = "With icon";
			t59 = space();
			create_component(button32.$$.fragment);
			t60 = space();
			create_component(button33.$$.fragment);
			t61 = space();
			create_component(button34.$$.fragment);
			t62 = space();
			create_component(button35.$$.fragment);
			t63 = space();
			hr2 = element("hr");
			t64 = space();
			h33 = element("h3");
			h33.textContent = "Link button";
			t66 = space();
			h49 = element("h4");
			h49.textContent = "Default";
			t68 = space();
			create_component(button36.$$.fragment);
			t69 = space();
			create_component(button37.$$.fragment);
			t70 = space();
			create_component(button38.$$.fragment);
			t71 = space();
			create_component(button39.$$.fragment);
			t72 = space();
			h410 = element("h4");
			h410.textContent = "Disabled";
			t74 = space();
			create_component(button40.$$.fragment);
			t75 = space();
			create_component(button41.$$.fragment);
			t76 = space();
			create_component(button42.$$.fragment);
			t77 = space();
			create_component(button43.$$.fragment);
			t78 = space();
			h411 = element("h4");
			h411.textContent = "With icon";
			t80 = space();
			create_component(button44.$$.fragment);
			t81 = space();
			create_component(button45.$$.fragment);
			t82 = space();
			create_component(button46.$$.fragment);
			t83 = space();
			create_component(button47.$$.fragment);
			t84 = space();
			hr3 = element("hr");
			t85 = space();
			h34 = element("h3");
			h34.textContent = "Icon only buttons";
			t87 = space();
			h412 = element("h4");
			h412.textContent = "Default";
			t89 = space();
			create_component(button48.$$.fragment);
			t90 = space();
			create_component(button49.$$.fragment);
			t91 = space();
			create_component(button50.$$.fragment);
			t92 = space();
			create_component(button51.$$.fragment);
			t93 = space();
			h413 = element("h4");
			h413.textContent = "Outline";
			t95 = space();
			create_component(button52.$$.fragment);
			t96 = space();
			create_component(button53.$$.fragment);
			t97 = space();
			create_component(button54.$$.fragment);
			t98 = space();
			create_component(button55.$$.fragment);
			t99 = space();
			h414 = element("h4");
			h414.textContent = "Text";
			t101 = space();
			create_component(button56.$$.fragment);
			t102 = space();
			create_component(button57.$$.fragment);
			t103 = space();
			create_component(button58.$$.fragment);
			t104 = space();
			create_component(button59.$$.fragment);
			t105 = space();
			h415 = element("h4");
			h415.textContent = "Link";
			t107 = space();
			create_component(button60.$$.fragment);
			t108 = space();
			create_component(button61.$$.fragment);
			t109 = space();
			create_component(button62.$$.fragment);
			t110 = space();
			create_component(button63.$$.fragment);
			t111 = space();
			hr4 = element("hr");
			t112 = space();
			h35 = element("h3");
			h35.textContent = "Icon only, and round";
			t114 = space();
			h416 = element("h4");
			h416.textContent = "Default";
			t116 = space();
			create_component(button64.$$.fragment);
			t117 = space();
			create_component(button65.$$.fragment);
			t118 = space();
			create_component(button66.$$.fragment);
			t119 = space();
			create_component(button67.$$.fragment);
			t120 = space();
			h417 = element("h4");
			h417.textContent = "Outline";
			t122 = space();
			create_component(button68.$$.fragment);
			t123 = space();
			create_component(button69.$$.fragment);
			t124 = space();
			create_component(button70.$$.fragment);
			t125 = space();
			create_component(button71.$$.fragment);
			t126 = space();
			h418 = element("h4");
			h418.textContent = "Text";
			t128 = space();
			create_component(button72.$$.fragment);
			t129 = space();
			create_component(button73.$$.fragment);
			t130 = space();
			create_component(button74.$$.fragment);
			t131 = space();
			create_component(button75.$$.fragment);
			add_location(h2, file$k, 0, 0, 0);
			add_location(h30, file$k, 2, 0, 17);
			add_location(h40, file$k, 4, 0, 34);
			add_location(h41, file$k, 10, 0, 172);
			add_location(h42, file$k, 16, 0, 347);
			add_location(hr0, file$k, 23, 0, 538);
			add_location(h31, file$k, 24, 0, 543);
			add_location(h43, file$k, 26, 0, 561);
			add_location(h44, file$k, 32, 0, 731);
			add_location(h45, file$k, 38, 0, 938);
			add_location(hr1, file$k, 45, 0, 1162);
			add_location(h32, file$k, 46, 0, 1167);
			add_location(h46, file$k, 48, 0, 1189);
			add_location(h47, file$k, 54, 0, 1347);
			add_location(h48, file$k, 60, 0, 1542);
			add_location(hr2, file$k, 67, 0, 1754);
			add_location(h33, file$k, 68, 0, 1759);
			add_location(h49, file$k, 70, 0, 1781);
			add_location(h410, file$k, 76, 0, 1939);
			add_location(h411, file$k, 82, 0, 2134);
			add_location(hr3, file$k, 89, 0, 2346);
			add_location(h34, file$k, 90, 0, 2351);
			add_location(h412, file$k, 92, 0, 2379);
			add_location(h413, file$k, 98, 0, 2543);
			add_location(h414, file$k, 104, 0, 2739);
			add_location(h415, file$k, 110, 0, 2920);
			add_location(hr4, file$k, 117, 0, 3102);
			add_location(h35, file$k, 118, 0, 3107);
			add_location(h416, file$k, 120, 0, 3138);
			add_location(h417, file$k, 126, 0, 3326);
			add_location(h418, file$k, 132, 0, 3546);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, h2, anchor);
			insert_dev(target, t1, anchor);
			insert_dev(target, h30, anchor);
			insert_dev(target, t3, anchor);
			insert_dev(target, h40, anchor);
			insert_dev(target, t5, anchor);
			mount_component(button0, target, anchor);
			insert_dev(target, t6, anchor);
			mount_component(button1, target, anchor);
			insert_dev(target, t7, anchor);
			mount_component(button2, target, anchor);
			insert_dev(target, t8, anchor);
			mount_component(button3, target, anchor);
			insert_dev(target, t9, anchor);
			insert_dev(target, h41, anchor);
			insert_dev(target, t11, anchor);
			mount_component(button4, target, anchor);
			insert_dev(target, t12, anchor);
			mount_component(button5, target, anchor);
			insert_dev(target, t13, anchor);
			mount_component(button6, target, anchor);
			insert_dev(target, t14, anchor);
			mount_component(button7, target, anchor);
			insert_dev(target, t15, anchor);
			insert_dev(target, h42, anchor);
			insert_dev(target, t17, anchor);
			mount_component(button8, target, anchor);
			insert_dev(target, t18, anchor);
			mount_component(button9, target, anchor);
			insert_dev(target, t19, anchor);
			mount_component(button10, target, anchor);
			insert_dev(target, t20, anchor);
			mount_component(button11, target, anchor);
			insert_dev(target, t21, anchor);
			insert_dev(target, hr0, anchor);
			insert_dev(target, t22, anchor);
			insert_dev(target, h31, anchor);
			insert_dev(target, t24, anchor);
			insert_dev(target, h43, anchor);
			insert_dev(target, t26, anchor);
			mount_component(button12, target, anchor);
			insert_dev(target, t27, anchor);
			mount_component(button13, target, anchor);
			insert_dev(target, t28, anchor);
			mount_component(button14, target, anchor);
			insert_dev(target, t29, anchor);
			mount_component(button15, target, anchor);
			insert_dev(target, t30, anchor);
			insert_dev(target, h44, anchor);
			insert_dev(target, t32, anchor);
			mount_component(button16, target, anchor);
			insert_dev(target, t33, anchor);
			mount_component(button17, target, anchor);
			insert_dev(target, t34, anchor);
			mount_component(button18, target, anchor);
			insert_dev(target, t35, anchor);
			mount_component(button19, target, anchor);
			insert_dev(target, t36, anchor);
			insert_dev(target, h45, anchor);
			insert_dev(target, t38, anchor);
			mount_component(button20, target, anchor);
			insert_dev(target, t39, anchor);
			mount_component(button21, target, anchor);
			insert_dev(target, t40, anchor);
			mount_component(button22, target, anchor);
			insert_dev(target, t41, anchor);
			mount_component(button23, target, anchor);
			insert_dev(target, t42, anchor);
			insert_dev(target, hr1, anchor);
			insert_dev(target, t43, anchor);
			insert_dev(target, h32, anchor);
			insert_dev(target, t45, anchor);
			insert_dev(target, h46, anchor);
			insert_dev(target, t47, anchor);
			mount_component(button24, target, anchor);
			insert_dev(target, t48, anchor);
			mount_component(button25, target, anchor);
			insert_dev(target, t49, anchor);
			mount_component(button26, target, anchor);
			insert_dev(target, t50, anchor);
			mount_component(button27, target, anchor);
			insert_dev(target, t51, anchor);
			insert_dev(target, h47, anchor);
			insert_dev(target, t53, anchor);
			mount_component(button28, target, anchor);
			insert_dev(target, t54, anchor);
			mount_component(button29, target, anchor);
			insert_dev(target, t55, anchor);
			mount_component(button30, target, anchor);
			insert_dev(target, t56, anchor);
			mount_component(button31, target, anchor);
			insert_dev(target, t57, anchor);
			insert_dev(target, h48, anchor);
			insert_dev(target, t59, anchor);
			mount_component(button32, target, anchor);
			insert_dev(target, t60, anchor);
			mount_component(button33, target, anchor);
			insert_dev(target, t61, anchor);
			mount_component(button34, target, anchor);
			insert_dev(target, t62, anchor);
			mount_component(button35, target, anchor);
			insert_dev(target, t63, anchor);
			insert_dev(target, hr2, anchor);
			insert_dev(target, t64, anchor);
			insert_dev(target, h33, anchor);
			insert_dev(target, t66, anchor);
			insert_dev(target, h49, anchor);
			insert_dev(target, t68, anchor);
			mount_component(button36, target, anchor);
			insert_dev(target, t69, anchor);
			mount_component(button37, target, anchor);
			insert_dev(target, t70, anchor);
			mount_component(button38, target, anchor);
			insert_dev(target, t71, anchor);
			mount_component(button39, target, anchor);
			insert_dev(target, t72, anchor);
			insert_dev(target, h410, anchor);
			insert_dev(target, t74, anchor);
			mount_component(button40, target, anchor);
			insert_dev(target, t75, anchor);
			mount_component(button41, target, anchor);
			insert_dev(target, t76, anchor);
			mount_component(button42, target, anchor);
			insert_dev(target, t77, anchor);
			mount_component(button43, target, anchor);
			insert_dev(target, t78, anchor);
			insert_dev(target, h411, anchor);
			insert_dev(target, t80, anchor);
			mount_component(button44, target, anchor);
			insert_dev(target, t81, anchor);
			mount_component(button45, target, anchor);
			insert_dev(target, t82, anchor);
			mount_component(button46, target, anchor);
			insert_dev(target, t83, anchor);
			mount_component(button47, target, anchor);
			insert_dev(target, t84, anchor);
			insert_dev(target, hr3, anchor);
			insert_dev(target, t85, anchor);
			insert_dev(target, h34, anchor);
			insert_dev(target, t87, anchor);
			insert_dev(target, h412, anchor);
			insert_dev(target, t89, anchor);
			mount_component(button48, target, anchor);
			insert_dev(target, t90, anchor);
			mount_component(button49, target, anchor);
			insert_dev(target, t91, anchor);
			mount_component(button50, target, anchor);
			insert_dev(target, t92, anchor);
			mount_component(button51, target, anchor);
			insert_dev(target, t93, anchor);
			insert_dev(target, h413, anchor);
			insert_dev(target, t95, anchor);
			mount_component(button52, target, anchor);
			insert_dev(target, t96, anchor);
			mount_component(button53, target, anchor);
			insert_dev(target, t97, anchor);
			mount_component(button54, target, anchor);
			insert_dev(target, t98, anchor);
			mount_component(button55, target, anchor);
			insert_dev(target, t99, anchor);
			insert_dev(target, h414, anchor);
			insert_dev(target, t101, anchor);
			mount_component(button56, target, anchor);
			insert_dev(target, t102, anchor);
			mount_component(button57, target, anchor);
			insert_dev(target, t103, anchor);
			mount_component(button58, target, anchor);
			insert_dev(target, t104, anchor);
			mount_component(button59, target, anchor);
			insert_dev(target, t105, anchor);
			insert_dev(target, h415, anchor);
			insert_dev(target, t107, anchor);
			mount_component(button60, target, anchor);
			insert_dev(target, t108, anchor);
			mount_component(button61, target, anchor);
			insert_dev(target, t109, anchor);
			mount_component(button62, target, anchor);
			insert_dev(target, t110, anchor);
			mount_component(button63, target, anchor);
			insert_dev(target, t111, anchor);
			insert_dev(target, hr4, anchor);
			insert_dev(target, t112, anchor);
			insert_dev(target, h35, anchor);
			insert_dev(target, t114, anchor);
			insert_dev(target, h416, anchor);
			insert_dev(target, t116, anchor);
			mount_component(button64, target, anchor);
			insert_dev(target, t117, anchor);
			mount_component(button65, target, anchor);
			insert_dev(target, t118, anchor);
			mount_component(button66, target, anchor);
			insert_dev(target, t119, anchor);
			mount_component(button67, target, anchor);
			insert_dev(target, t120, anchor);
			insert_dev(target, h417, anchor);
			insert_dev(target, t122, anchor);
			mount_component(button68, target, anchor);
			insert_dev(target, t123, anchor);
			mount_component(button69, target, anchor);
			insert_dev(target, t124, anchor);
			mount_component(button70, target, anchor);
			insert_dev(target, t125, anchor);
			mount_component(button71, target, anchor);
			insert_dev(target, t126, anchor);
			insert_dev(target, h418, anchor);
			insert_dev(target, t128, anchor);
			mount_component(button72, target, anchor);
			insert_dev(target, t129, anchor);
			mount_component(button73, target, anchor);
			insert_dev(target, t130, anchor);
			mount_component(button74, target, anchor);
			insert_dev(target, t131, anchor);
			mount_component(button75, target, anchor);
			current = true;
		},
		p: function update(ctx, [dirty]) {
			const button0_changes = {};

			if (dirty & /*$$scope*/ 1) {
				button0_changes.$$scope = { dirty, ctx };
			}

			button0.$set(button0_changes);
			const button1_changes = {};

			if (dirty & /*$$scope*/ 1) {
				button1_changes.$$scope = { dirty, ctx };
			}

			button1.$set(button1_changes);
			const button2_changes = {};

			if (dirty & /*$$scope*/ 1) {
				button2_changes.$$scope = { dirty, ctx };
			}

			button2.$set(button2_changes);
			const button3_changes = {};

			if (dirty & /*$$scope*/ 1) {
				button3_changes.$$scope = { dirty, ctx };
			}

			button3.$set(button3_changes);
			const button4_changes = {};

			if (dirty & /*$$scope*/ 1) {
				button4_changes.$$scope = { dirty, ctx };
			}

			button4.$set(button4_changes);
			const button5_changes = {};

			if (dirty & /*$$scope*/ 1) {
				button5_changes.$$scope = { dirty, ctx };
			}

			button5.$set(button5_changes);
			const button6_changes = {};

			if (dirty & /*$$scope*/ 1) {
				button6_changes.$$scope = { dirty, ctx };
			}

			button6.$set(button6_changes);
			const button7_changes = {};

			if (dirty & /*$$scope*/ 1) {
				button7_changes.$$scope = { dirty, ctx };
			}

			button7.$set(button7_changes);
			const button8_changes = {};

			if (dirty & /*$$scope*/ 1) {
				button8_changes.$$scope = { dirty, ctx };
			}

			button8.$set(button8_changes);
			const button9_changes = {};

			if (dirty & /*$$scope*/ 1) {
				button9_changes.$$scope = { dirty, ctx };
			}

			button9.$set(button9_changes);
			const button10_changes = {};

			if (dirty & /*$$scope*/ 1) {
				button10_changes.$$scope = { dirty, ctx };
			}

			button10.$set(button10_changes);
			const button11_changes = {};

			if (dirty & /*$$scope*/ 1) {
				button11_changes.$$scope = { dirty, ctx };
			}

			button11.$set(button11_changes);
			const button12_changes = {};

			if (dirty & /*$$scope*/ 1) {
				button12_changes.$$scope = { dirty, ctx };
			}

			button12.$set(button12_changes);
			const button13_changes = {};

			if (dirty & /*$$scope*/ 1) {
				button13_changes.$$scope = { dirty, ctx };
			}

			button13.$set(button13_changes);
			const button14_changes = {};

			if (dirty & /*$$scope*/ 1) {
				button14_changes.$$scope = { dirty, ctx };
			}

			button14.$set(button14_changes);
			const button15_changes = {};

			if (dirty & /*$$scope*/ 1) {
				button15_changes.$$scope = { dirty, ctx };
			}

			button15.$set(button15_changes);
			const button16_changes = {};

			if (dirty & /*$$scope*/ 1) {
				button16_changes.$$scope = { dirty, ctx };
			}

			button16.$set(button16_changes);
			const button17_changes = {};

			if (dirty & /*$$scope*/ 1) {
				button17_changes.$$scope = { dirty, ctx };
			}

			button17.$set(button17_changes);
			const button18_changes = {};

			if (dirty & /*$$scope*/ 1) {
				button18_changes.$$scope = { dirty, ctx };
			}

			button18.$set(button18_changes);
			const button19_changes = {};

			if (dirty & /*$$scope*/ 1) {
				button19_changes.$$scope = { dirty, ctx };
			}

			button19.$set(button19_changes);
			const button20_changes = {};

			if (dirty & /*$$scope*/ 1) {
				button20_changes.$$scope = { dirty, ctx };
			}

			button20.$set(button20_changes);
			const button21_changes = {};

			if (dirty & /*$$scope*/ 1) {
				button21_changes.$$scope = { dirty, ctx };
			}

			button21.$set(button21_changes);
			const button22_changes = {};

			if (dirty & /*$$scope*/ 1) {
				button22_changes.$$scope = { dirty, ctx };
			}

			button22.$set(button22_changes);
			const button23_changes = {};

			if (dirty & /*$$scope*/ 1) {
				button23_changes.$$scope = { dirty, ctx };
			}

			button23.$set(button23_changes);
			const button24_changes = {};

			if (dirty & /*$$scope*/ 1) {
				button24_changes.$$scope = { dirty, ctx };
			}

			button24.$set(button24_changes);
			const button25_changes = {};

			if (dirty & /*$$scope*/ 1) {
				button25_changes.$$scope = { dirty, ctx };
			}

			button25.$set(button25_changes);
			const button26_changes = {};

			if (dirty & /*$$scope*/ 1) {
				button26_changes.$$scope = { dirty, ctx };
			}

			button26.$set(button26_changes);
			const button27_changes = {};

			if (dirty & /*$$scope*/ 1) {
				button27_changes.$$scope = { dirty, ctx };
			}

			button27.$set(button27_changes);
			const button28_changes = {};

			if (dirty & /*$$scope*/ 1) {
				button28_changes.$$scope = { dirty, ctx };
			}

			button28.$set(button28_changes);
			const button29_changes = {};

			if (dirty & /*$$scope*/ 1) {
				button29_changes.$$scope = { dirty, ctx };
			}

			button29.$set(button29_changes);
			const button30_changes = {};

			if (dirty & /*$$scope*/ 1) {
				button30_changes.$$scope = { dirty, ctx };
			}

			button30.$set(button30_changes);
			const button31_changes = {};

			if (dirty & /*$$scope*/ 1) {
				button31_changes.$$scope = { dirty, ctx };
			}

			button31.$set(button31_changes);
			const button32_changes = {};

			if (dirty & /*$$scope*/ 1) {
				button32_changes.$$scope = { dirty, ctx };
			}

			button32.$set(button32_changes);
			const button33_changes = {};

			if (dirty & /*$$scope*/ 1) {
				button33_changes.$$scope = { dirty, ctx };
			}

			button33.$set(button33_changes);
			const button34_changes = {};

			if (dirty & /*$$scope*/ 1) {
				button34_changes.$$scope = { dirty, ctx };
			}

			button34.$set(button34_changes);
			const button35_changes = {};

			if (dirty & /*$$scope*/ 1) {
				button35_changes.$$scope = { dirty, ctx };
			}

			button35.$set(button35_changes);
			const button36_changes = {};

			if (dirty & /*$$scope*/ 1) {
				button36_changes.$$scope = { dirty, ctx };
			}

			button36.$set(button36_changes);
			const button37_changes = {};

			if (dirty & /*$$scope*/ 1) {
				button37_changes.$$scope = { dirty, ctx };
			}

			button37.$set(button37_changes);
			const button38_changes = {};

			if (dirty & /*$$scope*/ 1) {
				button38_changes.$$scope = { dirty, ctx };
			}

			button38.$set(button38_changes);
			const button39_changes = {};

			if (dirty & /*$$scope*/ 1) {
				button39_changes.$$scope = { dirty, ctx };
			}

			button39.$set(button39_changes);
			const button40_changes = {};

			if (dirty & /*$$scope*/ 1) {
				button40_changes.$$scope = { dirty, ctx };
			}

			button40.$set(button40_changes);
			const button41_changes = {};

			if (dirty & /*$$scope*/ 1) {
				button41_changes.$$scope = { dirty, ctx };
			}

			button41.$set(button41_changes);
			const button42_changes = {};

			if (dirty & /*$$scope*/ 1) {
				button42_changes.$$scope = { dirty, ctx };
			}

			button42.$set(button42_changes);
			const button43_changes = {};

			if (dirty & /*$$scope*/ 1) {
				button43_changes.$$scope = { dirty, ctx };
			}

			button43.$set(button43_changes);
			const button44_changes = {};

			if (dirty & /*$$scope*/ 1) {
				button44_changes.$$scope = { dirty, ctx };
			}

			button44.$set(button44_changes);
			const button45_changes = {};

			if (dirty & /*$$scope*/ 1) {
				button45_changes.$$scope = { dirty, ctx };
			}

			button45.$set(button45_changes);
			const button46_changes = {};

			if (dirty & /*$$scope*/ 1) {
				button46_changes.$$scope = { dirty, ctx };
			}

			button46.$set(button46_changes);
			const button47_changes = {};

			if (dirty & /*$$scope*/ 1) {
				button47_changes.$$scope = { dirty, ctx };
			}

			button47.$set(button47_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(button0.$$.fragment, local);
			transition_in(button1.$$.fragment, local);
			transition_in(button2.$$.fragment, local);
			transition_in(button3.$$.fragment, local);
			transition_in(button4.$$.fragment, local);
			transition_in(button5.$$.fragment, local);
			transition_in(button6.$$.fragment, local);
			transition_in(button7.$$.fragment, local);
			transition_in(button8.$$.fragment, local);
			transition_in(button9.$$.fragment, local);
			transition_in(button10.$$.fragment, local);
			transition_in(button11.$$.fragment, local);
			transition_in(button12.$$.fragment, local);
			transition_in(button13.$$.fragment, local);
			transition_in(button14.$$.fragment, local);
			transition_in(button15.$$.fragment, local);
			transition_in(button16.$$.fragment, local);
			transition_in(button17.$$.fragment, local);
			transition_in(button18.$$.fragment, local);
			transition_in(button19.$$.fragment, local);
			transition_in(button20.$$.fragment, local);
			transition_in(button21.$$.fragment, local);
			transition_in(button22.$$.fragment, local);
			transition_in(button23.$$.fragment, local);
			transition_in(button24.$$.fragment, local);
			transition_in(button25.$$.fragment, local);
			transition_in(button26.$$.fragment, local);
			transition_in(button27.$$.fragment, local);
			transition_in(button28.$$.fragment, local);
			transition_in(button29.$$.fragment, local);
			transition_in(button30.$$.fragment, local);
			transition_in(button31.$$.fragment, local);
			transition_in(button32.$$.fragment, local);
			transition_in(button33.$$.fragment, local);
			transition_in(button34.$$.fragment, local);
			transition_in(button35.$$.fragment, local);
			transition_in(button36.$$.fragment, local);
			transition_in(button37.$$.fragment, local);
			transition_in(button38.$$.fragment, local);
			transition_in(button39.$$.fragment, local);
			transition_in(button40.$$.fragment, local);
			transition_in(button41.$$.fragment, local);
			transition_in(button42.$$.fragment, local);
			transition_in(button43.$$.fragment, local);
			transition_in(button44.$$.fragment, local);
			transition_in(button45.$$.fragment, local);
			transition_in(button46.$$.fragment, local);
			transition_in(button47.$$.fragment, local);
			transition_in(button48.$$.fragment, local);
			transition_in(button49.$$.fragment, local);
			transition_in(button50.$$.fragment, local);
			transition_in(button51.$$.fragment, local);
			transition_in(button52.$$.fragment, local);
			transition_in(button53.$$.fragment, local);
			transition_in(button54.$$.fragment, local);
			transition_in(button55.$$.fragment, local);
			transition_in(button56.$$.fragment, local);
			transition_in(button57.$$.fragment, local);
			transition_in(button58.$$.fragment, local);
			transition_in(button59.$$.fragment, local);
			transition_in(button60.$$.fragment, local);
			transition_in(button61.$$.fragment, local);
			transition_in(button62.$$.fragment, local);
			transition_in(button63.$$.fragment, local);
			transition_in(button64.$$.fragment, local);
			transition_in(button65.$$.fragment, local);
			transition_in(button66.$$.fragment, local);
			transition_in(button67.$$.fragment, local);
			transition_in(button68.$$.fragment, local);
			transition_in(button69.$$.fragment, local);
			transition_in(button70.$$.fragment, local);
			transition_in(button71.$$.fragment, local);
			transition_in(button72.$$.fragment, local);
			transition_in(button73.$$.fragment, local);
			transition_in(button74.$$.fragment, local);
			transition_in(button75.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(button0.$$.fragment, local);
			transition_out(button1.$$.fragment, local);
			transition_out(button2.$$.fragment, local);
			transition_out(button3.$$.fragment, local);
			transition_out(button4.$$.fragment, local);
			transition_out(button5.$$.fragment, local);
			transition_out(button6.$$.fragment, local);
			transition_out(button7.$$.fragment, local);
			transition_out(button8.$$.fragment, local);
			transition_out(button9.$$.fragment, local);
			transition_out(button10.$$.fragment, local);
			transition_out(button11.$$.fragment, local);
			transition_out(button12.$$.fragment, local);
			transition_out(button13.$$.fragment, local);
			transition_out(button14.$$.fragment, local);
			transition_out(button15.$$.fragment, local);
			transition_out(button16.$$.fragment, local);
			transition_out(button17.$$.fragment, local);
			transition_out(button18.$$.fragment, local);
			transition_out(button19.$$.fragment, local);
			transition_out(button20.$$.fragment, local);
			transition_out(button21.$$.fragment, local);
			transition_out(button22.$$.fragment, local);
			transition_out(button23.$$.fragment, local);
			transition_out(button24.$$.fragment, local);
			transition_out(button25.$$.fragment, local);
			transition_out(button26.$$.fragment, local);
			transition_out(button27.$$.fragment, local);
			transition_out(button28.$$.fragment, local);
			transition_out(button29.$$.fragment, local);
			transition_out(button30.$$.fragment, local);
			transition_out(button31.$$.fragment, local);
			transition_out(button32.$$.fragment, local);
			transition_out(button33.$$.fragment, local);
			transition_out(button34.$$.fragment, local);
			transition_out(button35.$$.fragment, local);
			transition_out(button36.$$.fragment, local);
			transition_out(button37.$$.fragment, local);
			transition_out(button38.$$.fragment, local);
			transition_out(button39.$$.fragment, local);
			transition_out(button40.$$.fragment, local);
			transition_out(button41.$$.fragment, local);
			transition_out(button42.$$.fragment, local);
			transition_out(button43.$$.fragment, local);
			transition_out(button44.$$.fragment, local);
			transition_out(button45.$$.fragment, local);
			transition_out(button46.$$.fragment, local);
			transition_out(button47.$$.fragment, local);
			transition_out(button48.$$.fragment, local);
			transition_out(button49.$$.fragment, local);
			transition_out(button50.$$.fragment, local);
			transition_out(button51.$$.fragment, local);
			transition_out(button52.$$.fragment, local);
			transition_out(button53.$$.fragment, local);
			transition_out(button54.$$.fragment, local);
			transition_out(button55.$$.fragment, local);
			transition_out(button56.$$.fragment, local);
			transition_out(button57.$$.fragment, local);
			transition_out(button58.$$.fragment, local);
			transition_out(button59.$$.fragment, local);
			transition_out(button60.$$.fragment, local);
			transition_out(button61.$$.fragment, local);
			transition_out(button62.$$.fragment, local);
			transition_out(button63.$$.fragment, local);
			transition_out(button64.$$.fragment, local);
			transition_out(button65.$$.fragment, local);
			transition_out(button66.$$.fragment, local);
			transition_out(button67.$$.fragment, local);
			transition_out(button68.$$.fragment, local);
			transition_out(button69.$$.fragment, local);
			transition_out(button70.$$.fragment, local);
			transition_out(button71.$$.fragment, local);
			transition_out(button72.$$.fragment, local);
			transition_out(button73.$$.fragment, local);
			transition_out(button74.$$.fragment, local);
			transition_out(button75.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(h2);
			if (detaching) detach_dev(t1);
			if (detaching) detach_dev(h30);
			if (detaching) detach_dev(t3);
			if (detaching) detach_dev(h40);
			if (detaching) detach_dev(t5);
			destroy_component(button0, detaching);
			if (detaching) detach_dev(t6);
			destroy_component(button1, detaching);
			if (detaching) detach_dev(t7);
			destroy_component(button2, detaching);
			if (detaching) detach_dev(t8);
			destroy_component(button3, detaching);
			if (detaching) detach_dev(t9);
			if (detaching) detach_dev(h41);
			if (detaching) detach_dev(t11);
			destroy_component(button4, detaching);
			if (detaching) detach_dev(t12);
			destroy_component(button5, detaching);
			if (detaching) detach_dev(t13);
			destroy_component(button6, detaching);
			if (detaching) detach_dev(t14);
			destroy_component(button7, detaching);
			if (detaching) detach_dev(t15);
			if (detaching) detach_dev(h42);
			if (detaching) detach_dev(t17);
			destroy_component(button8, detaching);
			if (detaching) detach_dev(t18);
			destroy_component(button9, detaching);
			if (detaching) detach_dev(t19);
			destroy_component(button10, detaching);
			if (detaching) detach_dev(t20);
			destroy_component(button11, detaching);
			if (detaching) detach_dev(t21);
			if (detaching) detach_dev(hr0);
			if (detaching) detach_dev(t22);
			if (detaching) detach_dev(h31);
			if (detaching) detach_dev(t24);
			if (detaching) detach_dev(h43);
			if (detaching) detach_dev(t26);
			destroy_component(button12, detaching);
			if (detaching) detach_dev(t27);
			destroy_component(button13, detaching);
			if (detaching) detach_dev(t28);
			destroy_component(button14, detaching);
			if (detaching) detach_dev(t29);
			destroy_component(button15, detaching);
			if (detaching) detach_dev(t30);
			if (detaching) detach_dev(h44);
			if (detaching) detach_dev(t32);
			destroy_component(button16, detaching);
			if (detaching) detach_dev(t33);
			destroy_component(button17, detaching);
			if (detaching) detach_dev(t34);
			destroy_component(button18, detaching);
			if (detaching) detach_dev(t35);
			destroy_component(button19, detaching);
			if (detaching) detach_dev(t36);
			if (detaching) detach_dev(h45);
			if (detaching) detach_dev(t38);
			destroy_component(button20, detaching);
			if (detaching) detach_dev(t39);
			destroy_component(button21, detaching);
			if (detaching) detach_dev(t40);
			destroy_component(button22, detaching);
			if (detaching) detach_dev(t41);
			destroy_component(button23, detaching);
			if (detaching) detach_dev(t42);
			if (detaching) detach_dev(hr1);
			if (detaching) detach_dev(t43);
			if (detaching) detach_dev(h32);
			if (detaching) detach_dev(t45);
			if (detaching) detach_dev(h46);
			if (detaching) detach_dev(t47);
			destroy_component(button24, detaching);
			if (detaching) detach_dev(t48);
			destroy_component(button25, detaching);
			if (detaching) detach_dev(t49);
			destroy_component(button26, detaching);
			if (detaching) detach_dev(t50);
			destroy_component(button27, detaching);
			if (detaching) detach_dev(t51);
			if (detaching) detach_dev(h47);
			if (detaching) detach_dev(t53);
			destroy_component(button28, detaching);
			if (detaching) detach_dev(t54);
			destroy_component(button29, detaching);
			if (detaching) detach_dev(t55);
			destroy_component(button30, detaching);
			if (detaching) detach_dev(t56);
			destroy_component(button31, detaching);
			if (detaching) detach_dev(t57);
			if (detaching) detach_dev(h48);
			if (detaching) detach_dev(t59);
			destroy_component(button32, detaching);
			if (detaching) detach_dev(t60);
			destroy_component(button33, detaching);
			if (detaching) detach_dev(t61);
			destroy_component(button34, detaching);
			if (detaching) detach_dev(t62);
			destroy_component(button35, detaching);
			if (detaching) detach_dev(t63);
			if (detaching) detach_dev(hr2);
			if (detaching) detach_dev(t64);
			if (detaching) detach_dev(h33);
			if (detaching) detach_dev(t66);
			if (detaching) detach_dev(h49);
			if (detaching) detach_dev(t68);
			destroy_component(button36, detaching);
			if (detaching) detach_dev(t69);
			destroy_component(button37, detaching);
			if (detaching) detach_dev(t70);
			destroy_component(button38, detaching);
			if (detaching) detach_dev(t71);
			destroy_component(button39, detaching);
			if (detaching) detach_dev(t72);
			if (detaching) detach_dev(h410);
			if (detaching) detach_dev(t74);
			destroy_component(button40, detaching);
			if (detaching) detach_dev(t75);
			destroy_component(button41, detaching);
			if (detaching) detach_dev(t76);
			destroy_component(button42, detaching);
			if (detaching) detach_dev(t77);
			destroy_component(button43, detaching);
			if (detaching) detach_dev(t78);
			if (detaching) detach_dev(h411);
			if (detaching) detach_dev(t80);
			destroy_component(button44, detaching);
			if (detaching) detach_dev(t81);
			destroy_component(button45, detaching);
			if (detaching) detach_dev(t82);
			destroy_component(button46, detaching);
			if (detaching) detach_dev(t83);
			destroy_component(button47, detaching);
			if (detaching) detach_dev(t84);
			if (detaching) detach_dev(hr3);
			if (detaching) detach_dev(t85);
			if (detaching) detach_dev(h34);
			if (detaching) detach_dev(t87);
			if (detaching) detach_dev(h412);
			if (detaching) detach_dev(t89);
			destroy_component(button48, detaching);
			if (detaching) detach_dev(t90);
			destroy_component(button49, detaching);
			if (detaching) detach_dev(t91);
			destroy_component(button50, detaching);
			if (detaching) detach_dev(t92);
			destroy_component(button51, detaching);
			if (detaching) detach_dev(t93);
			if (detaching) detach_dev(h413);
			if (detaching) detach_dev(t95);
			destroy_component(button52, detaching);
			if (detaching) detach_dev(t96);
			destroy_component(button53, detaching);
			if (detaching) detach_dev(t97);
			destroy_component(button54, detaching);
			if (detaching) detach_dev(t98);
			destroy_component(button55, detaching);
			if (detaching) detach_dev(t99);
			if (detaching) detach_dev(h414);
			if (detaching) detach_dev(t101);
			destroy_component(button56, detaching);
			if (detaching) detach_dev(t102);
			destroy_component(button57, detaching);
			if (detaching) detach_dev(t103);
			destroy_component(button58, detaching);
			if (detaching) detach_dev(t104);
			destroy_component(button59, detaching);
			if (detaching) detach_dev(t105);
			if (detaching) detach_dev(h415);
			if (detaching) detach_dev(t107);
			destroy_component(button60, detaching);
			if (detaching) detach_dev(t108);
			destroy_component(button61, detaching);
			if (detaching) detach_dev(t109);
			destroy_component(button62, detaching);
			if (detaching) detach_dev(t110);
			destroy_component(button63, detaching);
			if (detaching) detach_dev(t111);
			if (detaching) detach_dev(hr4);
			if (detaching) detach_dev(t112);
			if (detaching) detach_dev(h35);
			if (detaching) detach_dev(t114);
			if (detaching) detach_dev(h416);
			if (detaching) detach_dev(t116);
			destroy_component(button64, detaching);
			if (detaching) detach_dev(t117);
			destroy_component(button65, detaching);
			if (detaching) detach_dev(t118);
			destroy_component(button66, detaching);
			if (detaching) detach_dev(t119);
			destroy_component(button67, detaching);
			if (detaching) detach_dev(t120);
			if (detaching) detach_dev(h417);
			if (detaching) detach_dev(t122);
			destroy_component(button68, detaching);
			if (detaching) detach_dev(t123);
			destroy_component(button69, detaching);
			if (detaching) detach_dev(t124);
			destroy_component(button70, detaching);
			if (detaching) detach_dev(t125);
			destroy_component(button71, detaching);
			if (detaching) detach_dev(t126);
			if (detaching) detach_dev(h418);
			if (detaching) detach_dev(t128);
			destroy_component(button72, detaching);
			if (detaching) detach_dev(t129);
			destroy_component(button73, detaching);
			if (detaching) detach_dev(t130);
			destroy_component(button74, detaching);
			if (detaching) detach_dev(t131);
			destroy_component(button75, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$k.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$k($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots('Button', slots, []);
	const writable_props = [];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Button> was created with unknown prop '${key}'`);
	});

	$$self.$capture_state = () => ({ Button });
	return [];
}

class Button_1 extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$k, create_fragment$k, safe_not_equal, {});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Button_1",
			options,
			id: create_fragment$k.name
		});
	}
}

/* docs/components/context-menu.svelte generated by Svelte v3.46.4 */
const file$j = "docs/components/context-menu.svelte";

// (8:1) <Item on:click="{newTab}">
function create_default_slot_7$1(ctx) {
	let icon;
	let t;
	let current;
	icon = new Icon({ props: { name: "plus" }, $$inline: true });

	const block = {
		c: function create() {
			create_component(icon.$$.fragment);
			t = text(" New Tab");
		},
		m: function mount(target, anchor) {
			mount_component(icon, target, anchor);
			insert_dev(target, t, anchor);
			current = true;
		},
		p: noop,
		i: function intro(local) {
			if (current) return;
			transition_in(icon.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(icon.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(icon, detaching);
			if (detaching) detach_dev(t);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_7$1.name,
		type: "slot",
		source: "(8:1) <Item on:click=\\\"{newTab}\\\">",
		ctx
	});

	return block;
}

// (9:1) <Item on:click="{newPrivateTab}">
function create_default_slot_6$1(ctx) {
	let icon;
	let t;
	let current;
	icon = new Icon({ props: { name: "" }, $$inline: true });

	const block = {
		c: function create() {
			create_component(icon.$$.fragment);
			t = text(" New Private Tab");
		},
		m: function mount(target, anchor) {
			mount_component(icon, target, anchor);
			insert_dev(target, t, anchor);
			current = true;
		},
		p: noop,
		i: function intro(local) {
			if (current) return;
			transition_in(icon.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(icon.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(icon, detaching);
			if (detaching) detach_dev(t);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_6$1.name,
		type: "slot",
		source: "(9:1) <Item on:click=\\\"{newPrivateTab}\\\">",
		ctx
	});

	return block;
}

// (11:1) <Item on:click="{closeTabs}">
function create_default_slot_5$1(ctx) {
	let icon;
	let t0;
	let t1;
	let current;
	icon = new Icon({ props: { name: "close" }, $$inline: true });

	const block = {
		c: function create() {
			create_component(icon.$$.fragment);
			t0 = space();
			t1 = text(/*closeTabsText*/ ctx[2]);
		},
		m: function mount(target, anchor) {
			mount_component(icon, target, anchor);
			insert_dev(target, t0, anchor);
			insert_dev(target, t1, anchor);
			current = true;
		},
		p: function update(ctx, dirty) {
			if (!current || dirty & /*closeTabsText*/ 4) set_data_dev(t1, /*closeTabsText*/ ctx[2]);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(icon.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(icon.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(icon, detaching);
			if (detaching) detach_dev(t0);
			if (detaching) detach_dev(t1);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_5$1.name,
		type: "slot",
		source: "(11:1) <Item on:click=\\\"{closeTabs}\\\">",
		ctx
	});

	return block;
}

// (7:0) <Menu targetSelector=".div1" bind:this="{menu1}" on:close="{onMenu1close}">
function create_default_slot_4$2(ctx) {
	let item0;
	let t0;
	let item1;
	let t1;
	let separator;
	let t2;
	let item2;
	let current;

	item0 = new Menu_item({
			props: {
				$$slots: { default: [create_default_slot_7$1] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	item0.$on("click", /*newTab*/ ctx[3]);

	item1 = new Menu_item({
			props: {
				$$slots: { default: [create_default_slot_6$1] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	item1.$on("click", /*newPrivateTab*/ ctx[4]);
	separator = new Menu_separator({ $$inline: true });

	item2 = new Menu_item({
			props: {
				$$slots: { default: [create_default_slot_5$1] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	item2.$on("click", /*closeTabs*/ ctx[5]);

	const block = {
		c: function create() {
			create_component(item0.$$.fragment);
			t0 = space();
			create_component(item1.$$.fragment);
			t1 = space();
			create_component(separator.$$.fragment);
			t2 = space();
			create_component(item2.$$.fragment);
		},
		m: function mount(target, anchor) {
			mount_component(item0, target, anchor);
			insert_dev(target, t0, anchor);
			mount_component(item1, target, anchor);
			insert_dev(target, t1, anchor);
			mount_component(separator, target, anchor);
			insert_dev(target, t2, anchor);
			mount_component(item2, target, anchor);
			current = true;
		},
		p: function update(ctx, dirty) {
			const item0_changes = {};

			if (dirty & /*$$scope*/ 8192) {
				item0_changes.$$scope = { dirty, ctx };
			}

			item0.$set(item0_changes);
			const item1_changes = {};

			if (dirty & /*$$scope*/ 8192) {
				item1_changes.$$scope = { dirty, ctx };
			}

			item1.$set(item1_changes);
			const item2_changes = {};

			if (dirty & /*$$scope, closeTabsText*/ 8196) {
				item2_changes.$$scope = { dirty, ctx };
			}

			item2.$set(item2_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(item0.$$.fragment, local);
			transition_in(item1.$$.fragment, local);
			transition_in(separator.$$.fragment, local);
			transition_in(item2.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(item0.$$.fragment, local);
			transition_out(item1.$$.fragment, local);
			transition_out(separator.$$.fragment, local);
			transition_out(item2.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(item0, detaching);
			if (detaching) detach_dev(t0);
			destroy_component(item1, detaching);
			if (detaching) detach_dev(t1);
			destroy_component(separator, detaching);
			if (detaching) detach_dev(t2);
			destroy_component(item2, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_4$2.name,
		type: "slot",
		source: "(7:0) <Menu targetSelector=\\\".div1\\\" bind:this=\\\"{menu1}\\\" on:close=\\\"{onMenu1close}\\\">",
		ctx
	});

	return block;
}

// (15:1) <Item on:click="{newWindow}">
function create_default_slot_3$2(ctx) {
	let t;

	const block = {
		c: function create() {
			t = text("New window");
		},
		m: function mount(target, anchor) {
			insert_dev(target, t, anchor);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(t);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_3$2.name,
		type: "slot",
		source: "(15:1) <Item on:click=\\\"{newWindow}\\\">",
		ctx
	});

	return block;
}

// (16:1) <Item on:click="{newPrivateWindow}">
function create_default_slot_2$4(ctx) {
	let t;

	const block = {
		c: function create() {
			t = text("New private window");
		},
		m: function mount(target, anchor) {
			insert_dev(target, t, anchor);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(t);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_2$4.name,
		type: "slot",
		source: "(16:1) <Item on:click=\\\"{newPrivateWindow}\\\">",
		ctx
	});

	return block;
}

// (18:1) <Item on:click="{closeWindows}">
function create_default_slot_1$5(ctx) {
	let t;

	const block = {
		c: function create() {
			t = text("Close All Windows");
		},
		m: function mount(target, anchor) {
			insert_dev(target, t, anchor);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(t);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_1$5.name,
		type: "slot",
		source: "(18:1) <Item on:click=\\\"{closeWindows}\\\">",
		ctx
	});

	return block;
}

// (14:0) <Menu targetSelector=".div2" bind:this="{menu2}">
function create_default_slot$6(ctx) {
	let item0;
	let t0;
	let item1;
	let t1;
	let separator;
	let t2;
	let item2;
	let current;

	item0 = new Menu_item({
			props: {
				$$slots: { default: [create_default_slot_3$2] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	item0.$on("click", /*newWindow*/ ctx[7]);

	item1 = new Menu_item({
			props: {
				$$slots: { default: [create_default_slot_2$4] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	item1.$on("click", /*newPrivateWindow*/ ctx[8]);
	separator = new Menu_separator({ $$inline: true });

	item2 = new Menu_item({
			props: {
				$$slots: { default: [create_default_slot_1$5] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	item2.$on("click", /*closeWindows*/ ctx[9]);

	const block = {
		c: function create() {
			create_component(item0.$$.fragment);
			t0 = space();
			create_component(item1.$$.fragment);
			t1 = space();
			create_component(separator.$$.fragment);
			t2 = space();
			create_component(item2.$$.fragment);
		},
		m: function mount(target, anchor) {
			mount_component(item0, target, anchor);
			insert_dev(target, t0, anchor);
			mount_component(item1, target, anchor);
			insert_dev(target, t1, anchor);
			mount_component(separator, target, anchor);
			insert_dev(target, t2, anchor);
			mount_component(item2, target, anchor);
			current = true;
		},
		p: function update(ctx, dirty) {
			const item0_changes = {};

			if (dirty & /*$$scope*/ 8192) {
				item0_changes.$$scope = { dirty, ctx };
			}

			item0.$set(item0_changes);
			const item1_changes = {};

			if (dirty & /*$$scope*/ 8192) {
				item1_changes.$$scope = { dirty, ctx };
			}

			item1.$set(item1_changes);
			const item2_changes = {};

			if (dirty & /*$$scope*/ 8192) {
				item2_changes.$$scope = { dirty, ctx };
			}

			item2.$set(item2_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(item0.$$.fragment, local);
			transition_in(item1.$$.fragment, local);
			transition_in(separator.$$.fragment, local);
			transition_in(item2.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(item0.$$.fragment, local);
			transition_out(item1.$$.fragment, local);
			transition_out(separator.$$.fragment, local);
			transition_out(item2.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(item0, detaching);
			if (detaching) detach_dev(t0);
			destroy_component(item1, detaching);
			if (detaching) detach_dev(t1);
			destroy_component(separator, detaching);
			if (detaching) detach_dev(t2);
			destroy_component(item2, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot$6.name,
		type: "slot",
		source: "(14:0) <Menu targetSelector=\\\".div2\\\" bind:this=\\\"{menu2}\\\">",
		ctx
	});

	return block;
}

function create_fragment$j(ctx) {
	let h2;
	let t1;
	let small;
	let t3;
	let div0;
	let t5;
	let div1;
	let t7;
	let menu0;
	let t8;
	let menu1_1;
	let current;

	let menu0_props = {
		targetSelector: ".div1",
		$$slots: { default: [create_default_slot_4$2] },
		$$scope: { ctx }
	};

	menu0 = new Menu({ props: menu0_props, $$inline: true });
	/*menu0_binding*/ ctx[10](menu0);
	menu0.$on("close", /*onMenu1close*/ ctx[6]);

	let menu1_1_props = {
		targetSelector: ".div2",
		$$slots: { default: [create_default_slot$6] },
		$$scope: { ctx }
	};

	menu1_1 = new Menu({ props: menu1_1_props, $$inline: true });
	/*menu1_1_binding*/ ctx[11](menu1_1);

	const block = {
		c: function create() {
			h2 = element("h2");
			h2.textContent = "Context menu";
			t1 = space();
			small = element("small");
			small.textContent = "(Right-click on the boxes below)";
			t3 = space();
			div0 = element("div");
			div0.textContent = "Tab";
			t5 = space();
			div1 = element("div");
			div1.textContent = "Window";
			t7 = space();
			create_component(menu0.$$.fragment);
			t8 = space();
			create_component(menu1_1.$$.fragment);
			add_location(h2, file$j, 0, 0, 0);
			add_location(small, file$j, 1, 0, 22);
			attr_dev(div0, "class", "div div1");
			add_location(div0, file$j, 3, 0, 71);
			attr_dev(div1, "class", "div div2");
			add_location(div1, file$j, 4, 0, 103);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, h2, anchor);
			insert_dev(target, t1, anchor);
			insert_dev(target, small, anchor);
			insert_dev(target, t3, anchor);
			insert_dev(target, div0, anchor);
			insert_dev(target, t5, anchor);
			insert_dev(target, div1, anchor);
			insert_dev(target, t7, anchor);
			mount_component(menu0, target, anchor);
			insert_dev(target, t8, anchor);
			mount_component(menu1_1, target, anchor);
			current = true;
		},
		p: function update(ctx, [dirty]) {
			const menu0_changes = {};

			if (dirty & /*$$scope, closeTabsText*/ 8196) {
				menu0_changes.$$scope = { dirty, ctx };
			}

			menu0.$set(menu0_changes);
			const menu1_1_changes = {};

			if (dirty & /*$$scope*/ 8192) {
				menu1_1_changes.$$scope = { dirty, ctx };
			}

			menu1_1.$set(menu1_1_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(menu0.$$.fragment, local);
			transition_in(menu1_1.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(menu0.$$.fragment, local);
			transition_out(menu1_1.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(h2);
			if (detaching) detach_dev(t1);
			if (detaching) detach_dev(small);
			if (detaching) detach_dev(t3);
			if (detaching) detach_dev(div0);
			if (detaching) detach_dev(t5);
			if (detaching) detach_dev(div1);
			if (detaching) detach_dev(t7);
			/*menu0_binding*/ ctx[10](null);
			destroy_component(menu0, detaching);
			if (detaching) detach_dev(t8);
			/*menu1_1_binding*/ ctx[11](null);
			destroy_component(menu1_1, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$j.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$j($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots('Context_menu', slots, []);
	let menu1, menu2;
	let closeTabsText = 'Close all tabs';
	let menu1timer;

	function newTab() {
		menu1.close().then(() => alert('New Tab clicked'));
	}

	function newPrivateTab() {
		menu1.close().then(() => alert('New Private Tab clicked'));
	}

	function closeTabs() {
		const initial = 'Close all tabs';
		const confrm = 'Confirm Closing';

		if (closeTabsText === initial) {
			$$invalidate(2, closeTabsText = confrm);
			menu1timer = setTimeout(() => $$invalidate(2, closeTabsText = initial), 2000);
		} else {
			menu1.close().then(() => alert('Closed all tabs!'));
		}
	}

	function onMenu1close() {
		$$invalidate(2, closeTabsText = 'Close all tabs');
		if (menu1timer) clearTimeout(menu1timer);
	}

	function newWindow() {
		menu2.close().then(() => alert('New Window clicked'));
	}

	function newPrivateWindow() {
		menu2.close().then(() => alert('New Private Window clicked'));
	}

	function closeWindows() {
		menu2.close().then(() => alert('Windows closed!'));
	}

	const writable_props = [];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Context_menu> was created with unknown prop '${key}'`);
	});

	function menu0_binding($$value) {
		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
			menu1 = $$value;
			$$invalidate(0, menu1);
		});
	}

	function menu1_1_binding($$value) {
		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
			menu2 = $$value;
			$$invalidate(1, menu2);
		});
	}

	$$self.$capture_state = () => ({
		Menu,
		Item: Menu_item,
		Separator: Menu_separator,
		Icon,
		menu1,
		menu2,
		closeTabsText,
		menu1timer,
		newTab,
		newPrivateTab,
		closeTabs,
		onMenu1close,
		newWindow,
		newPrivateWindow,
		closeWindows
	});

	$$self.$inject_state = $$props => {
		if ('menu1' in $$props) $$invalidate(0, menu1 = $$props.menu1);
		if ('menu2' in $$props) $$invalidate(1, menu2 = $$props.menu2);
		if ('closeTabsText' in $$props) $$invalidate(2, closeTabsText = $$props.closeTabsText);
		if ('menu1timer' in $$props) menu1timer = $$props.menu1timer;
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [
		menu1,
		menu2,
		closeTabsText,
		newTab,
		newPrivateTab,
		closeTabs,
		onMenu1close,
		newWindow,
		newPrivateWindow,
		closeWindows,
		menu0_binding,
		menu1_1_binding
	];
}

class Context_menu extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$j, create_fragment$j, safe_not_equal, {});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Context_menu",
			options,
			id: create_fragment$j.name
		});
	}
}

/* docs/components/icon.svelte generated by Svelte v3.46.4 */

const { Object: Object_1 } = globals;
const file$i = "docs/components/icon.svelte";

function get_each_context(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[0] = list[i];
	return child_ctx;
}

// (2:0) {#each Object.keys(icons) as icon}
function create_each_block(ctx) {
	let div2;
	let div0;
	let icon;
	let t0;
	let div1;
	let t1_value = /*icon*/ ctx[0] + "";
	let t1;
	let t2;
	let current;

	icon = new Icon({
			props: { name: /*icon*/ ctx[0] },
			$$inline: true
		});

	const block = {
		c: function create() {
			div2 = element("div");
			div0 = element("div");
			create_component(icon.$$.fragment);
			t0 = space();
			div1 = element("div");
			t1 = text(t1_value);
			t2 = space();
			attr_dev(div0, "class", "icon-block-icon");
			add_location(div0, file$i, 3, 2, 78);
			attr_dev(div1, "class", "icon-block-name");
			add_location(div1, file$i, 4, 2, 137);
			attr_dev(div2, "class", "icon-block");
			add_location(div2, file$i, 2, 1, 51);
		},
		m: function mount(target, anchor) {
			insert_dev(target, div2, anchor);
			append_dev(div2, div0);
			mount_component(icon, div0, null);
			append_dev(div2, t0);
			append_dev(div2, div1);
			append_dev(div1, t1);
			append_dev(div2, t2);
			current = true;
		},
		p: noop,
		i: function intro(local) {
			if (current) return;
			transition_in(icon.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(icon.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div2);
			destroy_component(icon);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_each_block.name,
		type: "each",
		source: "(2:0) {#each Object.keys(icons) as icon}",
		ctx
	});

	return block;
}

function create_fragment$i(ctx) {
	let h2;
	let t1;
	let each_1_anchor;
	let current;
	let each_value = Object.keys(icons);
	validate_each_argument(each_value);
	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
	}

	const out = i => transition_out(each_blocks[i], 1, 1, () => {
		each_blocks[i] = null;
	});

	const block = {
		c: function create() {
			h2 = element("h2");
			h2.textContent = "Icons";
			t1 = space();

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			each_1_anchor = empty();
			add_location(h2, file$i, 0, 0, 0);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, h2, anchor);
			insert_dev(target, t1, anchor);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(target, anchor);
			}

			insert_dev(target, each_1_anchor, anchor);
			current = true;
		},
		p: function update(ctx, [dirty]) {
			if (dirty & /*Object, icons*/ 0) {
				each_value = Object.keys(icons);
				validate_each_argument(each_value);
				let i;

				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
						transition_in(each_blocks[i], 1);
					} else {
						each_blocks[i] = create_each_block(child_ctx);
						each_blocks[i].c();
						transition_in(each_blocks[i], 1);
						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
					}
				}

				group_outros();

				for (i = each_value.length; i < each_blocks.length; i += 1) {
					out(i);
				}

				check_outros();
			}
		},
		i: function intro(local) {
			if (current) return;

			for (let i = 0; i < each_value.length; i += 1) {
				transition_in(each_blocks[i]);
			}

			current = true;
		},
		o: function outro(local) {
			each_blocks = each_blocks.filter(Boolean);

			for (let i = 0; i < each_blocks.length; i += 1) {
				transition_out(each_blocks[i]);
			}

			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(h2);
			if (detaching) detach_dev(t1);
			destroy_each(each_blocks, detaching);
			if (detaching) detach_dev(each_1_anchor);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$i.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$i($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots('Icon', slots, []);
	const writable_props = [];

	Object_1.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Icon> was created with unknown prop '${key}'`);
	});

	$$self.$capture_state = () => ({ Icon, icons });
	return [];
}

class Icon_1 extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$i, create_fragment$i, safe_not_equal, {});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Icon_1",
			options,
			id: create_fragment$i.name
		});
	}
}

/* docs/components/text-fit.svelte generated by Svelte v3.46.4 */
const file$h = "docs/components/text-fit.svelte";

// (3:47) <TextFit>
function create_default_slot_2$3(ctx) {
	let t;

	const block = {
		c: function create() {
			t = text(/*textFitText*/ ctx[0]);
		},
		m: function mount(target, anchor) {
			insert_dev(target, t, anchor);
		},
		p: function update(ctx, dirty) {
			if (dirty & /*textFitText*/ 1) set_data_dev(t, /*textFitText*/ ctx[0]);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(t);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_2$3.name,
		type: "slot",
		source: "(3:47) <TextFit>",
		ctx
	});

	return block;
}

// (4:47) <TextFit>
function create_default_slot_1$4(ctx) {
	let t;

	const block = {
		c: function create() {
			t = text(/*textFitText*/ ctx[0]);
		},
		m: function mount(target, anchor) {
			insert_dev(target, t, anchor);
		},
		p: function update(ctx, dirty) {
			if (dirty & /*textFitText*/ 1) set_data_dev(t, /*textFitText*/ ctx[0]);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(t);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_1$4.name,
		type: "slot",
		source: "(4:47) <TextFit>",
		ctx
	});

	return block;
}

// (5:47) <TextFit>
function create_default_slot$5(ctx) {
	let t;

	const block = {
		c: function create() {
			t = text(/*textFitText*/ ctx[0]);
		},
		m: function mount(target, anchor) {
			insert_dev(target, t, anchor);
		},
		p: function update(ctx, dirty) {
			if (dirty & /*textFitText*/ 1) set_data_dev(t, /*textFitText*/ ctx[0]);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(t);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot$5.name,
		type: "slot",
		source: "(5:47) <TextFit>",
		ctx
	});

	return block;
}

function create_fragment$h(ctx) {
	let h2;
	let t1;
	let input;
	let t2;
	let div0;
	let textfit0;
	let t3;
	let div1;
	let textfit1;
	let t4;
	let div2;
	let textfit2;
	let current;
	let mounted;
	let dispose;

	textfit0 = new Text_fit$1({
			props: {
				$$slots: { default: [create_default_slot_2$3] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	textfit1 = new Text_fit$1({
			props: {
				$$slots: { default: [create_default_slot_1$4] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	textfit2 = new Text_fit$1({
			props: {
				$$slots: { default: [create_default_slot$5] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	const block = {
		c: function create() {
			h2 = element("h2");
			h2.textContent = "Text-fit";
			t1 = space();
			input = element("input");
			t2 = space();
			div0 = element("div");
			create_component(textfit0.$$.fragment);
			t3 = space();
			div1 = element("div");
			create_component(textfit1.$$.fragment);
			t4 = space();
			div2 = element("div");
			create_component(textfit2.$$.fragment);
			add_location(h2, file$h, 0, 0, 0);
			attr_dev(input, "type", "text");
			add_location(input, file$h, 1, 0, 18);
			attr_dev(div0, "class", "text-fit-div");
			set_style(div0, "width", "100px");
			add_location(div0, file$h, 2, 0, 65);
			attr_dev(div1, "class", "text-fit-div");
			set_style(div1, "width", "200px");
			add_location(div1, file$h, 3, 0, 151);
			attr_dev(div2, "class", "text-fit-div");
			set_style(div2, "width", "300px");
			add_location(div2, file$h, 4, 0, 237);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, h2, anchor);
			insert_dev(target, t1, anchor);
			insert_dev(target, input, anchor);
			set_input_value(input, /*textFitText*/ ctx[0]);
			insert_dev(target, t2, anchor);
			insert_dev(target, div0, anchor);
			mount_component(textfit0, div0, null);
			insert_dev(target, t3, anchor);
			insert_dev(target, div1, anchor);
			mount_component(textfit1, div1, null);
			insert_dev(target, t4, anchor);
			insert_dev(target, div2, anchor);
			mount_component(textfit2, div2, null);
			current = true;

			if (!mounted) {
				dispose = listen_dev(input, "input", /*input_input_handler*/ ctx[1]);
				mounted = true;
			}
		},
		p: function update(ctx, [dirty]) {
			if (dirty & /*textFitText*/ 1 && input.value !== /*textFitText*/ ctx[0]) {
				set_input_value(input, /*textFitText*/ ctx[0]);
			}

			const textfit0_changes = {};

			if (dirty & /*$$scope, textFitText*/ 5) {
				textfit0_changes.$$scope = { dirty, ctx };
			}

			textfit0.$set(textfit0_changes);
			const textfit1_changes = {};

			if (dirty & /*$$scope, textFitText*/ 5) {
				textfit1_changes.$$scope = { dirty, ctx };
			}

			textfit1.$set(textfit1_changes);
			const textfit2_changes = {};

			if (dirty & /*$$scope, textFitText*/ 5) {
				textfit2_changes.$$scope = { dirty, ctx };
			}

			textfit2.$set(textfit2_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(textfit0.$$.fragment, local);
			transition_in(textfit1.$$.fragment, local);
			transition_in(textfit2.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(textfit0.$$.fragment, local);
			transition_out(textfit1.$$.fragment, local);
			transition_out(textfit2.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(h2);
			if (detaching) detach_dev(t1);
			if (detaching) detach_dev(input);
			if (detaching) detach_dev(t2);
			if (detaching) detach_dev(div0);
			destroy_component(textfit0);
			if (detaching) detach_dev(t3);
			if (detaching) detach_dev(div1);
			destroy_component(textfit1);
			if (detaching) detach_dev(t4);
			if (detaching) detach_dev(div2);
			destroy_component(textfit2);
			mounted = false;
			dispose();
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$h.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$h($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots('Text_fit', slots, []);
	let textFitText = 'My Lovely Text';
	const writable_props = [];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Text_fit> was created with unknown prop '${key}'`);
	});

	function input_input_handler() {
		textFitText = this.value;
		$$invalidate(0, textFitText);
	}

	$$self.$capture_state = () => ({ TextFit: Text_fit$1, textFitText });

	$$self.$inject_state = $$props => {
		if ('textFitText' in $$props) $$invalidate(0, textFitText = $$props.textFitText);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [textFitText, input_input_handler];
}

class Text_fit extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$h, create_fragment$h, safe_not_equal, {});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Text_fit",
			options,
			id: create_fragment$h.name
		});
	}
}

/* docs/components/toaster.svelte generated by Svelte v3.46.4 */

const { console: console_1$1 } = globals;
const file$g = "docs/components/toaster.svelte";

// (3:0) <Button on:click="{() => showToast('Hello')}">
function create_default_slot_4$1(ctx) {
	let t;

	const block = {
		c: function create() {
			t = text("Show info");
		},
		m: function mount(target, anchor) {
			insert_dev(target, t, anchor);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(t);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_4$1.name,
		type: "slot",
		source: "(3:0) <Button on:click=\\\"{() => showToast('Hello')}\\\">",
		ctx
	});

	return block;
}

// (4:0) <Button success on:click="{() => showToast('Hello', 'success')}">
function create_default_slot_3$1(ctx) {
	let t;

	const block = {
		c: function create() {
			t = text("Show warning");
		},
		m: function mount(target, anchor) {
			insert_dev(target, t, anchor);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(t);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_3$1.name,
		type: "slot",
		source: "(4:0) <Button success on:click=\\\"{() => showToast('Hello', 'success')}\\\">",
		ctx
	});

	return block;
}

// (5:0) <Button warning on:click="{() => showToast('Hello', 'warning')}">
function create_default_slot_2$2(ctx) {
	let t;

	const block = {
		c: function create() {
			t = text("Show warning");
		},
		m: function mount(target, anchor) {
			insert_dev(target, t, anchor);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(t);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_2$2.name,
		type: "slot",
		source: "(5:0) <Button warning on:click=\\\"{() => showToast('Hello', 'warning')}\\\">",
		ctx
	});

	return block;
}

// (6:0) <Button danger on:click="{() => showToast('Hello', 'error', 10000, 'Undo', cb)}">
function create_default_slot_1$3(ctx) {
	let t;

	const block = {
		c: function create() {
			t = text("Show error");
		},
		m: function mount(target, anchor) {
			insert_dev(target, t, anchor);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(t);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_1$3.name,
		type: "slot",
		source: "(6:0) <Button danger on:click=\\\"{() => showToast('Hello', 'error', 10000, 'Undo', cb)}\\\">",
		ctx
	});

	return block;
}

// (7:0) <Button danger on:click="{() => showToast('Hello', 'error', 100000, 'Undo', cb)}">
function create_default_slot$4(ctx) {
	let t;

	const block = {
		c: function create() {
			t = text("Show long-lasting error");
		},
		m: function mount(target, anchor) {
			insert_dev(target, t, anchor);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(t);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot$4.name,
		type: "slot",
		source: "(7:0) <Button danger on:click=\\\"{() => showToast('Hello', 'error', 100000, 'Undo', cb)}\\\">",
		ctx
	});

	return block;
}

function create_fragment$g(ctx) {
	let h2;
	let t1;
	let toaster;
	let t2;
	let button0;
	let t3;
	let button1;
	let t4;
	let button2;
	let t5;
	let button3;
	let t6;
	let button4;
	let current;

	toaster = new Toaster({
			props: { position: "bottom" },
			$$inline: true
		});

	button0 = new Button({
			props: {
				$$slots: { default: [create_default_slot_4$1] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	button0.$on("click", /*click_handler*/ ctx[1]);

	button1 = new Button({
			props: {
				success: true,
				$$slots: { default: [create_default_slot_3$1] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	button1.$on("click", /*click_handler_1*/ ctx[2]);

	button2 = new Button({
			props: {
				warning: true,
				$$slots: { default: [create_default_slot_2$2] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	button2.$on("click", /*click_handler_2*/ ctx[3]);

	button3 = new Button({
			props: {
				danger: true,
				$$slots: { default: [create_default_slot_1$3] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	button3.$on("click", /*click_handler_3*/ ctx[4]);

	button4 = new Button({
			props: {
				danger: true,
				$$slots: { default: [create_default_slot$4] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	button4.$on("click", /*click_handler_4*/ ctx[5]);

	const block = {
		c: function create() {
			h2 = element("h2");
			h2.textContent = "Toaster";
			t1 = space();
			create_component(toaster.$$.fragment);
			t2 = space();
			create_component(button0.$$.fragment);
			t3 = space();
			create_component(button1.$$.fragment);
			t4 = space();
			create_component(button2.$$.fragment);
			t5 = space();
			create_component(button3.$$.fragment);
			t6 = space();
			create_component(button4.$$.fragment);
			add_location(h2, file$g, 0, 0, 0);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, h2, anchor);
			insert_dev(target, t1, anchor);
			mount_component(toaster, target, anchor);
			insert_dev(target, t2, anchor);
			mount_component(button0, target, anchor);
			insert_dev(target, t3, anchor);
			mount_component(button1, target, anchor);
			insert_dev(target, t4, anchor);
			mount_component(button2, target, anchor);
			insert_dev(target, t5, anchor);
			mount_component(button3, target, anchor);
			insert_dev(target, t6, anchor);
			mount_component(button4, target, anchor);
			current = true;
		},
		p: function update(ctx, [dirty]) {
			const button0_changes = {};

			if (dirty & /*$$scope*/ 64) {
				button0_changes.$$scope = { dirty, ctx };
			}

			button0.$set(button0_changes);
			const button1_changes = {};

			if (dirty & /*$$scope*/ 64) {
				button1_changes.$$scope = { dirty, ctx };
			}

			button1.$set(button1_changes);
			const button2_changes = {};

			if (dirty & /*$$scope*/ 64) {
				button2_changes.$$scope = { dirty, ctx };
			}

			button2.$set(button2_changes);
			const button3_changes = {};

			if (dirty & /*$$scope*/ 64) {
				button3_changes.$$scope = { dirty, ctx };
			}

			button3.$set(button3_changes);
			const button4_changes = {};

			if (dirty & /*$$scope*/ 64) {
				button4_changes.$$scope = { dirty, ctx };
			}

			button4.$set(button4_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(toaster.$$.fragment, local);
			transition_in(button0.$$.fragment, local);
			transition_in(button1.$$.fragment, local);
			transition_in(button2.$$.fragment, local);
			transition_in(button3.$$.fragment, local);
			transition_in(button4.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(toaster.$$.fragment, local);
			transition_out(button0.$$.fragment, local);
			transition_out(button1.$$.fragment, local);
			transition_out(button2.$$.fragment, local);
			transition_out(button3.$$.fragment, local);
			transition_out(button4.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(h2);
			if (detaching) detach_dev(t1);
			destroy_component(toaster, detaching);
			if (detaching) detach_dev(t2);
			destroy_component(button0, detaching);
			if (detaching) detach_dev(t3);
			destroy_component(button1, detaching);
			if (detaching) detach_dev(t4);
			destroy_component(button2, detaching);
			if (detaching) detach_dev(t5);
			destroy_component(button3, detaching);
			if (detaching) detach_dev(t6);
			destroy_component(button4, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$g.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$g($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots('Toaster', slots, []);

	function cb(id) {
		console.log(id);
		hideToast(id);
	}

	const writable_props = [];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$1.warn(`<Toaster> was created with unknown prop '${key}'`);
	});

	const click_handler = () => showToast('Hello');
	const click_handler_1 = () => showToast('Hello', 'success');
	const click_handler_2 = () => showToast('Hello', 'warning');
	const click_handler_3 = () => showToast('Hello', 'error', 10000, 'Undo', cb);
	const click_handler_4 = () => showToast('Hello', 'error', 100000, 'Undo', cb);

	$$self.$capture_state = () => ({
		Button,
		Toaster,
		showToast,
		hideToast,
		cb
	});

	return [
		cb,
		click_handler,
		click_handler_1,
		click_handler_2,
		click_handler_3,
		click_handler_4
	];
}

class Toaster_1 extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$g, create_fragment$g, safe_not_equal, {});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Toaster_1",
			options,
			id: create_fragment$g.name
		});
	}
}

/* docs/components/color-palette-box.svelte generated by Svelte v3.46.4 */

const file$f = "docs/components/color-palette-box.svelte";

function create_fragment$f(ctx) {
	let div;
	let t0;
	let t1;
	let br;
	let t2;
	let t3;

	const block = {
		c: function create() {
			div = element("div");
			t0 = text("background: --ui-");
			t1 = text(/*bg*/ ctx[0]);
			br = element("br");
			t2 = text("\n\ttext: --ui-");
			t3 = text(/*text*/ ctx[1]);
			add_location(br, file$f, 1, 22, 114);
			attr_dev(div, "class", "palette-box");
			set_style(div, "background-color", "var(--ui-" + /*bg*/ ctx[0] + ")");
			set_style(div, "color", "var(--ui-" + /*text*/ ctx[1] + ")");
			add_location(div, file$f, 0, 0, 0);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);
			append_dev(div, t0);
			append_dev(div, t1);
			append_dev(div, br);
			append_dev(div, t2);
			append_dev(div, t3);
		},
		p: function update(ctx, [dirty]) {
			if (dirty & /*bg*/ 1) set_data_dev(t1, /*bg*/ ctx[0]);
			if (dirty & /*text*/ 2) set_data_dev(t3, /*text*/ ctx[1]);

			if (dirty & /*bg*/ 1) {
				set_style(div, "background-color", "var(--ui-" + /*bg*/ ctx[0] + ")");
			}

			if (dirty & /*text*/ 2) {
				set_style(div, "color", "var(--ui-" + /*text*/ ctx[1] + ")");
			}
		},
		i: noop,
		o: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(div);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$f.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$f($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots('Color_palette_box', slots, []);
	let { bg = 'color-background' } = $$props;
	let { text = 'color-text' } = $$props;
	const writable_props = ['bg', 'text'];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Color_palette_box> was created with unknown prop '${key}'`);
	});

	$$self.$$set = $$props => {
		if ('bg' in $$props) $$invalidate(0, bg = $$props.bg);
		if ('text' in $$props) $$invalidate(1, text = $$props.text);
	};

	$$self.$capture_state = () => ({ bg, text });

	$$self.$inject_state = $$props => {
		if ('bg' in $$props) $$invalidate(0, bg = $$props.bg);
		if ('text' in $$props) $$invalidate(1, text = $$props.text);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [bg, text];
}

class Color_palette_box extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$f, create_fragment$f, safe_not_equal, { bg: 0, text: 1 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Color_palette_box",
			options,
			id: create_fragment$f.name
		});
	}

	get bg() {
		throw new Error("<Color_palette_box>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set bg(value) {
		throw new Error("<Color_palette_box>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get text() {
		throw new Error("<Color_palette_box>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set text(value) {
		throw new Error("<Color_palette_box>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* docs/components/color-palette.svelte generated by Svelte v3.46.4 */
const file$e = "docs/components/color-palette.svelte";

function create_fragment$e(ctx) {
	let h2;
	let t1;
	let h30;
	let t3;
	let div0;
	let palettebox0;
	let t4;
	let palettebox1;
	let t5;
	let palettebox2;
	let t6;
	let palettebox3;
	let t7;
	let palettebox4;
	let t8;
	let palettebox5;
	let t9;
	let palettebox6;
	let t10;
	let palettebox7;
	let t11;
	let palettebox8;
	let t12;
	let palettebox9;
	let t13;
	let h31;
	let t15;
	let div1;
	let palettebox10;
	let t16;
	let palettebox11;
	let t17;
	let palettebox12;
	let t18;
	let palettebox13;
	let t19;
	let palettebox14;
	let t20;
	let palettebox15;
	let t21;
	let h32;
	let t23;
	let div2;
	let palettebox16;
	let t24;
	let palettebox17;
	let t25;
	let palettebox18;
	let t26;
	let palettebox19;
	let t27;
	let palettebox20;
	let t28;
	let palettebox21;
	let t29;
	let h33;
	let t31;
	let div3;
	let palettebox22;
	let t32;
	let palettebox23;
	let t33;
	let palettebox24;
	let t34;
	let palettebox25;
	let t35;
	let palettebox26;
	let t36;
	let palettebox27;
	let current;

	palettebox0 = new Color_palette_box({
			props: { bg: "color-accent" },
			$$inline: true
		});

	palettebox1 = new Color_palette_box({
			props: { bg: "color-accent-semi" },
			$$inline: true
		});

	palettebox2 = new Color_palette_box({
			props: { bg: "color-info" },
			$$inline: true
		});

	palettebox3 = new Color_palette_box({
			props: { bg: "color-info-semi" },
			$$inline: true
		});

	palettebox4 = new Color_palette_box({
			props: { bg: "color-success" },
			$$inline: true
		});

	palettebox5 = new Color_palette_box({
			props: { bg: "color-success-semi" },
			$$inline: true
		});

	palettebox6 = new Color_palette_box({
			props: { bg: "color-danger" },
			$$inline: true
		});

	palettebox7 = new Color_palette_box({
			props: { bg: "color-danger-semi" },
			$$inline: true
		});

	palettebox8 = new Color_palette_box({
			props: { bg: "color-warning" },
			$$inline: true
		});

	palettebox9 = new Color_palette_box({
			props: { bg: "color-warning-semi" },
			$$inline: true
		});

	palettebox10 = new Color_palette_box({
			props: { bg: "color-highlight" },
			$$inline: true
		});

	palettebox11 = new Color_palette_box({
			props: { bg: "color-highlight-semi" },
			$$inline: true
		});

	palettebox12 = new Color_palette_box({
			props: { bg: "color-highlight-light-1" },
			$$inline: true
		});

	palettebox13 = new Color_palette_box({
			props: { bg: "color-highlight-light-2" },
			$$inline: true
		});

	palettebox14 = new Color_palette_box({
			props: { bg: "color-highlight-dark-1" },
			$$inline: true
		});

	palettebox15 = new Color_palette_box({
			props: { bg: "color-highlight-dark-2" },
			$$inline: true
		});

	palettebox16 = new Color_palette_box({
			props: { bg: "color-background" },
			$$inline: true
		});

	palettebox17 = new Color_palette_box({
			props: { bg: "color-background-semi" },
			$$inline: true
		});

	palettebox18 = new Color_palette_box({
			props: { bg: "color-background-light-1" },
			$$inline: true
		});

	palettebox19 = new Color_palette_box({
			props: { bg: "color-background-light-2" },
			$$inline: true
		});

	palettebox20 = new Color_palette_box({
			props: { bg: "color-background-dark-1" },
			$$inline: true
		});

	palettebox21 = new Color_palette_box({
			props: { bg: "color-background-dark-2" },
			$$inline: true
		});

	palettebox22 = new Color_palette_box({
			props: { text: "color-text" },
			$$inline: true
		});

	palettebox23 = new Color_palette_box({
			props: { text: "color-text-semi" },
			$$inline: true
		});

	palettebox24 = new Color_palette_box({
			props: { text: "color-text-light-1" },
			$$inline: true
		});

	palettebox25 = new Color_palette_box({
			props: { text: "color-text-light-2" },
			$$inline: true
		});

	palettebox26 = new Color_palette_box({
			props: { text: "color-text-dark-1" },
			$$inline: true
		});

	palettebox27 = new Color_palette_box({
			props: { text: "color-text-dark-2" },
			$$inline: true
		});

	const block = {
		c: function create() {
			h2 = element("h2");
			h2.textContent = "Color Palette";
			t1 = space();
			h30 = element("h3");
			h30.textContent = "Special colors";
			t3 = space();
			div0 = element("div");
			create_component(palettebox0.$$.fragment);
			t4 = space();
			create_component(palettebox1.$$.fragment);
			t5 = space();
			create_component(palettebox2.$$.fragment);
			t6 = space();
			create_component(palettebox3.$$.fragment);
			t7 = space();
			create_component(palettebox4.$$.fragment);
			t8 = space();
			create_component(palettebox5.$$.fragment);
			t9 = space();
			create_component(palettebox6.$$.fragment);
			t10 = space();
			create_component(palettebox7.$$.fragment);
			t11 = space();
			create_component(palettebox8.$$.fragment);
			t12 = space();
			create_component(palettebox9.$$.fragment);
			t13 = space();
			h31 = element("h3");
			h31.textContent = "Highlight colors";
			t15 = space();
			div1 = element("div");
			create_component(palettebox10.$$.fragment);
			t16 = space();
			create_component(palettebox11.$$.fragment);
			t17 = space();
			create_component(palettebox12.$$.fragment);
			t18 = space();
			create_component(palettebox13.$$.fragment);
			t19 = space();
			create_component(palettebox14.$$.fragment);
			t20 = space();
			create_component(palettebox15.$$.fragment);
			t21 = space();
			h32 = element("h3");
			h32.textContent = "Background colors";
			t23 = space();
			div2 = element("div");
			create_component(palettebox16.$$.fragment);
			t24 = space();
			create_component(palettebox17.$$.fragment);
			t25 = space();
			create_component(palettebox18.$$.fragment);
			t26 = space();
			create_component(palettebox19.$$.fragment);
			t27 = space();
			create_component(palettebox20.$$.fragment);
			t28 = space();
			create_component(palettebox21.$$.fragment);
			t29 = space();
			h33 = element("h3");
			h33.textContent = "Text colors";
			t31 = space();
			div3 = element("div");
			create_component(palettebox22.$$.fragment);
			t32 = space();
			create_component(palettebox23.$$.fragment);
			t33 = space();
			create_component(palettebox24.$$.fragment);
			t34 = space();
			create_component(palettebox25.$$.fragment);
			t35 = space();
			create_component(palettebox26.$$.fragment);
			t36 = space();
			create_component(palettebox27.$$.fragment);
			add_location(h2, file$e, 0, 0, 0);
			add_location(h30, file$e, 2, 0, 24);
			attr_dev(div0, "class", "group");
			add_location(div0, file$e, 3, 0, 48);
			add_location(h31, file$e, 16, 0, 441);
			attr_dev(div1, "class", "group");
			add_location(div1, file$e, 17, 0, 467);
			add_location(h32, file$e, 26, 0, 752);
			attr_dev(div2, "class", "group group-light");
			add_location(div2, file$e, 27, 0, 779);
			add_location(h33, file$e, 36, 0, 1082);
			attr_dev(div3, "class", "group");
			add_location(div3, file$e, 37, 0, 1103);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, h2, anchor);
			insert_dev(target, t1, anchor);
			insert_dev(target, h30, anchor);
			insert_dev(target, t3, anchor);
			insert_dev(target, div0, anchor);
			mount_component(palettebox0, div0, null);
			append_dev(div0, t4);
			mount_component(palettebox1, div0, null);
			append_dev(div0, t5);
			mount_component(palettebox2, div0, null);
			append_dev(div0, t6);
			mount_component(palettebox3, div0, null);
			append_dev(div0, t7);
			mount_component(palettebox4, div0, null);
			append_dev(div0, t8);
			mount_component(palettebox5, div0, null);
			append_dev(div0, t9);
			mount_component(palettebox6, div0, null);
			append_dev(div0, t10);
			mount_component(palettebox7, div0, null);
			append_dev(div0, t11);
			mount_component(palettebox8, div0, null);
			append_dev(div0, t12);
			mount_component(palettebox9, div0, null);
			insert_dev(target, t13, anchor);
			insert_dev(target, h31, anchor);
			insert_dev(target, t15, anchor);
			insert_dev(target, div1, anchor);
			mount_component(palettebox10, div1, null);
			append_dev(div1, t16);
			mount_component(palettebox11, div1, null);
			append_dev(div1, t17);
			mount_component(palettebox12, div1, null);
			append_dev(div1, t18);
			mount_component(palettebox13, div1, null);
			append_dev(div1, t19);
			mount_component(palettebox14, div1, null);
			append_dev(div1, t20);
			mount_component(palettebox15, div1, null);
			insert_dev(target, t21, anchor);
			insert_dev(target, h32, anchor);
			insert_dev(target, t23, anchor);
			insert_dev(target, div2, anchor);
			mount_component(palettebox16, div2, null);
			append_dev(div2, t24);
			mount_component(palettebox17, div2, null);
			append_dev(div2, t25);
			mount_component(palettebox18, div2, null);
			append_dev(div2, t26);
			mount_component(palettebox19, div2, null);
			append_dev(div2, t27);
			mount_component(palettebox20, div2, null);
			append_dev(div2, t28);
			mount_component(palettebox21, div2, null);
			insert_dev(target, t29, anchor);
			insert_dev(target, h33, anchor);
			insert_dev(target, t31, anchor);
			insert_dev(target, div3, anchor);
			mount_component(palettebox22, div3, null);
			append_dev(div3, t32);
			mount_component(palettebox23, div3, null);
			append_dev(div3, t33);
			mount_component(palettebox24, div3, null);
			append_dev(div3, t34);
			mount_component(palettebox25, div3, null);
			append_dev(div3, t35);
			mount_component(palettebox26, div3, null);
			append_dev(div3, t36);
			mount_component(palettebox27, div3, null);
			current = true;
		},
		p: noop,
		i: function intro(local) {
			if (current) return;
			transition_in(palettebox0.$$.fragment, local);
			transition_in(palettebox1.$$.fragment, local);
			transition_in(palettebox2.$$.fragment, local);
			transition_in(palettebox3.$$.fragment, local);
			transition_in(palettebox4.$$.fragment, local);
			transition_in(palettebox5.$$.fragment, local);
			transition_in(palettebox6.$$.fragment, local);
			transition_in(palettebox7.$$.fragment, local);
			transition_in(palettebox8.$$.fragment, local);
			transition_in(palettebox9.$$.fragment, local);
			transition_in(palettebox10.$$.fragment, local);
			transition_in(palettebox11.$$.fragment, local);
			transition_in(palettebox12.$$.fragment, local);
			transition_in(palettebox13.$$.fragment, local);
			transition_in(palettebox14.$$.fragment, local);
			transition_in(palettebox15.$$.fragment, local);
			transition_in(palettebox16.$$.fragment, local);
			transition_in(palettebox17.$$.fragment, local);
			transition_in(palettebox18.$$.fragment, local);
			transition_in(palettebox19.$$.fragment, local);
			transition_in(palettebox20.$$.fragment, local);
			transition_in(palettebox21.$$.fragment, local);
			transition_in(palettebox22.$$.fragment, local);
			transition_in(palettebox23.$$.fragment, local);
			transition_in(palettebox24.$$.fragment, local);
			transition_in(palettebox25.$$.fragment, local);
			transition_in(palettebox26.$$.fragment, local);
			transition_in(palettebox27.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(palettebox0.$$.fragment, local);
			transition_out(palettebox1.$$.fragment, local);
			transition_out(palettebox2.$$.fragment, local);
			transition_out(palettebox3.$$.fragment, local);
			transition_out(palettebox4.$$.fragment, local);
			transition_out(palettebox5.$$.fragment, local);
			transition_out(palettebox6.$$.fragment, local);
			transition_out(palettebox7.$$.fragment, local);
			transition_out(palettebox8.$$.fragment, local);
			transition_out(palettebox9.$$.fragment, local);
			transition_out(palettebox10.$$.fragment, local);
			transition_out(palettebox11.$$.fragment, local);
			transition_out(palettebox12.$$.fragment, local);
			transition_out(palettebox13.$$.fragment, local);
			transition_out(palettebox14.$$.fragment, local);
			transition_out(palettebox15.$$.fragment, local);
			transition_out(palettebox16.$$.fragment, local);
			transition_out(palettebox17.$$.fragment, local);
			transition_out(palettebox18.$$.fragment, local);
			transition_out(palettebox19.$$.fragment, local);
			transition_out(palettebox20.$$.fragment, local);
			transition_out(palettebox21.$$.fragment, local);
			transition_out(palettebox22.$$.fragment, local);
			transition_out(palettebox23.$$.fragment, local);
			transition_out(palettebox24.$$.fragment, local);
			transition_out(palettebox25.$$.fragment, local);
			transition_out(palettebox26.$$.fragment, local);
			transition_out(palettebox27.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(h2);
			if (detaching) detach_dev(t1);
			if (detaching) detach_dev(h30);
			if (detaching) detach_dev(t3);
			if (detaching) detach_dev(div0);
			destroy_component(palettebox0);
			destroy_component(palettebox1);
			destroy_component(palettebox2);
			destroy_component(palettebox3);
			destroy_component(palettebox4);
			destroy_component(palettebox5);
			destroy_component(palettebox6);
			destroy_component(palettebox7);
			destroy_component(palettebox8);
			destroy_component(palettebox9);
			if (detaching) detach_dev(t13);
			if (detaching) detach_dev(h31);
			if (detaching) detach_dev(t15);
			if (detaching) detach_dev(div1);
			destroy_component(palettebox10);
			destroy_component(palettebox11);
			destroy_component(palettebox12);
			destroy_component(palettebox13);
			destroy_component(palettebox14);
			destroy_component(palettebox15);
			if (detaching) detach_dev(t21);
			if (detaching) detach_dev(h32);
			if (detaching) detach_dev(t23);
			if (detaching) detach_dev(div2);
			destroy_component(palettebox16);
			destroy_component(palettebox17);
			destroy_component(palettebox18);
			destroy_component(palettebox19);
			destroy_component(palettebox20);
			destroy_component(palettebox21);
			if (detaching) detach_dev(t29);
			if (detaching) detach_dev(h33);
			if (detaching) detach_dev(t31);
			if (detaching) detach_dev(div3);
			destroy_component(palettebox22);
			destroy_component(palettebox23);
			destroy_component(palettebox24);
			destroy_component(palettebox25);
			destroy_component(palettebox26);
			destroy_component(palettebox27);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$e.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$e($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots('Color_palette', slots, []);
	const writable_props = [];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Color_palette> was created with unknown prop '${key}'`);
	});

	$$self.$capture_state = () => ({ PaletteBox: Color_palette_box });
	return [];
}

class Color_palette extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$e, create_fragment$e, safe_not_equal, {});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Color_palette",
			options,
			id: create_fragment$e.name
		});
	}
}

/* docs/components/autocomplete.svelte generated by Svelte v3.46.4 */
const file$d = "docs/components/autocomplete.svelte";

function create_fragment$d(ctx) {
	let h20;
	let t1;
	let div2;
	let div0;
	let h30;
	let t3;
	let autocomplete0;
	let updating_value;
	let t4;
	let h31;
	let t6;
	let autocomplete1;
	let updating_value_1;
	let t7;
	let h32;
	let t9;
	let autocomplete2;
	let updating_value_2;
	let t10;
	let div1;
	let h21;
	let t12;
	let pre;
	let t13_value = JSON.stringify(/*autocompleteValue*/ ctx[0] || {}, null, 2) + "";
	let t13;
	let current;

	function autocomplete0_value_binding(value) {
		/*autocomplete0_value_binding*/ ctx[2](value);
	}

	let autocomplete0_props = { data: /*autocompleteData*/ ctx[1] };

	if (/*autocompleteValue*/ ctx[0] !== void 0) {
		autocomplete0_props.value = /*autocompleteValue*/ ctx[0];
	}

	autocomplete0 = new Autocomplete({
			props: autocomplete0_props,
			$$inline: true
		});

	binding_callbacks.push(() => bind(autocomplete0, 'value', autocomplete0_value_binding));

	function autocomplete1_value_binding(value) {
		/*autocomplete1_value_binding*/ ctx[3](value);
	}

	let autocomplete1_props = {
		disabled: true,
		data: /*autocompleteData*/ ctx[1]
	};

	if (/*autocompleteValue*/ ctx[0] !== void 0) {
		autocomplete1_props.value = /*autocompleteValue*/ ctx[0];
	}

	autocomplete1 = new Autocomplete({
			props: autocomplete1_props,
			$$inline: true
		});

	binding_callbacks.push(() => bind(autocomplete1, 'value', autocomplete1_value_binding));

	function autocomplete2_value_binding(value) {
		/*autocomplete2_value_binding*/ ctx[4](value);
	}

	let autocomplete2_props = {
		data: /*autocompleteData*/ ctx[1],
		placeholder: "Type to filter",
		allowNew: "true"
	};

	if (/*autocompleteValue*/ ctx[0] !== void 0) {
		autocomplete2_props.value = /*autocompleteValue*/ ctx[0];
	}

	autocomplete2 = new Autocomplete({
			props: autocomplete2_props,
			$$inline: true
		});

	binding_callbacks.push(() => bind(autocomplete2, 'value', autocomplete2_value_binding));

	const block = {
		c: function create() {
			h20 = element("h2");
			h20.textContent = "Autocomplete";
			t1 = space();
			div2 = element("div");
			div0 = element("div");
			h30 = element("h3");
			h30.textContent = "Normal";
			t3 = space();
			create_component(autocomplete0.$$.fragment);
			t4 = space();
			h31 = element("h3");
			h31.textContent = "Disabled";
			t6 = space();
			create_component(autocomplete1.$$.fragment);
			t7 = space();
			h32 = element("h3");
			h32.textContent = "Allow arbitrary values";
			t9 = space();
			create_component(autocomplete2.$$.fragment);
			t10 = space();
			div1 = element("div");
			h21 = element("h2");
			h21.textContent = "Selected value:";
			t12 = space();
			pre = element("pre");
			t13 = text(t13_value);
			add_location(h20, file$d, 0, 0, 0);
			add_location(h30, file$d, 3, 2, 103);
			add_location(h31, file$d, 6, 2, 200);
			add_location(h32, file$d, 9, 2, 308);
			attr_dev(div0, "class", "docs-autocomplete-column");
			add_location(div0, file$d, 2, 1, 62);
			add_location(h21, file$d, 13, 2, 513);
			add_location(pre, file$d, 14, 2, 541);
			attr_dev(div1, "class", "docs-autocomplete-column");
			add_location(div1, file$d, 12, 1, 472);
			attr_dev(div2, "class", "docs-autocomplete-layout");
			add_location(div2, file$d, 1, 0, 22);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, h20, anchor);
			insert_dev(target, t1, anchor);
			insert_dev(target, div2, anchor);
			append_dev(div2, div0);
			append_dev(div0, h30);
			append_dev(div0, t3);
			mount_component(autocomplete0, div0, null);
			append_dev(div0, t4);
			append_dev(div0, h31);
			append_dev(div0, t6);
			mount_component(autocomplete1, div0, null);
			append_dev(div0, t7);
			append_dev(div0, h32);
			append_dev(div0, t9);
			mount_component(autocomplete2, div0, null);
			append_dev(div2, t10);
			append_dev(div2, div1);
			append_dev(div1, h21);
			append_dev(div1, t12);
			append_dev(div1, pre);
			append_dev(pre, t13);
			current = true;
		},
		p: function update(ctx, [dirty]) {
			const autocomplete0_changes = {};

			if (!updating_value && dirty & /*autocompleteValue*/ 1) {
				updating_value = true;
				autocomplete0_changes.value = /*autocompleteValue*/ ctx[0];
				add_flush_callback(() => updating_value = false);
			}

			autocomplete0.$set(autocomplete0_changes);
			const autocomplete1_changes = {};

			if (!updating_value_1 && dirty & /*autocompleteValue*/ 1) {
				updating_value_1 = true;
				autocomplete1_changes.value = /*autocompleteValue*/ ctx[0];
				add_flush_callback(() => updating_value_1 = false);
			}

			autocomplete1.$set(autocomplete1_changes);
			const autocomplete2_changes = {};

			if (!updating_value_2 && dirty & /*autocompleteValue*/ 1) {
				updating_value_2 = true;
				autocomplete2_changes.value = /*autocompleteValue*/ ctx[0];
				add_flush_callback(() => updating_value_2 = false);
			}

			autocomplete2.$set(autocomplete2_changes);
			if ((!current || dirty & /*autocompleteValue*/ 1) && t13_value !== (t13_value = JSON.stringify(/*autocompleteValue*/ ctx[0] || {}, null, 2) + "")) set_data_dev(t13, t13_value);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(autocomplete0.$$.fragment, local);
			transition_in(autocomplete1.$$.fragment, local);
			transition_in(autocomplete2.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(autocomplete0.$$.fragment, local);
			transition_out(autocomplete1.$$.fragment, local);
			transition_out(autocomplete2.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(h20);
			if (detaching) detach_dev(t1);
			if (detaching) detach_dev(div2);
			destroy_component(autocomplete0);
			destroy_component(autocomplete1);
			destroy_component(autocomplete2);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$d.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$d($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots('Autocomplete', slots, []);

	const autocompleteData = [
		{ id: 1, name: 'Alpha', group: 'Group 1' },
		{ id: 2, name: 'Beta', group: 'Group 1' },
		{ id: 3, name: 'Gamma', group: 'Group 1' },
		{ id: 4, name: 'Delta', group: 'Group 1' },
		{ id: 5, name: 'Epsilon', group: 'Group 1' },
		{
			id: 6,
			name: 'Zeta',
			group: '😀 Group 2 has a very long name'
		},
		{
			id: 7,
			name: 'Eta',
			group: '😀 Group 2 has a very long name'
		},
		{
			id: 8,
			name: 'Theta',
			group: '😀 Group 2 has a very long name'
		},
		{
			id: 9,
			name: 'Iota',
			group: '😀 Group 2 has a very long name'
		},
		{
			id: 10,
			name: 'Kappa',
			group: '😀 Group 2 has a very long name'
		},
		{
			id: 11,
			name: 'Lambda is the last item in Group 2',
			group: '😀 Group 2 has a very long name'
		},
		{ id: 12, name: 'Zeta', group: 'Group 3' },
		{ id: 13, name: 'Eta', group: 'Group 3' },
		{ id: 14, name: 'Theta', group: 'Group 3' },
		{ id: 15, name: 'Iota', group: 'Group 3' },
		{ id: 16, name: 'Kappa', group: 'Group 3' },
		{ id: 17, name: 'Lambda', group: 'Group 3' }
	];

	let autocompleteValue = autocompleteData[1];
	const writable_props = [];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Autocomplete> was created with unknown prop '${key}'`);
	});

	function autocomplete0_value_binding(value) {
		autocompleteValue = value;
		$$invalidate(0, autocompleteValue);
	}

	function autocomplete1_value_binding(value) {
		autocompleteValue = value;
		$$invalidate(0, autocompleteValue);
	}

	function autocomplete2_value_binding(value) {
		autocompleteValue = value;
		$$invalidate(0, autocompleteValue);
	}

	$$self.$capture_state = () => ({
		Autocomplete,
		autocompleteData,
		autocompleteValue
	});

	$$self.$inject_state = $$props => {
		if ('autocompleteValue' in $$props) $$invalidate(0, autocompleteValue = $$props.autocompleteValue);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [
		autocompleteValue,
		autocompleteData,
		autocomplete0_value_binding,
		autocomplete1_value_binding,
		autocomplete2_value_binding
	];
}

class Autocomplete_1 extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$d, create_fragment$d, safe_not_equal, {});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Autocomplete_1",
			options,
			id: create_fragment$d.name
		});
	}
}

/* docs/components/datepicker.svelte generated by Svelte v3.46.4 */
const file$c = "docs/components/datepicker.svelte";

function create_fragment$c(ctx) {
	let h2;
	let t1;
	let datepicker;
	let current;

	datepicker = new Datepicker_1$1({
			props: { placeholder: "Select date" },
			$$inline: true
		});

	const block = {
		c: function create() {
			h2 = element("h2");
			h2.textContent = "Datepicker";
			t1 = space();
			create_component(datepicker.$$.fragment);
			add_location(h2, file$c, 0, 0, 0);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, h2, anchor);
			insert_dev(target, t1, anchor);
			mount_component(datepicker, target, anchor);
			current = true;
		},
		p: noop,
		i: function intro(local) {
			if (current) return;
			transition_in(datepicker.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(datepicker.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(h2);
			if (detaching) detach_dev(t1);
			destroy_component(datepicker, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$c.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$c($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots('Datepicker', slots, []);
	const writable_props = [];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Datepicker> was created with unknown prop '${key}'`);
	});

	$$self.$capture_state = () => ({ Datepicker: Datepicker_1$1 });
	return [];
}

class Datepicker_1 extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Datepicker_1",
			options,
			id: create_fragment$c.name
		});
	}
}

/* docs/components/input.svelte generated by Svelte v3.46.4 */

const { console: console_1 } = globals;
const file$b = "docs/components/input.svelte";

function create_fragment$b(ctx) {
	let h2;
	let t1;
	let h30;
	let t3;
	let input0;
	let t4;
	let h31;
	let t6;
	let input1;
	let t7;
	let h32;
	let t9;
	let input2;
	let t10;
	let h33;
	let t12;
	let inputnumber;
	let t13;
	let h34;
	let t15;
	let input3;
	let t16;
	let h35;
	let t18;
	let input4;
	let t19;
	let input5;
	let t20;
	let h36;
	let t22;
	let input6;
	let t23;
	let input7;
	let t24;
	let input8;
	let current;
	let mounted;
	let dispose;
	inputnumber = new Input_number({ $$inline: true });

	const block = {
		c: function create() {
			h2 = element("h2");
			h2.textContent = "Input";
			t1 = space();
			h30 = element("h3");
			h30.textContent = "Text";
			t3 = space();
			input0 = element("input");
			t4 = space();
			h31 = element("h3");
			h31.textContent = "Password";
			t6 = space();
			input1 = element("input");
			t7 = space();
			h32 = element("h3");
			h32.textContent = "Number";
			t9 = space();
			input2 = element("input");
			t10 = space();
			h33 = element("h3");
			h33.textContent = "Better Number";
			t12 = space();
			create_component(inputnumber.$$.fragment);
			t13 = space();
			h34 = element("h3");
			h34.textContent = "Search";
			t15 = space();
			input3 = element("input");
			t16 = space();
			h35 = element("h3");
			h35.textContent = "Checkbox";
			t18 = space();
			input4 = element("input");
			t19 = space();
			input5 = element("input");
			t20 = space();
			h36 = element("h3");
			h36.textContent = "Radio button";
			t22 = space();
			input6 = element("input");
			t23 = space();
			input7 = element("input");
			t24 = space();
			input8 = element("input");
			add_location(h2, file$b, 0, 0, 0);
			add_location(h30, file$b, 2, 0, 16);
			attr_dev(input0, "type", "text");
			add_location(input0, file$b, 3, 0, 30);
			add_location(h31, file$b, 5, 0, 74);
			attr_dev(input1, "type", "password");
			add_location(input1, file$b, 6, 0, 92);
			add_location(h32, file$b, 8, 0, 119);
			attr_dev(input2, "type", "number");
			add_location(input2, file$b, 9, 0, 135);
			add_location(h33, file$b, 11, 0, 160);
			add_location(h34, file$b, 14, 0, 200);
			attr_dev(input3, "type", "search");
			add_location(input3, file$b, 15, 0, 216);
			add_location(h35, file$b, 17, 0, 241);
			attr_dev(input4, "type", "checkbox");
			add_location(input4, file$b, 18, 0, 259);
			attr_dev(input5, "type", "checkbox");
			input5.disabled = true;
			add_location(input5, file$b, 19, 0, 285);
			add_location(h36, file$b, 21, 0, 321);
			attr_dev(input6, "name", "radio-group");
			attr_dev(input6, "type", "radio");
			input6.disabled = true;
			add_location(input6, file$b, 22, 0, 343);
			attr_dev(input7, "name", "radio-group");
			attr_dev(input7, "type", "radio");
			add_location(input7, file$b, 23, 0, 394);
			attr_dev(input8, "name", "radio-group");
			attr_dev(input8, "type", "radio");
			add_location(input8, file$b, 24, 0, 436);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, h2, anchor);
			insert_dev(target, t1, anchor);
			insert_dev(target, h30, anchor);
			insert_dev(target, t3, anchor);
			insert_dev(target, input0, anchor);
			insert_dev(target, t4, anchor);
			insert_dev(target, h31, anchor);
			insert_dev(target, t6, anchor);
			insert_dev(target, input1, anchor);
			insert_dev(target, t7, anchor);
			insert_dev(target, h32, anchor);
			insert_dev(target, t9, anchor);
			insert_dev(target, input2, anchor);
			insert_dev(target, t10, anchor);
			insert_dev(target, h33, anchor);
			insert_dev(target, t12, anchor);
			mount_component(inputnumber, target, anchor);
			insert_dev(target, t13, anchor);
			insert_dev(target, h34, anchor);
			insert_dev(target, t15, anchor);
			insert_dev(target, input3, anchor);
			insert_dev(target, t16, anchor);
			insert_dev(target, h35, anchor);
			insert_dev(target, t18, anchor);
			insert_dev(target, input4, anchor);
			insert_dev(target, t19, anchor);
			insert_dev(target, input5, anchor);
			insert_dev(target, t20, anchor);
			insert_dev(target, h36, anchor);
			insert_dev(target, t22, anchor);
			insert_dev(target, input6, anchor);
			insert_dev(target, t23, anchor);
			insert_dev(target, input7, anchor);
			insert_dev(target, t24, anchor);
			insert_dev(target, input8, anchor);
			current = true;

			if (!mounted) {
				dispose = listen_dev(input0, "input", oninput, false, false, false);
				mounted = true;
			}
		},
		p: noop,
		i: function intro(local) {
			if (current) return;
			transition_in(inputnumber.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(inputnumber.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(h2);
			if (detaching) detach_dev(t1);
			if (detaching) detach_dev(h30);
			if (detaching) detach_dev(t3);
			if (detaching) detach_dev(input0);
			if (detaching) detach_dev(t4);
			if (detaching) detach_dev(h31);
			if (detaching) detach_dev(t6);
			if (detaching) detach_dev(input1);
			if (detaching) detach_dev(t7);
			if (detaching) detach_dev(h32);
			if (detaching) detach_dev(t9);
			if (detaching) detach_dev(input2);
			if (detaching) detach_dev(t10);
			if (detaching) detach_dev(h33);
			if (detaching) detach_dev(t12);
			destroy_component(inputnumber, detaching);
			if (detaching) detach_dev(t13);
			if (detaching) detach_dev(h34);
			if (detaching) detach_dev(t15);
			if (detaching) detach_dev(input3);
			if (detaching) detach_dev(t16);
			if (detaching) detach_dev(h35);
			if (detaching) detach_dev(t18);
			if (detaching) detach_dev(input4);
			if (detaching) detach_dev(t19);
			if (detaching) detach_dev(input5);
			if (detaching) detach_dev(t20);
			if (detaching) detach_dev(h36);
			if (detaching) detach_dev(t22);
			if (detaching) detach_dev(input6);
			if (detaching) detach_dev(t23);
			if (detaching) detach_dev(input7);
			if (detaching) detach_dev(t24);
			if (detaching) detach_dev(input8);
			mounted = false;
			dispose();
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$b.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function oninput(e) {
	console.log(e);
}

function instance$b($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots('Input', slots, []);
	const writable_props = [];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<Input> was created with unknown prop '${key}'`);
	});

	$$self.$capture_state = () => ({ InputNumber: Input_number, oninput });
	return [];
}

class Input extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Input",
			options,
			id: create_fragment$b.name
		});
	}
}

/* docs/components/input-math.svelte generated by Svelte v3.46.4 */
const file$a = "docs/components/input-math.svelte";

function create_fragment$a(ctx) {
	let h2;
	let t1;
	let inputmath;
	let current;
	inputmath = new Input_math$1({ $$inline: true });

	const block = {
		c: function create() {
			h2 = element("h2");
			h2.textContent = "InputMath (allow + - * /)";
			t1 = space();
			create_component(inputmath.$$.fragment);
			add_location(h2, file$a, 0, 0, 0);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, h2, anchor);
			insert_dev(target, t1, anchor);
			mount_component(inputmath, target, anchor);
			current = true;
		},
		p: noop,
		i: function intro(local) {
			if (current) return;
			transition_in(inputmath.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(inputmath.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(h2);
			if (detaching) detach_dev(t1);
			destroy_component(inputmath, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$a.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$a($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots('Input_math', slots, []);
	const writable_props = [];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Input_math> was created with unknown prop '${key}'`);
	});

	$$self.$capture_state = () => ({ InputMath: Input_math$1 });
	return [];
}

class Input_math extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Input_math",
			options,
			id: create_fragment$a.name
		});
	}
}

/* docs/components/input-password.svelte generated by Svelte v3.46.4 */
const file$9 = "docs/components/input-password.svelte";

function create_fragment$9(ctx) {
	let h2;
	let t1;
	let inputpassword;
	let current;
	inputpassword = new Input_password$1({ $$inline: true });

	const block = {
		c: function create() {
			h2 = element("h2");
			h2.textContent = "Input Password";
			t1 = space();
			create_component(inputpassword.$$.fragment);
			add_location(h2, file$9, 0, 0, 0);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, h2, anchor);
			insert_dev(target, t1, anchor);
			mount_component(inputpassword, target, anchor);
			current = true;
		},
		p: noop,
		i: function intro(local) {
			if (current) return;
			transition_in(inputpassword.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(inputpassword.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(h2);
			if (detaching) detach_dev(t1);
			destroy_component(inputpassword, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$9.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$9($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots('Input_password', slots, []);
	const writable_props = [];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Input_password> was created with unknown prop '${key}'`);
	});

	$$self.$capture_state = () => ({ InputPassword: Input_password$1 });
	return [];
}

class Input_password extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Input_password",
			options,
			id: create_fragment$9.name
		});
	}
}

/* docs/components/select.svelte generated by Svelte v3.46.4 */
const file$8 = "docs/components/select.svelte";

function create_fragment$8(ctx) {
	let h2;
	let t1;
	let select0;
	let t2;
	let select1;
	let current;

	select0 = new Select({
			props: { items: /*selectItems*/ ctx[0] },
			$$inline: true
		});

	select1 = new Select({
			props: {
				items: [{ name: 'Disabled' }],
				disabled: true
			},
			$$inline: true
		});

	const block = {
		c: function create() {
			h2 = element("h2");
			h2.textContent = "Select";
			t1 = space();
			create_component(select0.$$.fragment);
			t2 = space();
			create_component(select1.$$.fragment);
			add_location(h2, file$8, 0, 0, 0);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, h2, anchor);
			insert_dev(target, t1, anchor);
			mount_component(select0, target, anchor);
			insert_dev(target, t2, anchor);
			mount_component(select1, target, anchor);
			current = true;
		},
		p: noop,
		i: function intro(local) {
			if (current) return;
			transition_in(select0.$$.fragment, local);
			transition_in(select1.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(select0.$$.fragment, local);
			transition_out(select1.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(h2);
			if (detaching) detach_dev(t1);
			destroy_component(select0, detaching);
			if (detaching) detach_dev(t2);
			destroy_component(select1, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$8.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$8($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots('Select', slots, []);

	const selectItems = [
		{
			id: 'Alpha',
			name: 'Alpha',
			group: 'Group 1'
		},
		{
			id: 'Beta',
			name: 'Beta',
			group: 'Group 1'
		},
		{
			id: 'Gamma',
			name: 'Gamma',
			group: 'Group 1'
		},
		{
			id: 'Delta',
			name: 'Delta',
			group: 'Group 1'
		},
		{ id: 'Epsilon', name: 'Epsilon' },
		{ id: 'Zeta', name: 'Zeta' },
		{ id: 'Eta', name: 'Eta', group: 'Group 2' },
		{
			id: 'Theta',
			name: 'Theta',
			group: 'Group 2'
		},
		{
			id: 'Iota',
			name: 'Iota',
			group: 'Group 2'
		},
		{
			id: 'Kappa',
			name: 'Kappa',
			group: 'Group 2'
		},
		{
			id: 'Lambda',
			name: 'Lambda',
			group: 'Group 2'
		},
		{
			id: 'long-one',
			name: 'A very long text',
			group: 'Group 2'
		},
		{ id: 'Eta', name: 'Eta', group: 'Group 3' },
		{
			id: 'Theta',
			name: 'Theta',
			group: 'Group 3'
		},
		{
			id: 'Iota',
			name: 'Iota',
			group: 'Group 3'
		},
		{
			id: 'Kappa',
			name: 'Kappa',
			group: 'Group 3'
		},
		{
			id: 'Lambda',
			name: 'Lambda',
			group: 'Group 3'
		},
		{
			id: 'long-one',
			name: 'A very long text',
			group: 'Group 3'
		},
		{ id: 'Eta', name: 'Eta', group: 'Group 4' },
		{
			id: 'Theta',
			name: 'Theta',
			group: 'Group 4'
		},
		{
			id: 'Iota',
			name: 'Iota',
			group: 'Group 4'
		},
		{
			id: 'Kappa',
			name: 'Kappa',
			group: 'Group 4'
		},
		{
			id: 'Lambda',
			name: 'Lambda',
			group: 'Group 4'
		},
		{
			id: 'long-one',
			name: 'A very long text',
			group: 'Group 4'
		}
	];

	const writable_props = [];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Select> was created with unknown prop '${key}'`);
	});

	$$self.$capture_state = () => ({ Select, selectItems });
	return [selectItems];
}

class Select_1 extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Select_1",
			options,
			id: create_fragment$8.name
		});
	}
}

/* docs/components/textarea.svelte generated by Svelte v3.46.4 */
const file$7 = "docs/components/textarea.svelte";

function create_fragment$7(ctx) {
	let h2;
	let t1;
	let h30;
	let t3;
	let textarea0;
	let t4;
	let h31;
	let t6;
	let textarea1;
	let t7;
	let h32;
	let t9;
	let textarea2;
	let current;
	textarea0 = new Textarea({ $$inline: true });

	textarea1 = new Textarea({
			props: { disabled: true },
			$$inline: true
		});

	textarea2 = new Textarea({
			props: { autogrow: true },
			$$inline: true
		});

	const block = {
		c: function create() {
			h2 = element("h2");
			h2.textContent = "Textarea";
			t1 = space();
			h30 = element("h3");
			h30.textContent = "Default";
			t3 = space();
			create_component(textarea0.$$.fragment);
			t4 = space();
			h31 = element("h3");
			h31.textContent = "Disabled";
			t6 = space();
			create_component(textarea1.$$.fragment);
			t7 = space();
			h32 = element("h3");
			h32.textContent = "Autogrow";
			t9 = space();
			create_component(textarea2.$$.fragment);
			add_location(h2, file$7, 0, 0, 0);
			add_location(h30, file$7, 2, 0, 19);
			add_location(h31, file$7, 5, 0, 59);
			add_location(h32, file$7, 9, 0, 110);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, h2, anchor);
			insert_dev(target, t1, anchor);
			insert_dev(target, h30, anchor);
			insert_dev(target, t3, anchor);
			mount_component(textarea0, target, anchor);
			insert_dev(target, t4, anchor);
			insert_dev(target, h31, anchor);
			insert_dev(target, t6, anchor);
			mount_component(textarea1, target, anchor);
			insert_dev(target, t7, anchor);
			insert_dev(target, h32, anchor);
			insert_dev(target, t9, anchor);
			mount_component(textarea2, target, anchor);
			current = true;
		},
		p: noop,
		i: function intro(local) {
			if (current) return;
			transition_in(textarea0.$$.fragment, local);
			transition_in(textarea1.$$.fragment, local);
			transition_in(textarea2.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(textarea0.$$.fragment, local);
			transition_out(textarea1.$$.fragment, local);
			transition_out(textarea2.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(h2);
			if (detaching) detach_dev(t1);
			if (detaching) detach_dev(h30);
			if (detaching) detach_dev(t3);
			destroy_component(textarea0, detaching);
			if (detaching) detach_dev(t4);
			if (detaching) detach_dev(h31);
			if (detaching) detach_dev(t6);
			destroy_component(textarea1, detaching);
			if (detaching) detach_dev(t7);
			if (detaching) detach_dev(h32);
			if (detaching) detach_dev(t9);
			destroy_component(textarea2, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$7.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$7($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots('Textarea', slots, []);
	const writable_props = [];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Textarea> was created with unknown prop '${key}'`);
	});

	$$self.$capture_state = () => ({ Textarea });
	return [];
}

class Textarea_1 extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Textarea_1",
			options,
			id: create_fragment$7.name
		});
	}
}

/* docs/components/toggle.svelte generated by Svelte v3.46.4 */
const file$6 = "docs/components/toggle.svelte";

function create_fragment$6(ctx) {
	let h2;
	let t1;
	let ul;
	let li0;
	let t2;
	let em0;
	let t4;
	let em1;
	let t6;
	let li1;
	let t7;
	let em2;
	let t9;
	let em3;
	let t11;
	let li2;
	let li3;
	let t14;
	let br0;
	let t15;
	let toggle0;
	let t16;
	let t17;
	let t18;
	let br1;
	let br2;
	let br3;
	let t19;
	let toggle1;
	let t20;
	let current;

	toggle0 = new Toggle({
			props: { value: /*toggleValue*/ ctx[0] },
			$$inline: true
		});

	toggle0.$on("change", /*change_handler*/ ctx[1]);

	toggle1 = new Toggle({
			props: {
				value: /*toggleValue*/ ctx[0],
				disabled: true
			},
			$$inline: true
		});

	const block = {
		c: function create() {
			h2 = element("h2");
			h2.textContent = "Toggle";
			t1 = text("\n\nThe perfect toggle component in Svelte:\n");
			ul = element("ul");
			li0 = element("li");
			t2 = text("allows ");
			em0 = element("em");
			em0.textContent = "click";
			t4 = text(" as well as ");
			em1 = element("em");
			em1.textContent = "drag";
			t6 = text(" to toggle\n\t");
			li1 = element("li");
			t7 = text("keyboard support: press ");
			em2 = element("em");
			em2.textContent = "Enter";
			t9 = text(" or ");
			em3 = element("em");
			em3.textContent = "Space";
			t11 = text(" to toggle\n\t");
			li2 = element("li");
			li2.textContent = "accessible (based on a checkbox input)\n\t";
			li3 = element("li");
			li3.textContent = "no bloat, no dependencies";
			t14 = space();
			br0 = element("br");
			t15 = space();
			create_component(toggle0.$$.fragment);
			t16 = space();
			t17 = text(/*toggleValue*/ ctx[0]);
			t18 = space();
			br1 = element("br");
			br2 = element("br");
			br3 = element("br");
			t19 = space();
			create_component(toggle1.$$.fragment);
			t20 = text(" (disabled)");
			add_location(h2, file$6, 0, 0, 0);
			add_location(em0, file$6, 4, 12, 74);
			add_location(em1, file$6, 4, 38, 100);
			add_location(li0, file$6, 4, 1, 63);
			add_location(em2, file$6, 5, 29, 153);
			add_location(em3, file$6, 5, 47, 171);
			add_location(li1, file$6, 5, 1, 125);
			add_location(li2, file$6, 6, 1, 197);
			add_location(li3, file$6, 7, 1, 241);
			add_location(ul, file$6, 3, 0, 57);
			add_location(br0, file$6, 9, 0, 277);
			add_location(br1, file$6, 12, 0, 372);
			add_location(br2, file$6, 12, 4, 376);
			add_location(br3, file$6, 12, 8, 380);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, h2, anchor);
			insert_dev(target, t1, anchor);
			insert_dev(target, ul, anchor);
			append_dev(ul, li0);
			append_dev(li0, t2);
			append_dev(li0, em0);
			append_dev(li0, t4);
			append_dev(li0, em1);
			append_dev(li0, t6);
			append_dev(ul, li1);
			append_dev(li1, t7);
			append_dev(li1, em2);
			append_dev(li1, t9);
			append_dev(li1, em3);
			append_dev(li1, t11);
			append_dev(ul, li2);
			append_dev(ul, li3);
			insert_dev(target, t14, anchor);
			insert_dev(target, br0, anchor);
			insert_dev(target, t15, anchor);
			mount_component(toggle0, target, anchor);
			insert_dev(target, t16, anchor);
			insert_dev(target, t17, anchor);
			insert_dev(target, t18, anchor);
			insert_dev(target, br1, anchor);
			insert_dev(target, br2, anchor);
			insert_dev(target, br3, anchor);
			insert_dev(target, t19, anchor);
			mount_component(toggle1, target, anchor);
			insert_dev(target, t20, anchor);
			current = true;
		},
		p: function update(ctx, [dirty]) {
			const toggle0_changes = {};
			if (dirty & /*toggleValue*/ 1) toggle0_changes.value = /*toggleValue*/ ctx[0];
			toggle0.$set(toggle0_changes);
			if (!current || dirty & /*toggleValue*/ 1) set_data_dev(t17, /*toggleValue*/ ctx[0]);
			const toggle1_changes = {};
			if (dirty & /*toggleValue*/ 1) toggle1_changes.value = /*toggleValue*/ ctx[0];
			toggle1.$set(toggle1_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(toggle0.$$.fragment, local);
			transition_in(toggle1.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(toggle0.$$.fragment, local);
			transition_out(toggle1.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(h2);
			if (detaching) detach_dev(t1);
			if (detaching) detach_dev(ul);
			if (detaching) detach_dev(t14);
			if (detaching) detach_dev(br0);
			if (detaching) detach_dev(t15);
			destroy_component(toggle0, detaching);
			if (detaching) detach_dev(t16);
			if (detaching) detach_dev(t17);
			if (detaching) detach_dev(t18);
			if (detaching) detach_dev(br1);
			if (detaching) detach_dev(br2);
			if (detaching) detach_dev(br3);
			if (detaching) detach_dev(t19);
			destroy_component(toggle1, detaching);
			if (detaching) detach_dev(t20);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$6.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$6($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots('Toggle', slots, []);
	let toggleValue = false;
	const writable_props = [];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Toggle> was created with unknown prop '${key}'`);
	});

	const change_handler = e => $$invalidate(0, toggleValue = e.detail);
	$$self.$capture_state = () => ({ Toggle, toggleValue });

	$$self.$inject_state = $$props => {
		if ('toggleValue' in $$props) $$invalidate(0, toggleValue = $$props.toggleValue);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [toggleValue, change_handler];
}

class Toggle_1 extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Toggle_1",
			options,
			id: create_fragment$6.name
		});
	}
}

/* docs/components/drawer.svelte generated by Svelte v3.46.4 */
const file$5 = "docs/components/drawer.svelte";

// (3:0) <Button on:click="{() => drawer.toggle()}">
function create_default_slot_2$1(ctx) {
	let t;

	const block = {
		c: function create() {
			t = text("Toggle drawer");
		},
		m: function mount(target, anchor) {
			insert_dev(target, t, anchor);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(t);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_2$1.name,
		type: "slot",
		source: "(3:0) <Button on:click=\\\"{() => drawer.toggle()}\\\">",
		ctx
	});

	return block;
}

// (16:1) <Button on:click="{() => drawer.close()}">
function create_default_slot_1$2(ctx) {
	let t;

	const block = {
		c: function create() {
			t = text("Close Drawer");
		},
		m: function mount(target, anchor) {
			insert_dev(target, t, anchor);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(t);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_1$2.name,
		type: "slot",
		source: "(16:1) <Button on:click=\\\"{() => drawer.close()}\\\">",
		ctx
	});

	return block;
}

// (11:0) <Drawer bind:this="{drawer}" title="Drawer">
function create_default_slot$3(ctx) {
	let t0;
	let br0;
	let t1;
	let br1;
	let t2;
	let br2;
	let t3;
	let button;
	let t4;
	let p0;
	let t6;
	let p1;
	let t8;
	let p2;
	let t10;
	let p3;
	let t12;
	let p4;
	let current;

	button = new Button({
			props: {
				$$slots: { default: [create_default_slot_1$2] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	button.$on("click", /*click_handler_1*/ ctx[2]);

	const block = {
		c: function create() {
			t0 = text("drawer contents");
			br0 = element("br");
			t1 = text("\n\tHello world!");
			br1 = element("br");
			t2 = space();
			br2 = element("br");
			t3 = space();
			create_component(button.$$.fragment);
			t4 = space();
			p0 = element("p");
			p0.textContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris mollis porttitor justo, eget ornare massa commodo non. Pellentesque semper dictum mauris, id pretium mi mattis in. Proin sodales neque id euismod interdum. Fusce vel blandit orci. Mauris nec ligula aliquam, vestibulum erat nec, ullamcorper nunc. Cras vel lacinia sem. Aenean non tincidunt nisl, vitae consectetur est. Integer id neque tempor, facilisis felis egestas, aliquam turpis. Mauris id consectetur purus. Praesent vehicula, mauris eu hendrerit vehicula, velit tortor fermentum enim, eget malesuada quam eros at quam. Integer mattis egestas tempus.";
			t6 = space();
			p1 = element("p");
			p1.textContent = "Aliquam et purus enim. Suspendisse potenti. Suspendisse tincidunt ullamcorper nulla non gravida. Morbi at tellus dui. Sed orci ligula, facilisis sit amet odio eu, commodo ultricies lorem. Nullam sagittis sapien metus, eu posuere sem iaculis sed. Duis at nibh feugiat, placerat lectus nec, consectetur elit. In sollicitudin est in ultricies gravida. Ut malesuada ex lacinia, posuere augue eget, imperdiet erat. Phasellus ac dui sit amet ligula condimentum venenatis vitae ornare augue. Vivamus pellentesque felis in orci finibus, a accumsan libero consectetur.";
			t8 = space();
			p2 = element("p");
			p2.textContent = "Nulla facilisi. Sed in neque hendrerit, convallis neque a, semper sem. Maecenas suscipit ex quis risus mollis, at tincidunt mi faucibus. Pellentesque in faucibus metus. Etiam sollicitudin accumsan arcu interdum sollicitudin. Suspendisse iaculis congue justo id posuere. Ut sed nisi molestie, egestas nulla at, feugiat neque. Nullam vitae libero eu sem ornare tempus vel id tortor. Ut varius ullamcorper nisl et dignissim. Vestibulum sodales massa id odio aliquet ornare. Nunc mollis quis sapien fringilla ullamcorper. Interdum et malesuada fames ac ante ipsum primis in faucibus. Phasellus eget posuere orci.";
			t10 = space();
			p3 = element("p");
			p3.textContent = "Suspendisse sollicitudin sed ligula nec tempus. Phasellus quis luctus sapien. Nullam nec sapien fringilla, sollicitudin dui sit amet, molestie arcu. Pellentesque id elit et sem pharetra gravida. Donec sed metus ut dui venenatis euismod varius ut libero. Duis ornare odio finibus eros rhoncus ullamcorper. Maecenas auctor lectus volutpat sem pretium volutpat. Mauris blandit quam diam, nec consequat arcu dignissim ut. Donec ac lacus pretium, sollicitudin nisi in, ullamcorper enim. Ut convallis nec eros nec scelerisque. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Mauris non odio a ipsum varius pretium non ut ex. Quisque euismod luctus risus, sit amet venenatis justo vehicula non. Aliquam erat volutpat. Phasellus eu leo ut odio cursus cursus. Pellentesque porta odio id arcu mattis, vitae aliquam risus efficitur.";
			t12 = space();
			p4 = element("p");
			p4.textContent = "Curabitur nec cursus purus. Nullam scelerisque et odio ut pretium. Donec gravida auctor enim, in venenatis mi viverra sit amet. Integer tincidunt lectus quis sagittis pellentesque. Morbi nec ipsum erat. Donec finibus sit amet lorem et dignissim. Praesent pretium consequat enim, quis rutrum nisl imperdiet ut.";
			add_location(br0, file$5, 12, 16, 3144);
			add_location(br1, file$5, 13, 13, 3162);
			add_location(br2, file$5, 14, 1, 3168);
			add_location(p0, file$5, 17, 1, 3240);
			add_location(p1, file$5, 18, 1, 3868);
			add_location(p2, file$5, 19, 1, 4436);
			add_location(p3, file$5, 20, 1, 5053);
			add_location(p4, file$5, 21, 1, 5923);
		},
		m: function mount(target, anchor) {
			insert_dev(target, t0, anchor);
			insert_dev(target, br0, anchor);
			insert_dev(target, t1, anchor);
			insert_dev(target, br1, anchor);
			insert_dev(target, t2, anchor);
			insert_dev(target, br2, anchor);
			insert_dev(target, t3, anchor);
			mount_component(button, target, anchor);
			insert_dev(target, t4, anchor);
			insert_dev(target, p0, anchor);
			insert_dev(target, t6, anchor);
			insert_dev(target, p1, anchor);
			insert_dev(target, t8, anchor);
			insert_dev(target, p2, anchor);
			insert_dev(target, t10, anchor);
			insert_dev(target, p3, anchor);
			insert_dev(target, t12, anchor);
			insert_dev(target, p4, anchor);
			current = true;
		},
		p: function update(ctx, dirty) {
			const button_changes = {};

			if (dirty & /*$$scope*/ 16) {
				button_changes.$$scope = { dirty, ctx };
			}

			button.$set(button_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(button.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(button.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(t0);
			if (detaching) detach_dev(br0);
			if (detaching) detach_dev(t1);
			if (detaching) detach_dev(br1);
			if (detaching) detach_dev(t2);
			if (detaching) detach_dev(br2);
			if (detaching) detach_dev(t3);
			destroy_component(button, detaching);
			if (detaching) detach_dev(t4);
			if (detaching) detach_dev(p0);
			if (detaching) detach_dev(t6);
			if (detaching) detach_dev(p1);
			if (detaching) detach_dev(t8);
			if (detaching) detach_dev(p2);
			if (detaching) detach_dev(t10);
			if (detaching) detach_dev(p3);
			if (detaching) detach_dev(t12);
			if (detaching) detach_dev(p4);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot$3.name,
		type: "slot",
		source: "(11:0) <Drawer bind:this=\\\"{drawer}\\\" title=\\\"Drawer\\\">",
		ctx
	});

	return block;
}

function create_fragment$5(ctx) {
	let h2;
	let t1;
	let button;
	let t2;
	let p0;
	let t4;
	let p1;
	let t6;
	let p2;
	let t8;
	let p3;
	let t10;
	let p4;
	let t12;
	let drawer_1;
	let current;

	button = new Button({
			props: {
				$$slots: { default: [create_default_slot_2$1] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	button.$on("click", /*click_handler*/ ctx[1]);

	let drawer_1_props = {
		title: "Drawer",
		$$slots: { default: [create_default_slot$3] },
		$$scope: { ctx }
	};

	drawer_1 = new Drawer({ props: drawer_1_props, $$inline: true });
	/*drawer_1_binding*/ ctx[3](drawer_1);

	const block = {
		c: function create() {
			h2 = element("h2");
			h2.textContent = "Drawer";
			t1 = space();
			create_component(button.$$.fragment);
			t2 = space();
			p0 = element("p");
			p0.textContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris mollis porttitor justo, eget ornare massa commodo non. Pellentesque semper dictum mauris, id pretium mi mattis in. Proin sodales neque id euismod interdum. Fusce vel blandit orci. Mauris nec ligula aliquam, vestibulum erat nec, ullamcorper nunc. Cras vel lacinia sem. Aenean non tincidunt nisl, vitae consectetur est. Integer id neque tempor, facilisis felis egestas, aliquam turpis. Mauris id consectetur purus. Praesent vehicula, mauris eu hendrerit vehicula, velit tortor fermentum enim, eget malesuada quam eros at quam. Integer mattis egestas tempus.";
			t4 = space();
			p1 = element("p");
			p1.textContent = "Aliquam et purus enim. Suspendisse potenti. Suspendisse tincidunt ullamcorper nulla non gravida. Morbi at tellus dui. Sed orci ligula, facilisis sit amet odio eu, commodo ultricies lorem. Nullam sagittis sapien metus, eu posuere sem iaculis sed. Duis at nibh feugiat, placerat lectus nec, consectetur elit. In sollicitudin est in ultricies gravida. Ut malesuada ex lacinia, posuere augue eget, imperdiet erat. Phasellus ac dui sit amet ligula condimentum venenatis vitae ornare augue. Vivamus pellentesque felis in orci finibus, a accumsan libero consectetur.";
			t6 = space();
			p2 = element("p");
			p2.textContent = "Nulla facilisi. Sed in neque hendrerit, convallis neque a, semper sem. Maecenas suscipit ex quis risus mollis, at tincidunt mi faucibus. Pellentesque in faucibus metus. Etiam sollicitudin accumsan arcu interdum sollicitudin. Suspendisse iaculis congue justo id posuere. Ut sed nisi molestie, egestas nulla at, feugiat neque. Nullam vitae libero eu sem ornare tempus vel id tortor. Ut varius ullamcorper nisl et dignissim. Vestibulum sodales massa id odio aliquet ornare. Nunc mollis quis sapien fringilla ullamcorper. Interdum et malesuada fames ac ante ipsum primis in faucibus. Phasellus eget posuere orci.";
			t8 = space();
			p3 = element("p");
			p3.textContent = "Suspendisse sollicitudin sed ligula nec tempus. Phasellus quis luctus sapien. Nullam nec sapien fringilla, sollicitudin dui sit amet, molestie arcu. Pellentesque id elit et sem pharetra gravida. Donec sed metus ut dui venenatis euismod varius ut libero. Duis ornare odio finibus eros rhoncus ullamcorper. Maecenas auctor lectus volutpat sem pretium volutpat. Mauris blandit quam diam, nec consequat arcu dignissim ut. Donec ac lacus pretium, sollicitudin nisi in, ullamcorper enim. Ut convallis nec eros nec scelerisque. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Mauris non odio a ipsum varius pretium non ut ex. Quisque euismod luctus risus, sit amet venenatis justo vehicula non. Aliquam erat volutpat. Phasellus eu leo ut odio cursus cursus. Pellentesque porta odio id arcu mattis, vitae aliquam risus efficitur.";
			t10 = space();
			p4 = element("p");
			p4.textContent = "Curabitur nec cursus purus. Nullam scelerisque et odio ut pretium. Donec gravida auctor enim, in venenatis mi viverra sit amet. Integer tincidunt lectus quis sagittis pellentesque. Morbi nec ipsum erat. Donec finibus sit amet lorem et dignissim. Praesent pretium consequat enim, quis rutrum nisl imperdiet ut.";
			t12 = space();
			create_component(drawer_1.$$.fragment);
			add_location(h2, file$5, 0, 0, 0);
			add_location(p0, file$5, 4, 0, 84);
			add_location(p1, file$5, 5, 0, 711);
			add_location(p2, file$5, 6, 0, 1278);
			add_location(p3, file$5, 7, 0, 1894);
			add_location(p4, file$5, 8, 0, 2763);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, h2, anchor);
			insert_dev(target, t1, anchor);
			mount_component(button, target, anchor);
			insert_dev(target, t2, anchor);
			insert_dev(target, p0, anchor);
			insert_dev(target, t4, anchor);
			insert_dev(target, p1, anchor);
			insert_dev(target, t6, anchor);
			insert_dev(target, p2, anchor);
			insert_dev(target, t8, anchor);
			insert_dev(target, p3, anchor);
			insert_dev(target, t10, anchor);
			insert_dev(target, p4, anchor);
			insert_dev(target, t12, anchor);
			mount_component(drawer_1, target, anchor);
			current = true;
		},
		p: function update(ctx, [dirty]) {
			const button_changes = {};

			if (dirty & /*$$scope*/ 16) {
				button_changes.$$scope = { dirty, ctx };
			}

			button.$set(button_changes);
			const drawer_1_changes = {};

			if (dirty & /*$$scope, drawer*/ 17) {
				drawer_1_changes.$$scope = { dirty, ctx };
			}

			drawer_1.$set(drawer_1_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(button.$$.fragment, local);
			transition_in(drawer_1.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(button.$$.fragment, local);
			transition_out(drawer_1.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(h2);
			if (detaching) detach_dev(t1);
			destroy_component(button, detaching);
			if (detaching) detach_dev(t2);
			if (detaching) detach_dev(p0);
			if (detaching) detach_dev(t4);
			if (detaching) detach_dev(p1);
			if (detaching) detach_dev(t6);
			if (detaching) detach_dev(p2);
			if (detaching) detach_dev(t8);
			if (detaching) detach_dev(p3);
			if (detaching) detach_dev(t10);
			if (detaching) detach_dev(p4);
			if (detaching) detach_dev(t12);
			/*drawer_1_binding*/ ctx[3](null);
			destroy_component(drawer_1, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$5.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$5($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots('Drawer', slots, []);
	let drawer;
	const writable_props = [];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Drawer> was created with unknown prop '${key}'`);
	});

	const click_handler = () => drawer.toggle();
	const click_handler_1 = () => drawer.close();

	function drawer_1_binding($$value) {
		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
			drawer = $$value;
			$$invalidate(0, drawer);
		});
	}

	$$self.$capture_state = () => ({ Button, Drawer, drawer });

	$$self.$inject_state = $$props => {
		if ('drawer' in $$props) $$invalidate(0, drawer = $$props.drawer);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [drawer, click_handler, click_handler_1, drawer_1_binding];
}

class Drawer_1 extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Drawer_1",
			options,
			id: create_fragment$5.name
		});
	}
}

/* docs/components/panel.svelte generated by Svelte v3.46.4 */
const file$4 = "docs/components/panel.svelte";

// (5:1) <Panel title="Hello">
function create_default_slot_1$1(ctx) {
	let p0;
	let t1;
	let p1;
	let t3;
	let p2;
	let t5;
	let a;

	const block = {
		c: function create() {
			p0 = element("p");
			p0.textContent = "This is panel contents";
			t1 = space();
			p1 = element("p");
			p1.textContent = "Hello world!";
			t3 = space();
			p2 = element("p");
			p2.textContent = "This is panel contents";
			t5 = space();
			a = element("a");
			a.textContent = "a link";
			add_location(p0, file$4, 5, 2, 66);
			add_location(p1, file$4, 6, 2, 98);
			add_location(p2, file$4, 7, 2, 120);
			attr_dev(a, "href", "#some");
			add_location(a, file$4, 8, 2, 152);
		},
		m: function mount(target, anchor) {
			insert_dev(target, p0, anchor);
			insert_dev(target, t1, anchor);
			insert_dev(target, p1, anchor);
			insert_dev(target, t3, anchor);
			insert_dev(target, p2, anchor);
			insert_dev(target, t5, anchor);
			insert_dev(target, a, anchor);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(p0);
			if (detaching) detach_dev(t1);
			if (detaching) detach_dev(p1);
			if (detaching) detach_dev(t3);
			if (detaching) detach_dev(p2);
			if (detaching) detach_dev(t5);
			if (detaching) detach_dev(a);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_1$1.name,
		type: "slot",
		source: "(5:1) <Panel title=\\\"Hello\\\">",
		ctx
	});

	return block;
}

// (12:1) <Panel title="Panel 2" open>
function create_default_slot$2(ctx) {
	let p0;
	let t1;
	let p1;
	let t3;
	let p2;
	let t5;
	let button;

	const block = {
		c: function create() {
			p0 = element("p");
			p0.textContent = "This is panel contents";
			t1 = space();
			p1 = element("p");
			p1.textContent = "Hello world!";
			t3 = space();
			p2 = element("p");
			p2.textContent = "This is panel contents";
			t5 = space();
			button = element("button");
			button.textContent = "Asdasd";
			add_location(p0, file$4, 12, 2, 222);
			add_location(p1, file$4, 13, 2, 254);
			add_location(p2, file$4, 14, 2, 276);
			add_location(button, file$4, 15, 2, 308);
		},
		m: function mount(target, anchor) {
			insert_dev(target, p0, anchor);
			insert_dev(target, t1, anchor);
			insert_dev(target, p1, anchor);
			insert_dev(target, t3, anchor);
			insert_dev(target, p2, anchor);
			insert_dev(target, t5, anchor);
			insert_dev(target, button, anchor);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(p0);
			if (detaching) detach_dev(t1);
			if (detaching) detach_dev(p1);
			if (detaching) detach_dev(t3);
			if (detaching) detach_dev(p2);
			if (detaching) detach_dev(t5);
			if (detaching) detach_dev(button);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot$2.name,
		type: "slot",
		source: "(12:1) <Panel title=\\\"Panel 2\\\" open>",
		ctx
	});

	return block;
}

function create_fragment$4(ctx) {
	let h2;
	let t1;
	let div;
	let panel0;
	let t2;
	let panel1;
	let current;

	panel0 = new Panel({
			props: {
				title: "Hello",
				$$slots: { default: [create_default_slot_1$1] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	panel1 = new Panel({
			props: {
				title: "Panel 2",
				open: true,
				$$slots: { default: [create_default_slot$2] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	const block = {
		c: function create() {
			h2 = element("h2");
			h2.textContent = "Panel";
			t1 = space();
			div = element("div");
			create_component(panel0.$$.fragment);
			t2 = space();
			create_component(panel1.$$.fragment);
			add_location(h2, file$4, 0, 0, 0);
			attr_dev(div, "class", "accordion");
			add_location(div, file$4, 2, 0, 16);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, h2, anchor);
			insert_dev(target, t1, anchor);
			insert_dev(target, div, anchor);
			mount_component(panel0, div, null);
			append_dev(div, t2);
			mount_component(panel1, div, null);
			current = true;
		},
		p: function update(ctx, [dirty]) {
			const panel0_changes = {};

			if (dirty & /*$$scope*/ 1) {
				panel0_changes.$$scope = { dirty, ctx };
			}

			panel0.$set(panel0_changes);
			const panel1_changes = {};

			if (dirty & /*$$scope*/ 1) {
				panel1_changes.$$scope = { dirty, ctx };
			}

			panel1.$set(panel1_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(panel0.$$.fragment, local);
			transition_in(panel1.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(panel0.$$.fragment, local);
			transition_out(panel1.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(h2);
			if (detaching) detach_dev(t1);
			if (detaching) detach_dev(div);
			destroy_component(panel0);
			destroy_component(panel1);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$4.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$4($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots('Panel', slots, []);
	const writable_props = [];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Panel> was created with unknown prop '${key}'`);
	});

	$$self.$capture_state = () => ({ Panel });
	return [];
}

class Panel_1 extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Panel_1",
			options,
			id: create_fragment$4.name
		});
	}
}

/* docs/components/dialog.svelte generated by Svelte v3.46.4 */
const file$3 = "docs/components/dialog.svelte";

// (8:0) <Button on:click="{() => dialog1.open()}">
function create_default_slot_8(ctx) {
	let t;

	const block = {
		c: function create() {
			t = text("Show dialog 1");
		},
		m: function mount(target, anchor) {
			insert_dev(target, t, anchor);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(t);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_8.name,
		type: "slot",
		source: "(8:0) <Button on:click=\\\"{() => dialog1.open()}\\\">",
		ctx
	});

	return block;
}

// (9:0) <Button on:click="{() => dialog2.open()}">
function create_default_slot_7(ctx) {
	let t;

	const block = {
		c: function create() {
			t = text("Show dialog 2");
		},
		m: function mount(target, anchor) {
			insert_dev(target, t, anchor);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(t);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_7.name,
		type: "slot",
		source: "(9:0) <Button on:click=\\\"{() => dialog2.open()}\\\">",
		ctx
	});

	return block;
}

// (10:0) <Button on:click="{() => dialog3.open()}">
function create_default_slot_6(ctx) {
	let t;

	const block = {
		c: function create() {
			t = text("Show dialog 3");
		},
		m: function mount(target, anchor) {
			insert_dev(target, t, anchor);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(t);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_6.name,
		type: "slot",
		source: "(10:0) <Button on:click=\\\"{() => dialog3.open()}\\\">",
		ctx
	});

	return block;
}

// (18:0) <Dialog bind:this="{dialog1}" title="Hello" drawborders="true">
function create_default_slot_5(ctx) {
	let t0;
	let br;
	let t1;
	let p0;
	let t3;
	let p1;
	let t5;
	let p2;
	let t7;
	let p3;
	let t9;
	let p4;

	const block = {
		c: function create() {
			t0 = text("dialog contents");
			br = element("br");
			t1 = text("\n\tHello world!\n\n\t");
			p0 = element("p");
			p0.textContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris mollis porttitor justo, eget ornare massa commodo non. Pellentesque semper dictum mauris, id pretium mi mattis in. Proin sodales neque id euismod interdum. Fusce vel blandit orci. Mauris nec ligula aliquam, vestibulum erat nec, ullamcorper nunc. Cras vel lacinia sem. Aenean non tincidunt nisl, vitae consectetur est. Integer id neque tempor, facilisis felis egestas, aliquam turpis. Mauris id consectetur purus. Praesent vehicula, mauris eu hendrerit vehicula, velit tortor fermentum enim, eget malesuada quam eros at quam. Integer mattis egestas tempus.";
			t3 = space();
			p1 = element("p");
			p1.textContent = "Aliquam et purus enim. Suspendisse potenti. Suspendisse tincidunt ullamcorper nulla non gravida. Morbi at tellus dui. Sed orci ligula, facilisis sit amet odio eu, commodo ultricies lorem. Nullam sagittis sapien metus, eu posuere sem iaculis sed. Duis at nibh feugiat, placerat lectus nec, consectetur elit. In sollicitudin est in ultricies gravida. Ut malesuada ex lacinia, posuere augue eget, imperdiet erat. Phasellus ac dui sit amet ligula condimentum venenatis vitae ornare augue. Vivamus pellentesque felis in orci finibus, a accumsan libero consectetur.";
			t5 = space();
			p2 = element("p");
			p2.textContent = "Nulla facilisi. Sed in neque hendrerit, convallis neque a, semper sem. Maecenas suscipit ex quis risus mollis, at tincidunt mi faucibus. Pellentesque in faucibus metus. Etiam sollicitudin accumsan arcu interdum sollicitudin. Suspendisse iaculis congue justo id posuere. Ut sed nisi molestie, egestas nulla at, feugiat neque. Nullam vitae libero eu sem ornare tempus vel id tortor. Ut varius ullamcorper nisl et dignissim. Vestibulum sodales massa id odio aliquet ornare. Nunc mollis quis sapien fringilla ullamcorper. Interdum et malesuada fames ac ante ipsum primis in faucibus. Phasellus eget posuere orci.";
			t7 = space();
			p3 = element("p");
			p3.textContent = "Suspendisse sollicitudin sed ligula nec tempus. Phasellus quis luctus sapien. Nullam nec sapien fringilla, sollicitudin dui sit amet, molestie arcu. Pellentesque id elit et sem pharetra gravida. Donec sed metus ut dui venenatis euismod varius ut libero. Duis ornare odio finibus eros rhoncus ullamcorper. Maecenas auctor lectus volutpat sem pretium volutpat. Mauris blandit quam diam, nec consequat arcu dignissim ut. Donec ac lacus pretium, sollicitudin nisi in, ullamcorper enim. Ut convallis nec eros nec scelerisque. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Mauris non odio a ipsum varius pretium non ut ex. Quisque euismod luctus risus, sit amet venenatis justo vehicula non. Aliquam erat volutpat. Phasellus eu leo ut odio cursus cursus. Pellentesque porta odio id arcu mattis, vitae aliquam risus efficitur.";
			t9 = space();
			p4 = element("p");
			p4.textContent = "Curabitur nec cursus purus. Nullam scelerisque et odio ut pretium. Donec gravida auctor enim, in venenatis mi viverra sit amet. Integer tincidunt lectus quis sagittis pellentesque. Morbi nec ipsum erat. Donec finibus sit amet lorem et dignissim. Praesent pretium consequat enim, quis rutrum nisl imperdiet ut.";
			add_location(br, file$3, 18, 16, 3395);
			add_location(p0, file$3, 21, 1, 3416);
			add_location(p1, file$3, 22, 1, 4044);
			add_location(p2, file$3, 23, 1, 4612);
			add_location(p3, file$3, 24, 1, 5229);
			add_location(p4, file$3, 25, 1, 6099);
		},
		m: function mount(target, anchor) {
			insert_dev(target, t0, anchor);
			insert_dev(target, br, anchor);
			insert_dev(target, t1, anchor);
			insert_dev(target, p0, anchor);
			insert_dev(target, t3, anchor);
			insert_dev(target, p1, anchor);
			insert_dev(target, t5, anchor);
			insert_dev(target, p2, anchor);
			insert_dev(target, t7, anchor);
			insert_dev(target, p3, anchor);
			insert_dev(target, t9, anchor);
			insert_dev(target, p4, anchor);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(t0);
			if (detaching) detach_dev(br);
			if (detaching) detach_dev(t1);
			if (detaching) detach_dev(p0);
			if (detaching) detach_dev(t3);
			if (detaching) detach_dev(p1);
			if (detaching) detach_dev(t5);
			if (detaching) detach_dev(p2);
			if (detaching) detach_dev(t7);
			if (detaching) detach_dev(p3);
			if (detaching) detach_dev(t9);
			if (detaching) detach_dev(p4);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_5.name,
		type: "slot",
		source: "(18:0) <Dialog bind:this=\\\"{dialog1}\\\" title=\\\"Hello\\\" drawborders=\\\"true\\\">",
		ctx
	});

	return block;
}

// (29:2) <Button on:click="{() => dialog1.close()}">
function create_default_slot_4(ctx) {
	let t;

	const block = {
		c: function create() {
			t = text("Close");
		},
		m: function mount(target, anchor) {
			insert_dev(target, t, anchor);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(t);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_4.name,
		type: "slot",
		source: "(29:2) <Button on:click=\\\"{() => dialog1.close()}\\\">",
		ctx
	});

	return block;
}

// (28:1) 
function create_footer_slot_1(ctx) {
	let div;
	let button;
	let current;

	button = new Button({
			props: {
				$$slots: { default: [create_default_slot_4] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	button.$on("click", /*click_handler_3*/ ctx[6]);

	const block = {
		c: function create() {
			div = element("div");
			create_component(button.$$.fragment);
			attr_dev(div, "slot", "footer");
			add_location(div, file$3, 27, 1, 6419);
		},
		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);
			mount_component(button, div, null);
			current = true;
		},
		p: function update(ctx, dirty) {
			const button_changes = {};

			if (dirty & /*$$scope*/ 4096) {
				button_changes.$$scope = { dirty, ctx };
			}

			button.$set(button_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(button.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(button.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div);
			destroy_component(button);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_footer_slot_1.name,
		type: "slot",
		source: "(28:1) ",
		ctx
	});

	return block;
}

// (33:0) <Dialog bind:this="{dialog2}" title="Hello">
function create_default_slot_3(ctx) {
	let t;

	const block = {
		c: function create() {
			t = text("Hello!");
		},
		m: function mount(target, anchor) {
			insert_dev(target, t, anchor);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(t);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_3.name,
		type: "slot",
		source: "(33:0) <Dialog bind:this=\\\"{dialog2}\\\" title=\\\"Hello\\\">",
		ctx
	});

	return block;
}

// (38:0) <Dialog bind:this="{dialog3}">
function create_default_slot_2(ctx) {
	let t;

	const block = {
		c: function create() {
			t = text("Are you sure?");
		},
		m: function mount(target, anchor) {
			insert_dev(target, t, anchor);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(t);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_2.name,
		type: "slot",
		source: "(38:0) <Dialog bind:this=\\\"{dialog3}\\\">",
		ctx
	});

	return block;
}

// (41:2) <Button on:click="{() => dialog3.close()}">
function create_default_slot_1(ctx) {
	let t;

	const block = {
		c: function create() {
			t = text("Yes");
		},
		m: function mount(target, anchor) {
			insert_dev(target, t, anchor);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(t);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_1.name,
		type: "slot",
		source: "(41:2) <Button on:click=\\\"{() => dialog3.close()}\\\">",
		ctx
	});

	return block;
}

// (42:2) <Button on:click="{() => dialog3.close()}">
function create_default_slot$1(ctx) {
	let t;

	const block = {
		c: function create() {
			t = text("No");
		},
		m: function mount(target, anchor) {
			insert_dev(target, t, anchor);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(t);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot$1.name,
		type: "slot",
		source: "(42:2) <Button on:click=\\\"{() => dialog3.close()}\\\">",
		ctx
	});

	return block;
}

// (40:1) 
function create_footer_slot(ctx) {
	let div;
	let button0;
	let t;
	let button1;
	let current;

	button0 = new Button({
			props: {
				$$slots: { default: [create_default_slot_1] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	button0.$on("click", /*click_handler_4*/ ctx[9]);

	button1 = new Button({
			props: {
				$$slots: { default: [create_default_slot$1] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	button1.$on("click", /*click_handler_5*/ ctx[10]);

	const block = {
		c: function create() {
			div = element("div");
			create_component(button0.$$.fragment);
			t = space();
			create_component(button1.$$.fragment);
			attr_dev(div, "slot", "footer");
			add_location(div, file$3, 39, 1, 6630);
		},
		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);
			mount_component(button0, div, null);
			append_dev(div, t);
			mount_component(button1, div, null);
			current = true;
		},
		p: function update(ctx, dirty) {
			const button0_changes = {};

			if (dirty & /*$$scope*/ 4096) {
				button0_changes.$$scope = { dirty, ctx };
			}

			button0.$set(button0_changes);
			const button1_changes = {};

			if (dirty & /*$$scope*/ 4096) {
				button1_changes.$$scope = { dirty, ctx };
			}

			button1.$set(button1_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(button0.$$.fragment, local);
			transition_in(button1.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(button0.$$.fragment, local);
			transition_out(button1.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div);
			destroy_component(button0);
			destroy_component(button1);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_footer_slot.name,
		type: "slot",
		source: "(40:1) ",
		ctx
	});

	return block;
}

function create_fragment$3(ctx) {
	let h2;
	let t1;
	let ul;
	let li0;
	let li1;
	let t4;
	let br;
	let t5;
	let button0;
	let t6;
	let button1;
	let t7;
	let button2;
	let t8;
	let p0;
	let t10;
	let p1;
	let t12;
	let p2;
	let t14;
	let p3;
	let t16;
	let p4;
	let t18;
	let dialog0;
	let t19;
	let dialog1_1;
	let t20;
	let dialog2_1;
	let current;

	button0 = new Button({
			props: {
				$$slots: { default: [create_default_slot_8] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	button0.$on("click", /*click_handler*/ ctx[3]);

	button1 = new Button({
			props: {
				$$slots: { default: [create_default_slot_7] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	button1.$on("click", /*click_handler_1*/ ctx[4]);

	button2 = new Button({
			props: {
				$$slots: { default: [create_default_slot_6] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	button2.$on("click", /*click_handler_2*/ ctx[5]);

	let dialog0_props = {
		title: "Hello",
		drawborders: "true",
		$$slots: {
			footer: [create_footer_slot_1],
			default: [create_default_slot_5]
		},
		$$scope: { ctx }
	};

	dialog0 = new Dialog({ props: dialog0_props, $$inline: true });
	/*dialog0_binding*/ ctx[7](dialog0);

	let dialog1_1_props = {
		title: "Hello",
		$$slots: { default: [create_default_slot_3] },
		$$scope: { ctx }
	};

	dialog1_1 = new Dialog({ props: dialog1_1_props, $$inline: true });
	/*dialog1_1_binding*/ ctx[8](dialog1_1);

	let dialog2_1_props = {
		$$slots: {
			footer: [create_footer_slot],
			default: [create_default_slot_2]
		},
		$$scope: { ctx }
	};

	dialog2_1 = new Dialog({ props: dialog2_1_props, $$inline: true });
	/*dialog2_1_binding*/ ctx[11](dialog2_1);

	const block = {
		c: function create() {
			h2 = element("h2");
			h2.textContent = "Dialog";
			t1 = space();
			ul = element("ul");
			li0 = element("li");
			li0.textContent = "simple, small, no dependencies\n\t";
			li1 = element("li");
			li1.textContent = "accessible (full keyboard support, focus trap)";
			t4 = space();
			br = element("br");
			t5 = space();
			create_component(button0.$$.fragment);
			t6 = space();
			create_component(button1.$$.fragment);
			t7 = space();
			create_component(button2.$$.fragment);
			t8 = space();
			p0 = element("p");
			p0.textContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris mollis porttitor justo, eget ornare massa commodo non. Pellentesque semper dictum mauris, id pretium mi mattis in. Proin sodales neque id euismod interdum. Fusce vel blandit orci. Mauris nec ligula aliquam, vestibulum erat nec, ullamcorper nunc. Cras vel lacinia sem. Aenean non tincidunt nisl, vitae consectetur est. Integer id neque tempor, facilisis felis egestas, aliquam turpis. Mauris id consectetur purus. Praesent vehicula, mauris eu hendrerit vehicula, velit tortor fermentum enim, eget malesuada quam eros at quam. Integer mattis egestas tempus.";
			t10 = space();
			p1 = element("p");
			p1.textContent = "Aliquam et purus enim. Suspendisse potenti. Suspendisse tincidunt ullamcorper nulla non gravida. Morbi at tellus dui. Sed orci ligula, facilisis sit amet odio eu, commodo ultricies lorem. Nullam sagittis sapien metus, eu posuere sem iaculis sed. Duis at nibh feugiat, placerat lectus nec, consectetur elit. In sollicitudin est in ultricies gravida. Ut malesuada ex lacinia, posuere augue eget, imperdiet erat. Phasellus ac dui sit amet ligula condimentum venenatis vitae ornare augue. Vivamus pellentesque felis in orci finibus, a accumsan libero consectetur.";
			t12 = space();
			p2 = element("p");
			p2.textContent = "Nulla facilisi. Sed in neque hendrerit, convallis neque a, semper sem. Maecenas suscipit ex quis risus mollis, at tincidunt mi faucibus. Pellentesque in faucibus metus. Etiam sollicitudin accumsan arcu interdum sollicitudin. Suspendisse iaculis congue justo id posuere. Ut sed nisi molestie, egestas nulla at, feugiat neque. Nullam vitae libero eu sem ornare tempus vel id tortor. Ut varius ullamcorper nisl et dignissim. Vestibulum sodales massa id odio aliquet ornare. Nunc mollis quis sapien fringilla ullamcorper. Interdum et malesuada fames ac ante ipsum primis in faucibus. Phasellus eget posuere orci.";
			t14 = space();
			p3 = element("p");
			p3.textContent = "Suspendisse sollicitudin sed ligula nec tempus. Phasellus quis luctus sapien. Nullam nec sapien fringilla, sollicitudin dui sit amet, molestie arcu. Pellentesque id elit et sem pharetra gravida. Donec sed metus ut dui venenatis euismod varius ut libero. Duis ornare odio finibus eros rhoncus ullamcorper. Maecenas auctor lectus volutpat sem pretium volutpat. Mauris blandit quam diam, nec consequat arcu dignissim ut. Donec ac lacus pretium, sollicitudin nisi in, ullamcorper enim. Ut convallis nec eros nec scelerisque. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Mauris non odio a ipsum varius pretium non ut ex. Quisque euismod luctus risus, sit amet venenatis justo vehicula non. Aliquam erat volutpat. Phasellus eu leo ut odio cursus cursus. Pellentesque porta odio id arcu mattis, vitae aliquam risus efficitur.";
			t16 = space();
			p4 = element("p");
			p4.textContent = "Curabitur nec cursus purus. Nullam scelerisque et odio ut pretium. Donec gravida auctor enim, in venenatis mi viverra sit amet. Integer tincidunt lectus quis sagittis pellentesque. Morbi nec ipsum erat. Donec finibus sit amet lorem et dignissim. Praesent pretium consequat enim, quis rutrum nisl imperdiet ut.";
			t18 = space();
			create_component(dialog0.$$.fragment);
			t19 = space();
			create_component(dialog1_1.$$.fragment);
			t20 = space();
			create_component(dialog2_1.$$.fragment);
			add_location(h2, file$3, 0, 0, 0);
			add_location(li0, file$3, 3, 1, 23);
			add_location(li1, file$3, 4, 1, 59);
			add_location(ul, file$3, 2, 0, 17);
			add_location(br, file$3, 6, 0, 116);
			add_location(p0, file$3, 11, 0, 317);
			add_location(p1, file$3, 12, 0, 944);
			add_location(p2, file$3, 13, 0, 1511);
			add_location(p3, file$3, 14, 0, 2127);
			add_location(p4, file$3, 15, 0, 2996);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, h2, anchor);
			insert_dev(target, t1, anchor);
			insert_dev(target, ul, anchor);
			append_dev(ul, li0);
			append_dev(ul, li1);
			insert_dev(target, t4, anchor);
			insert_dev(target, br, anchor);
			insert_dev(target, t5, anchor);
			mount_component(button0, target, anchor);
			insert_dev(target, t6, anchor);
			mount_component(button1, target, anchor);
			insert_dev(target, t7, anchor);
			mount_component(button2, target, anchor);
			insert_dev(target, t8, anchor);
			insert_dev(target, p0, anchor);
			insert_dev(target, t10, anchor);
			insert_dev(target, p1, anchor);
			insert_dev(target, t12, anchor);
			insert_dev(target, p2, anchor);
			insert_dev(target, t14, anchor);
			insert_dev(target, p3, anchor);
			insert_dev(target, t16, anchor);
			insert_dev(target, p4, anchor);
			insert_dev(target, t18, anchor);
			mount_component(dialog0, target, anchor);
			insert_dev(target, t19, anchor);
			mount_component(dialog1_1, target, anchor);
			insert_dev(target, t20, anchor);
			mount_component(dialog2_1, target, anchor);
			current = true;
		},
		p: function update(ctx, [dirty]) {
			const button0_changes = {};

			if (dirty & /*$$scope*/ 4096) {
				button0_changes.$$scope = { dirty, ctx };
			}

			button0.$set(button0_changes);
			const button1_changes = {};

			if (dirty & /*$$scope*/ 4096) {
				button1_changes.$$scope = { dirty, ctx };
			}

			button1.$set(button1_changes);
			const button2_changes = {};

			if (dirty & /*$$scope*/ 4096) {
				button2_changes.$$scope = { dirty, ctx };
			}

			button2.$set(button2_changes);
			const dialog0_changes = {};

			if (dirty & /*$$scope, dialog1*/ 4097) {
				dialog0_changes.$$scope = { dirty, ctx };
			}

			dialog0.$set(dialog0_changes);
			const dialog1_1_changes = {};

			if (dirty & /*$$scope*/ 4096) {
				dialog1_1_changes.$$scope = { dirty, ctx };
			}

			dialog1_1.$set(dialog1_1_changes);
			const dialog2_1_changes = {};

			if (dirty & /*$$scope, dialog3*/ 4100) {
				dialog2_1_changes.$$scope = { dirty, ctx };
			}

			dialog2_1.$set(dialog2_1_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(button0.$$.fragment, local);
			transition_in(button1.$$.fragment, local);
			transition_in(button2.$$.fragment, local);
			transition_in(dialog0.$$.fragment, local);
			transition_in(dialog1_1.$$.fragment, local);
			transition_in(dialog2_1.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(button0.$$.fragment, local);
			transition_out(button1.$$.fragment, local);
			transition_out(button2.$$.fragment, local);
			transition_out(dialog0.$$.fragment, local);
			transition_out(dialog1_1.$$.fragment, local);
			transition_out(dialog2_1.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(h2);
			if (detaching) detach_dev(t1);
			if (detaching) detach_dev(ul);
			if (detaching) detach_dev(t4);
			if (detaching) detach_dev(br);
			if (detaching) detach_dev(t5);
			destroy_component(button0, detaching);
			if (detaching) detach_dev(t6);
			destroy_component(button1, detaching);
			if (detaching) detach_dev(t7);
			destroy_component(button2, detaching);
			if (detaching) detach_dev(t8);
			if (detaching) detach_dev(p0);
			if (detaching) detach_dev(t10);
			if (detaching) detach_dev(p1);
			if (detaching) detach_dev(t12);
			if (detaching) detach_dev(p2);
			if (detaching) detach_dev(t14);
			if (detaching) detach_dev(p3);
			if (detaching) detach_dev(t16);
			if (detaching) detach_dev(p4);
			if (detaching) detach_dev(t18);
			/*dialog0_binding*/ ctx[7](null);
			destroy_component(dialog0, detaching);
			if (detaching) detach_dev(t19);
			/*dialog1_1_binding*/ ctx[8](null);
			destroy_component(dialog1_1, detaching);
			if (detaching) detach_dev(t20);
			/*dialog2_1_binding*/ ctx[11](null);
			destroy_component(dialog2_1, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$3.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$3($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots('Dialog', slots, []);
	let dialog1, dialog2, dialog3;
	const writable_props = [];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Dialog> was created with unknown prop '${key}'`);
	});

	const click_handler = () => dialog1.open();
	const click_handler_1 = () => dialog2.open();
	const click_handler_2 = () => dialog3.open();
	const click_handler_3 = () => dialog1.close();

	function dialog0_binding($$value) {
		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
			dialog1 = $$value;
			$$invalidate(0, dialog1);
		});
	}

	function dialog1_1_binding($$value) {
		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
			dialog2 = $$value;
			$$invalidate(1, dialog2);
		});
	}

	const click_handler_4 = () => dialog3.close();
	const click_handler_5 = () => dialog3.close();

	function dialog2_1_binding($$value) {
		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
			dialog3 = $$value;
			$$invalidate(2, dialog3);
		});
	}

	$$self.$capture_state = () => ({
		Button,
		Dialog,
		dialog1,
		dialog2,
		dialog3
	});

	$$self.$inject_state = $$props => {
		if ('dialog1' in $$props) $$invalidate(0, dialog1 = $$props.dialog1);
		if ('dialog2' in $$props) $$invalidate(1, dialog2 = $$props.dialog2);
		if ('dialog3' in $$props) $$invalidate(2, dialog3 = $$props.dialog3);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [
		dialog1,
		dialog2,
		dialog3,
		click_handler,
		click_handler_1,
		click_handler_2,
		click_handler_3,
		dialog0_binding,
		dialog1_1_binding,
		click_handler_4,
		click_handler_5,
		dialog2_1_binding
	];
}

class Dialog_1 extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Dialog_1",
			options,
			id: create_fragment$3.name
		});
	}
}

/* docs/components/table.svelte generated by Svelte v3.46.4 */
const file$2 = "docs/components/table.svelte";

// (4:1) <Table>
function create_default_slot(ctx) {
	let thead0;
	let tr0;
	let th0;
	let th1;
	let th2;
	let t3;
	let thead1;
	let tr1;
	let th3;
	let t5;
	let tbody0;
	let tr2;
	let td0;
	let td1;
	let td2;
	let t9;
	let tr3;
	let td3;
	let td4;
	let td5;
	let t13;
	let tr4;
	let td6;
	let td7;
	let td8;
	let t17;
	let tr5;
	let td9;
	let td10;
	let td11;
	let t21;
	let tr6;
	let td12;
	let td13;
	let td14;
	let t25;
	let tr7;
	let td15;
	let td16;
	let td17;
	let t29;
	let tr8;
	let td18;
	let td19;
	let td20;
	let t33;
	let tr9;
	let td21;
	let td22;
	let td23;
	let t37;
	let tr10;
	let td24;
	let td25;
	let td26;
	let t41;
	let tr11;
	let td27;
	let td28;
	let td29;
	let t45;
	let tr12;
	let td30;
	let td31;
	let td32;
	let t49;
	let tr13;
	let td33;
	let td34;
	let td35;
	let t53;
	let thead2;
	let tr14;
	let th4;
	let t55;
	let tbody1;
	let tr15;
	let td36;
	let td37;
	let td38;
	let t59;
	let tr16;
	let td39;
	let td40;
	let td41;
	let t63;
	let tr17;
	let td42;
	let td43;
	let td44;
	let t67;
	let tr18;
	let td45;
	let td46;
	let td47;
	let t71;
	let tr19;
	let td48;
	let td49;
	let td50;
	let t75;
	let tr20;
	let td51;
	let td52;
	let td53;
	let t79;
	let tr21;
	let td54;
	let td55;
	let td56;
	let t83;
	let tr22;
	let td57;
	let td58;
	let td59;
	let t87;
	let tr23;
	let td60;
	let td61;
	let td62;
	let t91;
	let tr24;
	let td63;
	let td64;
	let td65;
	let t95;
	let tr25;
	let td66;
	let td67;
	let td68;
	let t99;
	let tr26;
	let td69;
	let td70;
	let td71;
	let t103;
	let thead3;
	let tr27;
	let th5;
	let t105;
	let tbody2;
	let tr28;
	let td72;
	let td73;
	let td74;
	let t109;
	let tr29;
	let td75;
	let td76;
	let td77;
	let t113;
	let tr30;
	let td78;
	let td79;
	let td80;
	let t117;
	let tr31;
	let td81;
	let td82;
	let td83;
	let t121;
	let tr32;
	let td84;
	let td85;
	let td86;
	let t125;
	let tr33;
	let td87;
	let td88;
	let td89;
	let t129;
	let tr34;
	let td90;
	let td91;
	let td92;
	let t133;
	let tr35;
	let td93;
	let td94;
	let td95;
	let t137;
	let tr36;
	let td96;
	let td97;
	let td98;
	let t141;
	let tr37;
	let td99;
	let td100;
	let td101;
	let t145;
	let tr38;
	let td102;
	let td103;
	let td104;
	let t149;
	let tr39;
	let td105;
	let td106;
	let td107;
	let t153;
	let thead4;
	let tr40;
	let th6;
	let t155;
	let tbody3;
	let tr41;
	let td108;
	let td109;
	let td110;
	let t159;
	let tr42;
	let td111;
	let td112;
	let td113;
	let t163;
	let tr43;
	let td114;
	let td115;
	let td116;
	let t167;
	let tr44;
	let td117;
	let td118;
	let td119;
	let t171;
	let tr45;
	let td120;
	let td121;
	let td122;
	let t175;
	let tr46;
	let td123;
	let td124;
	let td125;
	let t179;
	let tr47;
	let td126;
	let td127;
	let td128;
	let t183;
	let tr48;
	let td129;
	let td130;
	let td131;
	let t187;
	let tr49;
	let td132;
	let td133;
	let td134;
	let t191;
	let tr50;
	let td135;
	let td136;
	let td137;
	let t195;
	let tr51;
	let td138;
	let td139;
	let td140;
	let t199;
	let tr52;
	let td141;
	let td142;
	let td143;
	let t203;
	let thead5;
	let tr53;
	let th7;
	let t205;
	let tbody4;
	let tr54;
	let td144;
	let td145;
	let td146;
	let t209;
	let tr55;
	let td147;
	let td148;
	let td149;
	let t213;
	let tr56;
	let td150;
	let td151;
	let td152;
	let t217;
	let tr57;
	let td153;
	let td154;
	let td155;
	let t221;
	let tr58;
	let td156;
	let td157;
	let td158;
	let t225;
	let tr59;
	let td159;
	let td160;
	let td161;
	let t229;
	let tr60;
	let td162;
	let td163;
	let td164;
	let t233;
	let tr61;
	let td165;
	let td166;
	let td167;
	let t237;
	let tr62;
	let td168;
	let td169;
	let td170;
	let t241;
	let tr63;
	let td171;
	let td172;
	let td173;
	let t245;
	let tr64;
	let td174;
	let td175;
	let td176;
	let t249;
	let tr65;
	let td177;
	let td178;
	let td179;
	let t253;
	let tfoot;
	let tr66;
	let td180;
	let td181;

	const block = {
		c: function create() {
			thead0 = element("thead");
			tr0 = element("tr");
			th0 = element("th");
			th0.textContent = "Year";
			th1 = element("th");
			th1.textContent = "Month";
			th2 = element("th");
			th2.textContent = "Price";
			t3 = space();
			thead1 = element("thead");
			tr1 = element("tr");
			th3 = element("th");
			th3.textContent = "Year: 2021";
			t5 = space();
			tbody0 = element("tbody");
			tr2 = element("tr");
			td0 = element("td");
			td0.textContent = "2021";
			td1 = element("td");
			td1.textContent = "January";
			td2 = element("td");
			td2.textContent = "$100";
			t9 = space();
			tr3 = element("tr");
			td3 = element("td");
			td3.textContent = "2021";
			td4 = element("td");
			td4.textContent = "February";
			td5 = element("td");
			td5.textContent = "$80";
			t13 = space();
			tr4 = element("tr");
			td6 = element("td");
			td6.textContent = "2021";
			td7 = element("td");
			td7.textContent = "March";
			td8 = element("td");
			td8.textContent = "$80";
			t17 = space();
			tr5 = element("tr");
			td9 = element("td");
			td9.textContent = "2021";
			td10 = element("td");
			td10.textContent = "April";
			td11 = element("td");
			td11.textContent = "$80";
			t21 = space();
			tr6 = element("tr");
			td12 = element("td");
			td12.textContent = "2021";
			td13 = element("td");
			td13.textContent = "May";
			td14 = element("td");
			td14.textContent = "$80";
			t25 = space();
			tr7 = element("tr");
			td15 = element("td");
			td15.textContent = "2021";
			td16 = element("td");
			td16.textContent = "June";
			td17 = element("td");
			td17.textContent = "$80";
			t29 = space();
			tr8 = element("tr");
			td18 = element("td");
			td18.textContent = "2021";
			td19 = element("td");
			td19.textContent = "July";
			td20 = element("td");
			td20.textContent = "$80";
			t33 = space();
			tr9 = element("tr");
			td21 = element("td");
			td21.textContent = "2021";
			td22 = element("td");
			td22.textContent = "August";
			td23 = element("td");
			td23.textContent = "$80";
			t37 = space();
			tr10 = element("tr");
			td24 = element("td");
			td24.textContent = "2021";
			td25 = element("td");
			td25.textContent = "September";
			td26 = element("td");
			td26.textContent = "$80";
			t41 = space();
			tr11 = element("tr");
			td27 = element("td");
			td27.textContent = "2021";
			td28 = element("td");
			td28.textContent = "October";
			td29 = element("td");
			td29.textContent = "$80";
			t45 = space();
			tr12 = element("tr");
			td30 = element("td");
			td30.textContent = "2021";
			td31 = element("td");
			td31.textContent = "November";
			td32 = element("td");
			td32.textContent = "$80";
			t49 = space();
			tr13 = element("tr");
			td33 = element("td");
			td33.textContent = "2021";
			td34 = element("td");
			td34.textContent = "December";
			td35 = element("td");
			td35.textContent = "$80";
			t53 = space();
			thead2 = element("thead");
			tr14 = element("tr");
			th4 = element("th");
			th4.textContent = "Year: 2020";
			t55 = space();
			tbody1 = element("tbody");
			tr15 = element("tr");
			td36 = element("td");
			td36.textContent = "2020";
			td37 = element("td");
			td37.textContent = "January";
			td38 = element("td");
			td38.textContent = "$100";
			t59 = space();
			tr16 = element("tr");
			td39 = element("td");
			td39.textContent = "2020";
			td40 = element("td");
			td40.textContent = "February";
			td41 = element("td");
			td41.textContent = "$80";
			t63 = space();
			tr17 = element("tr");
			td42 = element("td");
			td42.textContent = "2020";
			td43 = element("td");
			td43.textContent = "March";
			td44 = element("td");
			td44.textContent = "$80";
			t67 = space();
			tr18 = element("tr");
			td45 = element("td");
			td45.textContent = "2020";
			td46 = element("td");
			td46.textContent = "April";
			td47 = element("td");
			td47.textContent = "$80";
			t71 = space();
			tr19 = element("tr");
			td48 = element("td");
			td48.textContent = "2020";
			td49 = element("td");
			td49.textContent = "May";
			td50 = element("td");
			td50.textContent = "$80";
			t75 = space();
			tr20 = element("tr");
			td51 = element("td");
			td51.textContent = "2020";
			td52 = element("td");
			td52.textContent = "June";
			td53 = element("td");
			td53.textContent = "$80";
			t79 = space();
			tr21 = element("tr");
			td54 = element("td");
			td54.textContent = "2020";
			td55 = element("td");
			td55.textContent = "July";
			td56 = element("td");
			td56.textContent = "$80";
			t83 = space();
			tr22 = element("tr");
			td57 = element("td");
			td57.textContent = "2020";
			td58 = element("td");
			td58.textContent = "August";
			td59 = element("td");
			td59.textContent = "$80";
			t87 = space();
			tr23 = element("tr");
			td60 = element("td");
			td60.textContent = "2020";
			td61 = element("td");
			td61.textContent = "September";
			td62 = element("td");
			td62.textContent = "$80";
			t91 = space();
			tr24 = element("tr");
			td63 = element("td");
			td63.textContent = "2020";
			td64 = element("td");
			td64.textContent = "October";
			td65 = element("td");
			td65.textContent = "$80";
			t95 = space();
			tr25 = element("tr");
			td66 = element("td");
			td66.textContent = "2020";
			td67 = element("td");
			td67.textContent = "November";
			td68 = element("td");
			td68.textContent = "$80";
			t99 = space();
			tr26 = element("tr");
			td69 = element("td");
			td69.textContent = "2020";
			td70 = element("td");
			td70.textContent = "December";
			td71 = element("td");
			td71.textContent = "$80";
			t103 = space();
			thead3 = element("thead");
			tr27 = element("tr");
			th5 = element("th");
			th5.textContent = "Year: 2019";
			t105 = space();
			tbody2 = element("tbody");
			tr28 = element("tr");
			td72 = element("td");
			td72.textContent = "2019";
			td73 = element("td");
			td73.textContent = "January";
			td74 = element("td");
			td74.textContent = "$100";
			t109 = space();
			tr29 = element("tr");
			td75 = element("td");
			td75.textContent = "2019";
			td76 = element("td");
			td76.textContent = "February";
			td77 = element("td");
			td77.textContent = "$80";
			t113 = space();
			tr30 = element("tr");
			td78 = element("td");
			td78.textContent = "2019";
			td79 = element("td");
			td79.textContent = "March";
			td80 = element("td");
			td80.textContent = "$80";
			t117 = space();
			tr31 = element("tr");
			td81 = element("td");
			td81.textContent = "2019";
			td82 = element("td");
			td82.textContent = "April";
			td83 = element("td");
			td83.textContent = "$80";
			t121 = space();
			tr32 = element("tr");
			td84 = element("td");
			td84.textContent = "2019";
			td85 = element("td");
			td85.textContent = "May";
			td86 = element("td");
			td86.textContent = "$80";
			t125 = space();
			tr33 = element("tr");
			td87 = element("td");
			td87.textContent = "2019";
			td88 = element("td");
			td88.textContent = "June";
			td89 = element("td");
			td89.textContent = "$80";
			t129 = space();
			tr34 = element("tr");
			td90 = element("td");
			td90.textContent = "2019";
			td91 = element("td");
			td91.textContent = "July";
			td92 = element("td");
			td92.textContent = "$80";
			t133 = space();
			tr35 = element("tr");
			td93 = element("td");
			td93.textContent = "2019";
			td94 = element("td");
			td94.textContent = "August";
			td95 = element("td");
			td95.textContent = "$80";
			t137 = space();
			tr36 = element("tr");
			td96 = element("td");
			td96.textContent = "2019";
			td97 = element("td");
			td97.textContent = "September";
			td98 = element("td");
			td98.textContent = "$80";
			t141 = space();
			tr37 = element("tr");
			td99 = element("td");
			td99.textContent = "2019";
			td100 = element("td");
			td100.textContent = "October";
			td101 = element("td");
			td101.textContent = "$80";
			t145 = space();
			tr38 = element("tr");
			td102 = element("td");
			td102.textContent = "2019";
			td103 = element("td");
			td103.textContent = "November";
			td104 = element("td");
			td104.textContent = "$80";
			t149 = space();
			tr39 = element("tr");
			td105 = element("td");
			td105.textContent = "2019";
			td106 = element("td");
			td106.textContent = "December";
			td107 = element("td");
			td107.textContent = "$80";
			t153 = space();
			thead4 = element("thead");
			tr40 = element("tr");
			th6 = element("th");
			th6.textContent = "Year: 2018";
			t155 = space();
			tbody3 = element("tbody");
			tr41 = element("tr");
			td108 = element("td");
			td108.textContent = "2018";
			td109 = element("td");
			td109.textContent = "January";
			td110 = element("td");
			td110.textContent = "$100";
			t159 = space();
			tr42 = element("tr");
			td111 = element("td");
			td111.textContent = "2018";
			td112 = element("td");
			td112.textContent = "February";
			td113 = element("td");
			td113.textContent = "$80";
			t163 = space();
			tr43 = element("tr");
			td114 = element("td");
			td114.textContent = "2018";
			td115 = element("td");
			td115.textContent = "March";
			td116 = element("td");
			td116.textContent = "$80";
			t167 = space();
			tr44 = element("tr");
			td117 = element("td");
			td117.textContent = "2018";
			td118 = element("td");
			td118.textContent = "April";
			td119 = element("td");
			td119.textContent = "$80";
			t171 = space();
			tr45 = element("tr");
			td120 = element("td");
			td120.textContent = "2018";
			td121 = element("td");
			td121.textContent = "May";
			td122 = element("td");
			td122.textContent = "$80";
			t175 = space();
			tr46 = element("tr");
			td123 = element("td");
			td123.textContent = "2018";
			td124 = element("td");
			td124.textContent = "June";
			td125 = element("td");
			td125.textContent = "$80";
			t179 = space();
			tr47 = element("tr");
			td126 = element("td");
			td126.textContent = "2018";
			td127 = element("td");
			td127.textContent = "July";
			td128 = element("td");
			td128.textContent = "$80";
			t183 = space();
			tr48 = element("tr");
			td129 = element("td");
			td129.textContent = "2018";
			td130 = element("td");
			td130.textContent = "August";
			td131 = element("td");
			td131.textContent = "$80";
			t187 = space();
			tr49 = element("tr");
			td132 = element("td");
			td132.textContent = "2018";
			td133 = element("td");
			td133.textContent = "September";
			td134 = element("td");
			td134.textContent = "$80";
			t191 = space();
			tr50 = element("tr");
			td135 = element("td");
			td135.textContent = "2018";
			td136 = element("td");
			td136.textContent = "October";
			td137 = element("td");
			td137.textContent = "$80";
			t195 = space();
			tr51 = element("tr");
			td138 = element("td");
			td138.textContent = "2018";
			td139 = element("td");
			td139.textContent = "November";
			td140 = element("td");
			td140.textContent = "$80";
			t199 = space();
			tr52 = element("tr");
			td141 = element("td");
			td141.textContent = "2018";
			td142 = element("td");
			td142.textContent = "December";
			td143 = element("td");
			td143.textContent = "$80";
			t203 = space();
			thead5 = element("thead");
			tr53 = element("tr");
			th7 = element("th");
			th7.textContent = "Year: 2017";
			t205 = space();
			tbody4 = element("tbody");
			tr54 = element("tr");
			td144 = element("td");
			td144.textContent = "2017";
			td145 = element("td");
			td145.textContent = "January";
			td146 = element("td");
			td146.textContent = "$100";
			t209 = space();
			tr55 = element("tr");
			td147 = element("td");
			td147.textContent = "2017";
			td148 = element("td");
			td148.textContent = "February";
			td149 = element("td");
			td149.textContent = "$80";
			t213 = space();
			tr56 = element("tr");
			td150 = element("td");
			td150.textContent = "2017";
			td151 = element("td");
			td151.textContent = "March";
			td152 = element("td");
			td152.textContent = "$80";
			t217 = space();
			tr57 = element("tr");
			td153 = element("td");
			td153.textContent = "2017";
			td154 = element("td");
			td154.textContent = "April";
			td155 = element("td");
			td155.textContent = "$80";
			t221 = space();
			tr58 = element("tr");
			td156 = element("td");
			td156.textContent = "2017";
			td157 = element("td");
			td157.textContent = "May";
			td158 = element("td");
			td158.textContent = "$80";
			t225 = space();
			tr59 = element("tr");
			td159 = element("td");
			td159.textContent = "2017";
			td160 = element("td");
			td160.textContent = "June";
			td161 = element("td");
			td161.textContent = "$80";
			t229 = space();
			tr60 = element("tr");
			td162 = element("td");
			td162.textContent = "2017";
			td163 = element("td");
			td163.textContent = "July";
			td164 = element("td");
			td164.textContent = "$80";
			t233 = space();
			tr61 = element("tr");
			td165 = element("td");
			td165.textContent = "2017";
			td166 = element("td");
			td166.textContent = "August";
			td167 = element("td");
			td167.textContent = "$80";
			t237 = space();
			tr62 = element("tr");
			td168 = element("td");
			td168.textContent = "2017";
			td169 = element("td");
			td169.textContent = "September";
			td170 = element("td");
			td170.textContent = "$80";
			t241 = space();
			tr63 = element("tr");
			td171 = element("td");
			td171.textContent = "2017";
			td172 = element("td");
			td172.textContent = "October";
			td173 = element("td");
			td173.textContent = "$80";
			t245 = space();
			tr64 = element("tr");
			td174 = element("td");
			td174.textContent = "2017";
			td175 = element("td");
			td175.textContent = "November";
			td176 = element("td");
			td176.textContent = "$80";
			t249 = space();
			tr65 = element("tr");
			td177 = element("td");
			td177.textContent = "2017";
			td178 = element("td");
			td178.textContent = "December";
			td179 = element("td");
			td179.textContent = "$80";
			t253 = space();
			tfoot = element("tfoot");
			tr66 = element("tr");
			td180 = element("td");
			td180.textContent = "Sum";
			td181 = element("td");
			td181.textContent = "$180";
			add_location(th0, file$2, 5, 7, 65);
			add_location(th1, file$2, 5, 20, 78);
			add_location(th2, file$2, 5, 34, 92);
			add_location(tr0, file$2, 5, 3, 61);
			add_location(thead0, file$2, 4, 2, 50);
			attr_dev(th3, "colspan", "3");
			add_location(th3, file$2, 8, 7, 140);
			add_location(tr1, file$2, 8, 3, 136);
			add_location(thead1, file$2, 7, 2, 125);
			add_location(td0, file$2, 11, 7, 205);
			add_location(td1, file$2, 11, 20, 218);
			add_location(td2, file$2, 11, 36, 234);
			add_location(tr2, file$2, 11, 3, 201);
			add_location(td3, file$2, 12, 7, 260);
			add_location(td4, file$2, 12, 20, 273);
			add_location(td5, file$2, 12, 37, 290);
			add_location(tr3, file$2, 12, 3, 256);
			add_location(td6, file$2, 13, 7, 315);
			add_location(td7, file$2, 13, 20, 328);
			add_location(td8, file$2, 13, 34, 342);
			add_location(tr4, file$2, 13, 3, 311);
			add_location(td9, file$2, 14, 7, 367);
			add_location(td10, file$2, 14, 20, 380);
			add_location(td11, file$2, 14, 34, 394);
			add_location(tr5, file$2, 14, 3, 363);
			add_location(td12, file$2, 15, 7, 419);
			add_location(td13, file$2, 15, 20, 432);
			add_location(td14, file$2, 15, 32, 444);
			add_location(tr6, file$2, 15, 3, 415);
			add_location(td15, file$2, 16, 7, 469);
			add_location(td16, file$2, 16, 20, 482);
			add_location(td17, file$2, 16, 33, 495);
			add_location(tr7, file$2, 16, 3, 465);
			add_location(td18, file$2, 17, 7, 520);
			add_location(td19, file$2, 17, 20, 533);
			add_location(td20, file$2, 17, 33, 546);
			add_location(tr8, file$2, 17, 3, 516);
			add_location(td21, file$2, 18, 7, 571);
			add_location(td22, file$2, 18, 20, 584);
			add_location(td23, file$2, 18, 35, 599);
			add_location(tr9, file$2, 18, 3, 567);
			add_location(td24, file$2, 19, 7, 624);
			add_location(td25, file$2, 19, 20, 637);
			add_location(td26, file$2, 19, 38, 655);
			add_location(tr10, file$2, 19, 3, 620);
			add_location(td27, file$2, 20, 7, 680);
			add_location(td28, file$2, 20, 20, 693);
			add_location(td29, file$2, 20, 36, 709);
			add_location(tr11, file$2, 20, 3, 676);
			add_location(td30, file$2, 21, 7, 734);
			add_location(td31, file$2, 21, 20, 747);
			add_location(td32, file$2, 21, 37, 764);
			add_location(tr12, file$2, 21, 3, 730);
			add_location(td33, file$2, 22, 7, 789);
			add_location(td34, file$2, 22, 20, 802);
			add_location(td35, file$2, 22, 37, 819);
			add_location(tr13, file$2, 22, 3, 785);
			add_location(tbody0, file$2, 10, 2, 190);
			attr_dev(th4, "colspan", "3");
			add_location(th4, file$2, 25, 7, 865);
			add_location(tr14, file$2, 25, 3, 861);
			add_location(thead2, file$2, 24, 2, 850);
			add_location(td36, file$2, 28, 7, 930);
			add_location(td37, file$2, 28, 20, 943);
			add_location(td38, file$2, 28, 36, 959);
			add_location(tr15, file$2, 28, 3, 926);
			add_location(td39, file$2, 29, 7, 985);
			add_location(td40, file$2, 29, 20, 998);
			add_location(td41, file$2, 29, 37, 1015);
			add_location(tr16, file$2, 29, 3, 981);
			add_location(td42, file$2, 30, 7, 1040);
			add_location(td43, file$2, 30, 20, 1053);
			add_location(td44, file$2, 30, 34, 1067);
			add_location(tr17, file$2, 30, 3, 1036);
			add_location(td45, file$2, 31, 7, 1092);
			add_location(td46, file$2, 31, 20, 1105);
			add_location(td47, file$2, 31, 34, 1119);
			add_location(tr18, file$2, 31, 3, 1088);
			add_location(td48, file$2, 32, 7, 1144);
			add_location(td49, file$2, 32, 20, 1157);
			add_location(td50, file$2, 32, 32, 1169);
			add_location(tr19, file$2, 32, 3, 1140);
			add_location(td51, file$2, 33, 7, 1194);
			add_location(td52, file$2, 33, 20, 1207);
			add_location(td53, file$2, 33, 33, 1220);
			add_location(tr20, file$2, 33, 3, 1190);
			add_location(td54, file$2, 34, 7, 1245);
			add_location(td55, file$2, 34, 20, 1258);
			add_location(td56, file$2, 34, 33, 1271);
			add_location(tr21, file$2, 34, 3, 1241);
			add_location(td57, file$2, 35, 7, 1296);
			add_location(td58, file$2, 35, 20, 1309);
			add_location(td59, file$2, 35, 35, 1324);
			add_location(tr22, file$2, 35, 3, 1292);
			add_location(td60, file$2, 36, 7, 1349);
			add_location(td61, file$2, 36, 20, 1362);
			add_location(td62, file$2, 36, 38, 1380);
			add_location(tr23, file$2, 36, 3, 1345);
			add_location(td63, file$2, 37, 7, 1405);
			add_location(td64, file$2, 37, 20, 1418);
			add_location(td65, file$2, 37, 36, 1434);
			add_location(tr24, file$2, 37, 3, 1401);
			add_location(td66, file$2, 38, 7, 1459);
			add_location(td67, file$2, 38, 20, 1472);
			add_location(td68, file$2, 38, 37, 1489);
			add_location(tr25, file$2, 38, 3, 1455);
			add_location(td69, file$2, 39, 7, 1514);
			add_location(td70, file$2, 39, 20, 1527);
			add_location(td71, file$2, 39, 37, 1544);
			add_location(tr26, file$2, 39, 3, 1510);
			add_location(tbody1, file$2, 27, 2, 915);
			attr_dev(th5, "colspan", "3");
			add_location(th5, file$2, 42, 7, 1590);
			add_location(tr27, file$2, 42, 3, 1586);
			add_location(thead3, file$2, 41, 2, 1575);
			add_location(td72, file$2, 45, 7, 1655);
			add_location(td73, file$2, 45, 20, 1668);
			add_location(td74, file$2, 45, 36, 1684);
			add_location(tr28, file$2, 45, 3, 1651);
			add_location(td75, file$2, 46, 7, 1710);
			add_location(td76, file$2, 46, 20, 1723);
			add_location(td77, file$2, 46, 37, 1740);
			add_location(tr29, file$2, 46, 3, 1706);
			add_location(td78, file$2, 47, 7, 1765);
			add_location(td79, file$2, 47, 20, 1778);
			add_location(td80, file$2, 47, 34, 1792);
			add_location(tr30, file$2, 47, 3, 1761);
			add_location(td81, file$2, 48, 7, 1817);
			add_location(td82, file$2, 48, 20, 1830);
			add_location(td83, file$2, 48, 34, 1844);
			add_location(tr31, file$2, 48, 3, 1813);
			add_location(td84, file$2, 49, 7, 1869);
			add_location(td85, file$2, 49, 20, 1882);
			add_location(td86, file$2, 49, 32, 1894);
			add_location(tr32, file$2, 49, 3, 1865);
			add_location(td87, file$2, 50, 7, 1919);
			add_location(td88, file$2, 50, 20, 1932);
			add_location(td89, file$2, 50, 33, 1945);
			add_location(tr33, file$2, 50, 3, 1915);
			add_location(td90, file$2, 51, 7, 1970);
			add_location(td91, file$2, 51, 20, 1983);
			add_location(td92, file$2, 51, 33, 1996);
			add_location(tr34, file$2, 51, 3, 1966);
			add_location(td93, file$2, 52, 7, 2021);
			add_location(td94, file$2, 52, 20, 2034);
			add_location(td95, file$2, 52, 35, 2049);
			add_location(tr35, file$2, 52, 3, 2017);
			add_location(td96, file$2, 53, 7, 2074);
			add_location(td97, file$2, 53, 20, 2087);
			add_location(td98, file$2, 53, 38, 2105);
			add_location(tr36, file$2, 53, 3, 2070);
			add_location(td99, file$2, 54, 7, 2130);
			add_location(td100, file$2, 54, 20, 2143);
			add_location(td101, file$2, 54, 36, 2159);
			add_location(tr37, file$2, 54, 3, 2126);
			add_location(td102, file$2, 55, 7, 2184);
			add_location(td103, file$2, 55, 20, 2197);
			add_location(td104, file$2, 55, 37, 2214);
			add_location(tr38, file$2, 55, 3, 2180);
			add_location(td105, file$2, 56, 7, 2239);
			add_location(td106, file$2, 56, 20, 2252);
			add_location(td107, file$2, 56, 37, 2269);
			add_location(tr39, file$2, 56, 3, 2235);
			add_location(tbody2, file$2, 44, 2, 1640);
			attr_dev(th6, "colspan", "3");
			add_location(th6, file$2, 59, 7, 2315);
			add_location(tr40, file$2, 59, 3, 2311);
			add_location(thead4, file$2, 58, 2, 2300);
			add_location(td108, file$2, 62, 7, 2380);
			add_location(td109, file$2, 62, 20, 2393);
			add_location(td110, file$2, 62, 36, 2409);
			add_location(tr41, file$2, 62, 3, 2376);
			add_location(td111, file$2, 63, 7, 2435);
			add_location(td112, file$2, 63, 20, 2448);
			add_location(td113, file$2, 63, 37, 2465);
			add_location(tr42, file$2, 63, 3, 2431);
			add_location(td114, file$2, 64, 7, 2490);
			add_location(td115, file$2, 64, 20, 2503);
			add_location(td116, file$2, 64, 34, 2517);
			add_location(tr43, file$2, 64, 3, 2486);
			add_location(td117, file$2, 65, 7, 2542);
			add_location(td118, file$2, 65, 20, 2555);
			add_location(td119, file$2, 65, 34, 2569);
			add_location(tr44, file$2, 65, 3, 2538);
			add_location(td120, file$2, 66, 7, 2594);
			add_location(td121, file$2, 66, 20, 2607);
			add_location(td122, file$2, 66, 32, 2619);
			add_location(tr45, file$2, 66, 3, 2590);
			add_location(td123, file$2, 67, 7, 2644);
			add_location(td124, file$2, 67, 20, 2657);
			add_location(td125, file$2, 67, 33, 2670);
			add_location(tr46, file$2, 67, 3, 2640);
			add_location(td126, file$2, 68, 7, 2695);
			add_location(td127, file$2, 68, 20, 2708);
			add_location(td128, file$2, 68, 33, 2721);
			add_location(tr47, file$2, 68, 3, 2691);
			add_location(td129, file$2, 69, 7, 2746);
			add_location(td130, file$2, 69, 20, 2759);
			add_location(td131, file$2, 69, 35, 2774);
			add_location(tr48, file$2, 69, 3, 2742);
			add_location(td132, file$2, 70, 7, 2799);
			add_location(td133, file$2, 70, 20, 2812);
			add_location(td134, file$2, 70, 38, 2830);
			add_location(tr49, file$2, 70, 3, 2795);
			add_location(td135, file$2, 71, 7, 2855);
			add_location(td136, file$2, 71, 20, 2868);
			add_location(td137, file$2, 71, 36, 2884);
			add_location(tr50, file$2, 71, 3, 2851);
			add_location(td138, file$2, 72, 7, 2909);
			add_location(td139, file$2, 72, 20, 2922);
			add_location(td140, file$2, 72, 37, 2939);
			add_location(tr51, file$2, 72, 3, 2905);
			add_location(td141, file$2, 73, 7, 2964);
			add_location(td142, file$2, 73, 20, 2977);
			add_location(td143, file$2, 73, 37, 2994);
			add_location(tr52, file$2, 73, 3, 2960);
			add_location(tbody3, file$2, 61, 2, 2365);
			attr_dev(th7, "colspan", "3");
			add_location(th7, file$2, 76, 7, 3040);
			add_location(tr53, file$2, 76, 3, 3036);
			add_location(thead5, file$2, 75, 2, 3025);
			add_location(td144, file$2, 79, 7, 3105);
			add_location(td145, file$2, 79, 20, 3118);
			add_location(td146, file$2, 79, 36, 3134);
			add_location(tr54, file$2, 79, 3, 3101);
			add_location(td147, file$2, 80, 7, 3160);
			add_location(td148, file$2, 80, 20, 3173);
			add_location(td149, file$2, 80, 37, 3190);
			add_location(tr55, file$2, 80, 3, 3156);
			add_location(td150, file$2, 81, 7, 3215);
			add_location(td151, file$2, 81, 20, 3228);
			add_location(td152, file$2, 81, 34, 3242);
			add_location(tr56, file$2, 81, 3, 3211);
			add_location(td153, file$2, 82, 7, 3267);
			add_location(td154, file$2, 82, 20, 3280);
			add_location(td155, file$2, 82, 34, 3294);
			add_location(tr57, file$2, 82, 3, 3263);
			add_location(td156, file$2, 83, 7, 3319);
			add_location(td157, file$2, 83, 20, 3332);
			add_location(td158, file$2, 83, 32, 3344);
			add_location(tr58, file$2, 83, 3, 3315);
			add_location(td159, file$2, 84, 7, 3369);
			add_location(td160, file$2, 84, 20, 3382);
			add_location(td161, file$2, 84, 33, 3395);
			add_location(tr59, file$2, 84, 3, 3365);
			add_location(td162, file$2, 85, 7, 3420);
			add_location(td163, file$2, 85, 20, 3433);
			add_location(td164, file$2, 85, 33, 3446);
			add_location(tr60, file$2, 85, 3, 3416);
			add_location(td165, file$2, 86, 7, 3471);
			add_location(td166, file$2, 86, 20, 3484);
			add_location(td167, file$2, 86, 35, 3499);
			add_location(tr61, file$2, 86, 3, 3467);
			add_location(td168, file$2, 87, 7, 3524);
			add_location(td169, file$2, 87, 20, 3537);
			add_location(td170, file$2, 87, 38, 3555);
			add_location(tr62, file$2, 87, 3, 3520);
			add_location(td171, file$2, 88, 7, 3580);
			add_location(td172, file$2, 88, 20, 3593);
			add_location(td173, file$2, 88, 36, 3609);
			add_location(tr63, file$2, 88, 3, 3576);
			add_location(td174, file$2, 89, 7, 3634);
			add_location(td175, file$2, 89, 20, 3647);
			add_location(td176, file$2, 89, 37, 3664);
			add_location(tr64, file$2, 89, 3, 3630);
			add_location(td177, file$2, 90, 7, 3689);
			add_location(td178, file$2, 90, 20, 3702);
			add_location(td179, file$2, 90, 37, 3719);
			add_location(tr65, file$2, 90, 3, 3685);
			add_location(tbody4, file$2, 78, 2, 3090);
			attr_dev(td180, "colspan", "2");
			add_location(td180, file$2, 93, 7, 3765);
			add_location(td181, file$2, 93, 31, 3789);
			add_location(tr66, file$2, 93, 3, 3761);
			add_location(tfoot, file$2, 92, 2, 3750);
		},
		m: function mount(target, anchor) {
			insert_dev(target, thead0, anchor);
			append_dev(thead0, tr0);
			append_dev(tr0, th0);
			append_dev(tr0, th1);
			append_dev(tr0, th2);
			insert_dev(target, t3, anchor);
			insert_dev(target, thead1, anchor);
			append_dev(thead1, tr1);
			append_dev(tr1, th3);
			insert_dev(target, t5, anchor);
			insert_dev(target, tbody0, anchor);
			append_dev(tbody0, tr2);
			append_dev(tr2, td0);
			append_dev(tr2, td1);
			append_dev(tr2, td2);
			append_dev(tbody0, t9);
			append_dev(tbody0, tr3);
			append_dev(tr3, td3);
			append_dev(tr3, td4);
			append_dev(tr3, td5);
			append_dev(tbody0, t13);
			append_dev(tbody0, tr4);
			append_dev(tr4, td6);
			append_dev(tr4, td7);
			append_dev(tr4, td8);
			append_dev(tbody0, t17);
			append_dev(tbody0, tr5);
			append_dev(tr5, td9);
			append_dev(tr5, td10);
			append_dev(tr5, td11);
			append_dev(tbody0, t21);
			append_dev(tbody0, tr6);
			append_dev(tr6, td12);
			append_dev(tr6, td13);
			append_dev(tr6, td14);
			append_dev(tbody0, t25);
			append_dev(tbody0, tr7);
			append_dev(tr7, td15);
			append_dev(tr7, td16);
			append_dev(tr7, td17);
			append_dev(tbody0, t29);
			append_dev(tbody0, tr8);
			append_dev(tr8, td18);
			append_dev(tr8, td19);
			append_dev(tr8, td20);
			append_dev(tbody0, t33);
			append_dev(tbody0, tr9);
			append_dev(tr9, td21);
			append_dev(tr9, td22);
			append_dev(tr9, td23);
			append_dev(tbody0, t37);
			append_dev(tbody0, tr10);
			append_dev(tr10, td24);
			append_dev(tr10, td25);
			append_dev(tr10, td26);
			append_dev(tbody0, t41);
			append_dev(tbody0, tr11);
			append_dev(tr11, td27);
			append_dev(tr11, td28);
			append_dev(tr11, td29);
			append_dev(tbody0, t45);
			append_dev(tbody0, tr12);
			append_dev(tr12, td30);
			append_dev(tr12, td31);
			append_dev(tr12, td32);
			append_dev(tbody0, t49);
			append_dev(tbody0, tr13);
			append_dev(tr13, td33);
			append_dev(tr13, td34);
			append_dev(tr13, td35);
			insert_dev(target, t53, anchor);
			insert_dev(target, thead2, anchor);
			append_dev(thead2, tr14);
			append_dev(tr14, th4);
			insert_dev(target, t55, anchor);
			insert_dev(target, tbody1, anchor);
			append_dev(tbody1, tr15);
			append_dev(tr15, td36);
			append_dev(tr15, td37);
			append_dev(tr15, td38);
			append_dev(tbody1, t59);
			append_dev(tbody1, tr16);
			append_dev(tr16, td39);
			append_dev(tr16, td40);
			append_dev(tr16, td41);
			append_dev(tbody1, t63);
			append_dev(tbody1, tr17);
			append_dev(tr17, td42);
			append_dev(tr17, td43);
			append_dev(tr17, td44);
			append_dev(tbody1, t67);
			append_dev(tbody1, tr18);
			append_dev(tr18, td45);
			append_dev(tr18, td46);
			append_dev(tr18, td47);
			append_dev(tbody1, t71);
			append_dev(tbody1, tr19);
			append_dev(tr19, td48);
			append_dev(tr19, td49);
			append_dev(tr19, td50);
			append_dev(tbody1, t75);
			append_dev(tbody1, tr20);
			append_dev(tr20, td51);
			append_dev(tr20, td52);
			append_dev(tr20, td53);
			append_dev(tbody1, t79);
			append_dev(tbody1, tr21);
			append_dev(tr21, td54);
			append_dev(tr21, td55);
			append_dev(tr21, td56);
			append_dev(tbody1, t83);
			append_dev(tbody1, tr22);
			append_dev(tr22, td57);
			append_dev(tr22, td58);
			append_dev(tr22, td59);
			append_dev(tbody1, t87);
			append_dev(tbody1, tr23);
			append_dev(tr23, td60);
			append_dev(tr23, td61);
			append_dev(tr23, td62);
			append_dev(tbody1, t91);
			append_dev(tbody1, tr24);
			append_dev(tr24, td63);
			append_dev(tr24, td64);
			append_dev(tr24, td65);
			append_dev(tbody1, t95);
			append_dev(tbody1, tr25);
			append_dev(tr25, td66);
			append_dev(tr25, td67);
			append_dev(tr25, td68);
			append_dev(tbody1, t99);
			append_dev(tbody1, tr26);
			append_dev(tr26, td69);
			append_dev(tr26, td70);
			append_dev(tr26, td71);
			insert_dev(target, t103, anchor);
			insert_dev(target, thead3, anchor);
			append_dev(thead3, tr27);
			append_dev(tr27, th5);
			insert_dev(target, t105, anchor);
			insert_dev(target, tbody2, anchor);
			append_dev(tbody2, tr28);
			append_dev(tr28, td72);
			append_dev(tr28, td73);
			append_dev(tr28, td74);
			append_dev(tbody2, t109);
			append_dev(tbody2, tr29);
			append_dev(tr29, td75);
			append_dev(tr29, td76);
			append_dev(tr29, td77);
			append_dev(tbody2, t113);
			append_dev(tbody2, tr30);
			append_dev(tr30, td78);
			append_dev(tr30, td79);
			append_dev(tr30, td80);
			append_dev(tbody2, t117);
			append_dev(tbody2, tr31);
			append_dev(tr31, td81);
			append_dev(tr31, td82);
			append_dev(tr31, td83);
			append_dev(tbody2, t121);
			append_dev(tbody2, tr32);
			append_dev(tr32, td84);
			append_dev(tr32, td85);
			append_dev(tr32, td86);
			append_dev(tbody2, t125);
			append_dev(tbody2, tr33);
			append_dev(tr33, td87);
			append_dev(tr33, td88);
			append_dev(tr33, td89);
			append_dev(tbody2, t129);
			append_dev(tbody2, tr34);
			append_dev(tr34, td90);
			append_dev(tr34, td91);
			append_dev(tr34, td92);
			append_dev(tbody2, t133);
			append_dev(tbody2, tr35);
			append_dev(tr35, td93);
			append_dev(tr35, td94);
			append_dev(tr35, td95);
			append_dev(tbody2, t137);
			append_dev(tbody2, tr36);
			append_dev(tr36, td96);
			append_dev(tr36, td97);
			append_dev(tr36, td98);
			append_dev(tbody2, t141);
			append_dev(tbody2, tr37);
			append_dev(tr37, td99);
			append_dev(tr37, td100);
			append_dev(tr37, td101);
			append_dev(tbody2, t145);
			append_dev(tbody2, tr38);
			append_dev(tr38, td102);
			append_dev(tr38, td103);
			append_dev(tr38, td104);
			append_dev(tbody2, t149);
			append_dev(tbody2, tr39);
			append_dev(tr39, td105);
			append_dev(tr39, td106);
			append_dev(tr39, td107);
			insert_dev(target, t153, anchor);
			insert_dev(target, thead4, anchor);
			append_dev(thead4, tr40);
			append_dev(tr40, th6);
			insert_dev(target, t155, anchor);
			insert_dev(target, tbody3, anchor);
			append_dev(tbody3, tr41);
			append_dev(tr41, td108);
			append_dev(tr41, td109);
			append_dev(tr41, td110);
			append_dev(tbody3, t159);
			append_dev(tbody3, tr42);
			append_dev(tr42, td111);
			append_dev(tr42, td112);
			append_dev(tr42, td113);
			append_dev(tbody3, t163);
			append_dev(tbody3, tr43);
			append_dev(tr43, td114);
			append_dev(tr43, td115);
			append_dev(tr43, td116);
			append_dev(tbody3, t167);
			append_dev(tbody3, tr44);
			append_dev(tr44, td117);
			append_dev(tr44, td118);
			append_dev(tr44, td119);
			append_dev(tbody3, t171);
			append_dev(tbody3, tr45);
			append_dev(tr45, td120);
			append_dev(tr45, td121);
			append_dev(tr45, td122);
			append_dev(tbody3, t175);
			append_dev(tbody3, tr46);
			append_dev(tr46, td123);
			append_dev(tr46, td124);
			append_dev(tr46, td125);
			append_dev(tbody3, t179);
			append_dev(tbody3, tr47);
			append_dev(tr47, td126);
			append_dev(tr47, td127);
			append_dev(tr47, td128);
			append_dev(tbody3, t183);
			append_dev(tbody3, tr48);
			append_dev(tr48, td129);
			append_dev(tr48, td130);
			append_dev(tr48, td131);
			append_dev(tbody3, t187);
			append_dev(tbody3, tr49);
			append_dev(tr49, td132);
			append_dev(tr49, td133);
			append_dev(tr49, td134);
			append_dev(tbody3, t191);
			append_dev(tbody3, tr50);
			append_dev(tr50, td135);
			append_dev(tr50, td136);
			append_dev(tr50, td137);
			append_dev(tbody3, t195);
			append_dev(tbody3, tr51);
			append_dev(tr51, td138);
			append_dev(tr51, td139);
			append_dev(tr51, td140);
			append_dev(tbody3, t199);
			append_dev(tbody3, tr52);
			append_dev(tr52, td141);
			append_dev(tr52, td142);
			append_dev(tr52, td143);
			insert_dev(target, t203, anchor);
			insert_dev(target, thead5, anchor);
			append_dev(thead5, tr53);
			append_dev(tr53, th7);
			insert_dev(target, t205, anchor);
			insert_dev(target, tbody4, anchor);
			append_dev(tbody4, tr54);
			append_dev(tr54, td144);
			append_dev(tr54, td145);
			append_dev(tr54, td146);
			append_dev(tbody4, t209);
			append_dev(tbody4, tr55);
			append_dev(tr55, td147);
			append_dev(tr55, td148);
			append_dev(tr55, td149);
			append_dev(tbody4, t213);
			append_dev(tbody4, tr56);
			append_dev(tr56, td150);
			append_dev(tr56, td151);
			append_dev(tr56, td152);
			append_dev(tbody4, t217);
			append_dev(tbody4, tr57);
			append_dev(tr57, td153);
			append_dev(tr57, td154);
			append_dev(tr57, td155);
			append_dev(tbody4, t221);
			append_dev(tbody4, tr58);
			append_dev(tr58, td156);
			append_dev(tr58, td157);
			append_dev(tr58, td158);
			append_dev(tbody4, t225);
			append_dev(tbody4, tr59);
			append_dev(tr59, td159);
			append_dev(tr59, td160);
			append_dev(tr59, td161);
			append_dev(tbody4, t229);
			append_dev(tbody4, tr60);
			append_dev(tr60, td162);
			append_dev(tr60, td163);
			append_dev(tr60, td164);
			append_dev(tbody4, t233);
			append_dev(tbody4, tr61);
			append_dev(tr61, td165);
			append_dev(tr61, td166);
			append_dev(tr61, td167);
			append_dev(tbody4, t237);
			append_dev(tbody4, tr62);
			append_dev(tr62, td168);
			append_dev(tr62, td169);
			append_dev(tr62, td170);
			append_dev(tbody4, t241);
			append_dev(tbody4, tr63);
			append_dev(tr63, td171);
			append_dev(tr63, td172);
			append_dev(tr63, td173);
			append_dev(tbody4, t245);
			append_dev(tbody4, tr64);
			append_dev(tr64, td174);
			append_dev(tr64, td175);
			append_dev(tr64, td176);
			append_dev(tbody4, t249);
			append_dev(tbody4, tr65);
			append_dev(tr65, td177);
			append_dev(tr65, td178);
			append_dev(tr65, td179);
			insert_dev(target, t253, anchor);
			insert_dev(target, tfoot, anchor);
			append_dev(tfoot, tr66);
			append_dev(tr66, td180);
			append_dev(tr66, td181);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(thead0);
			if (detaching) detach_dev(t3);
			if (detaching) detach_dev(thead1);
			if (detaching) detach_dev(t5);
			if (detaching) detach_dev(tbody0);
			if (detaching) detach_dev(t53);
			if (detaching) detach_dev(thead2);
			if (detaching) detach_dev(t55);
			if (detaching) detach_dev(tbody1);
			if (detaching) detach_dev(t103);
			if (detaching) detach_dev(thead3);
			if (detaching) detach_dev(t105);
			if (detaching) detach_dev(tbody2);
			if (detaching) detach_dev(t153);
			if (detaching) detach_dev(thead4);
			if (detaching) detach_dev(t155);
			if (detaching) detach_dev(tbody3);
			if (detaching) detach_dev(t203);
			if (detaching) detach_dev(thead5);
			if (detaching) detach_dev(t205);
			if (detaching) detach_dev(tbody4);
			if (detaching) detach_dev(t253);
			if (detaching) detach_dev(tfoot);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot.name,
		type: "slot",
		source: "(4:1) <Table>",
		ctx
	});

	return block;
}

function create_fragment$2(ctx) {
	let h2;
	let t1;
	let div;
	let table;
	let current;

	table = new Table({
			props: {
				$$slots: { default: [create_default_slot] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	const block = {
		c: function create() {
			h2 = element("h2");
			h2.textContent = "Table";
			t1 = space();
			div = element("div");
			create_component(table.$$.fragment);
			add_location(h2, file$2, 0, 0, 0);
			attr_dev(div, "class", "viewport");
			add_location(div, file$2, 2, 0, 16);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, h2, anchor);
			insert_dev(target, t1, anchor);
			insert_dev(target, div, anchor);
			mount_component(table, div, null);
			current = true;
		},
		p: function update(ctx, [dirty]) {
			const table_changes = {};

			if (dirty & /*$$scope*/ 1) {
				table_changes.$$scope = { dirty, ctx };
			}

			table.$set(table_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(table.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(table.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(h2);
			if (detaching) detach_dev(t1);
			if (detaching) detach_dev(div);
			destroy_component(table);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$2.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$2($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots('Table', slots, []);
	const writable_props = [];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Table> was created with unknown prop '${key}'`);
	});

	$$self.$capture_state = () => ({ Table });
	return [];
}

class Table_1 extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Table_1",
			options,
			id: create_fragment$2.name
		});
	}
}

/* docs/app/nav.svelte generated by Svelte v3.46.4 */
const file$1 = "docs/app/nav.svelte";

function create_fragment$1(ctx) {
	let nav;
	let h30;
	let t1;
	let navitem0;
	let t2;
	let navitem1;
	let t3;
	let navitem2;
	let t4;
	let navitem3;
	let t5;
	let navitem4;
	let t6;
	let navitem5;
	let t7;
	let navitem6;
	let t8;
	let navitem7;
	let t9;
	let navitem8;
	let t10;
	let h31;
	let t12;
	let navitem9;
	let t13;
	let navitem10;
	let t14;
	let navitem11;
	let t15;
	let navitem12;
	let t16;
	let h32;
	let t18;
	let navitem13;
	let t19;
	let navitem14;
	let t20;
	let navitem15;
	let t21;
	let navitem16;
	let t22;
	let navitem17;
	let current;
	let mounted;
	let dispose;

	navitem0 = new Nav_item({
			props: {
				name: "Autocomplete",
				active: /*active*/ ctx[0]
			},
			$$inline: true
		});

	navitem1 = new Nav_item({
			props: {
				name: "Button",
				active: /*active*/ ctx[0]
			},
			$$inline: true
		});

	navitem2 = new Nav_item({
			props: {
				name: "Datepicker",
				active: /*active*/ ctx[0]
			},
			$$inline: true
		});

	navitem3 = new Nav_item({
			props: { name: "Input", active: /*active*/ ctx[0] },
			$$inline: true
		});

	navitem4 = new Nav_item({
			props: {
				name: "Input Math",
				active: /*active*/ ctx[0]
			},
			$$inline: true
		});

	navitem5 = new Nav_item({
			props: {
				name: "Password",
				hash: "InputPassword",
				active: /*active*/ ctx[0]
			},
			$$inline: true
		});

	navitem6 = new Nav_item({
			props: {
				name: "Select",
				active: /*active*/ ctx[0]
			},
			$$inline: true
		});

	navitem7 = new Nav_item({
			props: {
				name: "Textarea",
				active: /*active*/ ctx[0]
			},
			$$inline: true
		});

	navitem8 = new Nav_item({
			props: {
				name: "Toggle",
				active: /*active*/ ctx[0]
			},
			$$inline: true
		});

	navitem9 = new Nav_item({
			props: {
				name: "Drawer",
				active: /*active*/ ctx[0]
			},
			$$inline: true
		});

	navitem10 = new Nav_item({
			props: { name: "Panel", active: /*active*/ ctx[0] },
			$$inline: true
		});

	navitem11 = new Nav_item({
			props: {
				name: "Dialog",
				active: /*active*/ ctx[0]
			},
			$$inline: true
		});

	navitem12 = new Nav_item({
			props: { name: "Table", active: /*active*/ ctx[0] },
			$$inline: true
		});

	navitem13 = new Nav_item({
			props: {
				name: "Context Menu",
				active: /*active*/ ctx[0]
			},
			$$inline: true
		});

	navitem14 = new Nav_item({
			props: { name: "Icon", active: /*active*/ ctx[0] },
			$$inline: true
		});

	navitem15 = new Nav_item({
			props: {
				name: "TextFit",
				active: /*active*/ ctx[0]
			},
			$$inline: true
		});

	navitem16 = new Nav_item({
			props: {
				name: "Toaster",
				active: /*active*/ ctx[0]
			},
			$$inline: true
		});

	navitem17 = new Nav_item({
			props: {
				name: "Color Palette",
				active: /*active*/ ctx[0]
			},
			$$inline: true
		});

	const block = {
		c: function create() {
			nav = element("nav");
			h30 = element("h3");
			h30.textContent = "Form Controls";
			t1 = space();
			create_component(navitem0.$$.fragment);
			t2 = space();
			create_component(navitem1.$$.fragment);
			t3 = space();
			create_component(navitem2.$$.fragment);
			t4 = space();
			create_component(navitem3.$$.fragment);
			t5 = space();
			create_component(navitem4.$$.fragment);
			t6 = space();
			create_component(navitem5.$$.fragment);
			t7 = space();
			create_component(navitem6.$$.fragment);
			t8 = space();
			create_component(navitem7.$$.fragment);
			t9 = space();
			create_component(navitem8.$$.fragment);
			t10 = space();
			h31 = element("h3");
			h31.textContent = "Containers";
			t12 = space();
			create_component(navitem9.$$.fragment);
			t13 = space();
			create_component(navitem10.$$.fragment);
			t14 = space();
			create_component(navitem11.$$.fragment);
			t15 = space();
			create_component(navitem12.$$.fragment);
			t16 = space();
			h32 = element("h3");
			h32.textContent = "Generic";
			t18 = space();
			create_component(navitem13.$$.fragment);
			t19 = space();
			create_component(navitem14.$$.fragment);
			t20 = space();
			create_component(navitem15.$$.fragment);
			t21 = space();
			create_component(navitem16.$$.fragment);
			t22 = space();
			create_component(navitem17.$$.fragment);
			add_location(h30, file$1, 1, 1, 7);
			add_location(h31, file$1, 12, 1, 394);
			add_location(h32, file$1, 18, 1, 558);
			add_location(nav, file$1, 0, 0, 0);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, nav, anchor);
			append_dev(nav, h30);
			append_dev(nav, t1);
			mount_component(navitem0, nav, null);
			append_dev(nav, t2);
			mount_component(navitem1, nav, null);
			append_dev(nav, t3);
			mount_component(navitem2, nav, null);
			append_dev(nav, t4);
			mount_component(navitem3, nav, null);
			append_dev(nav, t5);
			mount_component(navitem4, nav, null);
			append_dev(nav, t6);
			mount_component(navitem5, nav, null);
			append_dev(nav, t7);
			mount_component(navitem6, nav, null);
			append_dev(nav, t8);
			mount_component(navitem7, nav, null);
			append_dev(nav, t9);
			mount_component(navitem8, nav, null);
			append_dev(nav, t10);
			append_dev(nav, h31);
			append_dev(nav, t12);
			mount_component(navitem9, nav, null);
			append_dev(nav, t13);
			mount_component(navitem10, nav, null);
			append_dev(nav, t14);
			mount_component(navitem11, nav, null);
			append_dev(nav, t15);
			mount_component(navitem12, nav, null);
			append_dev(nav, t16);
			append_dev(nav, h32);
			append_dev(nav, t18);
			mount_component(navitem13, nav, null);
			append_dev(nav, t19);
			mount_component(navitem14, nav, null);
			append_dev(nav, t20);
			mount_component(navitem15, nav, null);
			append_dev(nav, t21);
			mount_component(navitem16, nav, null);
			append_dev(nav, t22);
			mount_component(navitem17, nav, null);
			current = true;

			if (!mounted) {
				dispose = listen_dev(window, "hashchange", /*onhashchange*/ ctx[1], false, false, false);
				mounted = true;
			}
		},
		p: function update(ctx, [dirty]) {
			const navitem0_changes = {};
			if (dirty & /*active*/ 1) navitem0_changes.active = /*active*/ ctx[0];
			navitem0.$set(navitem0_changes);
			const navitem1_changes = {};
			if (dirty & /*active*/ 1) navitem1_changes.active = /*active*/ ctx[0];
			navitem1.$set(navitem1_changes);
			const navitem2_changes = {};
			if (dirty & /*active*/ 1) navitem2_changes.active = /*active*/ ctx[0];
			navitem2.$set(navitem2_changes);
			const navitem3_changes = {};
			if (dirty & /*active*/ 1) navitem3_changes.active = /*active*/ ctx[0];
			navitem3.$set(navitem3_changes);
			const navitem4_changes = {};
			if (dirty & /*active*/ 1) navitem4_changes.active = /*active*/ ctx[0];
			navitem4.$set(navitem4_changes);
			const navitem5_changes = {};
			if (dirty & /*active*/ 1) navitem5_changes.active = /*active*/ ctx[0];
			navitem5.$set(navitem5_changes);
			const navitem6_changes = {};
			if (dirty & /*active*/ 1) navitem6_changes.active = /*active*/ ctx[0];
			navitem6.$set(navitem6_changes);
			const navitem7_changes = {};
			if (dirty & /*active*/ 1) navitem7_changes.active = /*active*/ ctx[0];
			navitem7.$set(navitem7_changes);
			const navitem8_changes = {};
			if (dirty & /*active*/ 1) navitem8_changes.active = /*active*/ ctx[0];
			navitem8.$set(navitem8_changes);
			const navitem9_changes = {};
			if (dirty & /*active*/ 1) navitem9_changes.active = /*active*/ ctx[0];
			navitem9.$set(navitem9_changes);
			const navitem10_changes = {};
			if (dirty & /*active*/ 1) navitem10_changes.active = /*active*/ ctx[0];
			navitem10.$set(navitem10_changes);
			const navitem11_changes = {};
			if (dirty & /*active*/ 1) navitem11_changes.active = /*active*/ ctx[0];
			navitem11.$set(navitem11_changes);
			const navitem12_changes = {};
			if (dirty & /*active*/ 1) navitem12_changes.active = /*active*/ ctx[0];
			navitem12.$set(navitem12_changes);
			const navitem13_changes = {};
			if (dirty & /*active*/ 1) navitem13_changes.active = /*active*/ ctx[0];
			navitem13.$set(navitem13_changes);
			const navitem14_changes = {};
			if (dirty & /*active*/ 1) navitem14_changes.active = /*active*/ ctx[0];
			navitem14.$set(navitem14_changes);
			const navitem15_changes = {};
			if (dirty & /*active*/ 1) navitem15_changes.active = /*active*/ ctx[0];
			navitem15.$set(navitem15_changes);
			const navitem16_changes = {};
			if (dirty & /*active*/ 1) navitem16_changes.active = /*active*/ ctx[0];
			navitem16.$set(navitem16_changes);
			const navitem17_changes = {};
			if (dirty & /*active*/ 1) navitem17_changes.active = /*active*/ ctx[0];
			navitem17.$set(navitem17_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(navitem0.$$.fragment, local);
			transition_in(navitem1.$$.fragment, local);
			transition_in(navitem2.$$.fragment, local);
			transition_in(navitem3.$$.fragment, local);
			transition_in(navitem4.$$.fragment, local);
			transition_in(navitem5.$$.fragment, local);
			transition_in(navitem6.$$.fragment, local);
			transition_in(navitem7.$$.fragment, local);
			transition_in(navitem8.$$.fragment, local);
			transition_in(navitem9.$$.fragment, local);
			transition_in(navitem10.$$.fragment, local);
			transition_in(navitem11.$$.fragment, local);
			transition_in(navitem12.$$.fragment, local);
			transition_in(navitem13.$$.fragment, local);
			transition_in(navitem14.$$.fragment, local);
			transition_in(navitem15.$$.fragment, local);
			transition_in(navitem16.$$.fragment, local);
			transition_in(navitem17.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(navitem0.$$.fragment, local);
			transition_out(navitem1.$$.fragment, local);
			transition_out(navitem2.$$.fragment, local);
			transition_out(navitem3.$$.fragment, local);
			transition_out(navitem4.$$.fragment, local);
			transition_out(navitem5.$$.fragment, local);
			transition_out(navitem6.$$.fragment, local);
			transition_out(navitem7.$$.fragment, local);
			transition_out(navitem8.$$.fragment, local);
			transition_out(navitem9.$$.fragment, local);
			transition_out(navitem10.$$.fragment, local);
			transition_out(navitem11.$$.fragment, local);
			transition_out(navitem12.$$.fragment, local);
			transition_out(navitem13.$$.fragment, local);
			transition_out(navitem14.$$.fragment, local);
			transition_out(navitem15.$$.fragment, local);
			transition_out(navitem16.$$.fragment, local);
			transition_out(navitem17.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(nav);
			destroy_component(navitem0);
			destroy_component(navitem1);
			destroy_component(navitem2);
			destroy_component(navitem3);
			destroy_component(navitem4);
			destroy_component(navitem5);
			destroy_component(navitem6);
			destroy_component(navitem7);
			destroy_component(navitem8);
			destroy_component(navitem9);
			destroy_component(navitem10);
			destroy_component(navitem11);
			destroy_component(navitem12);
			destroy_component(navitem13);
			destroy_component(navitem14);
			destroy_component(navitem15);
			destroy_component(navitem16);
			destroy_component(navitem17);
			mounted = false;
			dispose();
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$1.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$1($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots('Nav', slots, []);

	const components = {
		Button: Button_1,
		ContextMenu: Context_menu,
		Icon: Icon_1,
		TextFit: Text_fit,
		Toaster: Toaster_1,
		ColorPalette: Color_palette,
		Autocomplete: Autocomplete_1,
		Datepicker: Datepicker_1,
		Input,
		InputMath: Input_math,
		InputPassword: Input_password,
		Select: Select_1,
		Textarea: Textarea_1,
		Toggle: Toggle_1,
		Drawer: Drawer_1,
		Panel: Panel_1,
		Dialog: Dialog_1,
		Table: Table_1
	};

	let active = location.hash.substr(1) || 'Button';
	let { component = components[active] } = $$props;

	function onhashchange() {
		$$invalidate(0, active = location.hash.substr(1));
		$$invalidate(2, component = components[active]);
	}

	const writable_props = ['component'];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Nav> was created with unknown prop '${key}'`);
	});

	$$self.$$set = $$props => {
		if ('component' in $$props) $$invalidate(2, component = $$props.component);
	};

	$$self.$capture_state = () => ({
		NavItem: Nav_item,
		Button: Button_1,
		ContextMenu: Context_menu,
		Icon: Icon_1,
		TextFit: Text_fit,
		Toaster: Toaster_1,
		ColorPalette: Color_palette,
		Autocomplete: Autocomplete_1,
		Datepicker: Datepicker_1,
		Input,
		InputMath: Input_math,
		InputPassword: Input_password,
		Select: Select_1,
		Textarea: Textarea_1,
		Toggle: Toggle_1,
		Drawer: Drawer_1,
		Panel: Panel_1,
		Dialog: Dialog_1,
		Table: Table_1,
		components,
		active,
		component,
		onhashchange
	});

	$$self.$inject_state = $$props => {
		if ('active' in $$props) $$invalidate(0, active = $$props.active);
		if ('component' in $$props) $$invalidate(2, component = $$props.component);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [active, onhashchange, component];
}

class Nav extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$1, create_fragment$1, safe_not_equal, { component: 2 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Nav",
			options,
			id: create_fragment$1.name
		});
	}

	get component() {
		throw new Error("<Nav>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set component(value) {
		throw new Error("<Nav>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* docs/app/index.svelte generated by Svelte v3.46.4 */
const file = "docs/app/index.svelte";

function create_fragment(ctx) {
	let aside;
	let nav;
	let updating_component;
	let t;
	let main;
	let switch_instance;
	let current;

	function nav_component_binding(value) {
		/*nav_component_binding*/ ctx[1](value);
	}

	let nav_props = {};

	if (/*component*/ ctx[0] !== void 0) {
		nav_props.component = /*component*/ ctx[0];
	}

	nav = new Nav({ props: nav_props, $$inline: true });
	binding_callbacks.push(() => bind(nav, 'component', nav_component_binding));
	var switch_value = /*component*/ ctx[0];

	function switch_props(ctx) {
		return { $$inline: true };
	}

	if (switch_value) {
		switch_instance = new switch_value(switch_props());
	}

	const block = {
		c: function create() {
			aside = element("aside");
			create_component(nav.$$.fragment);
			t = space();
			main = element("main");
			if (switch_instance) create_component(switch_instance.$$.fragment);
			add_location(aside, file, 0, 0, 0);
			add_location(main, file, 3, 0, 55);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, aside, anchor);
			mount_component(nav, aside, null);
			insert_dev(target, t, anchor);
			insert_dev(target, main, anchor);

			if (switch_instance) {
				mount_component(switch_instance, main, null);
			}

			current = true;
		},
		p: function update(ctx, [dirty]) {
			const nav_changes = {};

			if (!updating_component && dirty & /*component*/ 1) {
				updating_component = true;
				nav_changes.component = /*component*/ ctx[0];
				add_flush_callback(() => updating_component = false);
			}

			nav.$set(nav_changes);

			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
				if (switch_instance) {
					group_outros();
					const old_component = switch_instance;

					transition_out(old_component.$$.fragment, 1, 0, () => {
						destroy_component(old_component, 1);
					});

					check_outros();
				}

				if (switch_value) {
					switch_instance = new switch_value(switch_props());
					create_component(switch_instance.$$.fragment);
					transition_in(switch_instance.$$.fragment, 1);
					mount_component(switch_instance, main, null);
				} else {
					switch_instance = null;
				}
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(nav.$$.fragment, local);
			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(nav.$$.fragment, local);
			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(aside);
			destroy_component(nav);
			if (detaching) detach_dev(t);
			if (detaching) detach_dev(main);
			if (switch_instance) destroy_component(switch_instance);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots('App', slots, []);
	let component = undefined;
	const writable_props = [];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
	});

	function nav_component_binding(value) {
		component = value;
		$$invalidate(0, component);
	}

	$$self.$capture_state = () => ({ Nav, component });

	$$self.$inject_state = $$props => {
		if ('component' in $$props) $$invalidate(0, component = $$props.component);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [component, nav_component_binding];
}

class App extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance, create_fragment, safe_not_equal, {});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "App",
			options,
			id: create_fragment.name
		});
	}
}

var index = new App({ target: document.querySelector('#app') });

export { index as default };
