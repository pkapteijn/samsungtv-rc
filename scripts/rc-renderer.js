const initState = {
    title:  "", 
    devicename: "", 
    hostname: "", 
    connected: false
}

class State {
    constructor(state) {
        this.state = {} 
        for (let key in state) { 
            this.state[key] = {}
            this.state[key].value = state[key]
            this.state[key].hooks = []
        }
    } 
    
    set(event){ 
        for (let key in event) { 
            if (this.state.hasOwnProperty(key)) {
                if (this.state[key].value  !== event[key]) {
                    // state change: set new state, execute hook functions
                    this.state[key].value = event[key]
                    for(let fn of this.state[key].hooks) {
                        fn(event[key])
                    }
                }
                // else do nothing
            }
            else {
                this.state[key] = {}
                this.state[key].value = event[key]
                this.state[key].hooks = []
            }
        }
    }

    addHook(key, fn) {
        if (this.state.hasOwnProperty(key)) {
            this.state[key].hooks.push(fn) 
        }
        else {
            this.state[key] = {}
            this.state[key].value = undefined
            this.state[key].hooks = []
            this.state[key].hooks.push(fn)
        }
    }
}

function drawGrid(keygrid, containerId) {
    const numRows = keygrid.length
    const cont = document.getElementById(containerId)
    for (let row=0; row<numRows; row++) {
        const numCols =  keygrid[row].length
        const newRow = getRow(row)
        const emptyCol1 = getEmptyColumn("empty")
        newRow.appendChild(emptyCol1)
        for (let col=0; col<numCols; col++) {
            const newCol = getColumn(col)
            const newCell = getCell(row, col)
            const newDiv = getDiv()
            const newButton = getButton(keygrid, row, col)
            newDiv.appendChild(newButton)
            newCell.appendChild(newDiv)
            newCol.appendChild(newCell)
            newRow.appendChild(newCol)

        }
        const emptyCol7 = getEmptyColumn("empty")
        newRow.appendChild(emptyCol7)
        cont.appendChild(newRow)

    }

}

function drawConnStat( id) {
    const connstat = document.getElementById(id)
    const newCell = getCell(0, 0)
    const newDiv = getDiv()
    const newButton = getButton(KEYS3, 0, 0)
    newDiv.appendChild(newButton)
    newCell.appendChild(newDiv)
    connstat.appendChild(newCell)
}

function getEmptyColumn(colId) {
    const column = document.createElement('div'); 
    column.setAttribute("class", "col-lg-1"); 
    column.setAttribute("id", "col-" + colId); 
    
    return column;    
}

function getRow(rowId) {
    let row = document.createElement("div")
    row.setAttribute("class", "row p-2")
    row.setAttribute("id", "row-" + rowId)

    return row
}

function getColumn(colId) {
    const column = document.createElement('div'); 
    column.setAttribute("class", "col-lg-2"); 
    column.setAttribute("id", "col-" + colId); 
    
    return column;
}

function getCell(rowId, colId) {
    const cell = document.createElement("div")
    cell.setAttribute("class", "bs-component")
    cell.setAttribute("id", "cell-"+rowId+"-"+colId)

    return cell
}

function getDiv() {
    const div = document.createElement("div")
    div.setAttribute("class", "d-grid gap-2")

    return div
}

function getButtonClass(prefix, label) {
    let btnClass = colorMapClass['DEFAULT']
    switch(prefix) {
        case 'KEY':
            if (['GREEN', 'RED', 'YELLOW', 'BLUE'].includes(label)) {
                btnClass = colorMapClass[label]
            }
            else {
                if (label == 'POWER') {
                btnClass = colorMapClass[label]
                }
                else {
                    btnClass = colorMapClass['DEFAULT']
                }
            }
            break
        case 'POWER': 
            btnClass = colorMapClass[label]
            break        
        case 'STATUS': 
            btnClass = colorMapClass[label]
            break
        default: 
            btnClass = colorMapClass['DEFAULT']
            break
    }
    return btnClass
}

function getButton(keygrid, rowId, colId) {

    const prefix = keygrid[rowId][colId].split("_")[0]
    let label = "null"
    if (keygrid[rowId][colId].length > 1) {

        label = keygrid[rowId][colId].split("_")[1]
    }
    let button = document.createElement("div")

    switch(prefix) {
        case "KEY": 

            button = document.createElement("button")
            button.setAttribute("class", getButtonClass(prefix, label))
            button.innerHTML = KEYLABELS[keygrid[rowId][colId]]
            button.key = keygrid[rowId][colId] // pass on arg in object for event
            button.addEventListener("click", keyPressHandler)
            break
        case "STATUS": 

            label = keygrid[rowId][colId].split("_")[1]
            button = document.createElement("span"); 
            button.setAttribute("class", getButtonClass(prefix, label))
            button.innerHTML = label; 
            break
        
        case "POWER": 
            label = keygrid[rowId][colId].split("_")[1]
            button = document.createElement("button")
            button.setAttribute("class", getButtonClass(prefix, label))
            button.innerHTML =  KEYLABELS[keygrid[rowId][colId]]
            button.key = keygrid[rowId][colId] // pass on arg in object for event
            button.addEventListener("click", powerHandler)
            default: 

            break
        }

    button.setAttribute("id", keygrid[rowId][colId].toLowerCase())
    return button
}

function getAlert() {
    let div = document.createElement('div')
    div.setAttribute('class', "alert alert-warning alert-dismissible")
    let button = document.createElement('button')
    button.setAttribute("class", "btn-close")
    button.setAttribute("data-bs-dismiss", "alert")
    let strong = document.createElement("strong")
    strong.innerText = "Warning! "
    div.appendChild(button)
    div.appendChild(strong)
    div.append("Connection to TV lost, trying to reconnect.")

    return div
}

function clearNode(node) {
    // Remove all children
    while (node.firstChild) {
        node.removeChild(node.firstChild);
    }
    
    // Clear inner text
    node.innerText = '';
}

function keyPressHandler(event) {
    let key = (event && event.currentTarget) ? event.currentTarget.key : "NULL";
    console.log("key pressed: " + key)

    window.electron.sendKey(key)
}

function powerHandler(event) {
    let key = (event && event.currentTarget) ? event.currentTarget.key : "NULL";
    console.log("key pressed: " + key)

}

function setTitle(name) {
    const title = document.getElementById("title")
    title.innerText = name
}

function setHost(host) {
    const hostname = document.getElementById("hostname")
    hostname.innerText = host
}

function setDevice(device) {
    const devicename = document.getElementById("devicename")
    devicename.innerText = device
}

function setConnectionStatus(connected) {
    const connstat = document.getElementById("status_connection")
    if (connected) {
        connstat.setAttribute("class", "badge rounded-pill bg-success badge-pill-close")
        clearNode(document.getElementById('alert-div'))
    }
    else {
        connstat.setAttribute("class", "badge rounded-pill bg-danger badge-pill-close")
        let alert = document.getElementById('alert-div') 
        alert.appendChild(getAlert())
    }
        
}


window.addEventListener('load', main)


function main() {

    let state = new State(initState)
    state.addHook('title', setTitle)
    state.addHook('devicename', setDevice)
    state.addHook('hostname', setHost)
    state.addHook('connected', setConnectionStatus)


    window.electron.onUpdateState((stateObj) => {
        console.log("Received 'state from main: ", stateObj)
        state.set(stateObj)
    })


    drawGrid(KEYS1, "container-buttons-1")
    drawGrid(KEYS2, "container-buttons-2")
    drawConnStat("col-connstat")

 
}