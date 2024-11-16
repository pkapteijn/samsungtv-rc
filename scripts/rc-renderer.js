// We have fixed grid of 5 columns for buttons, NULL will leave the cell empty
const KEYS1 = [
    ["KEY_HOME", "NULL", "KEY_MENU", "NULL", "KEY_POWER"], 
    ["NULL", "NULL", "NULL", "NULL", "NULL"], 
    ["NULL", "KEY_UP", "NULL", "NULL", "KEY_VOLUP"], 
    ["KEY_LEFT", "KEY_ENTER", "KEY_RIGHT", "NULL", "KEY_MUTE"], 
    ["NULL", "KEY_DOWN", "NULL", "NULL", "KEY_VOLDOWN"], 
    ["KEY_RETURN", "NULL", "KEY_PLAY_BACK", "NULL", "NULL"], 
]

const KEYS2 = [
    ["KEY_1", "KEY_2", "KEY_3", "NULL", "KEY_CHUP"], 
    ["KEY_4", "KEY_5", "KEY_6", "NULL", "KEY_INFO"], 
    ["KEY_7", "KEY_8", "KEY_9", "NULL", "KEY_CHDOWN"], 
    ["NULL", "KEY_0", "NULL", "NULL", "KEY_GUIDE"], 
    ["KEY_GREEN", "KEY_RED", "KEY_YELLOW", "KEY_BLUE", "NULL"], 
]

const KEYS3 = [["STATUS_CONNECTION"]]

const colorMapClass  = {
    'GREEN':  "btn btn-success", 
    'RED': "btn btn-danger", 
    'YELLOW': "btn btn-warning", 
    'BLUE': "btn btn-info", 
    'DEFAULT': "btn btn-primary", 
    'POWER': "btn btn-danger", 
    'CONNECTION': "badge rounded-pill bg-danger badge-pill-close"
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
            button.innerText = label
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
            button.innerText = label
            button.key = keygrid[rowId][colId] // pass on arg in object for event
            button.addEventListener("click", powerHandler)
            default: 

            break
        }

    button.setAttribute("id", keygrid[rowId][colId].toLowerCase())
    return button
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
    }
    else {
        connstat.setAttribute("class", "badge rounded-pill bg-danger badge-pill-close") 
    }
        
}


window.addEventListener('load', main)


function main() {

    window.electron.onUpdateName((name) => {
        console.log("Received name from main: " + name)
        setTitle(name)
    })

    window.electron.onUpdateHost((host) => {
        console.log("Received hostname from main: " + host)
        setHost(host)
    })

    window.electron.onUpdateDevice((device) => {
        console.log("Received devicenamefrom main: " + device)
        setDevice(device)
    })

    window.electron.onUpdateConnStatus((status) => {
        console.log("Received connection status from main: " + status)
        setConnectionStatus(status)
    })

    drawGrid(KEYS1, "container-buttons-1")
    drawGrid(KEYS2, "container-buttons-2")
    drawConnStat("col-connstat")

 
}