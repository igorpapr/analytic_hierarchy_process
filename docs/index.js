//Made by Ihor Paprotskyi, SE, FI-3, NaUKMA
let targetTitle = '';
let criteriaArr = [];
let alternativesArr = [];
//dictionary of indexOfRow : Component of normalized vector of top-level table
let topLevelTableRowComponentDict = {};
//array of all of the consistency values
let CVarr = [];

//Random consistency value
const RCV = {
    1: 0,
    2: 0,
    3: 0.58,
    4: 0.9,
    5: 1.12,
    6: 1.24,
    7: 1.32,
    8: 1.41,
    9: 1.45,
    10: 1.49
};


//array of dictionaries of indexOfRow : Component of normalized vector of all the lower-level tables
let lowerLevelTableDicts = [];

//main
$('document').ready(function () {
    setCriteriaNumsSelectedHandler();
    setAlternativesNumsSelectedHandler();
    setDefineButtonHandler();
});


//changed number of criteria
function setCriteriaNumsSelectedHandler() {
    $('#criteria-num').change(function (){
        let selected = parseInt($(this).val());
        out = '';
        for (let i = 1; i <= selected; i++){
            out += '<label for=\"criteria'+ i +'\">Criteria '+ i +' name </label>' +
                '<input type=\"text\" id=\"criteria' + i +'\" name=\"criteria' + i +'\"' +
                ' class="form-control crit" placeholder=\"Enter criteria ' + i +' name\" required><br>';
        }
        $('#criteria-list').html(out);
    });
}


//changed number of alternatives
function setAlternativesNumsSelectedHandler() {
    $('#alternatives-num').change(function (){
        let selected = parseInt($(this).val());
        out = '';
        for (let i = 1; i <= selected; i++){
            out += '<label for=\"alternative'+ i +'\">Alternative '+ i +' name </label>' +
                '<input type=\"text\" id=\"alternative' + i +'\" name=\"alternative' + i +'\"' +
                ' class="form-control altern" placeholder=\"Enter alternative ' + i +' name\" required><br>';
        }
        $('#alternatives-list').html(out);
    });
}


function initializeLowerLevelArrayOfDicts() {
    criteriaArr.map(() => {
        lowerLevelTableDicts.push({});
    })
}

function processAndCreateTables() {
    initializeLowerLevelArrayOfDicts();
    $('top-lvl-table-container').html('');
    $('lower-lvl-tables-container').html('');
    createTable("top-lvl-table-container", "top-lvl-loc-prior", targetTitle, criteriaArr, 'top-lvl-');
    for (let i=0; i < criteriaArr.length; i++){
        createTable("lower-lvl-tables-container", "loc-prior-table"+i, criteriaArr[i], alternativesArr, 'low-lvl-'+i);
    }
}

//precision - after comma
function fastCustomRound(val, precision){
    let tmp = Math.pow(10,precision);
    return Math.round(val * tmp)/tmp;
}

//final table
function createGlobalPriorityTable() {
    let out = '';
    out += '<tr class="bg-primary">' +
        '<th>' + targetTitle + '</th> ';
    for (let cr of criteriaArr){
        out += '<th>'+ cr +'</th>'
    }
    out += '<th>Global Priority</th></tr>';
    out += '<tr class="bg-info"><td>Local Criteria Priorities</td>';
    let criteriaLocPrValues = Object.keys(topLevelTableRowComponentDict).map(function(key){
        return fastCustomRound(topLevelTableRowComponentDict[key],3);
    });
    for (let i = 0; i < criteriaLocPrValues.length; i++){
        out += '<td>' + criteriaLocPrValues[i] + '</td>';
    }
    out += '<td></td>';

    //result values
    let result = {};
    //filling and computing
    for (let row = 0; row < alternativesArr.length; row++){
        out += '<tr><td>' + alternativesArr[row] + '</td>';
            let rowLocPrValues = [];
            for (let col = 0; col < criteriaArr.length; col++){
                let val = lowerLevelTableDicts[col][row+1];
                out += '<td>' + fastCustomRound(val,3) + '</td>';
                rowLocPrValues.push(val);
            }
            let foldsum = 0;
            for (let row_i = 0; row_i < rowLocPrValues.length; row_i++){
                foldsum += rowLocPrValues[row_i] * criteriaLocPrValues[row_i];
            }
            foldsum = fastCustomRound(foldsum,3);
            result[alternativesArr[row]] = foldsum;
            out += '<td>' + foldsum + '</td>';
        out += '</tr>';
    }
    res = '';
    let winner = Object.keys(result).reduce(function(a, b){ return result[a] > result[b] ? a : b });
    res += winner + ' has won!';
    res += '<br>' +
        'Global priority: ' + result[winner];

    $('#result').html(res);
    $('#gl-prior-table').html(out);

}

function proceedCalculation() {
    //clear previous consistency info
    //$('.info').remove();
    topLevelTableRowComponentDict = {};
    lowerLevelTableDicts = [];
    initializeLowerLevelArrayOfDicts();

    calculateConsistency('top-lvl-loc-prior',topLevelTableRowComponentDict,'top-lvl-');
    for (let i=0; i < criteriaArr.length; i++){
        calculateConsistency("loc-prior-table"+i, lowerLevelTableDicts[i], 'low-lvl-'+i);
    }
}

function swipeToFinish() {
    //If there's any CV greater than 20 - user must reinsert values in order everything to be clear.
    if((CVarr.filter(x => x > 20).length) > 0){
        alert("You have inserted inconsistent table data!\n" +
            "At least one of the tables has CV > 20\n" +
            "You must input consistent data and try again.")
    }else{
        createGlobalPriorityTable();
        //slide next
        $('#next').trigger('click');
    }
}

function calculateConsistency(tableid, componentDict, infoPrefix) {
    fillComponentDictionary(tableid, componentDict);
    let table = document.getElementById(tableid);
    //sums of every column
    let colSums = [];
    for (let col = 1; col < table.rows[0].cells.length; col++){
        let column = [];
        for (let row = 1; row < table.rows.length; row++){
            column.push(customParseInt(table.rows[row].cells[col].firstChild.value));
        }
        colSums.push(column.reduce((a, b) => a + b, 0));
    }
    //every column sum * component from dictionary
    let tempSums = [];
    for (let i = 0; i < colSums.length; i++){
        tempSums.push(colSums[i] * topLevelTableRowComponentDict[i+1]);
    }
    let lambdaMax = tempSums.reduce((a, b) => a + b, 0);

    let n = criteriaArr.length;
    //Consistency index
    let CI = (lambdaMax - n)/ (n - 1);
    //Consistency value
    let CV = CI / RCV[n];
    $('#'+infoPrefix+'lm').html(lambdaMax);
    $('#'+infoPrefix+'ci').html(CI);
    $('#'+infoPrefix+'cv').html(CV);
    CVarr.push(CV);
}

function fillComponentDictionary(tableId, dict) {
    let table = document.getElementById(tableId);
    let rows = table.rows;
    //semi-component - geometrical mean of all cells in a row
    let semiComponents = [];
    for (let ind = 1; ind < rows.length; ind++){
        let cells = rows[ind].cells;
        let cellsarr = [];
        for (let cellind = 1; cellind < cells.length; cellind++){
            cellsarr.push(customParseInt(cells[cellind].firstChild.value));
        }
        //geometrical mean
        semiComponents.push(Math.pow(cellsarr.reduce((a, b) => a * b, 1), 1 / (cellsarr.length)));
    }
    let sumOfSemiComponents = semiComponents.reduce((a, b) => a + b, 0);
    //Carefully, from 1!!!
    for (let i = 1; i < rows.length; i++){
        dict[i] = semiComponents[i-1] / sumOfSemiComponents;
    }
}

function swipeBack(clear = false) {
    if (clear){
        $('#top-lvl-table-container').html('');
        $('#lower-lvl-tables-container').html('');
    }
    $('#prev').trigger('click');
}



function createTable(tableContainerId, tableId, tableTitle, columnsArray, infoIdPrefix) {
    let tabletag = '<table id="'+tableId+'" class="table table-hover table-bordered table-dark"></table>';
    let tableContainer = $('#'+tableContainerId);
    tableContainer.html(tableContainer.html() + tabletag);
    //alert(tableContainerId);
    let out = "";
    out += '<tr>' +
        '<th>' + tableTitle + '</th> ';
    for (let cr of columnsArray){
        out += '<th>'+ cr +'</th>'
    }
    out += '</tr>';
    for (let rowtitle of columnsArray){
        out += '<tr ><td>'+ rowtitle +'</td>';
        for (let rowcol of columnsArray){
            if (rowtitle === rowcol){
                out += '<td><select disabled><option>1</option></select></td>';
            }
            else{
                out += '<td><select class="loc-pr-select">' +
                    '<option>9</option>' +
                    '<option>8</option>' +
                    '<option>7</option>' +
                    '<option>6</option>' +
                    '<option>5</option>' +
                    '<option>4</option>' +
                    '<option>3</option>' +
                    '<option>2</option>' +
                    '<option>1</option>' +
                    '<option>1/2</option>' +
                    '<option>1/3</option>' +
                    '<option>1/4</option>' +
                    '<option>1/5</option>' +
                    '<option>1/6</option>' +
                    '<option>1/7</option>' +
                    '<option>1/8</option>' +
                    '<option>1/9</option>' +
                    '</select></td>';
            }
        }
        out+='</tr>';
    }
    $('#'+tableId).html(out);


    //adding table info section
    info = '<div class="info container">' +
        '       <div class="row">' +
        '           <!--max proper number-->' +
        '           <div class="col text-bold">λmax =' +
        '           <span id="'+infoIdPrefix+'lm"></span></div>' +
        '           <div class="col text-bold">CI =' +
        '           <span id="'+infoIdPrefix+'ci"></span></div>' +
        '           <div class="col text-bold">CV =' +
        '           <span id="'+infoIdPrefix+'cv"></span></div>' +
        '</div>' +
        '</div>';
    tableContainer.html(tableContainer.html() + info);


    //setting handlers to
    //automatically select converse value
    $('.loc-pr-select').change(function () {
        let curr = $(this).val();
        let newVal = '';
        if(curr.toString().includes('/')){
            newVal = curr.split('/')[1];
        }else if (curr.toString() === '1') {
            newVal = '1';
        }else{
            newVal = '1/'+curr;
        }
        let rowInd = parseInt($(this).closest('tr').index());
        let colInd = parseInt($(this).closest('td').index());
        let table = document.getElementById($(this).closest('table').attr('id'));
        table.rows[colInd].cells[rowInd].firstChild.value = newVal;
    });

}


//first
function setDefineButtonHandler() {
    $('#define-button').click(function (e) {
        e.preventDefault();
        let form = document.forms["definition-form"];
        targetTitle = form.elements["target"].value;
        targetTitle.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        //criterias
        criteriaArr = [];
        $('.crit').each(function () {
            criteriaArr.push($(this).val());
        });
        //alternatives
        alternativesArr = [];
        $('.altern').each(function () {
            alternativesArr.push($(this).val().replace(/</g, "&lt;").replace(/>/g, "&gt;"));
        });
        //slide next
        $('#next').trigger('click');
        processAndCreateTables();
    });
}

function customParseInt(str) {
    if (str.includes("/")) {
        let valNum = str.split("/").map(x => parseInt(x));
        return valNum[0] / valNum[1];
    }
    return parseInt(str);
}