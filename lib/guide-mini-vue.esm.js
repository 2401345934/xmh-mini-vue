const Fragment = Symbol('Fragment');
const Text = Symbol('Text');
function createVnode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        el: null,
        shapeFlag: getShapeFlag(type),
    };
    if (typeof children === 'string') {
        vnode.shapeFlag |= 4 /* TEXT_CHILDREN */;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlag |= 8 /* ARRAY_CHILDREN */;
    }
    if (vnode.shapeFlag & 2 /* STATEFULE_COMPONENT */) {
        if (typeof children === 'object') {
            vnode.shapeFlag |= 16 /* SLOT_CHILREN */;
        }
    }
    return vnode;
}
function getShapeFlag(type) {
    return typeof type === 'string' ? 1 /* ELEMENT */ : 2 /* STATEFULE_COMPONENT */;
}
function createTextVnode(text) {
    return createVnode(Text, {}, text);
}

//  h 只是 createVnode 的别名
function h(type, props, children) {
    return createVnode(type, props, children);
}

function renderSlots(slots, name, props = {}) {
    const slot = slots[name];
    if (slot) {
        if (typeof slot === 'function') {
            return createVnode(Fragment, {}, slot(props));
        }
    }
    return createVnode('div', {}, slots);
}

// assign
const extend = Object.assign;
// 是否是对象
const isObject = (obj) => {
    return obj !== null && typeof obj === 'object';
};
// 值是否有改变
const hasChange = (value, newValue) => {
    return !Object.is(value, newValue);
};
// 是否是 k in obj
const hasOwn = (obj, k) => Object.prototype.hasOwnProperty.call(obj, k);
// 是否带有on
const isOn = (key) => /^on[A-Z]/.test(key);
// 首字母大写
const capitalize = (str) => {
    return str ? str.charAt(0).toLocaleUpperCase() + str.slice(1) : '';
};
// 拼接 on
const toHandleKey = (str) => str ? 'on' + capitalize(str) : '';
// 把 - 拼接 转换成 驼峰
const camelize = (str) => {
    return str.replace(/-(\w)/g, (_, c) => {
        return c ? c.toLocaleUpperCase() : '';
    });
};

// 获取 fn
let activeEffect;
let shouldTrack = false;
class ReactiveEffect {
    constructor(fn, scheduler) {
        this.deps = [];
        this.active = true;
        this._fn = fn;
        this.scheduler = scheduler;
    }
    run() {
        // 收集依赖
        // shouldTarck 做区分
        // 如果当前 active  就不需要收集依赖 不启用 开关
        if (!this.active) {
            return this._fn();
        }
        // 启用开关 收集
        shouldTrack = true;
        // 赋值全局变量
        activeEffect = this;
        // 返回值 用于return
        const result = this._fn();
        // 关闭开关 重置
        shouldTrack = false;
        return result;
    }
    stop() {
        if (this.active) {
            clearUpEffect(this);
            if (this.onStop) {
                this.onStop();
            }
            this.active = false;
        }
    }
}
const targetMap = new Map();
// 删除 dep
function clearUpEffect(effect) {
    effect.deps.forEach((dep) => {
        dep.delete(effect);
    });
    effect.deps.length = 0;
}
function trackEffect(dep) {
    // 如果 依赖已经存在 不需要重复收集
    if (dep.has(activeEffect))
        return;
    dep.add(activeEffect);
    activeEffect.deps.push(dep);
}
// 收集依赖
function track(target, key) {
    // 如果不是 track 中  不往下走
    if (!isTracking())
        return;
    // target -> key -> dep
    let depsMap = targetMap.get(target);
    // 初始化的时候 处理
    if (!depsMap) {
        depsMap = new Map();
        targetMap.set(target, depsMap);
    }
    let dep = depsMap.get(key);
    if (!dep) {
        dep = new Set();
        depsMap.set(key, dep);
    }
    trackEffect(dep);
}
// 是否正在 track 中
function isTracking() {
    return shouldTrack && activeEffect !== undefined;
}
function triggerEffect(dep) {
    for (const effect of dep) {
        if (effect.scheduler) {
            effect.scheduler();
        }
        else {
            effect.run();
        }
    }
}
// 触发依赖
function trigger(target, key) {
    let depsMap = targetMap.get(target);
    let dep = depsMap.get(key);
    triggerEffect(dep);
}
function effect(fn, options = {}) {
    const _effect = new ReactiveEffect(fn, options.scheduler);
    // extend
    extend(_effect, options);
    _effect.run();
    const runner = _effect.run.bind(_effect);
    runner.effect = _effect;
    return runner;
}

// 初始化创建 防止重复创建
const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);
function createGetter(isReadonly = false, shallow = false) {
    return function get(target, key) {
        const res = Reflect.get(target, key);
        if (key === "__v_isReactive" /* IS_REACTIVE */) {
            return !isReadonly;
        }
        else if (key === "__v_isReadonly" /* IS_READONLY */) {
            return isReadonly;
        }
        // shallow
        if (shallow) {
            return res;
        }
        // 如果子元素还是 对象 递归处理
        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res);
        }
        if (!isReadonly) {
            // 依赖收集
            track(target, key);
        }
        return res;
    };
}
function createSetter() {
    return function set(target, key, value) {
        const res = Reflect.set(target, key, value);
        // 触发依赖
        trigger(target, key);
        return res;
    };
}
const mutableHandlers = {
    get,
    set
};
const readonlyHandlers = {
    get: readonlyGet,
    set(target, key, value) {
        console.warn(`readonly no set ${key} - ${value} is ${target}`);
        return true;
    }
};
const shallowReadonlyHandle = extend({}, readonlyHandlers, {
    get: shallowReadonlyGet
});

function reactive(raw) {
    return createActiveObject(raw, mutableHandlers);
}
function readonly(raw) {
    return createActiveObject(raw, readonlyHandlers);
}
function shallowReadonly(raw) {
    return createActiveObject(raw, shallowReadonlyHandle);
}
function createActiveObject(raw, baseHandle) {
    if (!isObject(raw)) {
        console.warn("target is not object");
        return;
    }
    return new Proxy(raw, baseHandle);
}

function initProps(instance, rawProps) {
    instance.props = rawProps || {};
}

const emit = (instance, event, ...rest) => {
    const { props } = instance;
    const handle = props[toHandleKey(camelize(event))];
    if (handle && typeof handle === 'function') {
        handle(...rest);
    }
};

function initSlots(instance, children) {
    const { vnode } = instance;
    if (vnode.shapeFlag & 16 /* SLOT_CHILREN */) {
        normalizeObjcetSlots(children, instance.slots);
    }
}
// 处理 slots 的值
function normalizeObjcetSlots(children, slots) {
    for (const k in children) {
        const v = children[k];
        slots[k] = (props) => normalizeSlotValue(v(props));
    }
}
// 处理 slots
function normalizeSlotValue(value) {
    return Array.isArray(value) ? value : [value];
}

const publicPropsMap = {
    $el: (i) => i.vnode.el,
    $slots: (i) => i.slots
};
const publicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        const { setupState, props } = instance;
        // 实现代理 this setupState props
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            return props[key];
        }
        // 实现 $el
        if (publicPropsMap[key]) {
            return publicPropsMap[key](instance);
        }
    },
};

function createComponentInstance(vnode, parent) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        slots: {},
        provides: parent ? parent.provides : {},
        parent,
        isMounted: false,
        subTree: {},
        emit: () => { }
    };
    component.emit = emit.bind(null, component);
    return component;
}
function setupComponent(instance) {
    initProps(instance, instance.vnode.props);
    initSlots(instance, instance.vnode.children);
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    const Componet = instance.type;
    // ctx
    instance.proxy = new Proxy({ _: instance }, publicInstanceProxyHandlers);
    const { setup } = Componet;
    if (setup) {
        setCurrentInstance(instance);
        const setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit
        });
        setCurrentInstance(null);
        handleSetupResult(instance, setupResult);
    }
}
// 处理组件的 setup 的返回值
function handleSetupResult(instance, setupResult) {
    // object
    if (typeof setupResult === 'object') {
        instance.setupState = proxyRefs(setupResult);
    }
    // TODO:
    // function
    finisComponentSetup(instance);
}
// 处理组件的 setup
function finisComponentSetup(instance) {
    const Componet = instance.type;
    if (Componet.render) {
        instance.render = Componet.render;
    }
}
let currentInstance = null;
function getCurrentInstance() {
    return currentInstance;
}
function setCurrentInstance(instance) {
    currentInstance = instance;
}

function provide(key, value) {
    var _a;
    const instance = getCurrentInstance();
    if (instance) {
        let { provides } = instance;
        const parentProvides = (_a = instance.parent) === null || _a === void 0 ? void 0 : _a.provides;
        if (provides === parentProvides) {
            provides = instance.provides = Object.create(parentProvides);
        }
        provides[key] = value;
    }
}
function inject(key, defaultValue) {
    const instance = getCurrentInstance();
    if (instance) {
        const { parent: { provides } } = instance;
        if (key in provides) {
            return provides[key];
        }
        else if (typeof defaultValue === 'function') {
            return defaultValue();
        }
        else {
            return defaultValue;
        }
    }
}

function createAppApi(render) {
    return function createApp(rootComponent) {
        return {
            mount(rootContainer) {
                // 先转换成 vnode
                // component -》 vnode
                const vnode = createVnode(rootComponent);
                // 转换成真实节点
                // const container = document.querySelector(rootContainer)
                render(vnode, rootContainer);
            }
        };
    };
}

function createRenderer(options) {
    const { createElement: hostCreateElement, patchProp: hostPatchProp, insert: hostInsert } = options;
    function render(vnode, container) {
        // 这里只做调用 patch 方法  方便递归处理
        return patch(null, vnode, container, null);
    }
    // n1 老的
    // n2 新的  
    function patch(n1, n2, container, parentComponent) {
        // 处理 element
        const { type, shapeFlag } = n2;
        switch (type) {
            case Fragment:
                processFragment(n1, n2, container, parentComponent);
                break;
            case Text:
                processText(n1, n2, container);
                break;
            default:
                if (shapeFlag & 1 /* ELEMENT */) {
                    processElement(n1, n2, container, parentComponent);
                }
                else if (shapeFlag & 2 /* STATEFULE_COMPONENT */) {
                    // 处理 component
                    processComponent(n1, n2, container, parentComponent);
                }
                break;
        }
    }
    function processText(n1, n2, container) {
        const { children } = n2;
        const textNode = n2.el = document.createTextNode(children);
        container.append(textNode);
    }
    function processComponent(n1, n2, container, parentComponent) {
        mountComponent(n2, container, parentComponent);
    }
    function processElement(n1, n2, container, parentComponent) {
        if (!n1) {
            mountElement(n2, container, parentComponent);
        }
        else {
            patchElement(n1, n2);
        }
    }
    function patchElement(n1, n2, container) {
        console.log(n1, 'n1');
        console.log(n2, 'n2');
    }
    function processFragment(n1, n2, container, parentComponent) {
        mountChildren(n2, container, parentComponent);
    }
    function mountElement(vnode, container, parentComponent) {
        const { type, children, props, shapeFlag } = vnode;
        const el = vnode.el = hostCreateElement(type);
        // props
        if (shapeFlag & 4 /* TEXT_CHILDREN */) {
            el.textContent = children;
        }
        else if (shapeFlag & 8 /* ARRAY_CHILDREN */) {
            mountChildren(vnode, el, parentComponent);
        }
        // 设置属性
        for (const key in props) {
            const value = props[key];
            hostPatchProp(el, key, value);
        }
        hostInsert(el, container);
    }
    function mountChildren(vnode, container, parentComponent) {
        vnode.children.forEach((d) => {
            patch(null, d, container, parentComponent);
        });
    }
    function mountComponent(initialVnode, container, parentComponent) {
        const instance = createComponentInstance(initialVnode, parentComponent);
        setupComponent(instance);
        setupRenderEffect(instance, initialVnode, container);
    }
    // render effect
    function setupRenderEffect(instance, initialVnode, container) {
        effect(() => {
            if (!instance.isMounted) {
                // 虚拟节点树
                const { proxy } = instance;
                const subTree = instance.subTree = instance.render.call(proxy);
                patch(null, subTree, container, instance);
                // 把组件的 根节点 挂载在  initialVnode 的 el
                initialVnode.el = subTree.el;
                instance.isMounted = true;
            }
            else {
                const { proxy } = instance;
                const subTree = instance.render.call(proxy);
                const preSubTree = instance.subTree;
                instance.subTree = subTree;
                patch(preSubTree, subTree, container, instance);
            }
        });
    }
    return {
        createApp: createAppApi(render)
    };
}

function createElement(type) {
    return document.createElement(type);
}
function insert(el, parent) {
    parent.append(el);
}
function patchProp(el, key, value) {
    if (isOn(key)) {
        el.addEventListener(key.slice(2).toLocaleLowerCase(), value);
    }
    else {
        el.setAttribute(key, value);
    }
}
const renderer = createRenderer({
    createElement,
    insert,
    patchProp
});
function createApp(...args) {
    return renderer.createApp(...args);
}

class RefImpl {
    constructor(value) {
        // value 是不是对象 如果是对象  使用 reactive
        this._rawValue = value;
        this.__v_isRef = true;
        this._value = convert(value);
        this.dep = new Set();
    }
    get value() {
        trackRefValue(this);
        return this._value;
    }
    set value(newVal) {
        // 如果一样 直接 return
        // 如果对象 对比
        if (!hasChange(newVal, this._rawValue))
            return;
        this._rawValue = newVal;
        this._value = convert(newVal);
        triggerEffect(this.dep);
    }
}
function convert(val) {
    return isObject(val) ? reactive(val) : val;
}
function trackRefValue(refRaw) {
    if (isTracking()) {
        // 收集依赖
        trackEffect(refRaw.dep);
    }
}
function ref(value) {
    return new RefImpl(value);
}
// 返回 是否是 ref
function isRef(ref) {
    return !!ref.__v_isRef;
}
// 返回 ref 的value 值
function unRef(value) {
    return isRef(value) ? value.value : value;
}
function proxyRefs(objectWithRefs) {
    return new Proxy(objectWithRefs, {
        get(target, key) {
            return unRef(Reflect.get(target, key));
        },
        set(target, key, value) {
            // 如果 是 ref  替换掉 不是  的话 就修改他的 .value
            // 原来 是 ref  并且 新值 不是 ref  修改原来的 ref 和新的值
            if (isRef(target[key]) && !isRef(value)) {
                return (target[key].value = value);
            }
            else {
                return Reflect.set(target, key, value);
            }
        }
    });
}

export { createApp, createRenderer, createTextVnode, getCurrentInstance, h, inject, provide, proxyRefs, ref, renderSlots };
