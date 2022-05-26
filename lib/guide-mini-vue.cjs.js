'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const extend = Object.assign;
const isObject = (obj) => {
    return obj !== null && typeof obj === 'object';
};
var hasOwn = (obj, k) => Object.prototype.hasOwnProperty.call(obj, k);
const isOn = (key) => /^on[A-Z]/.test(key);

const targetMap = new Map();
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
// 首字母大写
const capitalize = (str) => {
    return str ? str.charAt(0).toLocaleUpperCase() + str.slice(1) : '';
};
// 拼接 on
const toHandleKey = (str) => str ? 'on' + capitalize(str) : '';
const camelize = (str) => {
    return str.replace(/-(\w)/g, (_, c) => {
        return c ? c.toLocaleUpperCase() : '';
    });
};

const publicPropsMap = {
    $el: (i) => {
        return i.vnode.el;
    }
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

function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        emit: () => { }
    };
    component.emit = emit.bind(null, component);
    return component;
}
function setupComponent(instance) {
    initProps(instance, instance.vnode.props);
    // TODO:
    // initSlots()
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    const Componet = instance.type;
    // ctx
    instance.proxy = new Proxy({ _: instance }, publicInstanceProxyHandlers);
    const { setup } = Componet;
    if (setup) {
        const setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit
        });
        handleSetupResult(instance, setupResult);
    }
}
// 处理组件的 setup 的返回值
function handleSetupResult(instance, setupResult) {
    // object
    if (typeof setupResult === 'object') {
        instance.setupState = setupResult;
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

function render(vnode, container) {
    // 这里只做调用 patch 方法  方便递归处理
    return patch(vnode, container);
}
function patch(vnode, container) {
    // 处理 element
    const { shapeFlag } = vnode;
    if (shapeFlag & 1 /* ELEMENT */) {
        processElement(vnode, container);
    }
    else if (shapeFlag & 2 /* STATEFULE_COMPONENT */) {
        // 处理 component
        processComponent(vnode, container);
    }
}
function processComponent(vnode, container) {
    mountComponent(vnode, container);
}
function processElement(vnode, container) {
    mountElement(vnode, container);
}
function mountElement(vnode, container) {
    const { type, children, props, shapeFlag } = vnode;
    const el = vnode.el = document.createElement(type);
    // props
    if (shapeFlag & 4 /* TEXT_CHILDREN */) {
        el.textContent = children;
    }
    else if (shapeFlag & 8 /* ARRAY_CHILDREN */) {
        mountChildren(vnode, el);
    }
    // 设置属性
    for (const key in props) {
        const value = props[key];
        if (isOn(key)) {
            el.addEventListener(key.slice(2).toLocaleLowerCase(), value);
        }
        else {
            el.setAttribute(key, value);
        }
    }
    container.append(el);
}
function mountChildren(vnode, container) {
    vnode.children.forEach((d) => {
        patch(d, container);
    });
}
function mountComponent(initialVnode, container) {
    const instance = createComponentInstance(initialVnode);
    setupComponent(instance);
    setupRenderEffect(instance, initialVnode, container);
}
function setupRenderEffect(instance, initialVnode, container) {
    // 虚拟节点树
    const { proxy } = instance;
    const subTree = instance.render.call(proxy);
    patch(subTree, container);
    // 把组件的 根节点 挂载在  initialVnode 的 el
    initialVnode.el = subTree.el;
}

function createVnode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        el: null,
        shapeFlag: getShapeFlag(type),
    };
    if (typeof children === 'string') {
        vnode.shapeFlag = vnode.shapeFlag | 4 /* TEXT_CHILDREN */;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlag = vnode.shapeFlag | 8 /* ARRAY_CHILDREN */;
    }
    return vnode;
}
function getShapeFlag(type) {
    return typeof type === 'string' ? 1 /* ELEMENT */ : 2 /* STATEFULE_COMPONENT */;
}

function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            // 先转换成 vnode
            // component -》 vnode
            const vnode = createVnode(rootComponent);
            // 转换成真实节点
            const container = document.querySelector(rootContainer);
            render(vnode, container);
        }
    };
}

//  h 只是 createVnode 的别名
function h(type, props, children) {
    return createVnode(type, props, children);
}

exports.createApp = createApp;
exports.h = h;
