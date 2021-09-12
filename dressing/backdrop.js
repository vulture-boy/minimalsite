function setup() {
    CanvasPrep(); // Prepare Canvas
    DOMPrep(); // Prepare Option DOMs
    Initialization(); // Initialization scripts
    UpdateAll();
}

/// Setup for Canvas elements
function CanvasPrep() {
    extentsX = windowWidth; 
    extentsY = windowHeight;
    var cnv = createCanvas(extentsX, extentsY);
    cnv.parent('jumbo-canvas')
    cnv.position(0, 0);
    cnv.style('z-index','0'); // Canvas as background element
    frameRate(fr)
}

/// Setup for DOM elements
function DOMPrep() {

}

/// Initialization of canvas elements
function Initialization() {
    //deadColor = color("#d1ccc7ff"); // The colour of a dead cell
    deadColor = color("#bfb9b2e6"); // The colour of a dead cell
    liveColor = color("#f2ffef00"); // The colour of a live cell
    InitializeCells();
}

function draw() {
    UpdateAll(); // Runs all Update scripts
}

/// Update cycle for canvas elements
function UpdateAll() {
    RunActions();
    MouseHover();
    Visualize();
}

/// Mouse Press: inverts a cell at the clicked location
function MouseHover() {

    // Find cell position relative to mouse
    var i = floor((mouseX / windowWidth) * numCellsX);
    var j = floor((mouseY / windowHeight) * numCellsY);
    var mPoint = [i,j];

    // Confirm Cell is within space
    if (mPoint[0] >= 0 && mPoint[0] < numCellsX && mPoint[1] >= 0 && mPoint[1] < numCellsY) {
        if (mouseBool) { 
            cells[mPoint[0]][mPoint[1]] = 1;
        } else {
            cells[mPoint[0]][mPoint[1]] = 0;
        } 
    }

    lastCellX = mPoint[0];
    lastCellY = mPoint[1];
}

var mouseBool = false;

function mousePressed() {
    mouseBool = true;

}

function mouseReleased() {
    mouseBool = false;
    if (mouseButton === RIGHT) {
        InitializeCells();
    }
}


// Cell Properties 
{    
    var initMethod = 2; // Determines which method to use when assigning init values
    var behaveMethod = 0; // Behaviour Method
    var cells = []; // Array of all cells in process
    var cellsTemp = []; // Used for storing update data (aka next generation)
    var cellSize = 24; // Cell Size (pixels)
    var shades = 1; // Number of shades? Not used this way presently
    var deadColor; // The colour of a dead cell
    var liveColor; // The colour of a live cell
    var gridColor;
    var genColMethod = 0;
    var shape = 0;

    
    var autoRun = true; // Whether to automatically advance the cycle
    var tick = false; // Set to true to advance by one cycle while paused
    var autoRunTime = 0; // Last recorded cycle end time
    var fr = 15; // Frame rate
    var autoRunTimeMax = 60;

}

// Canvas Properties
{
    var extentsX; // Determines the size of the canvas
    var extentsY;
}

    /// Determines when cycles are processed
    function RunActions() {
            
        if (autoRun || tick) {

            // Check if dx time exceeds wait time
            if (autoRunTimeMax < millis() - autoRunTime) {
                switch (behaveMethod) {
                    case 0:
                    default:
                        Interact();
                    break;
                }

                autoRunTime = millis(); // Reset the timer
            }

            tick = false;
        }
    }

function Interact() {
    for (var i=0; i<numCellsX; i++) {
        for (var j=0; j<numCellsY; j++) {
            
            if (behaveMethod == 0) {    // Blur

                var distX = 2;
                //var distX2 = 3;
                var distY = 2;

                // Check Neighbours
                if (i < numCellsX - distX) {
                    valRight = cells[i+distX][j];
                } else {
                    valRight = cells[i][j];
                }

                /*
                    // Check Neighbours
                    if (i < numCellsX - distX2) {
                        valRight2 = cells[i+distX2][j];
                    } else {
                        valRight2 = cells[i][j];
                    }

                    if (i > distX2) {
                        valLeft2 = cells[i-distX2][j];
                    } else {
                        valLeft2 = cells[i][j];
                    }
                */
                if (j < numCellsY - distY) {
                    valDown = cells[i][j+distY];
                } else {
                    valDown = cells[i][j];
                }

                if (i > distX) {
                    valLeft = cells[i-distX][j];
                } else {
                    valLeft = cells[i][j];
                }
                
                if (j > distY) {
                    valUp = cells[i][j-distY];
                } else {
                    valUp = cells[i][j];
                }

                var blurVal = (valDown + valRight + valUp + valLeft) / 4;
                //var blurVal = (valDown * 0.30 + valRight + valUp * 0.30 + valLeft + valLeft2 * 0.20 + valRight2 * 0.20) / 3;
                var ratio = 0.8;
                var inc = 0.001;
                if (mouseBool) {
                    inc = -0.004;
                }
                var dispVal = lerp(cells[i][j], blurVal, ratio);
                cellsTemp[i][j] = Math.min(dispVal + inc, 1);
            }
        }
    }

    // Copy
    for (var i=0; i<numCellsX; i++) {
        for (var j=0; j<numCellsY; j++) {
        cells[i][j] = cellsTemp[i][j];
    }}
}

/// Draws the cell status to the screen
function Visualize() {
    for (var i=0; i<numCellsX; i++) {
        for (var j=0; j<numCellsY; j++) {
        
            var m = i; var n = j; // Substitution values

            erase();
            DrawCell(color(255,255,255), m, n);
            noErase();

            noStroke();
            var c = color(0,0,0);
            // Select Color
            if (genColMethod == 0) { // Brightening
                colorMode(RGB);
                c = lerpColor(deadColor, liveColor, cells[m][n])
            }
            DrawCell(c, m, n);
        }
    }
}

function DrawCell(col, i, j) {
    // Draw Cell
    fill(col);
    switch (shape) {
        case 0:
        default:
            square(round(i * cellSize), round(j *cellSize), cellSize)
        break;

        case 1: // Circle
            ellipse(round(i * cellSize), round(j *cellSize), cellSize*1.3)
        break;
    }
}

///////////////// CORE METHODS ///////////////////
{
    /// Sets up the cells used in the application
    function InitializeCells() {

        cells = []; // Stores Cell States
        // Determine the number of cells to create based on screen proportions
        numCellsX = floor(extentsX / cellSize); 
        numCellsY = floor(extentsY/ cellSize);

        // Build the array of cells
        for (var i=0; i<numCellsX; i++) {

            cells[i] = [];
            cellsTemp[i] = [];
            for (var j=0; j<numCellsY; j++) {

                switch (initMethod) {
                    case 2: // Mid
                    cells[i][j] = 0.5
                    break;

                    case 1: // Random
                        cells[i][j] = random()
                    break;

                    case 0: // Blank
                    default:
                        cells[i][j] = 0;
                    break;
                }

                cellsTemp[i][j] = 0; // Preparing a temp array
            }
        }
    }
}

////////////////// HELPERS ///////////////////////////////
{
    function clamp(value, minVal, maxVal) {
        return Math.min(Math.max(value, minVal), maxVal);
    }

    /// Refreshes window when resized
    function windowResized() {
        extentsX = windowWidth;
        extentsY = windowHeight;
        resizeCanvas(extentsX, extentsY);
        CopyCellsToNewArraySize();
    }

    function CopyCellsToNewArraySize() {

        // Remember the old values
        var cloneCellsX = numCellsX;
        var cloneCellsY = numCellsY;

        // Determine the number of cells to create based on screen proportions
        numCellsX = floor(extentsX / cellSize); 
        numCellsY = floor(extentsY/ cellSize);

        // Build the array of cells, retaining old values where applicable
        var minX = Math.min(numCellsX,cloneCellsX);
        var minY = Math.min(numCellsY,cloneCellsY);
        for (var i=0; i<numCellsX; i++) {

            if (i>= minX) {
                cells[i] = [];
                cellsTemp[i] = [];
            }
            for (var j=0; j<numCellsY; j++) {

                if (i >= minX || j >= minY) { // Clone over the old cells
                    cells[i][j] = 0;
                    cellsTemp[i][j]=0;
                }
            }
        }
    }
}
