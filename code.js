// VARS
// vars for metrics
const localPaints = figma.getLocalPaintStyles();
const localEffects = figma.getLocalEffectStyles();
const localTexts = figma.getLocalTextStyles();
const totalLocalPaints = localPaints.length;
const totalLocalEffects = localEffects.length;
const totalLocalTexts = localTexts.length;
const totalLocalStyles = totalLocalPaints + totalLocalEffects + totalLocalTexts;
// component vars
const masterComponents = findComponents();
var instanceList = findInstances();
// state vars
var component;
var instances;
var componentTotal;
var componentCounter = -1;
var style;
var styleInstances;
var styleTotal;
var styleCounter = -1;
// Show UI once all data is collected
figma.showUI(__html__, { width: 360, height: 480 });
// COMMUNICATION TO UI
figma.ui.postMessage({
    'type': 'pluginStart',
    'instances': instanceList
});
// COMMUNICATION FROM UI
figma.ui.onmessage = msg => {
    switch (msg.type) {
        case 'selectInstance':
            if (msg.master != component) {
                component = msg.master;
                instances = componentInstances(msg.master);
                componentTotal = instances.length;
                componentCounter = -1;
            }
            break;
        case 'nextInstance':
            if (componentCounter < componentTotal) {
                componentCounter++;
                let nodes = [];
                nodes.push(instances[componentCounter]);
                figma.currentPage.selection = nodes;
                figma.viewport.scrollAndZoomIntoView(nodes);
            }
            break;
        case 'prevInstance':
            if (componentCounter > 0) {
                componentCounter--;
                let nodes = [];
                nodes.push(instances[componentCounter]);
                figma.currentPage.selection = nodes;
                figma.viewport.scrollAndZoomIntoView(nodes);
            }
            break;
    }
};
// FUNCTIONS
//find all instances
function findInstances() {
    let instanceList = [];
    let allInstances = Array.from(figma.root.findAll(i => i.type === 'INSTANCE'));
    let uniqueInstances = removeDuplicatesBy(i => i.masterComponent.id, allInstances);
    uniqueInstances.forEach(instance => {
        let mcId = instance.masterComponent.id;
        let instances = Array.from(figma.root.findAll(i => i.type === 'INSTANCE' && i.masterComponent.id === mcId));
        let instanceEntry = {
            'name': instance.name,
            'masterId': instance.masterComponent.id,
            'source': instanceSource(instance),
            'instances': instances,
            'count': instances.length
        };
        instanceList.push(instanceEntry);
    });
    console.log(instanceList);
    return instanceList;
}
// find all master components in doc
function findComponents() {
    let components = figma.root.findAll(mc => mc.type === 'COMPONENT');
    return components;
}
// HELPER FUNCTIONS
//remove duplicate keys from themes
function removeDuplicatesBy(keyFn, array) {
    var mySet = new Set();
    return array.filter(function (x) {
        var key = keyFn(x), isNew = !mySet.has(key);
        if (isNew)
            mySet.add(key);
        return isNew;
    });
}
// determine if component is remote or not
function instanceSource(instance) {
    if (instance.masterComponent.remote === true) {
        return 'library';
    }
    else {
        return 'local';
    }
}
// find instances of a specific component and return an array
function componentInstances(masterId) {
    let instances = figma.root.findAll(i => i.type === 'INSTANCE' && i.masterComponent.id === masterId);
    return instances;
}
