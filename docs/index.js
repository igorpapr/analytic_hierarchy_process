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

//first
function setDefineButtonHandler() {
    $('#define-button').click(function (e) {
        e.preventDefault();
        let form = document.forms["definition-form"];
        targetTitle = form.elements["target"].value;
        //criterias
        criteriaArr = [];
        $('.crit').each(function () {
            criteriaArr.push($(this).val());
        });
        //alternatives
        alternativesArr = []
        $('.altern').each(function () {
            alternativesArr.push($(this).val());
        });
        //slide next
        $('#next').trigger('click');
//        processAndCreateTables();
    });
}
