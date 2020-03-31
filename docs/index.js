//Made by Ihor Paprotskyi, SE, FI-3, NaUKMA
let targetTitle = '';
let criteriaArr = [];
let alternativesArr = [];
//dictionary of indexOfRow : Component of normalized vector of top-level table
let topLevelTableRowComponentDict = {};

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


function processAndCreateTables() {
    $('top-lvl-table-container').html('');
    $('lower-lvl-tables-container').html('');
    createTable("top-lvl-table-container", "top-lvl-loc-prior", targetTitle, criteriaArr, 'top-lvl-');
    calculateConsistency('top-lvl-');
    for (let i=0; i < criteriaArr.length; i++){
        createTable("lower-lvl-tables-container", "loc-prior-table"+i, criteriaArr[i], alternativesArr, 'low-lvl-'+i);
    }
}

function calculateConsistency(infoPrefix) {
    fillComponentDictionary('top-lvl-loc-prior', topLevelTableRowComponentDict);
    let table = document.getElementById('top-lvl-loc-prior');
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
    //console.log('tempSums');
    //console.log(tempSums);
    let lambdaMax = tempSums.reduce((a, b) => a + b, 0);

    let n = criteriaArr.length;
    //Consistency index
    let CI = (lambdaMax - n)/ (n - 1);
    //Random Consistency value
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
    //Consistency value
    let CV = CI / RCV[n];
    $('#'+infoPrefix+'lm').html(lambdaMax);
    $('#'+infoPrefix+'ci').html(CI);
    $('#'+infoPrefix+'cv').html(CV);

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
    //console.log("Dictionary: ");
    //console.log(dict);
}

function createTable(tableContainerId, tableId, tableTitle, columnsArray, infoIdPrefix) {
    let tabletag = '<table id="'+tableId+'" class="table table-hover"></table>';
    let tableContainer = $('#'+tableContainerId);
    tableContainer.html(tableContainer.html() + tabletag);
    //alert(tableContainerId);
    let out = "";
    out += '<tr class="thread-light">' +
        '<th>' + tableTitle + '</th> ';
    for (let cr of columnsArray){
        out += '<th>'+ cr +'</th>'
    }
    out += '</tr>';
    for (let rowtitle of columnsArray){
        out += '<tr><td>'+ rowtitle +'</td>';
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

    //setting handlers to
    //automatically select converse value
    $('.loc-pr-select').change(function () {
        let curr = $(this).val();
        let newVal = '';
        if(curr.toString().includes('/')){
            newVal = curr.split('/')[1];
        }else {
            newVal = '1/'+curr;
        }
        let rowInd = parseInt($(this).closest('tr').index());
        let colInd = parseInt($(this).closest('td').index());
        let table = document.getElementById($(this).closest('table').attr('id'));
        table.rows[colInd].cells[rowInd].firstChild.value = newVal;
    });

    //adding table info section
    info = '<div class="info container">' +
        '                            <div class="row">' +
        '                                <!--max proper number-->' +
        '                                <div class="col text-bold">λmax =' +
        '                                    <span id="'+infoIdPrefix+'lm"></span></div>' +
        '                                <div class="col text-bold">CI =' +
        '                                    <span id="'+infoIdPrefix+'ci"></span></div>' +
        '                                <div class="col text-bold">CV =' +
        '                                    <span id="'+infoIdPrefix+'cv"></span></div></div></div>';
    tableContainer.html(tableContainer.html() + info);
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