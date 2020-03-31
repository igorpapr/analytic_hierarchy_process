let targetTitle = '';
let criteriaArr = [];
let alternativesArr = [];

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
    createTable("top-lvl-table-container", "top-lvl-loc-prior", targetTitle, criteriaArr);
    for (let i=0; i < criteriaArr.length; i++){
        createTable("lower-lvl-tables-container", "loc-prior-table"+i, criteriaArr[i], alternativesArr);
    }
}

function createTable(tableContainerId, tableId, tableTitle, columnsArray) {
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