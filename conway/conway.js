/* Conway Machine
Based on Conway's Game of Life
Written by Tyson Moll */

////////////////// GLOBAL VARIABLES //////////////////////
{
    // Cell Properties 
    {    
        var cells = []; // Array of all cells in process
        var cellsTemp = []; // Used for storing update data (aka next generation)
        var cellSize = 15; // Cell Size (pixels)
        var deadColor; // The colour of a dead cell
        var liveColor; // The colour of a live cell
        var gridColor;
    }

    // Method Properties
    {
        var initMethod = 1; // Determines which method to use when assigning init values
        var cycleMethod = 0; // Determines which action method to apply each cycle
        var mirrorMethod = 0; // Method of symmettry
        var autoRun = true; // Whether to automatically advance the cycle
        var tick = false; // Set to true to advance by one cycle while paused
        var generations = 3; // Number of cell generations to track
        var maxCellAge = 25; // Maximum number of cell generations to track (DOM LIMIT)
        var genColMethod = 1; // Method to apply colour for generations
        var genColOptions = 2; // Total num. of options
        var autoRunTime = 0; // Last recorded cycle end time
        var autoRunTimeMax = 30; // Required difference between current time and last recorded cycle time
    }

    // Canvas Properties
    {
        var extentsX; // Determines the size of the canvas
        var extentsY;
    }

    // DOM References
    {
        var options; // DOM div holding all sliders and buttons for controls
        var sliderSize; // Slider reference for 
        var sliderSizeNum;
        var sliderUpdate;
        var sliderUpdateNum;
        var fieldCellAge;
        var fieldGenCol;
        var fieldMirror;
        var fieldColDead;
        var fieldColLive;
        var fieldColGrid;
        var boxGridOn;
        var boxRespawnResize;
        var lastCellX; // Last Cell clicked
        var lastCellY; 
    }
}

////////////////// SETUP METHODS /////////////////////////
{
    // Initialization
    function setup() {
        CanvasPrep(); // Prepare Canvas
        DOMPrep(); // Prepare Option DOMs
        UpdateAll(); // Runs all Update scripts
        ShowPage(0); // Show first page
        InitializeCells(); // Setup Cells
    }
    /// Setup for Canvas elements
    function CanvasPrep() {
        extentsX = windowWidth; 
        extentsY = windowHeight;
        var cnv = createCanvas(extentsX, extentsY);
        cnv.position(0, 0);
        cnv.parent('canvas');
        cnv.style('z-index','-1'); // Canvas as background element
    }
    /// Setup for DOM elements
    function DOMPrep() {

        options = document.getElementById('options');

        // Size Slider
        sliderSize = document.getElementById('cellSize');
        sliderSizeNum = document.getElementById('cellSizeValue');
        sliderSize.value = cellSize;
        sliderSize.min = 1;
        sliderSize.max = 100;
        boxRespawnResize = document.getElementById('respResize');

        // Update Slider
        sliderUpdate = document.getElementById('updateSpeed');
        sliderUpdateNum = document.getElementById('updateSpeedValue');
        sliderUpdate.value = autoRunTimeMax;
        sliderUpdate.min = 1;
        sliderUpdate.max = 750;

        // Live / Dead / Grid Colors
        fieldColLive = document.getElementById('colLive');
        fieldColDead = document.getElementById('colDead');
        fieldColGrid = document.getElementById('colGrid');
        RandomizeColors();
        fieldColGrid.value = "#AAAAAA" ; // Default grid colour
        boxGridOn = document.getElementById('gridDisplay');

        // Cell Age
        fieldCellAge = document.getElementById('cellAge');
        fieldCellAge.value = generations;
        fieldGenCol = document.getElementById('cellAgeCol');
        fieldGenCol.value = genColMethod;

        // SFX
        fieldMirror = document.getElementById('cellMirror');
        fieldMirror.value = mirrorMethod;
        
    }

    function UpdateAll() {
        UpdateCellSize();
        UpdateDelay();
        UpdateAge();
        UpdateGenCol();
        UpdateMirror();
        GetNewColor();
    }
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
                    case 1: // Random
                        cells[i][j] = round(random())
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

////////////////// RUNTIME METHODS ///////////////////////
{
    /// Main Loop
    function draw() {
        RunActions(); // Process Actions
        Visualize(); // Visualization
        GridLines();
    }

    /// Determines when cycles are processed
    function RunActions() {
            
        if (autoRun || tick) {

            // Check if dx time exceeds wait time
            if (autoRunTimeMax < millis() - autoRunTime) {
                switch (cycleMethod) {
                    case 0:
                    default:
                        CycleConway();
                    break;
                }

                autoRunTime = millis(); // Reset the timer
            }

            tick = false;
        }
    }
    /// Draws the cell status to the screen
    function Visualize() {
        for (var i=0; i<numCellsX; i++) {
            for (var j=0; j<numCellsY; j++) {
            
                var mirroredGrid = GridMirror(i,j); // Get symmettry viz
                var m = mirroredGrid[0]; var n = mirroredGrid[1]; // Substitution values

                noStroke();
                var c = color(0,0,0);
                // Select Color
                if (cells[m][n] == 0) { // Dead
                    c = deadColor;
                } else if (cells[m][n] == 1 && generations == 1) { // Alive
                    c = liveColor;
                } else if (cells[m][n] >= 1 && generations > 1) { // Alive, Multigenerational

                    if (genColMethod == 0) { // Brightening
                        c = color(red(liveColor) + round((255 - red(liveColor)) * cells[m][n] / generations), 
                            green(liveColor) + round((255 - green(liveColor)) * cells[m][n] / generations), 
                            blue(liveColor) + round((255 - blue(liveColor)) * cells[m][n] / generations)
                        );
                    } else if (genColMethod == 1) { // Darken Inverse
                        c = color(round(red(liveColor) * (1 - cells[m][n] / generations)), 
                            round(green(liveColor) * (1 - cells[m][n] / generations)), 
                            round(blue(liveColor) * (1 - cells[m][n] / generations))
                        );
                    } else if (genColMethod == 2) {
                        c = color(round(red(liveColor) * cells[m][n] / generations), 
                            round(green(liveColor) * cells[m][n] / generations), 
                            round(blue(liveColor) * cells[m][n] / generations)
                        );
                    }
                } else {
                    c = color(0,0,0);
                }
                fill(c);

                // Draw Cell
                square(round(i * cellSize), round(j *cellSize), cellSize)
            }
        }
    }
    function GridLines() {
        
        if (boxGridOn.checked) {
            stroke(gridColor);
            
            for (var i=1; i<numCellsX; i++) {
                line(round(i * cellSize), 0, round(i * cellSize), windowHeight);
            }
    
            for (var j=1; j<numCellsY; j++) {
                line(0,round(j * cellSize),windowWidth,round(j * cellSize))
            }
        }
    }
    function GridNewColor() {

    }
}

////////////////// CYCLE ALGORITHMS //////////////////////
{
    /// The standard Conway cycle, applied to the cells array
    function CycleConway() {

        // Iterate through all cells and determine the next generation
        for (var i=0; i<numCellsX; i++) {
            for (var j=0; j<numCellsY; j++) {
                var liveNeighbours = 0;

                // Determine Status of Neighbours
                for (var m = -1; m<2; m++) {
                    for (var n = -1; n<2; n++) {

                        // Skip if outside cell region or at cells[0][0]
                        if (m+ i < 0 || n + j < 0 || 
                            m + i >= numCellsX || n + j >= numCellsY
                            || m == 0 && n == 0) {
                            continue;
                        }

                        // Is this valid cell dead or alive?
                        if (cells[i+m][j+n] >= 1) {
                            liveNeighbours++;
                        }
                    }
                }

                if (cells[i][j] == 0) { // Dead Cell
                    // Dead cells with exactly 3 living neighbours become Live
                    if (liveNeighbours == 3) {
                        cellsTemp[i][j] = 1;
                    } else {
                        cellsTemp[i][j] = 0;
                    }

                } else if (cells[i][j] >= 1) { // Living Cell
                    // Note: Cells with 2-3 living neighbours survive
                    
                    if (liveNeighbours < 2) {
                        // Cells with fewer than 2 living neighbours die
                        cellsTemp[i][j] = 0;
                    } else if (liveNeighbours > 3) {
                        // Cells with more than 3 living neighbours die
                        cellsTemp[i][j] = 0;
                    } else {
                        cellsTemp[i][j] = cells[i][j] + 1; // Cell gets older
                        cellsTemp[i][j] = Math.min(cellsTemp[i][j], generations); // Generation Cap
                    }
                }
            }
        }

        // Apply the new generation to the existing generation
        for (var i=0; i<numCellsX; i++) {
            for (var j=0; j<numCellsY; j++) {
                cells[i][j] = cellsTemp[i][j];
                cellsTemp[i][j] = 0;
            }
        }
    }

    /// Gets mirrored co-ordinates
    function GridMirror(xPoint, yPoint) {
    
        var newM = xPoint; var newN = yPoint;

        if (mirrorMethod == 1) { // Horizontal
            if (xPoint > numCellsX/2) {newM = numCellsX - xPoint;} 
        } else if (mirrorMethod == 2) { // Both
            if (xPoint > numCellsX/2) {newM = numCellsX - xPoint;} 
            if (yPoint > numCellsY/2) {newN = numCellsY - yPoint;}
        } else if (mirrorMethod == 3) { // Vertical
            if (yPoint > numCellsY/2) {newN = numCellsY - yPoint;}
        }

        return [newM, newN];
    }
}

////////////////// USER INTERACTION ELEMENTS /////////////
{
    /// Mouse Press: inverts a cell at the clicked location
    function mousePressed() {

        // Find cell position relative to mouse
        var i = floor((mouseX / windowWidth) * numCellsX);
        var j = floor((mouseY / windowHeight) * numCellsY);
        var mPoint = GridMirror(i,j);

        // Confirm Cell is within space
        if (mPoint[0] >= 0 && mPoint[0] < numCellsX && mPoint[1] >= 0 && mPoint[1] < numCellsY) {
            if (cells[mPoint[0]][mPoint[1]] == 0) {
                cells[mPoint[0]][mPoint[1]] = 1;
            } else if (cells[mPoint[0]][mPoint[1]] >= 1)  {
                cells[mPoint[0]][mPoint[1]] = 0;
            }
        }

        lastCellX = mPoint[0];
        lastCellY = mPoint[1];
    }

    function mouseDragged(){
        // Find cell position relative to mouse
        var i = floor((mouseX / windowWidth) * numCellsX);
        var j = floor((mouseY / windowHeight) * numCellsY);
        var mPoint = GridMirror(i,j);

        if (mPoint[0] != lastCellX || mPoint[1] != lastCellY) {
            mousePressed();
        }
    }

    
    /// Clears life from board
    function ClearLife() {
        for (var i=0; i<numCellsX; i++) {
            for (var j=0; j<numCellsY; j++) {
                        cells[i][j] = 0;
            }
        }
    }
    /// Toggles visibility of options menu
    function PauseToggle() {
        optToggle = document.getElementById("pseToggle");

        if (autoRun) {
            optToggle.innerHTML = "Play";
        } else {
            optToggle.innerHTML = "Pause";
        }

        autoRun = !autoRun;
    }
    /// Toggles visibility of options menu
    function OptionToggle() {
        optToggle = document.getElementById("optToggle");

        if (options.style.display === "none") {
            options.style.display = "block";
            optToggle.innerHTML = "Hide Options"
        } else {
            options.style.display = "none";
            optToggle.innerHTML = "Show Options"
        }
    }
    /// Reads DOM to retrieve new colour values
    function GetNewColor() {
        CreateColors();
    }
    /// Randomizes Colors
    function RandomizeColors() {
        fieldColDead.value = "#" + rgbToHex(round(random() * 255)) + rgbToHex(round(random() * 255)) + rgbToHex(round(random() * 255));
        fieldColLive.value = "#" + rgbToHex(round(random() * 255)) + rgbToHex(round(random() * 255)) + rgbToHex(round(random() * 255));

        CreateColors();
    }
    function rgbToHex(rgb){
        var hex = Number(rgb).toString(16);
        if (hex.length < 2) {
             hex = "0" + hex;
        }
        return hex;
    }
    /// Creates colors with DOM values
    function CreateColors() {
        liveColor = color(fieldColLive.value);
        deadColor = color(fieldColDead.value);
        gridColor = color(fieldColGrid.value);
    }
    /// Refreshes window when resized
    function windowResized() {
        extentsX = windowWidth;
        extentsY = windowHeight;
        resizeCanvas(extentsX, extentsY);
        CopyCellsToNewArraySize();
    }
    function Tick() {
        tick = true;
    }
    
    function UpdateCellSize() {
        sliderSizeNum.innerHTML = "Cell Size: " + sliderSize.value;
        if (cellSize != sliderSize.value) {  // Size Change
            cellSize = sliderSize.value
            if (boxRespawnResize.checked) { // Initialize on resize
                InitializeCells();
            } else { // Lock microbiome
                CopyCellsToNewArraySize();
            }
        }
    }

    function UpdateDelay() {
        sliderUpdateNum.innerHTML = "Update Delay: " + sliderUpdate.value;
        if (autoRunTimeMax != sliderUpdate.value) { // Delay Change
            autoRunTimeMax = sliderUpdate.value;
            autoRunTime = millis();
        }
    }
    
    function UpdateAge() {
        fieldCellAge.value = clamp(fieldCellAge.value, 1, maxCellAge);
        generations = fieldCellAge.value;
    }
    
    function UpdateGenCol() {
        fieldGenCol.value = clamp(fieldGenCol.value, 0, genColOptions);
        genColMethod = fieldGenCol.value;
    }
    
    function UpdateMirror() {
        fieldMirror.value = clamp(fieldMirror.value, 0, 3);
        mirrorMethod = fieldMirror.value;
    }

    function ShowPage(num) {

        var backLink = document.getElementById('backLink');
        var aboutLink = document.getElementById('aboutLink');
        var spaceLink = document.getElementById('spaceLink');
        var aboutPage = document.getElementById('aboutPage');
        var simPage = document.getElementById('simPage');
        var spacePage = document.getElementById('spacePage');

        if (num == 0) {
            backLink.style.display = "none";
            aboutLink.style.display = "block";
            spaceLink.style.display = "block";

            aboutPage.style.display = "none";
            simPage.style.display = "block";
            spacePage.style.display = "none";
        } else if (num == 1) {
            backLink.style.display = "block";
            aboutLink.style.display = "none";
            spaceLink.style.display = "block";

            aboutPage.style.display = "block";
            simPage.style.display = "none";
            spacePage.style.display = "none";
        } else if (num == 2) {
            backLink.style.display = "block";
            aboutLink.style.display = "block";
            spaceLink.style.display = "none";

            aboutPage.style.display = "none";
            simPage.style.display = "none";
            spacePage.style.display = "block";
        }
    }
}

////////////////// HELPERS ///////////////////////////////
{
    function clamp(value, minVal, maxVal) {
        return Math.min(Math.max(value, minVal), maxVal);
    }
}