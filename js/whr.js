$(document).ready(function() {
    
    // Declare constants
    var ONE_YEAR = 1000 * 60 * 60 * 24 * 365;
    var TODAY = new Date();
    
    // Declare variables
    var $birthdate = $('#birthdate');
    var $examinationdate = $('#examinationdate');
    var $age = $('#age');
    var $weight = $('#weight');
    var $height = $('#height');
    var $bmi = $('#bmi');
    var $overweight = $('#overweight');
    var $obesity = $('#obesity');
    var $nutrionalstatus = $('#nutrionalstatus');
    var $waist = $('#waist');
    var $hip = $('#hip');
    var $whr = $('#whr');
    var $meanwhr = $('#meanwhr');
    var $sdwhr = $('#sdwhr');
    var $zscorewhr = $('#zscorewhr');
    var $selected_sex = $('.selected_sex');
    
    $birthdate.$error = $('#birthdate_error');
    $examinationdate.$error = $('#examinationdate_error');
    $age.$error = $('#age_error');
    $weight.$error = $('#weight_error');
    $height.$error = $('#height_error');
    $waist.$error = $('#waist_error');
    $hip.$error = $('#hip_error');

    var inputFields = [
        $birthdate,
        $examinationdate,
        $weight,
        $height,
        $waist,
        $hip
    ]

    var months = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec'
    ]

    var days = [
        '01', '02', '03', '04', '05', '06', '07', '08', '09', '10',
        '11', '12', '13', '14', '15', '16', '17', '18', '19', '20',
        '21', '22', '23', '24', '25', '26', '27', '28', '29', '30',
        '31'
    ]
    // Setup some fields

    $birthdate.datepicker({
        changeMonth: true,
        changeYear: true,
        dateFormat: 'dd M yy',
        showOn: "button",
        buttonImage: "css/smoothness/images/calendar.gif",
        buttonImageOnly: true,
        minDate: '-18y',
        yearRange: 'c-18:c+18'
    });
    $examinationdate
        .val( days[TODAY.getDate()-1] + ' ' + months[TODAY.getMonth()] + ' ' + TODAY.getFullYear())
        .datepicker({
            changeMonth: true,
            changeYear: true,
            dateFormat: 'dd M yy',
            showOn: "button",
            buttonImage: "css/smoothness/images/calendar.gif",
            buttonImageOnly: true,
            yearRange: 'c-15:c+15'
        });
    
    // Bind event handlers
    $('.text_input').keypress(enterToTab);
    $('.text_input').change(refresh);
    $('input[name="sex"]:radio').change(refresh);
    $('#reset_button').click(resetValue);
    
    // Function definitions
    function refresh() {
        validate();
        recalculate();
    }
    
    function validate() {
        for (var i=0; i<inputFields.length; i++) {
            validateField(inputFields[i]);
        }
    }
    
    function validateField($field) {
        $field.$error.html('');
        if ($field.val() == '') {    
            return false;
        }
        
        if ($field.hasClass('date')) {
            return validateDate($field);
        } else {
            return validateNumber($field);
        }
    }
    
    function validateDate($field) {
        var date = new Date($field.val());
        if (date == 'Invalid Date') {
            $field.$error.html('Invalid date');
            return false;
        }
        return true;
    }
    
    function validateNumber($field) {
        var num = $field.val();
        if (isNaN(num)) {
            $field.$error.html('Invalid number');
            return false;
        } else if (num <= 0) {
            $field.$error.html('Value cannot be 0 or negative');
            return false;
        }
        return true;
    }
    
    function recalculate() {
        updateSex();
        recalculateAge();
        recalculateBMI();
        updateNutrionalStatus();
        recalculateWHR();
        updateWHRStat();
    }
    
    function updateSex() {
        var sex = $('input[name="sex"]:checked').val();
        $selected_sex.html(sex);
    }
    
    function recalculateAge() {
        $age.val('');
        $age.$error.html('');
        
        var birthdate = new Date($birthdate.val());
        var examinationdate = new Date($examinationdate.val());
        var age = (examinationdate - birthdate) / ONE_YEAR;
        
        if (isNaN(age)) {
            return false;
        } else if (age <= 0.0) {
            $age.$error.html('Birth date must be before examination date');
            return false;
        }
        
        $age.val(age.toFixed(1));
        return $age.val();
    }
    
    function recalculateBMI() {
        $bmi.val('');
        
        var weight = $weight.val();
        var height = $height.val();
        var bmi = weight/((height/100)*(height/100));
        
        if (weight != '' && height != '' && isFinite(bmi)) {
            $bmi.val( bmi.toFixed(3) );
        }
    }
    
    function recalculateWHR() {
        $whr.val('');
        
        var waist = $waist.val();
        var hip = $hip.val();
        var whr = waist/hip;
        if (waist != '' && hip != '' && isFinite(whr)) {
            $whr.val( whr.toFixed(4) );
        }
    }
    
    function updateNutrionalStatus() {
        $overweight.val('');
        $obesity.val('');
        $nutrionalstatus.val('');
        
        var age = $age.val();
        if (age != '') {
            var half_rounded_age = halfRound(age);
            var sex = $('input[name="sex"]:checked').val();
            var overweight = lookup(half_rounded_age, sex, 'overweight', whr_cutoff);
            var obesity = lookup(half_rounded_age, sex, 'obesity', whr_cutoff);
            $('#overweight').val(overweight);
            $('#obesity').val(obesity);
            
            var bmi = $bmi.val();
            if (bmi != '') {
                $nutrionalstatus.val( lookupNutrionalStatus(bmi, overweight, obesity) );
            }
        }
    }
    
    function updateWHRStat() {
        $meanwhr.val('');
        $sdwhr.val('');
        $zscorewhr.val('');
        
        var age = $age.val();
        if (age != '') {
            var rounded_age = Math.round(age);
            var sex = $('input[name="sex"]:checked').val();
            var whr = $whr.val();
            var meanwhr = lookup(rounded_age, sex, 'mean', whr_normal);
            var sdwhr = lookup(rounded_age, sex, 'sd', whr_normal);
            var zscorewhr = (whr-meanwhr)/sdwhr;
            $meanwhr.val(meanwhr);
            $sdwhr.val(sdwhr);
            
            if (whr != '' && isFinite(zscorewhr))
                $('#zscorewhr').val( zscorewhr.toFixed(2) );
        }
    }
    
    function lookup(age, sex, fieldname, lookup_list) {
        var sexified_fieldname = (sex == 'boys') ? 'male-' + fieldname : 'female-' + fieldname;
        for (var i=0; i<lookup_list.length; i++) {
            var row = lookup_list[i];
            if (row['age'] == age) {
                return row[sexified_fieldname];
            }
        }
        return 'Not found';
    }
    
    function halfRound(age) {
        age = parseFloat(age);
        var whole = Math.floor(age);
        var decimal = age - whole;
        if (decimal < 0.5)
            return whole.toFixed(1);
        else if (decimal > 0.5)
            return (whole+1).toFixed(1);
        else
            return age.toFixed(1);
    }
    
    function lookupNutrionalStatus(bmi, overweight, obesity) {
        if (bmi == '' || overweight == '' || obesity == '' || overweight == 'Not found' || obesity == 'Not found')
            return '';

        // make sure it's a number before we compare them
        var bmi = Number(bmi);
        var overweight = Number(overweight);
        var obesity = Number(obesity);

        if (bmi < overweight)
            return 'Not Overweight';
        else if (bmi > obesity)
            return 'Obesity';
        else
            return 'Overweight';
    }

    function enterToTab(e){
        if (e.which == 13) {
        var $targ = $(e.target);

        if (!$targ.is("textarea") && !$targ.is(":button,:submit")) {
            var focusNext = false;
            $('#calculator').find(":input:visible:not([disabled],[readonly]), a").each(function(){
                if (this === e.target) {
                    focusNext = true;
                }
                else if (focusNext){
                    $(this).focus();
                    return false;
                }
                });
            refresh();
            return false;
            }
        }
    }

    function resetValue(){
        for (var i in inputFields){
            var input = inputFields[i];
            input.val('');
            if (input.attr('id') == 'examinationdate'){
                input.val( days[TODAY.getDate()-1] + ' ' + months[TODAY.getMonth()] + ' ' + TODAY.getFullYear());
            }
        }
        refresh();
    }


});
