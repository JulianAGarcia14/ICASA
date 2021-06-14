//import { Network, DataSet, Edge, Node, Options, idType } from "vis";
//import * as vis from '../node_modules/vis';
//let vis = require("vis");
//import CanvasJS from '../node_modules/canvasjs';
//let canvas = require("canvasjs");
class net {
    constructor(container) {
        this.nodeIds = [0];
        this.clusterSum = 0;
        this.sumOfDegrees = 0;
        this.nodes_array = [
            { id: 0, label: "Node 0" },
        ];
        this.edges_array = [];
        this.nodes = new vis.DataSet(this.nodes_array);
        this.edges = new vis.DataSet(this.edges_array);
        let home = document.getElementById(container);
        let data = {
            nodes: this.nodes,
            edges: this.edges,
        };
        let options = {
            nodes: {
                shape: "dot",
                scaling: {
                    min: 0.2,
                    max: 1,
                    label: {
                        min: 2,
                        max: 10,
                        drawThreshold: 12,
                        maxVisible: 20,
                    },
                },
                font: {
                    size: 12,
                    face: "Tahoma",
                },
            },
            edges: {
                width: 0.15,
                color: { inherit: true },
                smooth: {
                    type: "continuous",
                },
            },
            physics: {
                enabled: true,
                solver: "forceAtlas2Based",
                forceAtlas2Based: {
                    "gravitationalConstant": -1000,
                    "springLength": 25,
                    "springConstant": 0.09,
                    "avoidOverlap": 0.2,
                    "damping": 1,
                },
            },
            layout: {},
            interaction: {
                hover: true,
                hoverConnectedEdges: true,
                tooltipDelay: 200,
                hideEdgesOnDrag: true,
                hideEdgesOnZoom: true,
            },
        };
        // @ts-ignore
        this.drawNet = new vis.Network(home, data, options);
        ;
    }
}
let er = new net("mynetwork2");
let bar = new net("mynetwork3");
let holme = new net("mynetwork");
/**
 * Implements erdos reyni algorithm, connecting each node by a given probability
 * @param  {float} prob Given probability that a node can connect to another
 * @param  {float} vertNum Number of vertices to create/connect
 */
function erdos(pr, vn, network, globeContainer, nodeContainer, graphContainer) {
    let prob = parseFloat(pr);
    let vertNum = parseInt(vn);
    network.nodes.clear();
    network.edges.clear();
    network.nodes_array = [];
    network.edges_array = [];
    let idLen = network.nodes.length;
    let idNum;
    for (let i = 0; i < vertNum; i++) {
        idNum = i + idLen;
        network.nodes_array.push({ id: idNum, label: 'Node' + idNum });
    }
    for (let i = 0; i <= vertNum + idLen; i++) {
        for (let j = i + 1; j <= vertNum + idLen; j++) {
            let p = Math.random();
            if (p <= prob) {
                network.edges_array.push({ from: i, to: j });
            }
        }
    }
    network.nodes.add(network.nodes_array);
    network.edges.add(network.edges_array);
    shade(network);
    writedata(network, globeContainer, nodeContainer, graphContainer);
}
/**
 * Randomly connects a neighbor or repeats Connect step of algorithm
 * @param  {array} neighborhood list of nodes connected to the node who's neighborhood we're looking at
 * @param  {array} used List of nodes the newly added node is already connected to
 * @param  {int} idNum Id of the newest node
 */
function neighborConnect(neighborhood, used, idNum, network) {
    let nLen = neighborhood.length;
    let found = false;
    for (let i = 0; i < nLen - 1; i++) {
        //console.log(used);
        if (binarySearch(used, i) === false) {
            found = true;
            network.edges.add({ from: idNum, to: i });
            network.sumOfDegrees = network.sumOfDegrees + 1;
            break;
        }
    }
    if (found === false) {
        connect(idNum, true, network);
    }
}
/**
 * Handles the work of connecting nodes based on degree
 * @param  {int} idNum id of node that is being added
 * @param  {boolean} isLooped Tells us whether we're repeating the step in the case where there is no neighbor to connect to
 * also used to differentiate between when we're generating a barabasi or a holme-kim
 */
function connect(idNum, isLooped, network) {
    let sumDegree = network.sumOfDegrees;
    //var idLen = Object.keys(nodes).length / 2;
    let idLen = network.nodes.length;
    for (let i = 0; i < idLen - 1; i++) {
        let prob = network.drawNet.getConnectedEdges(i).length / sumDegree;
        let p = Math.random();
        if (p <= prob) {
            network.edges.add({ from: idNum, to: i });
            network.sumOfDegrees = network.sumOfDegrees + 1;
            if (isLooped === false) {
                let neighborhood = network.drawNet.getConnectedNodes(i);
                let used = network.drawNet.getConnectedNodes(idNum);
                neighborConnect(neighborhood, used, idNum, network);
            }
        }
    }
}
/**
 * Implements barabasi algorithm to add as many nodes as desired, updates the visualization
 * @param  {int} vertNum number of nodes to be added using algorithm
 * @param  {net} network network we're working with
 * @param  {boolean} isLooped Tells us whether we're repeating the step in the case where there is no neighbor to connect to
 * also used to differentiate between when we're generating a barabasi or a holme-kim
 * @param  {string} globeContainer container to print global clustering to
 * @param  {string} nodeContainer container to print total node count to
 * @param  {string} graphContainer container to draw degree distribution graph
 */
function createAdvanced(vn, network, isLooped, globeContainer, nodeContainer, graphContainer) {
    let vertNum = parseInt(vn);
    let idLen = network.nodes.length;
    //var idLen = Object.keys(nodes).length / 2;
    let idNum;
    for (let i = 0; i < vertNum; i++) {
        idNum = i + idLen;
        network.nodes.add({ id: idNum, label: 'Node' + idNum });
        connect(idNum, isLooped, network);
    }
    shade(network);
    writedata(network, globeContainer, nodeContainer, graphContainer);
}
/**
 * Shades each node by how high its degree is.
 * @param  {net} network network we're working with
 */
function shade(network) {
    let idLen = network.nodes.length;
    for (let i = 0; i < idLen; i++) {
        let cool = network.drawNet.getConnectedEdges(i).length;
        let heat = (0.1 * cool);
        let clickedNode = network.nodes.get(i);
        clickedNode.color = {
            border: '#000000',
            background: 'rgba(240, 0, 0, ' + heat + ')',
            highlight: {
                border: '#2B7CE9',
                background: 'rgba(0, 240, 0, 1)'
            }
        };
        network.nodes.update(clickedNode);
    }
}
/**
 * Writes Clustering Coefficient and Degree to each nodes title.
 * @param  {net} network network we're working with
 * @param  {string} globeContainer container to print global clustering to
 * @param  {string} nodeContainer container to print total node count to
 * @param  {string} graphContainer container to draw degree distribution graph
 */
function writedata(network, globeContainer, nodeContainer, graphContainer) {
    let idLen = network.nodes.length;
    let arr = new Array(5);
    let localCluster;
    arr.fill(0);
    try {
        for (let i = 0; i < idLen; i++) {
            let deg = network.drawNet.getConnectedEdges(i).length;
            //getting track of degree distribution
            if (deg > arr.length) {
                while (arr.length <= deg) {
                    arr.push(0);
                }
            }
            arr[deg] += 1;
            localCluster = clusteringCount(i, network);
            network.clusterSum = network.clusterSum + localCluster;
            network.nodes.update({
                id: i,
                label: 'Node' + i,
                title: 'Node ' + i + '\n Degree: ' + deg + '\nLocal Clustering Coefficient: ' + localCluster,
            });
        }
    }
    catch (err) {
        alert(err);
    }
    network.degreeDist = [];
    for (let j = 0; j < arr.length; j++) {
        network.degreeDist.push({ x: j, y: arr[j] });
    }
    drawDistribution(network, graphContainer);
    let globalCluster = network.clusterSum / network.nodes.length;
    document.getElementById(globeContainer).textContent = "Global Clustering Coefficient: " + globalCluster;
    document.getElementById(nodeContainer).textContent = "# of Nodes: " + network.nodes.length;
}
/**
 * Calculates local clustering coefficient by comparing connected nodes of origin node and neighborhood nodes
 * @param  {node} currNode a given node to be evaluated for clustering coefficient
 * @param  {net} network network we're working with
 * @return {float}     local clustering coefficient of current node
 */
function clusteringCount(currNode, network) {
    let totalE = 0;
    let atMost;
    let clus = network.drawNet.getConnectedNodes(currNode);
    if (clus.length == 1) {
        totalE = 1;
        atMost = 1;
    }
    else {
        for (let i = 0; i < clus.length; i++) {
            // @ts-ignore
            let ed = network.drawNet.getConnectedNodes(clus[i]);
            for (var j = 0; j < ed.length; j++) {
                if (binarySearch(clus, ed[j]) === true) {
                    totalE = totalE + 1;
                }
            }
        }
        totalE = 1.0 * totalE / 2;
        atMost = 1.0 * clus.length * (clus.length - 1) / 2;
    }
    //console.log(totalE);
    let coef;
    if (atMost != 0) {
        coef = 1.0 * totalE / atMost;
    }
    else {
        coef = 0;
    }
    //console.log(atMost);
    //console.log(coef);
    return coef;
}
/**
 * Simple binary search to look for key in a sorted array
 * @param  {array} sortedArray array to be parsed
 * @param  {key} key key to be found
 */
function binarySearch(sortedArray, key) {
    let start = 0;
    let end = sortedArray.length - 1;
    while (start <= end) {
        let middle = Math.floor((start + end) / 2);
        if (sortedArray[middle] === key) {
            // found the key
            return true;
        }
        else if (sortedArray[middle] < key) {
            // continue searching to the right
            start = middle + 1;
        }
        else {
            // search searching to the left
            end = middle - 1;
        }
    }
    // key wasn't found
    return false;
}
/**
 * Draws the degree distribution using canvas js
 * @param {net} network network to be parsed for degree distribution
 * @param  {string} graphContainer container to draw degree distribution graph
 */
function drawDistribution(network, graphContainer) {
    // @ts-ignore
    let chart = new CanvasJS.Chart(graphContainer, {
        animationEnabled: true,
        zoomEnabled: true,
        backgroundColor: "rgba(255,255,255,1)",
        title: {
            text: "",
            fontFamily: "Segoe UI",
        },
        axisX: {
            interval: network.degreeDist.length / 5,
            titleFontSize: 18,
            title: "Degree"
        },
        axisY: {
            titleFontSize: 18,
            title: "Amount of nodes"
        },
        data: [{
                type: "column",
                color: "#ff615d",
                dataPoints: network.degreeDist,
            }]
    });
    chart.render();
}
erdos("0.2", "2", er, "erdosCC", "erdoNodes", "erdosGraph");
erdos("0.2", "2", bar, "baraCC", "baraNodes", "barGraph");
erdos("0.2", "2", holme, "holmesCC", "holmesNodes", "holmeGraph");
//# sourceMappingURL=initialize.js.map