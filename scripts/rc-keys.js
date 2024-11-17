// This mapping defines how the keys are labeled inside the button
// If someone feels like creating icons that are a bit more appealing, feel free
// just put a <img> tag instead
const KEYLABELS = {
    "KEY_0": "<h5><b>0</b></h5>", 
    "KEY_1": "<h5><b>1</b></h5>", 
    "KEY_2": "<h5><b>2</b></h5>", 
    "KEY_3": "<h5><b>3</b></h5>", 
    "KEY_4": "<h5><b>4</b></h5>", 
    "KEY_5": "<h5><b>5</b></h5>", 
    "KEY_6": "<h5><b>6</b></h5>", 
    "KEY_7": "<h5><b>7</b></h5>", 
    "KEY_8": "<h5><b>8</b></h5>", 
    "KEY_9": "<h5><b>9</b></h5>", 
    "KEY_HOME" : "<h5><b>Home</b></h5>", 
    "KEY_MENU": "<h5><b>Menu</b></h5>", 
    "KEY_ENTER": "<h5><b>OK</b></h5>", 
    "KEY_RETURN": "<h5><b>Back</b></h5>", 
    "KEY_LEFT": "<h5><b>←</b></h5>", 
    "KEY_RIGHT": "<h5><b>→</b></h5>", 
    "KEY_UP": "<h5><b>↑</b></h5>", 
    "KEY_DOWN": "<h5><b>↓</b></h5>", 
    "KEY_PLAY_BACK": "<h5><b>Play</b></h5>", 
    "KEY_VOLUP": "<h5><b>Vol+</b></h5>", 
    "KEY_VOLDOWN": "<h5><b>Vol-</b></h5>", 
    "KEY_MUTE": "<h5><b>Mute ×</b></h5>", 
    "KEY_POWER": "<h5><b>On/Off</b></h5>", 
    "KEY_CHUP": "<h5><b>Ch+</b></h5>", 
    "KEY_CHDOWN": "<h5><b>Ch-</b></h5>", 
    "KEY_INFO": "<h5><b>Info</b></h5>", 
    "KEY_GUIDE": "<h5><b>Guide</b></h5>", 
    "KEY_RED": "R", 
    "KEY_GREEN": "G", 
    "KEY_YELLOW": "Y", 
    "KEY_BLUE": "B",
    "NULL": " "
}
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

