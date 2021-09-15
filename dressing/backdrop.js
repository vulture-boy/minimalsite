/*
Blur Matrix Backdrop
By Tyson Moll (2021)
*/

// Cell Properties 
{    
    var initMethod = 2; // Determines which method to use when assigning init values
    var behaveMethod = 0; // Behaviour Method
    var neutralValue = 0.5;
    var cells = [[],[]];
    var cellSize = 24; // Cell Size (pixels)
    var numCells = [0,0]
    var shades = 1; // Number of shades? Not used this way presently
    var deadColor; // The colour of a dead cell
    var liveColor; // The colour of a live cell
    var shape = 0;
    var bufferActive = 0;
}

// Canvas Properties
{
    var extents = [0,0]; // Determines the size of the canvas
    var autoRun = true; // Whether to automatically advance the cycle
    var autoRunTime = 0; // Last recorded cycle end time
    var fr = 15; // Frame rate
    var autoRunTimeMax = 60;
}

///////////////// PREP & RUNNERS ///////////////////
{
    function setup() {
        CanvasPrep(); // Prepare Canvas
        Initialization(); // Initialization scripts
        UpdateAll();
    }

    function draw() {
        UpdateAll(); // Runs all Update scripts
    }

    /// Simple Boolean driven by mouse state
    var mouseBool = false;
    function mousePressed() {mouseBool = true;}
    function mouseReleased() {mouseBool = false;}

    /// Setup for Canvas elements
    function CanvasPrep() {
        extents[0] = windowWidth; 
        extents[1] = windowHeight;
        var cnv = createCanvas(extents[0], extents[1]);
        cnv.parent('blurBackground')
        cnv.position(0, 0);
        frameRate(fr)
    }

    /// Initialization of canvas elements
    function Initialization() {
        deadColor = color("#bfb9b2"); // The colour of a dead cell
        liveColor = color("#f2ffef"); // The colour of a live cell
        InitializeCells();
    }

    /// Update cycle for canvas elements
    function UpdateAll() {

        if (!autoRun) {return} // Functionality for pausing

        RunActions();
        MouseHover();
        Visualize();
    }
}

///////////////// CORE METHODS ///////////////////
{
    /// Sets up the cells used in the application
    function InitializeCells() {

        // Determine the number of cells to create based on screen proportions
        numCells[0] = floor(extents[0] / cellSize); 
        numCells[1] = floor(extents[1]/ cellSize);

        bufferActive = 0; // Init
        cells[0] = [];  
        cells[1] = [];

        // Build the array of cells
        for (var i=0; i<numCells[0]; i++) {
            cells[0][i] = [];
            cells[1][i] = [];
            for (var j=0; j<numCells[1]; j++) {

                switch (initMethod) {
                    case 2: // Mid
                    cells[0][i][j] = neutralValue
                    break;

                    case 1: // Random
                        cells[0][i][j] = random()
                    break;

                    case 0: // Dark
                    default:
                        cells[0][i][j] = 0;
                    break;
                }

                cells[1][i][j] = 0; // Preparing a temp array
            }
        }
    }

        /// Determines when cycles are processed
    function RunActions() {
            
        // Check if dx time exceeds wait time
        if (autoRunTimeMax < millis() - autoRunTime) {
            Interact();
            autoRunTime = millis(); // Reset the timer
        }
    }

    /// Mouse Press: inverts a cell at the clicked location
    function MouseHover() {

        // Find cell position relative to mouse
        var i = floor((mouseX / windowWidth) * numCells[0]);
        var j = floor((mouseY / windowHeight) * numCells[1]);

        // Confirm Cell is within space
        if (i >= 0 && i < numCells[0] && j >= 0 && j < numCells[1]) {
            if (mouseBool) {  // Different effect depending on mouse status
                cells[bufferActive][i][j] = 1;
            } else {
                cells[bufferActive][i][j] = 0;
            } 
        }
    }

    /// Applies Blur Matrix effect to cells on separate buffer, then swaps buffer
    function Interact() {
        for (var i=0; i<numCells[0]; i++) {
            for (var j=0; j<numCells[1]; j++) {
                
                if (behaveMethod == 0) {    // Blur

                    var dist = 2 ;   // Distance from cell for blur matrix calculation
                    var startVal = cells[bufferActive][i][j]; // Cell's current value
                    var neighbour = [startVal,startVal,startVal,startVal]; // array of neighbours
                    
                    // Check Neighbours
                    if ( i < numCells[0] - dist) { // Right
                        neighbour[1] = cells[bufferActive][i+dist][j];} 
                    if (j < numCells[1] - dist) { // Down
                        neighbour[2] = cells[bufferActive][i][j+dist];}
                    if (i > dist) { // Left
                        neighbour[3] = cells[bufferActive][i-dist][j];} 
                    if (j > dist) { // Up
                        neighbour[0] = cells[bufferActive][i][j-dist];} 

                    // Blur matrix result
                    var blurVal = (neighbour[2] + neighbour[1] + neighbour[0] + neighbour[3]) / 4;
                    var ratio = 0.8;
                    var inc = 0.000;    // Ambient blend value change change
                    if (mouseBool) {inc = -0.00;}
                    var dispVal = lerp(cells[bufferActive][i][j], blurVal, ratio);

                    // Apply change to inactive buffer
                    SwapBuffer();
                    cells[bufferActive][i][j] = Math.min(dispVal + inc, 1);
                    SwapBuffer();
                }
            }
        }

        // Use new buffer 
        SwapBuffer();
    }

    /// Swaps between active display buffer 2D array (0/1 used for convenience)
    function SwapBuffer() {
        // Swap Active Buffer
        (bufferActive == 0) ? 1 : 0
    }


    /// Draws the cell status to the screen
    function Visualize() {
        for (var i=0; i<numCells[0]; i++) {
            for (var j=0; j<numCells[1]; j++) {
            
                var m = i; var n = j; // Substitution values

                // Clear Region
                erase();
                DrawCell(color(255,255,255), m, n);
                noErase();

                // Draw new cell
                noStroke();
                var c = color(0,0,0);
                c = lerpColor(deadColor, liveColor, cells[bufferActive][m][n])
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
}

////////////////// HELPERS ///////////////////////////////
{
    /// Refreshes window when resized
    function windowResized() {
        extents[0] = windowWidth;
        extents[1] = windowHeight;
        resizeCanvas(extents[0], extents[1]);
        CopyCellsToNewArraySize();
    }

    function CopyCellsToNewArraySize() {

        // Determine if larger or smaller
        var cloneCells = [0,0];
        var min = [0,0];
        for (var q=0; q<2; q++) {
            // Remember the old values
            cloneCells[q] = numCells[q]; 
            // Determine the number of cells to create based on screen proportions
            numCells[q] = floor(extents[q] / cellSize); 
            // Build the array of cells, retaining old values where applicable
            min[q] = Math.min(numCells[q],cloneCells[q]);
        }

        // Fill Empty cells
        for (var i=0; i<numCells[0]; i++) {

            if (i>= min[0]) { // Prep empty arrays
                cells[0][i] = [];
                cells[1][i] = [];
            }

            for (var j=0; j<numCells[1]; j++) {

                if (i >= min[0] || j >= min[1]) { // Fill new cells with value
                    cells[0][i][j] = 0;
                    cells[1][i][j] = 0;
                }
            }
        }
    }
}
