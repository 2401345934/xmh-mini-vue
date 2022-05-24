'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type
    };
    return component;
}
function setupComponent(instance) {
    // TODO:
    // initProps()
    // TODO:
    // initSlots()
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    const Componet = instance.type;
    const { setup } = Componet;
    if (setup) {
        const setupResult = setup();
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    // object
    if (typeof setupResult === 'object') {
        instance.setupState = setupResult;
    }
    // TODO:
    // function
    finisComponentSetup(instance);
}
function finisComponentSetup(instance) {
    const Componet = instance.type;
    if (Componet.render) {
        instance.render = Componet.render;
    }
}

function render(vnode, container) {
    // 这里只做调用 patch 方法  方便递归处理
    return patch(vnode);
}
function patch(vnode, container) {
    // TODO: vnode 是不是 element  还是 component
    // processElement(vnode)
    if (vnode.type.render) {
        processComponent(vnode);
    }
}
function processComponent(vnode, container) {
    mountComponent(vnode);
}
function mountComponent(vnode, container) {
    const instance = createComponentInstance(vnode);
    setupComponent(instance);
    setupRenderEffect(instance);
}
function setupRenderEffect(instance, container) {
    // 虚拟节点树
    const subTree = instance.render();
    patch(subTree);
}

function createVnode(type, props, children) {
    const vnode = {
        type,
        props,
        children
    };
    return vnode;
}

function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            // 先转换成 vnode
            // component -》 vnode
            const vnode = createVnode(rootComponent);
            // 转换成真实节点
            document.querySelector(rootContainer);
            render(vnode);
        }
    };
}

//  h 只是 createVnode 的别名
function h(type, props, children) {
    return createVnode(type, props, children);
}

exports.createApp = createApp;
exports.h = h;
