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
    createTopLevelTable();

}

//function createTable(tableContainer, tableId, ) {
//    let tabletag = '<table id="'+tableId+'" class="table table-hover"></table>';
//    $('#top-lvl-table-container').html(tabletag);
//}

function createTopLevelTable() {
    let tabletag = '<table id="top-lvl-loc-prior" class="table table-hover"></table>';
    $('#top-lvl-table-container').html(tabletag);
    let out = "";
    out += '<tr class="thread-light">' +
        '<th>' + targetTitle + '</th> ';
    for (let cr of criteriaArr){
        out += '<th>'+ cr +'</th>'
    }
    out += '</tr>';
    for (let rowtitle of criteriaArr){
        out += '<tr><td>'+ rowtitle +'</td>';
        for (let rowcol of criteriaArr){
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
    $('#top-lvl-loc-prior').html(out);
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
        let table = document.getElementById('top-lvl-loc-prior');
        table.rows[colInd].cells[rowInd].firstChild.value = newVal;//.УСТНОВИТИ ЗНАЧЕННЯ НЕВВАЛ
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