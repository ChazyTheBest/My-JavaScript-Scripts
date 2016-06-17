// Plugin to verify form fields
// 
// By Chazy Chaz (how2hack@hotmail.es)
// 
// Based on the original work by
// Formly v1.0 by Daniel Raftery
// http://thrivingkings.com/formly
// http://twitter.com/ThrivingKings


(function($) {

    $.fn.formly = function(callback) {

        $.fn.setCursorPosition = function (pos) {

            this.each(function (index, elem) {

                if (elem.setSelectionRange) {

                    elem.setSelectionRange(pos, pos);

                } else if (elem.createTextRange) {

                    var range = elem.createTextRange();

                    range.collapse(true);
                    range.moveEnd('character', pos);
                    range.moveStart('character', pos);
                    range.select();
                }

            });

            return this;
        }

        // Form name, very important!
        var formName = this.attr('id');

        if (!formName) {
            // If no name, make a random one
            formName = Math.ceil(Math.random() * 5000); 
            this.attr('id', formName);
        }

        this.append('</div><div class="formlyAlerts"></div>');

        this.find('input, select, :radio').each(function(index, item) {

            // Focus actions
            /*$(item).focus(function() {

                // Prefixes
                if ($(item).attr('atr') && $(item).val() == '') {
                    $(item).val('(+)');
                }

            });*/

            var required = true;

            $(item).blur(function() {

                var length = $(item).val().length;

                if ($(item).hasClass('country_code')) {

                    if (length === 3 || length === 2 || length === 1) {
                        $(item).val('');
                    }

                }

                // Required
                if ($(item).attr('required')) {
                    required = functions.required(item);
                }

                // Validation
                if (required && $(item).attr('validate')) {
                    functions.validate(item);
                }

            });

            $(item).on('input', function() {

                // Required
                if ($(item).attr('required')) {
                    required = functions.required(item);
                }

                // Validation
                if ($(item).attr('validate')) {
                    functions.validate(item);
                }

                // Match
                if (required && $(item).attr('match')) {
                    functions.match(item);
                }

            });

        });

        $('.nif').on('input', function() {

            var nif = $(this).val(),
                map = ['T', 'R', 'W', 'A', 'G', 'M', 'Y', 'F', 'P', 'D', 'X', 'B', 'N', 'J', 'Z', 'S', 'Q', 'V', 'H', 'L', 'C', 'K', 'E'];

            if (isNaN(nif)) return;

            if (nif.length === 8) {
                $(this).val(nif + map[nif%23]);
            }

        });

        $('.country_code').focus(function() {

            var self = $(this);

            if (self.val() == '') {
                self.val('(+)').setCursorPosition(2);
            }

        });

        $('input[type="number"]').on('input', function(e) {
            var self = $(this),
                val = self.val(),
                max = self.attr('maxlength'); 
            if (val.length > max) {
                self.val(val.slice(0, max));
            }
        });

        // Submit button
        this.on('submit', this, function(e) {

            e.preventDefault();
            var canSubmit = true;

            $(this).find('input').each(function() {

                // Required
                if ($(this).attr('required')) {
                    canSubmit = functions.required(this);
                }

                // Validate
                if ($(this).attr('validate')) {
                    canSubmit = functions.validate(this);
                }

                // Match
                if ($(this).attr('match')) {
                    canSubmit = functions.match(this);
                }

            });

            if (canSubmit) {

                if (callback) {

                    var clientInfo = $(this).serializeArray();

                    /* Password hash function */
                    var p = $('#reg_pwd').val(),
                        c = $('#confirm_pwd').val(),
                        shaObj = new jsSHA('SHA-512', 'TEXT');

                    shaObj.update(p);
                    var p_hash = shaObj.getHash("HEX"),
                        shaObj = new jsSHA('SHA-512', 'TEXT');

                    shaObj.update(c);
                    var c_hash = shaObj.getHash("HEX");

                    callback(clientInfo, p_hash, c_hash);
                }
            }

        });

        var functions = {

            required: function(item) {

                var alertName = 'required_' + $(item).attr('name'),
                    field     = $(item).is(':radio') ? $('label[for="' + this.id + '"]').html() : $(item).attr('placeholder'),
                    type      = $(item).attr('type');

                if ($(item).val() == '' || $(item).val() == '0') {

                    if (!$('#' + alertName).is(':visible')) {
                         $('#' + formName).find('.formlyAlerts').append('<div class="formlyRequired formlyAlert" id="' + alertName + '">¡El campo ' + field + ' está vacio!</div>');
                         $('#' + alertName).fadeIn();
                    }

                    var borderColor = $('#' + alertName).css('background-color');

                    $(item).css('border-color', borderColor);

                    if (type == 'password') {
                        $(item).next('.formlyPWPlaces').css('border-color', borderColor);
                    }

                    return false;

                } else if (type == 'radio' && !$(item).is(':checked')) {

                    if (!$('#' + alertName).is(':visible')) {
                         $('#' + formName).find('.formlyAlerts').append('<div class="formlyRequired formlyAlert" id="' + alertName + '">Debes seleccionar una de las opciones: ' + field + '</div>');
                         $('#' + alertName).fadeIn();
                         $(item).focus();
                    }

                    var borderColor = $('#' + alertName).css('background-color');

                    $(item).css('border-color', borderColor);

                    return false;

                } else {

                    $('#' + alertName).fadeOut(function() { $(this).remove() });
                    
                    $(item).css('border-color', '');
                    $('.formlyPWPlaces').css('border-color', '');

                    return true;
                }
            },
            validateInteger: function(type, string) {

                switch (type) {
                    // Validate phone regular expression
                    case 'phone':

                        var filter = /^([\d]{9})$/,
                            valid  = filter.test(string);

                        break;

                    // Validate zipcode regular expression
                    case 'zipcode':

                        var filter = /^([\d]{5})$/,
                            valid  = filter.test(string);

                        break;
                }

                return valid;
            },
            validateString: function(type, string) {

                switch (type) {
                    // Validate name/surname regular expression
                    case 'company':
                    case 'name':
                    case 'surname':

                        var filter = /^([a-z\d\s\-\']{4,40})$/i,
                            valid  = filter.test(string);

                        break;

                    // Validate nif regular expression
                    case 'nif':

                        var filter = /^([\d]{8}([A-Z]){1})$/,
                            valid  = filter.test(string);

                        break;

                    // Validate country code prefix regular expression
                    case 'cc':

                        var filter = /^(\(\+[\d]{0,2}\))$/,
                            valid  = filter.test(string);

                        break;

                    // Validate email regular expression
                    case 'email':

                        var filter = /^([\w\-]+(?:[\.][\w\-]+)*)@([\w\-]+(?:[\.][\w\-]+)*)\.([a-z]{2,7})$/i,
                            valid  = filter.test(string);

                        break;

                    // Validate address regular expression
                    case 'address':

                        var filter = /^([a-z\d\s\-\'\.,]{5,40})$/i,
                            valid  = filter.test(string);

                        break;
                }

                return valid;
            },
            validate: function(item) {

                var alertName = 'validate_' + $(item).attr('name'),
                    validate  = $(item).attr('validate'),
                    field     = $(item).hasClass('country_code') ? 'Código de pais' : $(item).attr('placeholder'),
                    val       = $(item).val();

                switch (validate) {

                    case 'company':

                        var valid = functions.validateString(validate, val);

                        break;

                    case 'name':

                        var valid = functions.validateString(validate, val);

                        break;

                    case 'surname':

                        var valid = functions.validateString(validate, val);

                        break;

                    case 'nif':

                        var valid = functions.validateString(validate, val);

                        break;

                    case 'cc':

                        var valid = functions.validateString(validate, val);

                        break;

                    case 'phone':

                        var valid = functions.validateInteger(validate, val);

                        break;

                    case 'email':

                        var valid = functions.validateString(validate, val);

                        break;

                    case 'address':

                        var valid = functions.validateString(validate, val);

                        break;

                    case 'zipcode':

                        var valid = functions.validateInteger(validate, val);

                        break;

                }

                if (valid || val == '') {

                    $('#' + alertName).fadeOut(function() {
                        $(this).remove()
                    });

                    $(item).css('border-color', '');
                    $('.formlyPWPlaces').css('border-color', '');

                    return true;

                } else {

                    if (!$('#' + alertName).is(':visible')) {
                         $('#' + formName).find('.formlyAlerts').append('<div class="formlyInvalid formlyAlert" id="' + alertName + '">¡El campo ' + field + ' contiene carateres no válidos!</div>');
                         $('#' + alertName).fadeIn();
                    }

                    var borderColor = $('#' + alertName).css('background-color');

                    $(item).css('border-color', borderColor);

                    if ($(item).attr('type') == 'password') {
                        $(item).next('.formlyPWPlaces').css('border-color', borderColor);
                    }

                    return false;
                }
            },
            match: function(item) {

                var alertName = 'match_' + $(item).attr('name'),
                    toMatch   = $(item).attr('match');

                if ($(item).val() != $('#' + formName).find('input[name=' + toMatch + ']').val() || !$(item).val()) {

                    if (!$('#' + alertName).is(':visible')) {
                         $('#' + formName).find('.formlyAlerts').append('<div class="formlyInvalid formlyAlert" id="' + alertName + '">¡Las contraseñas no coinciden!</div>');
                         $('#' + alertName).fadeIn();
                    }

                    var borderColor = $('#' + alertName).css('background-color');

                    $(item).css('border-color', borderColor);

                    if ($(item).attr('type') == 'password') {
                        $(item).next('.formlyPWPlaces').css('border-color', borderColor);
                    }

                    return false;

                } else {

                    $('#' + alertName).fadeOut(function() {
                        $(this).remove()
                    });

                    $(item).css('border-color', '');
                    $('.formlyPWPlaces').css('border-color', '');

                    return true;
                }
            }
        }
    };

})( jQuery );